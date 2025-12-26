# Deployment Guide for Supabase Edge Functions

This guide walks you through deploying the Edge Functions to Supabase.

## Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install the Supabase CLI globally
3. **Deno**: Install Deno runtime (optional, for local testing)

### Installing Supabase CLI

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**NPM (all platforms):**
```bash
npm install -g supabase
```

### Installing Deno (Optional)

**macOS/Linux:**
```bash
curl -fsSL https://deno.land/install.sh | sh
```

**Windows:**
```powershell
irm https://deno.land/install.ps1 | iex
```

## Initial Setup

### 1. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details
4. Note your project URL and anon key

### 2. Login to Supabase CLI

```bash
supabase login
```

This will open a browser window for authentication.

### 3. Link Your Project

```bash
cd /path/to/sona-plugin
supabase link --project-ref your-project-ref
```

You can find your project ref in the Supabase Dashboard URL:
`https://app.supabase.com/project/[your-project-ref]`

## Database Setup

### Run Migration to Create Jobs Table

```bash
supabase db push
```

This will apply the migration in `supabase/migrations/20251226_create_jobs_table.sql` to create the `jobs` table with proper RLS policies.

**Alternatively**, you can run the SQL manually in the Supabase SQL Editor:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20251226_create_jobs_table.sql`
4. Execute the SQL

### Verify Database Setup

Check that the `jobs` table was created:
```bash
supabase db diff
```

Or verify in the Supabase Dashboard under "Table Editor".

## Deploy Edge Functions

### Deploy All Functions

```bash
cd edge-functions
supabase functions deploy
```

### Deploy Specific Function

```bash
supabase functions deploy generate
```

### Verify Deployment

After deployment, you should see output like:
```
Deploying generate (project ref: your-project-ref)
Bundled generate (xx.xx KB)
generate deployed successfully!
```

Your function will be available at:
```
https://your-project-ref.supabase.co/functions/v1/generate
```

## Environment Variables

Edge Functions automatically receive these environment variables from Supabase:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Your anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (use with caution)

**No additional environment variables are needed** for the `generate` function.

## Testing Deployment

### Get an Authentication Token

First, create a test user and get an auth token:

```bash
# Using Supabase CLI
supabase functions invoke generate \
  --method POST \
  --body '{"email":"test@example.com","password":"testpassword"}' \
  --create-jwt
```

Or sign up through your React app and copy the JWT token from the browser's developer tools.

### Test the Generate Function

```bash
# Replace YOUR_JWT_TOKEN with the actual token
curl -i --location --request POST \
  'https://your-project-ref.supabase.co/functions/v1/generate' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "peaceful ambient forest sounds",
    "duration": 10,
    "quality": "medium",
    "mode": "ambient"
  }'
```

Expected response (201 Created):
```json
{
  "success": true,
  "job_id": "uuid-here",
  "status": "pending",
  "message": "Job created successfully",
  "job": {
    "id": "uuid-here",
    "prompt": "peaceful ambient forest sounds",
    "duration": 10,
    "quality": "medium",
    "mode": "ambient",
    "status": "pending",
    "created_at": "2025-12-26T19:00:00Z"
  }
}
```

## Local Development

### Start Supabase Locally

```bash
supabase start
```

This starts a local Supabase instance with:
- PostgreSQL database
- Auth server
- Storage server
- Edge Functions runtime

### Serve Functions Locally

```bash
supabase functions serve
```

Functions will be available at:
```
http://localhost:54321/functions/v1/generate
```

### Test Locally

```bash
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/generate' \
  --header 'Authorization: Bearer YOUR_LOCAL_JWT' \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "test prompt",
    "duration": 5,
    "quality": "low"
  }'
```

### Stop Local Supabase

```bash
supabase stop
```

## Monitoring and Debugging

### View Function Logs

Real-time logs:
```bash
supabase functions logs generate --tail
```

Recent logs:
```bash
supabase functions logs generate
```

### View in Dashboard

1. Go to Supabase Dashboard
2. Navigate to "Edge Functions"
3. Click on "generate"
4. View logs, metrics, and deployment history

## Updating Functions

To update a function after making changes:

1. Edit the function code in `edge-functions/generate/index.ts`
2. Deploy the updated function:
   ```bash
   supabase functions deploy generate
   ```

The new version will be deployed immediately.

## Rollback

If you need to rollback to a previous version:

1. Go to Supabase Dashboard > Edge Functions > generate
2. View deployment history
3. Click "Rollback" on a previous version

Or redeploy from git:
```bash
git checkout <previous-commit>
supabase functions deploy generate
```

## Security Best Practices

1. **Never commit secrets**: The `.env` file should never be committed
2. **Use RLS policies**: Always enable Row Level Security on tables
3. **Validate all inputs**: The function validates all inputs before processing
4. **Use JWT authentication**: All requests require a valid JWT token
5. **Monitor logs**: Regularly check function logs for suspicious activity

## Troubleshooting

### Common Issues

**Function deployment fails:**
- Check you're linked to the correct project: `supabase link`
- Verify you're logged in: `supabase login`
- Check for syntax errors in the function code

**401 Unauthorized errors:**
- Verify the JWT token is valid
- Check the token hasn't expired
- Ensure the user exists in Supabase Auth

**500 Internal Server Error:**
- Check function logs: `supabase functions logs generate`
- Verify the `jobs` table exists with correct schema
- Check RLS policies are configured correctly

**CORS errors:**
- CORS headers are already configured in the function
- If using a custom domain, update `corsHeaders` in the function

### Getting Help

- Supabase Docs: https://supabase.com/docs/guides/functions
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Open an issue in this repository

## Next Steps

After successful deployment:

1. ✅ Test the function with your React app
2. ✅ Test the function with your JUCE plugin
3. ✅ Set up a background worker to process jobs
4. ✅ Implement audio generation with Stable Audio API
5. ✅ Set up Supabase Storage for generated audio files
6. ✅ Implement job status polling or webhooks

## Production Checklist

Before going to production:

- [ ] Database migration applied
- [ ] RLS policies enabled and tested
- [ ] Edge Functions deployed and tested
- [ ] JWT authentication working
- [ ] Error handling tested
- [ ] Logging verified
- [ ] Input validation tested with edge cases
- [ ] Performance tested under load
- [ ] Monitoring and alerts set up
- [ ] Documentation updated
