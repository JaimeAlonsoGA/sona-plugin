# React Frontend Integration with Supabase Edge Functions

This document explains how the React frontend connects to Supabase Edge Functions for audio job submission and status tracking.

## Overview

The React UI now integrates with Supabase Edge Functions to:
- Submit audio generation jobs via the `/generate` endpoint
- Track job status in real-time using polling and subscriptions
- Display job progress (pending → queued → processing → completed/failed)
- Provide download links for generated audio files (MP3 preview and WAV master)
- Handle authentication securely with JWT tokens

## Architecture

```
┌─────────────────┐
│   React UI      │
│   (Plugin/ui)   │
└────────┬────────┘
         │
         │ JWT Auth
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Edge Functions │─────▶│  Supabase DB     │
│  /generate      │      │  (jobs table)    │
└─────────────────┘      └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Audio Worker    │
                         │  (processes jobs)│
                         └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Supabase        │
                         │  Storage         │
                         └──────────────────┘
```

## Key Files

### 1. Type Definitions
**File:** `Plugin/ui/src/types/jobs.ts`

Defines TypeScript types for jobs, matching the database schema and API contracts:
- `Job` - Complete job record from database
- `CreateJobInput` - Input for creating new jobs
- `GenerateJobResponse` - Response from Edge Function
- `JobStatus` - Job status enum (pending, queued, processing, completed, failed)
- `QualityLevel` - Audio quality enum (low, medium, high)

### 2. API Client
**File:** `Plugin/ui/src/lib/api/jobs.ts`

Provides functions to interact with Supabase:
- `submitJob(input)` - Submit job to Edge Function with JWT auth
- `getJob(jobId)` - Fetch job details from database
- `getUserJobs(limit)` - Get all jobs for current user
- `subscribeToJob(jobId, callback)` - Subscribe to real-time job updates

### 3. React Hooks
**File:** `Plugin/ui/src/lib/hooks/use-jobs.ts`

TanStack Query hooks for job management:
- `useSubmitJob()` - Mutation hook for submitting jobs
- `useJob(jobId, options)` - Query hook for fetching job status
- `useUserJobs(limit)` - Query hook for fetching all user jobs
- `useJobSubscription(jobId, enabled)` - Hook for real-time subscriptions
- `useJobPolling(jobId, enabled)` - Combined polling + subscription hook

### 4. Components
**Files:**
- `Plugin/ui/src/App.tsx` - Main app with job submission integration
- `Plugin/ui/src/components/AudioPreview.tsx` - Job status and download UI
- `Plugin/ui/src/components/AudioGenerationExample.tsx` - Example usage

## Usage Examples

### Basic Job Submission

```typescript
import { useSubmitJob, useJobPolling } from './lib/hooks'
import type { CreateJobInput } from './types/jobs'

function MyComponent() {
  const [jobId, setJobId] = useState<string | null>(null)
  const submitJobMutation = useSubmitJob()
  const { data: job } = useJobPolling(jobId, !!jobId)

  const handleSubmit = async () => {
    const input: CreateJobInput = {
      prompt: 'peaceful ambient forest sounds',
      duration: 10,
      quality: 'medium',
      mode: 'default',
    }

    try {
      const response = await submitJobMutation.mutateAsync(input)
      setJobId(response.job_id)
    } catch (error) {
      console.error('Failed to submit job:', error)
    }
  }

  return (
    <div>
      <button onClick={handleSubmit}>Generate Audio</button>
      {job && <div>Status: {job.status}</div>}
    </div>
  )
}
```

### Fetching User Jobs

```typescript
import { useUserJobs } from './lib/hooks'

function JobHistory() {
  const { data: jobs, isLoading, error } = useUserJobs(50)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {jobs?.map(job => (
        <li key={job.id}>
          {job.prompt} - {job.status}
        </li>
      ))}
    </ul>
  )
}
```

### Real-time Job Updates

```typescript
import { useJobSubscription } from './lib/hooks'

function JobStatus({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState('unknown')

  useJobSubscription(jobId, true)

  const { data: job } = useJob(jobId)

  useEffect(() => {
    if (job) {
      setStatus(job.status)
    }
  }, [job])

  return <div>Status: {status}</div>
}
```

## Job Status Flow

Jobs progress through the following states:

1. **pending** - Job created, waiting to be picked up
2. **queued** - Job queued in the worker
3. **processing** - Audio generation in progress
4. **completed** - Job finished successfully (download links available)
5. **failed** - Job failed (error message available)

## Download URLs

When a job completes successfully, the following URLs become available:

- `mp3_url` - Preview MP3 file (compressed, smaller size)
- `wav_url` - Master WAV file (lossless, full quality)
- `result_url` - Legacy field (may be used if specific URLs not available)

## Authentication

All API calls automatically include JWT authentication:

1. User signs in via Supabase Auth
2. Session token is stored in Supabase client
3. API calls include `Authorization: Bearer <token>` header
4. Edge Functions validate the JWT and extract user ID
5. Jobs are created with the authenticated user's ID

## Error Handling

The implementation includes comprehensive error handling:

### Job Submission Errors
```typescript
const submitJobMutation = useSubmitJob()

if (submitJobMutation.isError) {
  console.error('Error:', submitJobMutation.error.message)
}
```

### Job Fetch Errors
```typescript
const { error } = useJob(jobId)

if (error) {
  console.error('Failed to fetch job:', error.message)
}
```

### Job Failures
```typescript
if (job?.status === 'failed') {
  console.error('Job failed:', job.error_message)
}
```

## Polling vs. Subscriptions

The implementation uses both approaches for optimal UX:

### Polling (Every 2 seconds)
- Reliable fallback if subscriptions fail
- Works even with flaky connections
- Automatically stops when job completes

### Real-time Subscriptions
- Instant updates when job status changes
- More efficient (no repeated queries)
- Uses Supabase Realtime

The `useJobPolling` hook combines both for best results.

## Environment Variables

Required environment variables in `Plugin/ui/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Testing

To test the implementation:

1. Ensure you have a Supabase project set up
2. Deploy the Edge Functions (`supabase functions deploy generate`)
3. Apply database migrations (`supabase db push`)
4. Configure environment variables
5. Run the UI: `npm run dev`
6. Sign in with a test account
7. Submit a job and watch the status update

## Troubleshooting

### "Not authenticated" error
- Ensure you're signed in
- Check that session is valid
- Verify environment variables are set

### Jobs not updating
- Check browser console for errors
- Verify database migrations are applied
- Ensure RLS policies are configured correctly

### Download links not working
- Verify audio worker is running
- Check Supabase Storage bucket exists
- Ensure storage URLs are public or signed

## API Reference

### submitJob(input)
Submits a new audio generation job.

**Parameters:**
- `input.prompt` (string, required) - Text description (max 500 chars)
- `input.duration` (number, optional) - Duration in seconds (1-60, default: 10)
- `input.quality` (string, optional) - 'low', 'medium', or 'high' (default: 'medium')
- `input.mode` (string, optional) - Generation mode (default: 'default')

**Returns:** `Promise<GenerateJobResponse>`

**Throws:** Error if not authenticated or submission fails

### getJob(jobId)
Fetches a job by ID.

**Parameters:**
- `jobId` (string) - The job ID

**Returns:** `Promise<Job>`

**Throws:** Error if job not found or fetch fails

### getUserJobs(limit)
Gets all jobs for the current user.

**Parameters:**
- `limit` (number, optional) - Max jobs to return (default: 50)

**Returns:** `Promise<Job[]>`

### subscribeToJob(jobId, callback)
Subscribes to real-time job updates.

**Parameters:**
- `jobId` (string) - The job ID
- `callback` (function) - Called when job updates

**Returns:** `{ unsubscribe: () => void }`

## Next Steps

- Implement job cancellation
- Add progress indicators for processing jobs
- Support batch job submission
- Add job history UI with filtering
- Implement job retry logic
