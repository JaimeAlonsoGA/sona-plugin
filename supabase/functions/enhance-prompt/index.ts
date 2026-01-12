/**
 * Supabase Edge Function: Enhance Prompt
 * 
 * Optional prompt enhancement using GPT-5-nano.
 * This is a separate, user-initiated action that costs 1 token.
 * 
 * Unlike the main generation flow, this ONLY enhances the prompt text
 * and does NOT generate naming conventions.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'

// CORS headers for web requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
}

// Token cost for prompt enhancement
const ENHANCEMENT_TOKEN_COST = 1

interface EnhanceRequest {
  prompt: string
  mode?: 'designer' | 'producer' | 'creator'
}

interface EnhanceResponse {
  success: boolean
  enhancedPrompt: string
  tokensCharged: number
}

/**
 * Build system prompt for the given mode
 */
function buildSystemPrompt(mode: string): string {
  switch (mode) {
    case 'producer':
      return `You are an expert music production AI assistant. Enhance the user's prompt to create better musical loops.

ENHANCEMENT RULES:
1. Add specific instrument details and sound characteristics
2. Include production style descriptors (e.g., "punchy kicks", "warm analog bass", "crisp hi-hats")
3. Suggest tempo feel if rhythmic (e.g., "laid-back groove", "driving rhythm")
4. Add texture words (e.g., "saturated", "airy", "gritty")
5. Keep it concise (max 100 words)
6. DO NOT add duration, BPM numbers, or technical specs - those are handled separately
7. Focus on SONIC QUALITY and VIBE

Return ONLY the enhanced prompt text, nothing else.`

    case 'creator':
      return `You are an expert music composition AI assistant. Enhance the user's prompt to create better full songs.

ENHANCEMENT RULES:
1. Add musical structure hints (e.g., "building intro", "powerful chorus", "emotional bridge")
2. Include instrumentation details (e.g., "layered synths", "acoustic drums", "orchestral strings")
3. Describe the emotional arc and mood progression
4. Add production style (e.g., "polished pop production", "raw indie sound")
5. Keep it concise (max 120 words)
6. DO NOT add duration, BPM numbers, or technical specs - those are handled separately
7. Focus on COMPOSITION and ARRANGEMENT

Return ONLY the enhanced prompt text, nothing else.`

    case 'designer':
    default:
      return `You are an expert sound design AI assistant. Enhance the user's prompt to create better sound effects.

ENHANCEMENT RULES:
1. Identify and emphasize the sound SOURCE (what makes the sound)
2. Describe the ACTION or movement (e.g., "swooping", "crackling", "thudding")
3. Add texture and character words (e.g., "metallic", "organic", "digital")
4. Suggest spatial qualities (e.g., "close mic", "distant reverb", "stereo width")
5. Include dynamic information (e.g., "sharp attack", "long decay", "building intensity")
6. Keep it concise (max 80 words)
7. Focus on SONIC CHARACTERISTICS, not narrative context

Return ONLY the enhanced prompt text, nothing else.`
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Debug: Log all incoming headers
    const allHeaders: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      // Mask sensitive values for logging
      if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'apikey' || key.toLowerCase() === 'x-user-token') {
        allHeaders[key] = value.substring(0, 30) + '...'
      } else {
        allHeaders[key] = value
      }
    })
    console.log('Incoming headers:', JSON.stringify(allHeaders, null, 2))

    // Get token from custom header or Authorization
    const customToken = req.headers.get('x-user-token')
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    
    console.log('Token extraction:', {
      hasCustomToken: !!customToken,
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20),
    })
    
    let token: string | null = null
    if (customToken) {
      token = customToken
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '')
    }
    
    if (!token) {
      console.error('No token found after extraction')
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Missing authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Token found, length:', token.length)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? ''
    
    if (!openaiApiKey) {
      console.error('Missing OPENAI_API_KEY')
      return new Response(
        JSON.stringify({ error: 'Configuration Error', message: 'Service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Verify user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Invalid JWT' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    let body: EnhanceRequest
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate prompt
    if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Validation Error', message: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (body.prompt.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Validation Error', message: 'Prompt must be 500 characters or less' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check and charge tokens
    const { data: hasTokens } = await supabaseAdmin.rpc('check_user_tokens', {
      p_user_id: user.id,
      p_required: ENHANCEMENT_TOKEN_COST,
    })

    if (!hasTokens) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient Tokens',
          message: `Prompt enhancement requires ${ENHANCEMENT_TOKEN_COST} token`,
          code: 'INSUFFICIENT_TOKENS',
          required: ENHANCEMENT_TOKEN_COST,
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Charge token
    const { data: tokenCharged, error: chargeError } = await supabaseAdmin.rpc('use_tokens', {
      p_user_id: user.id,
      p_amount: ENHANCEMENT_TOKEN_COST,
      p_description: `Prompt enhancement (${body.mode || 'designer'})`,
    })

    if (chargeError || !tokenCharged) {
      return new Response(
        JSON.stringify({ error: 'Token Charge Failed', message: 'Could not deduct tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI to enhance prompt
    const openai = new OpenAI({ apiKey: openaiApiKey })
    const mode = body.mode || 'designer'
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-5-nano-2025-08-07', // Fast and cheap model for simple enhancement
        messages: [
          { role: 'system', content: buildSystemPrompt(mode) },
          { role: 'user', content: body.prompt.trim() }
        ],
        max_tokens: 200,
        temperature: 0.7,
      })

      const enhancedPrompt = response.choices[0]?.message?.content?.trim() || body.prompt

      console.log('Prompt enhanced successfully', {
        userId: user.id,
        mode,
        originalLength: body.prompt.length,
        enhancedLength: enhancedPrompt.length,
      })

      return new Response(
        JSON.stringify({
          success: true,
          enhancedPrompt,
          tokensCharged: ENHANCEMENT_TOKEN_COST,
        } as EnhanceResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (aiError) {
      console.error('OpenAI error:', aiError)
      
      // Refund the token on AI failure
      await supabaseAdmin.rpc('add_tokens', {
        p_user_id: user.id,
        p_amount: ENHANCEMENT_TOKEN_COST,
        p_description: 'Refund: Prompt enhancement failed',
      })

      return new Response(
        JSON.stringify({ 
          error: 'Enhancement Failed', 
          message: 'Could not enhance prompt. Token refunded.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
