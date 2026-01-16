/**
 * Send Beta Approved Email Edge Function
 * 
 * Sends email notification when a user is approved for beta access.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface RequestBody {
  userEmail: string
  userName?: string
  bonusTokens?: number
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getTemplate = (userName: string | undefined, bonusTokens: number) => ({
  subject: '🎉 Welcome to the SONA Beta!',
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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">You're In! 🎉</h1>
              <p style="color: #a78bfa; margin: 8px 0 0 0; font-size: 16px;">Welcome to the SONA Beta Program</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${userName ? `Hi ${userName},` : 'Hi there,'}
              </p>
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Great news! Your application to join the <strong style="color: #a78bfa;">SONA Beta Program</strong> has been approved. You now have full access to our AI-powered audio generation platform.
              </p>

              <!-- Bonus Tokens Box -->
              <div style="background: linear-gradient(135deg, #a78bfa20 0%, #1a1a1a 100%); border: 1px solid #a78bfa40; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
                <p style="color: #a78bfa; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">Beta Bonus</p>
                <p style="color: #ffffff; font-size: 48px; font-weight: 700; margin: 0;">${bonusTokens}</p>
                <p style="color: #a0a0a0; font-size: 14px; margin: 8px 0 0 0;">Free tokens added to your account</p>
              </div>

              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                As a beta tester, you'll get:
              </p>
              <ul style="color: #a0a0a0; font-size: 15px; line-height: 2; margin: 0; padding-left: 20px;">
                <li>Early access to new features</li>
                <li>Direct line to our development team</li>
                <li>Influence on SONA's future direction</li>
                <li>Special beta tester perks</li>
              </ul>

              <div style="text-align: center; margin-top: 32px;">
                <a href="https://sona.audio/download" style="display: inline-block; background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%); color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Download SONA</a>
              </div>

              <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0; text-align: center;">
                Questions? Just reply to this email or reach out at <a href="mailto:support@sona.audio" style="color: #a78bfa;">support@sona.audio</a>
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
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const body: RequestBody = await req.json()
    const { userEmail, userName, bonusTokens = 100 } = body

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: userEmail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const template = getTemplate(userName, bonusTokens)
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SONA <hello@sona.audio>',
        to: [userEmail],
        subject: template.subject,
        html: template.html,
        reply_to: 'support@sona.audio',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[SendBetaApproved] Resend API error:', errorData)
      throw new Error(`Resend API error: ${errorData.message || 'Unknown error'}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[SendBetaApproved] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
