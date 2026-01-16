/**
 * Supabase Edge Function: Submit Report
 * 
 * Handles feedback submissions from users.
 * Supports both authenticated and anonymous submissions.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for web requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Allowed feedback types
const VALID_FEEDBACK_TYPES = ['bug', 'feature', 'general', 'prompting'] as const
type FeedbackType = typeof VALID_FEEDBACK_TYPES[number]

interface ReportRequest {
  feedbackType: FeedbackType
  message: string
  email?: string
  jobId?: string
  jobStorageUrl?: string
}

interface ReportResponse {
  success: boolean
  reportId?: string
  message: string
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const body: ReportRequest = await req.json()
    
    // Validate required fields
    if (!body.message || body.message.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (body.message.length > 5000) {
      return new Response(
        JSON.stringify({ success: false, message: 'Message must be less than 5000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Validate feedback type
    const feedbackType = body.feedbackType || 'general'
    if (!VALID_FEEDBACK_TYPES.includes(feedbackType)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid feedback type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Validate email format if provided
    if (body.email && body.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create Supabase client with service role (to bypass RLS for insert)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration')
      return new Response(
        JSON.stringify({ success: false, message: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Try to get authenticated user (optional)
    let userId: string | null = null
    const authHeader = req.headers.get('Authorization')
    
    if (authHeader) {
      const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey)
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
      
      if (!authError && user) {
        userId = user.id
        console.log(`[submit-report] Authenticated user: ${userId}`)
      }
    }
    
    // Create service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Validate job_id if provided and user is authenticated
    let validJobId: string | null = null
    let validStorageUrl: string | null = null
    
    if (body.jobId && userId) {
      // Verify the job belongs to the user
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id, preview_path')
        .eq('id', body.jobId)
        .eq('user_id', userId)
        .single()
      
      if (!jobError && job) {
        validJobId = job.id
        validStorageUrl = body.jobStorageUrl || job.preview_path
        console.log(`[submit-report] Linking job: ${validJobId}`)
      } else {
        console.warn(`[submit-report] Invalid job_id or job doesn't belong to user`)
      }
    }
    
    // Insert the report
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        email: body.email?.trim() || null,
        feedback_type: feedbackType,
        message: body.message.trim(),
        job_id: validJobId,
        job_storage_url: validStorageUrl,
        status: 'pending',
      })
      .select('id')
      .single()
    
    if (insertError) {
      console.error('[submit-report] Insert error:', insertError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to submit report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`[submit-report] Report created: ${report.id}`)
    
    // Send email notifications (fire and forget - don't block response)
    if (body.email?.trim()) {
      try {
        const emailPayload = {
          userEmail: body.email.trim(),
          feedbackType: feedbackType,
          message: body.message.trim(),
          jobId: validJobId,
        }
        
        // Call the send-feedback-notification function
        fetch(`${supabaseUrl}/functions/v1/send-feedback-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify(emailPayload),
        }).catch(err => console.error('[submit-report] Email notification error:', err))
        
        console.log(`[submit-report] Email notification triggered for ${body.email}`)
      } catch (emailError) {
        console.error('[submit-report] Failed to trigger email notification:', emailError)
        // Don't fail the report submission if email fails
      }
    }
    
    const response: ReportResponse = {
      success: true,
      reportId: report.id,
      message: 'Report submitted successfully',
    }
    
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('[submit-report] Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
