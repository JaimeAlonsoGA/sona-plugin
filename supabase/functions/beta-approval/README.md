# Beta Approval Edge Function

This function handles approving beta applications and sending approval emails via **Resend**.

## Why Resend?

- ✅ **Supabase Compatible**: Works perfectly with Deno Edge Functions (simple REST API)
- ✅ **Free Tier**: 100 emails/day, 3,000/month (perfect for beta)
- ✅ **Cheap Scaling**: $20/month for 50,000 emails
- ✅ **Great Deliverability**: Modern infrastructure, high delivery rates
- ✅ **Simple API**: No SDK needed, just a single HTTP POST

## Setup

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com) and create an account
2. Verify your domain (`sona.audio`) or use their testing domain
3. Go to **API Keys** and create a new API key
4. Copy the API key (starts with `re_`)

### 2. Add Domain (Production)

For production, you need to verify your domain:

1. In Resend dashboard, go to **Domains**
2. Add `sona.audio`
3. Add the DNS records Resend provides:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)
4. Wait for verification (usually < 5 minutes)

### 3. Configure Supabase Secret

Add the Resend API key as a Supabase secret:

```bash
# Using Supabase CLI
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Or via Supabase Dashboard:
# Project Settings → Edge Functions → Add new secret
```

### 4. Deploy the Function

```bash
supabase functions deploy beta-approval
```

## Usage

### Approve a User

```typescript
// From admin dashboard or internal tool
const response = await fetch(
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/beta-approval',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      userId: 'user-uuid-here',
      adminNotes: 'Approved by admin - quality application' // optional
    })
  }
)

const result = await response.json()
// { success: true, emailSent: true, emailId: 'xxx', application: {...} }
```

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Application approved and email sent",
  "emailSent": true,
  "emailId": "resend-email-id",
  "application": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "status": "approved"
  }
}
```

**Already Approved:**
```json
{
  "success": true,
  "message": "Application already approved",
  "emailSent": false
}
```

**Email Failed (approval still succeeds):**
```json
{
  "success": true,
  "message": "Application approved but email failed to send",
  "emailSent": false,
  "emailError": "Error details"
}
```

## Database Trigger (Optional)

To automatically send emails when an admin updates the status directly in the database, create a trigger:

```sql
-- Create function to call edge function on approval
CREATE OR REPLACE FUNCTION notify_beta_approval()
RETURNS TRIGGER AS $$
DECLARE
  response json;
BEGIN
  -- Only trigger when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Call the edge function
    SELECT content::json INTO response
    FROM http_post(
      'https://YOUR_PROJECT_REF.supabase.co/functions/v1/beta-approval',
      json_build_object('userId', NEW.user_id)::text,
      'application/json'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_beta_approval
  AFTER UPDATE OF status ON beta_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_beta_approval();
```

> **Note**: This requires the `http` extension. Enable it in Supabase dashboard under Database → Extensions.

## Testing

### Local Testing

```bash
# Start local Supabase
supabase start

# Set local secret
supabase secrets set RESEND_API_KEY=re_test_key

# Serve function locally
supabase functions serve beta-approval --env-file supabase/.env.local
```

### Test with cURL

```bash
curl -X POST http://localhost:54321/functions/v1/beta-approval \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-uuid"}'
```

## Monitoring

### Resend Dashboard

Monitor email delivery in the Resend dashboard:
- View sent emails
- Check delivery status
- See opens and clicks
- Debug bounces and complaints

### Supabase Logs

View function logs in Supabase dashboard:
- Project → Edge Functions → beta-approval → Logs

## Cost Estimation

| Usage | Cost |
|-------|------|
| 0-100 emails/day | Free |
| 3,000 emails/month | Free |
| 50,000 emails/month | $20/month |
| 100,000 emails/month | $40/month |

For a beta with ~500 users, the free tier is more than enough.

## Troubleshooting

### "Missing RESEND_API_KEY"

```bash
supabase secrets set RESEND_API_KEY=re_your_key
supabase functions deploy beta-approval
```

### Email not delivered

1. Check Resend dashboard for delivery status
2. Verify domain DNS records are correct
3. Check spam folder
4. Ensure "from" address uses verified domain

### CORS errors

The function includes CORS headers. If issues persist, check the request origin is allowed.
