# Supabase Edge Functions

This directory contains Deno-based Edge Functions for the Sona Audio Plugin, ready for deployment with Supabase.

## Overview

Edge Functions handle user requests from the React frontend and JUCE plugin. They validate input, authenticate users via Supabase JWT, and create jobs in the Supabase database.

**Security Note:** Edge Functions do NOT handle actual audio generation or expose the Stable Audio API key. Audio generation is handled separately by background workers.

## Functions

### 1. `generate` - Create Audio Generation Job

**Endpoint:** `POST /generate`

**Purpose:** Validates user input and creates a job record in the database for audio generation.

**Authentication:** Required (Supabase JWT)

**Request Body:**
```json
{
  "prompt": "ambient forest sounds with birds",
  "duration": 10,
  "quality": "medium",
  "mode": "ambient"
}
```

**Parameters:**
- `prompt` (required, string): Text description of the audio to generate (max 500 characters)
- `duration` (optional, number): Duration in seconds (1-60, default: 10)
- `quality` (optional, string): Quality level - "low", "medium", or "high" (default: "medium")
- `mode` (optional, string): Generation mode (default: "default")

**Response (Success - 201):**
```json
{
  "success": true,
  "job_id": "uuid-here",
  "status": "pending",
  "message": "Job created successfully",
  "job": {
    "id": "uuid-here",
    "prompt": "ambient forest sounds with birds",
    "duration": 10,
    "quality": "medium",
    "mode": "ambient",
    "status": "pending",
    "created_at": "2025-12-26T19:00:00Z"
  }
}
```

**Error Responses:**

- **401 Unauthorized:** Invalid or missing JWT token
- **400 Bad Request:** Invalid input parameters or JSON
- **500 Internal Server Error:** Database or server error

## Database Schema

The `generate` function requires a `jobs` table with the following schema:

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prompt TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 10,
  quality TEXT NOT NULL DEFAULT 'medium',
  mode TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  result_url TEXT
);

-- Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own jobs
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create jobs
CREATE POLICY "Users can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Deployment

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

### Deploy Functions

Deploy all functions:
```bash
supabase functions deploy
```

Deploy a specific function:
```bash
supabase functions deploy generate
```

### Local Development

Run functions locally:
```bash
supabase start
supabase functions serve
```

Test the function:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"prompt":"peaceful ambient sounds","duration":10,"quality":"medium"}'
```

## Testing

### Prerequisites for Testing

1. Create a user account in your Supabase project
2. Get a JWT token by signing in
3. Ensure the `jobs` table exists with the correct schema

### Example cURL Request

```bash
# Replace YOUR_JWT_TOKEN with an actual token from your Supabase auth
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/generate' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "ambient forest sounds with birds",
    "duration": 10,
    "quality": "medium",
    "mode": "ambient"
  }'
```

### Example JavaScript/TypeScript Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// Sign in first
const { data: { session } } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Call the edge function
const { data, error } = await supabase.functions.invoke('generate', {
  body: {
    prompt: 'ambient forest sounds with birds',
    duration: 10,
    quality: 'medium',
    mode: 'ambient'
  }
})

if (error) {
  console.error('Error:', error)
} else {
  console.log('Job created:', data)
}
```

## Error Handling

The function implements comprehensive error handling:

1. **Input Validation:** All inputs are validated before processing
2. **Authentication:** JWT tokens are verified for every request
3. **Database Errors:** Proper error messages for database failures
4. **Logging:** All errors are logged to Supabase logs for debugging

## Security Features

- ✅ JWT authentication required for all requests
- ✅ Input validation to prevent injection attacks
- ✅ CORS headers properly configured
- ✅ Stable Audio API key NOT exposed or used in Edge Functions
- ✅ Row Level Security (RLS) policies on database tables
- ✅ Rate limiting (handled by Supabase platform)

## Monitoring

View function logs:
```bash
supabase functions logs generate
```

View logs in real-time:
```bash
supabase functions logs generate --tail
```

## Best Practices

1. **Always authenticate:** Never skip JWT validation
2. **Validate inputs:** Check all user inputs before processing
3. **Handle errors gracefully:** Return meaningful error messages
4. **Log important events:** Use console.log for debugging
5. **Keep functions focused:** Each function should have a single responsibility
6. **Don't expose secrets:** Never include API keys in edge functions
7. **Use RLS policies:** Ensure database security with Row Level Security

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check that you're sending the Authorization header
   - Verify the JWT token is valid and not expired
   - Ensure the user exists in your Supabase auth

2. **400 Bad Request**
   - Validate your JSON payload
   - Check that required fields are present
   - Ensure values are within acceptable ranges

3. **500 Internal Server Error**
   - Check the function logs: `supabase functions logs generate`
   - Verify the `jobs` table exists with correct schema
   - Ensure RLS policies are properly configured

## Next Steps

After deploying the Edge Functions:

1. Set up a background worker to process jobs from the `jobs` table
2. Implement the actual audio generation using the Stable Audio API
3. Update job status as they are processed
4. Store generated audio files in Supabase Storage
5. Implement webhooks or polling for job status updates

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs/guides/functions
- Review Deno documentation: https://deno.land/manual
