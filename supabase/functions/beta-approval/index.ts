/**
 * Beta Approval Edge Function
 * 
 * This function handles beta application approval:
 * 1. Updates the application status to 'approved'
 * 2. Sets approved_at timestamp
 * 3. Sends approval email via Resend
 * 
 * Required environment variables:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - RESEND_API_KEY
 * 
 * Called by admin dashboard or automated approval system
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Beta approval email template
const generateApprovalEmail = (firstName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're In! Welcome to SONA Beta</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0a0a0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 48px 40px; }
    .heading { color: #fafafa; font-weight: 500; }
    .body-text { color: #a1a1aa; line-height: 1.6; }
    .cta-button { display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff !important; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; }
    .step-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px 16px; text-align: center; }
    .step-number { width: 40px; height: 40px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); border-radius: 50%; color: #fff; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .gift-box { background: linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(217, 119, 6, 0.02) 100%); border: 1px solid rgba(217, 119, 6, 0.2); border-radius: 16px; padding: 24px; text-align: center; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div style="text-align: center; padding-bottom: 40px;">
      <img src="https://xniixyeksaolrompxvbz.supabase.co/storage/v1/object/public/sona-branding/sona-icon.png" alt="SONA" width="48" height="48" style="border-radius: 12px; display: inline-block; vertical-align: middle;" />
      <span class="heading" style="font-size: 28px; margin-left: 12px; vertical-align: middle;">SONA</span>
    </div>
    
    <div class="card">
      <!-- Celebration Icon -->
      <div style="text-align: center; padding-bottom: 24px;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">🎉</span>
        </div>
      </div>
      
      <!-- Welcome Message -->
      <div style="text-align: center; padding-bottom: 32px;">
        <h1 class="heading" style="margin: 0; font-size: 36px;">You're In!</h1>
        <p class="body-text" style="margin: 16px 0 0 0; font-size: 18px; color: #d4d4d8;">
          Welcome to the SONA Beta, ${firstName}!
        </p>
        <p class="body-text" style="margin: 12px 0 0 0; font-size: 15px;">
          Your application has been approved. You now have full access<br/>
          to download and use SONA for AI audio generation.
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; padding: 16px 0 40px 0;">
        <a href="https://sona.audio/download" class="cta-button">Download SONA Now</a>
      </div>
      
      <!-- Divider -->
      <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%); margin-bottom: 40px;"></div>
      
      <!-- Getting Started Steps -->
      <h2 class="heading" style="text-align: center; font-size: 20px; margin-bottom: 24px;">Get Started in 3 Steps</h2>
      
      <table width="100%" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
        <tr>
          <td width="33%" style="padding: 0 8px 0 0; vertical-align: top;">
            <div class="step-box">
              <div class="step-number">1</div>
              <div class="body-text" style="color: #fafafa; font-weight: 500; margin-bottom: 8px;">Download</div>
              <div class="body-text" style="font-size: 13px;">Get the VST3 plugin for your platform</div>
            </div>
          </td>
          <td width="33%" style="padding: 0 8px; vertical-align: top;">
            <div class="step-box">
              <div class="step-number">2</div>
              <div class="body-text" style="color: #fafafa; font-weight: 500; margin-bottom: 8px;">Install</div>
              <div class="body-text" style="font-size: 13px;">Add to your VST folder and scan</div>
            </div>
          </td>
          <td width="33%" style="padding: 0 0 0 8px; vertical-align: top;">
            <div class="step-box">
              <div class="step-number">3</div>
              <div class="body-text" style="color: #fafafa; font-weight: 500; margin-bottom: 8px;">Create</div>
              <div class="body-text" style="font-size: 13px;">Sign in and start generating audio!</div>
            </div>
          </td>
        </tr>
      </table>
      
      <!-- Beta Tokens Info -->
      <div class="gift-box">
        <span style="font-size: 32px; display: block; margin-bottom: 8px;">🎁</span>
        <span class="heading" style="font-size: 18px; display: block; margin-bottom: 8px;">Beta Welcome Gift</span>
        <span class="body-text" style="font-size: 14px;">
          As a beta tester, you receive <strong style="color: #d97706;">1,000 free tokens</strong><br/>
          to explore and create with SONA!
        </span>
      </div>
    </div>
    
    <!-- Help Section -->
    <div style="text-align: center; padding: 32px 0;">
      <p class="body-text" style="margin: 0 0 16px 0; font-size: 14px; color: #d4d4d8;">Need help getting started?</p>
      <a href="https://sona.audio/docs" style="color: #d97706; text-decoration: none; font-size: 14px; font-weight: 500; margin: 0 12px;">📖 Documentation</a>
      <a href="https://discord.gg/sona" style="color: #d97706; text-decoration: none; font-size: 14px; font-weight: 500; margin: 0 12px;">💬 Discord Community</a>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 32px;">
      <a href="https://twitter.com/sonaudio" style="color: #71717a; text-decoration: none; font-size: 13px; margin: 0 8px;">Twitter</a>
      <span style="color: #3f3f46;">•</span>
      <a href="https://discord.gg/sona" style="color: #71717a; text-decoration: none; font-size: 13px; margin: 0 8px;">Discord</a>
      <span style="color: #3f3f46;">•</span>
      <a href="https://sona.audio" style="color: #71717a; text-decoration: none; font-size: 13px; margin: 0 8px;">Website</a>
      <p class="body-text" style="margin: 24px 0 0 0; font-size: 11px; color: #52525b;">
        © 2026 SONA Audio. All rights reserved.<br/>
        You're receiving this because your beta application was approved.
      </p>
    </div>
  </div>
</body>
</html>
`

interface ApprovalRequest {
  userId: string
  adminNotes?: string
}

interface ResendEmailPayload {
  from: string
  to: string
  subject: string
  html: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate required env vars
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY - please configure in Supabase secrets')
    }

    // Parse request body
    const { userId, adminNotes }: ApprovalRequest = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role (admin access)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user's beta application
    const { data: application, error: fetchError } = await supabase
      .from('beta_applications')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError || !application) {
      return new Response(
        JSON.stringify({ error: 'Beta application not found', details: fetchError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already approved
    if (application.status === 'approved') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Application already approved',
          emailSent: false 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update application status to approved
    const { error: updateError } = await supabase
      .from('beta_applications')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        admin_notes: adminNotes || application.admin_notes
      })
      .eq('user_id', userId)

    if (updateError) {
      throw new Error(`Failed to update application: ${updateError.message}`)
    }

    // Grant welcome tokens to the approved user (1000 tokens)
    const WELCOME_TOKENS = 1000
    let tokensGranted = false
    
    try {
      const { error: tokenError } = await supabase.rpc('add_user_tokens', {
        p_user_id: userId,
        p_amount: WELCOME_TOKENS,
        p_transaction_type: 'bonus',
        p_description: 'Beta welcome bonus - 1000 tokens'
      })

      if (tokenError) {
        console.error('Failed to grant welcome tokens:', tokenError)
        // Don't fail the approval if token grant fails - can be done manually
      } else {
        console.log(`Granted ${WELCOME_TOKENS} welcome tokens to user ${userId}`)
        tokensGranted = true
      }
    } catch (tokenErr) {
      console.error('Error granting welcome tokens:', tokenErr)
    }

    // Send approval email via Resend
    const emailPayload: ResendEmailPayload = {
      from: 'SONA <noreply@sona.audio>',
      to: application.email,
      subject: "🎉 You're In! Welcome to SONA Beta",
      html: generateApprovalEmail(application.first_name)
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })

    const resendResult = await resendResponse.json()

    if (!resendResponse.ok) {
      // Log error but don't fail the approval - email can be retried
      console.error('Resend API error:', resendResult)
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Application approved but email failed to send',
          emailSent: false,
          emailError: resendResult.message || 'Unknown email error',
          tokensGranted,
          tokensAmount: tokensGranted ? WELCOME_TOKENS : 0,
          application: {
            id: application.id,
            email: application.email,
            firstName: application.first_name,
            status: 'approved'
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Success - application approved and email sent
    return new Response(
      JSON.stringify({
        success: true,
        message: `Application approved, email sent${tokensGranted ? `, and ${WELCOME_TOKENS} tokens granted` : ''}`,
        emailSent: true,
        emailId: resendResult.id,
        tokensGranted,
        tokensAmount: tokensGranted ? WELCOME_TOKENS : 0,
        application: {
          id: application.id,
          email: application.email,
          firstName: application.first_name,
          status: 'approved'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Beta approval error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})