/**
 * Send Beta Application Received Edge Function
 * 
 * Sends email notifications when a user applies for beta access:
 * - Confirmation email to the user
 * - Notification email to admin (alonsog.jaime@gmail.com)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = 'alonsog.jaime@gmail.com'

interface RequestBody {
  userEmail: string
  firstName: string
  lastName: string
  country: string
  role: string
  referralSource: string
  modesOfInterest: string[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email template for user confirmation
const getUserConfirmationTemplate = (firstName: string) => ({
  subject: 'Your SONA Beta Application Has Been Received',
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
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Application Received!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi ${firstName},
              </p>
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for applying to join the <strong style="color: #a78bfa;">SONA Beta Program</strong>! We're excited that you want to be part of the future of AI-powered audio generation.
              </p>

              <div style="background-color: #1a1a1a; border-left: 4px solid #a78bfa; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0;">
                  <strong>What happens next?</strong><br><br>
                  Our team will review your application and get back to you within <strong>24-48 hours</strong>. We're carefully selecting beta testers to ensure a great experience for everyone.
                </p>
              </div>

              <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                In the meantime, you can learn more about SONA on our website or follow us on social media for the latest updates.
              </p>

              <div style="text-align: center; margin-top: 32px;">
                <a href="https://sona.audio" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid #333;">Visit sona.audio</a>
              </div>
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

// Email template for admin notification
const getAdminNotificationTemplate = (data: RequestBody) => ({
  subject: `[SONA] New Beta Application: ${data.firstName} ${data.lastName}`,
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
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Beta Application</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333;">
                      <span style="color: #666666; font-size: 12px; text-transform: uppercase;">Name</span>
                      <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0 0; font-weight: 600;">${data.firstName} ${data.lastName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333;">
                      <span style="color: #666666; font-size: 12px; text-transform: uppercase;">Email</span>
                      <p style="color: #ffffff; font-size: 14px; margin: 4px 0 0 0;">${data.userEmail}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333;">
                      <span style="color: #666666; font-size: 12px; text-transform: uppercase;">Country</span>
                      <p style="color: #ffffff; font-size: 14px; margin: 4px 0 0 0;">${data.country}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333;">
                      <span style="color: #666666; font-size: 12px; text-transform: uppercase;">Role</span>
                      <p style="color: #a78bfa; font-size: 14px; margin: 4px 0 0 0; font-weight: 600;">${data.role}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333;">
                      <span style="color: #666666; font-size: 12px; text-transform: uppercase;">How they found us</span>
                      <p style="color: #ffffff; font-size: 14px; margin: 4px 0 0 0;">${data.referralSource}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #666666; font-size: 12px; text-transform: uppercase;">Interested in</span>
                      <p style="color: #ffffff; font-size: 14px; margin: 4px 0 0 0;">
                        ${data.modesOfInterest.map(mode => `<span style="display: inline-block; background-color: #333; padding: 4px 8px; border-radius: 4px; margin: 4px 4px 0 0; font-size: 12px;">${mode}</span>`).join('')}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="https://sona.audio/admin" style="display: inline-block; background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%); color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Review in Admin Panel</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 24px 32px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                SONA Admin Notification
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
    const { userEmail, firstName, lastName } = body

    if (!userEmail || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send confirmation email to user
    const userTemplate = getUserConfirmationTemplate(firstName)
    const userEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SONA <hello@sona.audio>',
        to: [userEmail],
        subject: userTemplate.subject,
        html: userTemplate.html,
        reply_to: 'hello@sona.audio',
      }),
    })

    if (!userEmailResponse.ok) {
      const errorData = await userEmailResponse.json()
      console.error('[SendBetaApplication] Error sending user email:', errorData)
    }

    // Send notification email to admin
    const adminTemplate = getAdminNotificationTemplate(body)
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SONA Notifications <hello@sona.audio>',
        to: [ADMIN_EMAIL],
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        reply_to: userEmail,
      }),
    })

    if (!adminEmailResponse.ok) {
      const errorData = await adminEmailResponse.json()
      console.error('[SendBetaApplication] Error sending admin email:', errorData)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Beta application notifications sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[SendBetaApplication] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
