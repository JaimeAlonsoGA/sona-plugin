/**
 * Supabase Edge Function: Cleanup Expired Audio Files
 * 
 * This function removes audio files from the storage bucket that are older than 1 day
 * and clears the corresponding paths (master_path, preview_path) in the jobs table.
 * 
 * This function should be called by a cron job (e.g., daily at midnight).
 * 
 * Endpoint: POST /cleanup-expired-audio
 * Headers: 
 *   - Authorization: Bearer <service_role_key> (for cron/admin access)
 *   - x-cleanup-secret: <CLEANUP_SECRET> (optional additional security)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for web requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cleanup-secret',
}

// Configuration
const EXPIRATION_HOURS = 24 // Audio files expire after 24 hours
const STORAGE_BUCKET = 'audio-files'
const BATCH_SIZE = 50 // Process jobs in batches to avoid timeouts

interface CleanupResult {
  success: boolean
  jobsProcessed: number
  filesDeleted: number
  errors: string[]
  dryRun: boolean
}

interface ExpiredJob {
  id: string
  master_path: string | null
  preview_path: string | null
  completed_at: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify authorization - require service role key or cleanup secret
    const authHeader = req.headers.get('authorization')
    const cleanupSecret = req.headers.get('x-cleanup-secret')
    const expectedSecret = Deno.env.get('CLEANUP_SECRET')
    
    // Check if service role is being used (via Supabase internal call) or cleanup secret matches
    const isServiceRole = authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')
    const isValidSecret = expectedSecret && cleanupSecret === expectedSecret
    
    if (!isServiceRole && !isValidSecret) {
      console.warn('Unauthorized cleanup attempt')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body for options
    let dryRun = false
    let customExpirationHours = EXPIRATION_HOURS
    
    try {
      const body = await req.json()
      dryRun = body.dryRun === true
      if (body.expirationHours && typeof body.expirationHours === 'number') {
        customExpirationHours = body.expirationHours
      }
    } catch {
      // No body or invalid JSON - use defaults
    }

    console.log(`Starting audio cleanup (dryRun: ${dryRun}, expirationHours: ${customExpirationHours})`)

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Calculate expiration threshold
    const expirationDate = new Date()
    expirationDate.setHours(expirationDate.getHours() - customExpirationHours)
    const expirationThreshold = expirationDate.toISOString()

    console.log(`Looking for jobs completed before: ${expirationThreshold}`)

    // Find expired jobs with audio files
    const { data: expiredJobs, error: queryError } = await supabase
      .from('jobs')
      .select('id, master_path, preview_path, completed_at')
      .eq('status', 'completed')
      .lt('completed_at', expirationThreshold)
      .or('master_path.not.is.null,preview_path.not.is.null')
      .limit(BATCH_SIZE)

    if (queryError) {
      console.error('Error querying expired jobs:', queryError)
      return new Response(
        JSON.stringify({ error: 'Database query failed', details: queryError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jobs = (expiredJobs || []) as ExpiredJob[]
    console.log(`Found ${jobs.length} expired jobs to process`)

    const result: CleanupResult = {
      success: true,
      jobsProcessed: 0,
      filesDeleted: 0,
      errors: [],
      dryRun,
    }

    // Process each expired job
    for (const job of jobs) {
      const filesToDelete: string[] = []
      
      // Collect unique file paths to delete
      if (job.master_path) {
        filesToDelete.push(job.master_path)
      }
      if (job.preview_path && job.preview_path !== job.master_path) {
        filesToDelete.push(job.preview_path)
      }

      if (filesToDelete.length === 0) {
        continue
      }

      console.log(`Processing job ${job.id}: ${filesToDelete.length} file(s) to delete`)

      if (!dryRun) {
        // Delete files from storage
        for (const filePath of filesToDelete) {
          try {
            const { error: deleteError } = await supabase.storage
              .from(STORAGE_BUCKET)
              .remove([filePath])

            if (deleteError) {
              const errorMsg = `Failed to delete file ${filePath}: ${deleteError.message}`
              console.error(errorMsg)
              result.errors.push(errorMsg)
            } else {
              console.log(`Deleted file: ${filePath}`)
              result.filesDeleted++
            }
          } catch (err) {
            const errorMsg = `Exception deleting file ${filePath}: ${err}`
            console.error(errorMsg)
            result.errors.push(errorMsg)
          }
        }

        // Clear the paths in the jobs table
        const { error: updateError } = await supabase
          .from('jobs')
          .update({
            master_path: null,
            preview_path: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id)

        if (updateError) {
          const errorMsg = `Failed to update job ${job.id}: ${updateError.message}`
          console.error(errorMsg)
          result.errors.push(errorMsg)
        } else {
          console.log(`Cleared audio paths for job ${job.id}`)
        }
      } else {
        // Dry run - just count what would be deleted
        result.filesDeleted += filesToDelete.length
        console.log(`[DRY RUN] Would delete ${filesToDelete.length} file(s) for job ${job.id}`)
      }

      result.jobsProcessed++
    }

    // Check if there are more jobs to process
    const { count: remainingCount } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed')
      .lt('completed_at', expirationThreshold)
      .or('master_path.not.is.null,preview_path.not.is.null')

    const hasMore = (remainingCount || 0) > 0

    console.log(`Cleanup complete. Processed: ${result.jobsProcessed}, Files deleted: ${result.filesDeleted}, Errors: ${result.errors.length}, More remaining: ${hasMore}`)

    return new Response(
      JSON.stringify({
        ...result,
        hasMoreToProcess: hasMore,
        remainingJobs: remainingCount || 0,
        expirationThreshold,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Cleanup function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
