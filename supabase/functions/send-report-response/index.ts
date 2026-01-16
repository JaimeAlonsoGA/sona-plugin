/**
 * Send Report Response Edge Function
 * 
 * Sends email responses to users who submitted reports using Resend.
 * Supports different templates and sender addresses based on report type.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Available sender emails
const SENDER_EMAILS = {
  support: 'SONA Support <support@sona.audio>',
  hello: 'SONA <hello@sona.audio>',
  jaime: 'Jaime Alonso <jaime.alonso@sona.audio>',
  development: 'SONA Development <development@sona.audio>',
} as const

// Default sender based on feedback type
const DEFAULT_SENDERS: Record<string, keyof typeof SENDER_EMAILS> = {
  bug: 'support',
  feature: 'development',
  prompting: 'development',
  general: 'hello',
}

// Email templates
const TEMPLATES = {
  bug: (message: string, userName?: string) => ({
    subject: 'Re: Your Bug Report - SONA',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #141414; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%); padding: 32px; text-align: center;">
              <img src="https://ucxhzpxyjxuhlqmbomrv.supabase.co/storage/v1/object/public/sona-branding/sona-icon.png" alt="SONA" width="120" style="margin-bottom: 16px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Bug Report Update</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${userName ? `Hi ${userName},` : 'Hi there,'}
              </p>
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for reporting this issue. Our team has reviewed your bug report and here's our response:
              </p>
              <div style="background-color: #1a1a1a; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                If you have any additional information or questions, feel free to reply to this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 24px 32px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                © 2026 SONA Audio. All rights reserved.
              </p>
              <p style="color: #666666; font-size: 12px; margin: 8px 0 0 0;">
                <a href="https://sona.audio" style="color: #a78bfa; text-decoration: none;">sona.audio</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  feature: (message: string, userName?: string) => ({
    subject: 'Re: Your Feature Request - SONA',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #141414; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%); padding: 32px; text-align: center;">
              <img src="https://sona.audio/logo.png" alt="SONA" width="120" style="margin-bottom: 16px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Feature Request Update</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${userName ? `Hi ${userName},` : 'Hi there,'}
              </p>
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for your feature suggestion! We love hearing ideas from our community. Here's an update from our development team:
              </p>
              <div style="background-color: #1a1a1a; border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                We're always working to make SONA better. Keep the ideas coming!
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 24px 32px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                © 2026 SONA Audio. All rights reserved.
              </p>
              <p style="color: #666666; font-size: 12px; margin: 8px 0 0 0;">
                <a href="https://sona.audio" style="color: #a78bfa; text-decoration: none;">sona.audio</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  prompting: (message: string, userName?: string) => ({
    subject: 'Re: Your Prompting Feedback - SONA',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #141414; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%); padding: 32px; text-align: center;">
              <img src="https://sona.audio/logo.png" alt="SONA" width="120" style="margin-bottom: 16px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Prompting Feedback Response</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${userName ? `Hi ${userName},` : 'Hi there,'}
              </p>
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for your feedback about our prompting system. Your input helps us improve the AI generation experience. Here's our response:
              </p>
              <div style="background-color: #1a1a1a; border-left: 4px solid #a78bfa; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                Your insights are valuable for improving SONA's audio generation capabilities.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 24px 32px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                © 2026 SONA Audio. All rights reserved.
              </p>
              <p style="color: #666666; font-size: 12px; margin: 8px 0 0 0;">
                <a href="https://sona.audio" style="color: #a78bfa; text-decoration: none;">sona.audio</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  general: (message: string, userName?: string) => ({
    subject: 'Re: Your Message - SONA',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #141414; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%); padding: 32px; text-align: center;">
              <img src="https://sona.audio/logo.png" alt="SONA" width="120" style="margin-bottom: 16px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Message from SONA</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${userName ? `Hi ${userName},` : 'Hi there,'}
              </p>
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for reaching out to us. Here's our response to your message:
              </p>
              <div style="background-color: #1a1a1a; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                If you have any other questions, don't hesitate to reach out!
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 24px 32px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                © 2026 SONA Audio. All rights reserved.
              </p>
              <p style="color: #666666; font-size: 12px; margin: 8px 0 0 0;">
                <a href="https://sona.audio" style="color: #a78bfa; text-decoration: none;">sona.audio</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),
}

interface RequestBody {
  reportId: string
  recipientEmail: string
  message: string
  feedbackType: 'bug' | 'feature' | 'prompting' | 'general'
  senderKey?: keyof typeof SENDER_EMAILS
  userName?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate environment
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables not configured')
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's token
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    // Verify user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check admin status
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_admin', { check_user_id: user.id })

    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: RequestBody = await req.json()
    const { reportId, recipientEmail, message, feedbackType, senderKey, userName } = body

    // Validate required fields
    if (!reportId || !recipientEmail || !message || !feedbackType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: reportId, recipientEmail, message, feedbackType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid recipient email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get sender email (use provided key or default based on feedback type)
    const sender = SENDER_EMAILS[senderKey || DEFAULT_SENDERS[feedbackType] || 'hello']

    // Get template based on feedback type
    const template = TEMPLATES[feedbackType] || TEMPLATES.general
    const { subject, html } = template(message, userName)

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [recipientEmail],
        subject,
        html,
        reply_to: sender.match(/<(.+)>/)?.[1] || 'hello@sona.audio',
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json()
      console.error('[SendReportResponse] Resend API error:', errorData)
      throw new Error(`Resend API error: ${errorData.message || 'Unknown error'}`)
    }

    const resendData = await resendResponse.json()

    // Update report with response info
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        admin_notes: `[Email sent to ${recipientEmail} on ${new Date().toISOString()}]\n\n${message}`,
        status: 'reviewed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (updateError) {
      console.error('[SendReportResponse] Error updating report:', updateError)
      // Don't fail the request since email was sent successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailId: resendData.id,
        message: 'Email sent successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[SendReportResponse] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
