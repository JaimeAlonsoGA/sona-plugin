/**
 * Supabase Edge Function: Generate Audio Job
 * 
 * This function validates user input, authenticates via Supabase JWT,
 * and creates a job in the database for audio generation.
 * 
 * NOTE: This function does NOT handle actual audio generation.
 * The Stable Audio API key is NOT exposed or used here.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for web requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
}

// Input validation schema
interface GenerateRequest {
  prompt: string
  duration?: number
  quality?: 'low' | 'medium' | 'high'
  mode?: string
}

interface JobRecord {
  user_id: string
  prompt: string
  duration: number
  quality: string
  mode: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  created_at?: string
}

/**
 * Validate input parameters
 */
function validateInput(body: GenerateRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate prompt
  if (!body.prompt || typeof body.prompt !== 'string') {
    errors.push('Prompt is required and must be a string')
  } else if (body.prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty')
  } else if (body.prompt.length > 500) {
    errors.push('Prompt must be 500 characters or less')
  }

  // Validate duration (optional, default to 10 seconds)
  if (body.duration !== undefined) {
    if (typeof body.duration !== 'number') {
      errors.push('Duration must be a number')
    } else if (body.duration < 1 || body.duration > 60) {
      errors.push('Duration must be between 1 and 60 seconds')
    }
  }

  // Validate quality (optional)
  if (body.quality !== undefined) {
    const validQualities = ['low', 'medium', 'high']
    if (!validQualities.includes(body.quality)) {
      errors.push(`Quality must be one of: ${validQualities.join(', ')}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get token from custom header (x-user-token) or Authorization header
    // x-user-token is used because Supabase gateway may filter Authorization header
    const customToken = req.headers.get('x-user-token')
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    
    // Extract token from either source
    let token: string | null = null
    if (customToken) {
      token = customToken
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '')
    }
    
    if (!token) {
      console.error('No token found in headers')
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Missing authentication token'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase client with the user's JWT to verify identity
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    )

    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Token verification failed:', userError?.message || 'No user')
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Invalid authentication token'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create admin client for database operations (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Log authentication success
    console.log(`Request authenticated for user: ${user.id}`)

    // Parse request body
    let body: GenerateRequest
    try {
      body = await req.json()
    } catch (e) {
      console.error('Invalid JSON:', e)
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request',
          message: 'Invalid JSON in request body'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate input
    const validation = validateInput(body)
    if (!validation.valid) {
      console.error('Validation failed:', validation.errors)
      return new Response(
        JSON.stringify({ 
          error: 'Validation Error',
          message: 'Invalid input parameters',
          details: validation.errors
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create job record in database
    const jobData: JobRecord = {
      user_id: user.id,
      prompt: body.prompt.trim(),
      duration: body.duration ?? 10, // Default 10 seconds
      quality: body.quality ?? 'medium', // Default medium quality
      mode: body.mode ?? 'default',
      status: 'queued',
    }

    // Log job creation (prompts are user content, not PII)
    console.log('Creating job with params:', {
      user_id: user.id,
      duration: jobData.duration,
      quality: jobData.quality,
      mode: jobData.mode,
      promptLength: jobData.prompt.length
    })

    const { data: job, error: dbError } = await supabaseAdmin
      .from('jobs')
      .insert([jobData])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ 
          error: 'Database Error',
          message: 'Failed to create job',
          details: dbError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Log successful job creation with job ID for tracing
    console.log('Job created successfully with ID:', job.id)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        job_id: job.id,
        status: job.status,
        message: 'Job created successfully',
        job: {
          id: job.id,
          prompt: job.prompt,
          duration: job.duration,
          quality: job.quality,
          mode: job.mode,
          status: job.status,
          created_at: job.created_at,
        }
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
