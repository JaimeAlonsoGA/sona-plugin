/**
 * Send Feedback Notification Edge Function
 * 
 * Sends email notifications when a user submits feedback:
 * - Confirmation email to the user
 * - Notification email to admin (alonsog.jaime@gmail.com)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = 'alonsog.jaime@gmail.com'

interface RequestBody {
  userEmail: string
  userName?: string
  feedbackType: 'bug' | 'feature' | 'prompting' | 'general'
  message: string
  jobId?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getFeedbackTypeLabel = (type: string) => {
  switch (type) {
    case 'bug': return 'Bug Report'
    case 'feature': return 'Feature Request'
    case 'prompting': return 'Prompting Feedback'
    default: return 'General Feedback'
  }
}

const getFeedbackTypeColor = (type: string) => {
  switch (type) {
    case 'bug': return '#ef4444'
    case 'feature': return '#22c55e'
    case 'prompting': return '#a78bfa'
    default: return '#3b82f6'
  }
}

// Email template for user confirmation
const getUserConfirmationTemplate = (userName: string | undefined, feedbackType: string, message: string) => ({
  subject: `We received your ${getFeedbackTypeLabel(feedbackType).toLowerCase()} - SONA`,
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
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Thanks for your feedback!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${userName ? `Hi ${userName},` : 'Hi there,'}
              </p>
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                We've received your <strong style="color: ${getFeedbackTypeColor(feedbackType)}">${getFeedbackTypeLabel(feedbackType).toLowerCase()}</strong> and our team will review it shortly.
              </p>
              <div style="background-color: #1a1a1a; border-left: 4px solid ${getFeedbackTypeColor(feedbackType)}; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="color: #666666; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Your message</p>
                <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                We appreciate you taking the time to help us improve SONA. If we need any additional information, we'll reach out to you at this email address.
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

// Email template for admin notification
const getAdminNotificationTemplate = (userEmail: string, userName: string | undefined, feedbackType: string, message: string, jobId?: string) => ({
  subject: `[SONA] New ${getFeedbackTypeLabel(feedbackType)} from ${userName || userEmail}`,
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
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New ${getFeedbackTypeLabel(feedbackType)}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <div style="background-color: #1a1a1a; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #666666; font-size: 12px; text-transform: uppercase;">From</span>
                      <p style="color: #ffffff; font-size: 14px; margin: 4px 0 0 0;">${userName || 'Anonymous'} &lt;${userEmail}&gt;</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #666666; font-size: 12px; text-transform: uppercase;">Type</span>
                      <p style="color: ${getFeedbackTypeColor(feedbackType)}; font-size: 14px; margin: 4px 0 0 0; font-weight: 600;">${getFeedbackTypeLabel(feedbackType)}</p>
                    </td>
                  </tr>
                  ${jobId ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #666666; font-size: 12px; text-transform: uppercase;">Related Job</span>
                      <p style="color: #ffffff; font-size: 14px; margin: 4px 0 0 0; font-family: monospace;">${jobId}</p>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="background-color: #1a1a1a; border-left: 4px solid ${getFeedbackTypeColor(feedbackType)}; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="color: #666666; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="https://sona.audio/admin" style="display: inline-block; background-color: #a78bfa; color: #000000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View in Admin Panel</a>
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
    const { userEmail, userName, feedbackType, message, jobId } = body

    if (!userEmail || !feedbackType || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userEmail, feedbackType, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send confirmation email to user
    const userTemplate = getUserConfirmationTemplate(userName, feedbackType, message)
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
        reply_to: 'support@sona.audio',
      }),
    })

    if (!userEmailResponse.ok) {
      const errorData = await userEmailResponse.json()
      console.error('[SendFeedbackNotification] Error sending user email:', errorData)
    }

    // Send notification email to admin
    const adminTemplate = getAdminNotificationTemplate(userEmail, userName, feedbackType, message, jobId)
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
      console.error('[SendFeedbackNotification] Error sending admin email:', errorData)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Feedback notifications sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[SendFeedbackNotification] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
