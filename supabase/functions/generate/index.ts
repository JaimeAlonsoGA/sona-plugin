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

// ============================================
// TOKEN COST CONFIGURATION
// Must match Plugin/ui/src/lib/token-costs.ts
// ============================================
type GenerationTier = 'designer' | 'producer' | 'creator'
type QualityLevel = 'draft' | 'standard' | 'high'

const TOKEN_COSTS = {
  /** Base cost by tier */
  BASE: {
    designer: 4,
    producer: 12,
    creator: 20,
  } as const,

  /** Additional cost by quality level per tier */
  QUALITY: {
    designer: { draft: 0, standard: 3, high: 8 },
    producer: { draft: 0, standard: 4, high: 10 },
    creator: { draft: 0, standard: 5, high: 13 },
  } as const,

  /** Additional cost by duration per tier (in seconds) */
  DURATION: {
    designer: { 10: 2, 20: 4 },
    producer: { 8: 3, 18: 5, 30: 8 },
    creator: { 120: 5, 180: 8 },
  } as const,
}

/**
 * Find the closest duration tier for cost calculation
 */
function findClosestDurationTier(tier: GenerationTier, duration: number): number | null {
  const tierDurations = TOKEN_COSTS.DURATION[tier]
  const tiers = Object.keys(tierDurations).map(Number).sort((a, b) => a - b)
  
  for (const tierKey of tiers) {
    if (duration <= tierKey) return tierKey
  }
  
  return tiers[tiers.length - 1] ?? null
}

/**
 * Calculate token cost based on generation parameters
 */
function calculateTokenCost(tier: GenerationTier, duration: number, quality: string): number {
  let cost = TOKEN_COSTS.BASE[tier]
  
  // Duration extra cost
  const durationTier = findClosestDurationTier(tier, duration)
  if (durationTier !== null) {
    const tierDurations = TOKEN_COSTS.DURATION[tier] as Record<number, number>
    cost += tierDurations[durationTier] ?? 0
  }
  
  // Quality extra cost - normalize quality string
  const normalizedQuality = (quality === 'medium' ? 'standard' : quality === 'low' ? 'draft' : quality) as QualityLevel
  cost += TOKEN_COSTS.QUALITY[tier][normalizedQuality] ?? 0
  
  return cost
}

/**
 * Format duration for display
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) return `${minutes}m`
  return `${minutes}m ${remainingSeconds}s`
}

/**
 * Generate description for token transaction
 */
function generateCostDescription(tier: GenerationTier, duration: number, quality: string, prompt: string): string {
  const promptSummary = prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1)
  return `${tierLabel} (${formatDuration(duration)}, ${quality}): "${promptSummary}"`
}

// Input validation schema
interface GenerateRequest {
  prompt: string
  duration?: number | null  // null means unspecified/auto (defaults to 10s)
  quality?: 'low' | 'medium' | 'high'
  mode?: 'designer' | 'producer' | 'creator'
  namingConvention?: {
    parameters: Array<{
      type: string
      value?: string
      format?: string
    }>
    separator: string
  }
  // Skip GPT naming convention for faster processing
  skipNaming?: boolean
  // Musical key parameters
  key?: string  // e.g., 'C', 'C#', 'D', etc.
  scale?: 'major' | 'minor'
  // Producer mode parameters
  bpm?: number
  timeSignature?: string  // e.g., '4/4'
  bars?: number
  producerType?: 'song' | 'loop' | 'one-shot'
  // Creator mode parameters
  userEmail?: string  // For AES naming convention
}

interface JobRecord {
  user_id: string
  prompt: string
  duration: number
  quality: string
  mode: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  naming_convention?: string // JSON string
  // Musical key (stored as JSON for flexibility)
  musical_key?: string  // JSON: { key: string, scale: string }
  // Producer metadata
  producer_config?: string  // JSON: { type, bpm, timeSignature, bars }
  // Creator mode
  user_email?: string
  // Skip naming convention generation
  skip_naming?: boolean
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
  } else if (body.prompt.length > 800) {
    errors.push('Prompt must be 800 characters or less')
  } else if (body.prompt.length < 5) {
    errors.push('Prompt must be at least 5 characters long')
  } 
  // else if (/[^a-zA-Z0-9 ,.'"!?\-]/.test(body.prompt)) {
  //   errors.push('Prompt contains invalid characters')
  // } else if (/https?:\/\//.test(body.prompt)) {
  //   errors.push('Prompt cannot contain URLs')
  // } else if (/[\u{1F600}-\u{1F64F}]/u.test(body.prompt)) {
  //   errors.push('Prompt cannot contain emojis')
  // } else if (/<script.*?>/i.test(body.prompt)) {
  //   errors.push('Prompt cannot contain script tags')
  // } 

  // Validate duration (optional, default to 10 seconds if null or undefined)
  if (body.duration !== undefined && body.duration !== null) {
    if (typeof body.duration !== 'number') {
      errors.push('Duration must be a number or null')
    } else if (body.duration < 1 || body.duration > 180) {
      errors.push('Duration must be between 1 and 180 seconds (3 minutes)')
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    console.log('Auth debug:', {
      hasToken: !!token,
      tokenPreview: token?.substring(0, 30) + '...',
      tokenAlg: token ? JSON.parse(atob(token.split('.')[0])).alg : 'unknown',
      supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
    })
    
    // Use service role client to verify user - more reliable
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Verify the JWT using admin client's getUser with the token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    console.log('User verification result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userError: userError?.message,
      errorCode: userError?.code,
    })
    
    if (userError || !user) {
      console.error('Token verification failed:', userError?.message || 'No user')
      return new Response(
        JSON.stringify({ 
          code: 401,
          error: 'Unauthorized',
          message: 'Invalid JWT',
          details: userError?.message,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

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

    // ============================================
    // TOKEN VERIFICATION AND CHARGING
    // ============================================
    const mode = (body.mode ?? 'designer') as GenerationTier
    const tokenCost = calculateTokenCost(
      mode,
      body.duration ?? 10,
      body.quality ?? 'standard'
    )
    
    console.log('Token cost calculation:', {
      tier: mode,
      duration: body.duration ?? 10,
      quality: body.quality ?? 'standard',
      calculatedCost: tokenCost,
    })

    // Check if user has enough tokens
    const { data: hasTokens, error: checkError } = await supabaseAdmin.rpc('check_user_tokens', {
      p_user_id: user.id,
      p_required: tokenCost,
    })

    if (checkError) {
      console.error('Token check error:', checkError)
      return new Response(
        JSON.stringify({
          error: 'Token Check Failed',
          message: 'Could not verify token balance',
          details: checkError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!hasTokens) {
      console.log('Insufficient tokens for user:', user.id)
      return new Response(
        JSON.stringify({
          error: 'Insufficient Tokens',
          message: `This generation requires ${tokenCost} tokens`,
          code: 'INSUFFICIENT_TOKENS',
          required: tokenCost,
        }),
        {
          status: 402, // Payment Required
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Charge tokens BEFORE creating the job
    const costDescription = generateCostDescription(
      mode,
      body.duration ?? 10,
      body.quality ?? 'standard',
      body.prompt.trim()
    )
    
    const { data: tokenCharged, error: chargeError } = await supabaseAdmin.rpc('use_tokens', {
      p_user_id: user.id,
      p_amount: tokenCost,
      p_description: costDescription,
    })

    if (chargeError || !tokenCharged) {
      console.error('Token charge failed:', chargeError?.message || 'Unknown error')
      return new Response(
        JSON.stringify({
          error: 'Token Charge Failed',
          message: 'Could not deduct tokens. Please try again.',
          details: chargeError?.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Tokens charged successfully:', { userId: user.id, amount: tokenCost })

    // Create job record in database
    const jobData: JobRecord = {
      user_id: user.id,
      prompt: body.prompt.trim(),
      duration: body.duration ?? 10, // Default 10 seconds
      quality: body.quality ?? 'standard', // Default standard quality
      mode: body.mode ?? 'designer',
      status: 'queued',
      naming_convention: body.namingConvention ? JSON.stringify(body.namingConvention) : undefined,
      // Skip naming convention generation for faster processing
      skip_naming: body.skipNaming ?? false,
      // Store musical key if provided (check for key existence, not truthiness)
      musical_key: body.key !== undefined && body.key !== null
        ? JSON.stringify({ key: body.key, scale: body.scale || 'major' }) 
        : undefined,
      // Store producer config if in producer or creator mode
      producer_config: (body.mode === 'producer' || body.mode === 'creator') && body.bpm !== undefined && body.bpm !== null
        ? JSON.stringify({ 
            type: body.producerType || (body.mode === 'creator' ? 'song' : 'loop'),
            bpm: body.bpm, 
            timeSignature: body.timeSignature || '4/4', 
            bars: body.bars || 4 
          })
        : undefined,
      // Store user email for Creator mode naming convention
      user_email: body.mode === 'creator' ? body.userEmail : undefined,
    }

    // Log job creation with all parameters - more detailed
    console.log('Creating job with params:', {
      user_id: user.id,
      duration: jobData.duration,
      quality: jobData.quality,
      mode: jobData.mode,
      promptLength: jobData.prompt.length,
      hasNamingConvention: !!body.namingConvention,
      // Raw input values for debugging
      rawKey: body.key,
      rawScale: body.scale,
      rawBpm: body.bpm,
      rawTimeSignature: body.timeSignature,
      rawBars: body.bars,
      rawUserEmail: body.userEmail ? '***@***' : undefined,
      // What we're storing
      musical_key: jobData.musical_key,
      producer_config: jobData.producer_config,
      user_email: jobData.user_email ? '***@***' : undefined,
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

    // Return success response with token info
    return new Response(
      JSON.stringify({
        success: true,
        job_id: job.id,
        status: job.status,
        message: 'Job created successfully',
        tokens_charged: tokenCost,
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
