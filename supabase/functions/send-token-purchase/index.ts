/**
 * Send Token Purchase Confirmation Edge Function
 * 
 * Sends email confirmation when a user purchases tokens.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface RequestBody {
  userEmail: string
  userName?: string
  tokenAmount: number
  price?: string
  amountPaid?: number
  packageName?: string
  currency: string
  transactionId?: string
  newBalance: number
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getTemplate = (data: RequestBody) => {
  // Support both price (string) and amountPaid (number) formats
  const displayPrice = data.price || (data.amountPaid !== undefined ? data.amountPaid.toFixed(2) : '0.00')
  
  return {
  subject: `Your SONA Token Purchase - ${data.tokenAmount} Tokens`,
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
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Purchase Confirmed ✓</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${data.userName ? `Hi ${data.userName},` : 'Hi there,'}
              </p>
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for your purchase! Your SONA tokens have been added to your account.
              </p>

              <!-- Purchase Details Box -->
              <div style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; margin: 24px 0;">
                <div style="background: linear-gradient(135deg, #f59e0b20 0%, #1a1a1a 100%); padding: 24px; text-align: center; border-bottom: 1px solid #333;">
                  <p style="color: #f59e0b; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">Tokens Added</p>
                  <p style="color: #ffffff; font-size: 48px; font-weight: 700; margin: 0;">+${data.tokenAmount}</p>
                  ${data.packageName ? `<p style="color: #666666; font-size: 12px; margin: 8px 0 0 0;">${data.packageName}</p>` : ''}
                </div>
                <div style="padding: 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #666666; font-size: 14px;">Amount Paid</span>
                      </td>
                      <td style="padding: 8px 0; text-align: right;">
                        <span style="color: #ffffff; font-size: 14px; font-weight: 600;">${displayPrice} ${data.currency}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #666666; font-size: 14px;">New Balance</span>
                      </td>
                      <td style="padding: 8px 0; text-align: right;">
                        <span style="color: #22c55e; font-size: 14px; font-weight: 600;">${data.newBalance} tokens</span>
                      </td>
                    </tr>
                    ${data.transactionId ? `
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #666666; font-size: 14px;">Transaction ID</span>
                      </td>
                      <td style="padding: 8px 0; text-align: right;">
                        <span style="color: #a0a0a0; font-size: 12px; font-family: monospace;">${data.transactionId}</span>
                      </td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
              </div>

              <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 24px 0;">
                Your tokens are ready to use. Generate incredible AI audio with SONA's Designer, Producer, and Creator modes.
              </p>

              <div style="text-align: center; margin-top: 32px;">
                <a href="https://sona.audio/download" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open SONA</a>
              </div>

              <p style="color: #666666; font-size: 12px; line-height: 1.6; margin: 32px 0 0 0; text-align: center;">
                If you have any questions about your purchase, contact us at <a href="mailto:support@sona.audio" style="color: #a78bfa;">support@sona.audio</a>
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
}}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const body: RequestBody = await req.json()
    const { userEmail, tokenAmount, price, amountPaid, currency, newBalance } = body

    if (!userEmail || !tokenAmount || (!price && amountPaid === undefined) || !currency || newBalance === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userEmail, tokenAmount, price or amountPaid, currency, newBalance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const template = getTemplate(body)
    
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
      console.error('[SendTokenPurchase] Resend API error:', errorData)
      throw new Error(`Resend API error: ${errorData.message || 'Unknown error'}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[SendTokenPurchase] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
