# Quick Reference Guide

Fast reference for common tasks with the Sona Audio Worker.

## Environment Variables

### Required
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STABLE_AUDIO_API_KEY=your-stable-audio-api-key
```

### Optional (with defaults)
```env
STABLE_AUDIO_API_URL=https://api.stability.ai/v2beta/stable-audio
MAX_CONCURRENT_JOBS=2
POLL_INTERVAL_MS=5000
JOB_TIMEOUT_MS=300000
SUPABASE_STORAGE_BUCKET=audio-files
STORAGE_PATH_PREFIX=generated
MAX_RETRIES=3
RETRY_DELAY_MS=2000
LOG_LEVEL=info
```

## Common Commands

### Development
```bash
npm install              # Install dependencies
npm run validate         # Validate configuration
npm run dev              # Run in development mode
npm run type-check       # Check TypeScript types
npm run build            # Build for production
```

### Production
```bash
npm install --production # Install production deps only
npm run build            # Compile TypeScript
npm start                # Start worker
```

### Docker
```bash
docker build -t sona-worker .                    # Build image
docker run --env-file .env sona-worker           # Run container
docker-compose up -d                             # Run with compose
docker-compose logs -f worker                    # View logs
```

## Job Status Flow

```
pending → processing → completed
   ↓                       ↓
queued                  failed
```

- **pending**: Job created by Edge Function
- **queued**: Alternative initial state
- **processing**: Worker has locked the job
- **completed**: Audio generated and uploaded
- **failed**: Error occurred (error_message set)

## Database Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Job ID |
| `user_id` | UUID | User who created job |
| `prompt` | TEXT | Audio description |
| `duration` | INTEGER | Duration in seconds (1-60) |
| `quality` | TEXT | low, medium, high |
| `mode` | TEXT | Generation mode |
| `status` | TEXT | Job status |
| `wav_url` | TEXT | Master WAV file URL |
| `mp3_url` | TEXT | Preview MP3 file URL |
| `result_url` | TEXT | Backwards compat (same as mp3_url) |
| `error_message` | TEXT | Error details if failed |
| `created_at` | TIMESTAMP | Job creation time |
| `updated_at` | TIMESTAMP | Last update time |
| `completed_at` | TIMESTAMP | Completion time |

## Storage Paths

Files are stored as:
```
{bucket}/{prefix}/{job_id}_{timestamp}.{wav|mp3}
```

Example:
```
audio-files/generated/550e8400-e29b-41d4-a716-446655440000_1703601234567.wav
audio-files/generated/550e8400-e29b-41d4-a716-446655440000_1703601234567.mp3
```

## Log Levels

- **debug**: Verbose output (file formats, API details)
- **info**: Normal operation (job processed, files uploaded)
- **warn**: Warnings (retries, missing MP3 conversion)
- **error**: Errors (failed jobs, API errors)

## Troubleshooting Quick Checks

### Worker won't start
1. Check `.env` file exists
2. Run `npm run validate`
3. Verify Node.js version: `node --version` (need 18+)
4. Check build: `npm run build`

### Jobs not processing
1. Check logs for errors
2. Verify jobs exist: `SELECT * FROM jobs WHERE status IN ('pending', 'queued')`
3. Check worker is running
4. Verify database connection

### Upload failures
1. Check service role key permissions
2. Verify bucket exists or can be created
3. Check network connectivity
4. Review storage bucket settings

### API errors
1. Verify API key is valid
2. Check API endpoint URL
3. Review retry configuration
4. Check API rate limits

## Monitoring

### Key Metrics
- Jobs processed per minute
- Failed job rate
- Average processing time
- Storage upload success rate
- API response time

### Log Messages to Watch
- ✅ `Job created successfully` - Normal
- ✅ `File uploaded successfully` - Normal
- ⚠️ `Retry attempt X/3` - API issue, retrying
- ⚠️ `MP3 conversion not yet implemented` - Known limitation
- ❌ `Job failed:` - Processing error
- ❌ `Error polling for jobs:` - Database issue

## Deployment Platforms

| Platform | Difficulty | Free Tier | Best For |
|----------|-----------|-----------|----------|
| Fly.io | Easy | Yes | Hobby/Production |
| Render | Easy | Yes | Quick setup |
| Railway | Easy | Yes | GitHub integration |
| Docker/VPS | Medium | Depends | Full control |

## Performance Tuning

### Low load (< 10 jobs/hour)
```env
MAX_CONCURRENT_JOBS=1
POLL_INTERVAL_MS=10000
```

### Medium load (10-100 jobs/hour)
```env
MAX_CONCURRENT_JOBS=2
POLL_INTERVAL_MS=5000
```

### High load (> 100 jobs/hour)
```env
MAX_CONCURRENT_JOBS=4
POLL_INTERVAL_MS=2000
```

Scale horizontally (multiple instances) for very high load.

## API Integration

### Create Job (Frontend/Plugin)
```typescript
const { data } = await supabase.functions.invoke('generate', {
  body: {
    prompt: 'ambient forest sounds',
    duration: 10,
    quality: 'medium'
  }
})
// Returns: { job_id, status: 'pending' }
```

### Check Job Status
```typescript
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('id', job_id)
  .single()

if (data.status === 'completed') {
  // Use data.wav_url and data.mp3_url
}
```

### Poll for Completion
```typescript
const pollJob = async (jobId) => {
  const interval = setInterval(async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    
    if (data.status === 'completed') {
      clearInterval(interval)
      // Use audio files
    } else if (data.status === 'failed') {
      clearInterval(interval)
      // Handle error
    }
  }, 3000)
}
```

## Useful SQL Queries

### Check job statistics
```sql
SELECT 
  status, 
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration_sec
FROM jobs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

### Recent failed jobs
```sql
SELECT id, prompt, error_message, created_at
FROM jobs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

### Jobs stuck in processing
```sql
SELECT id, prompt, updated_at
FROM jobs
WHERE status = 'processing'
  AND updated_at < NOW() - INTERVAL '10 minutes'
ORDER BY updated_at DESC;
```

## Support Resources

- **Worker README**: Full documentation
- **DEPLOYMENT.md**: Platform-specific deployment guides
- **Supabase Docs**: https://supabase.com/docs
- **Stable Audio API**: https://platform.stability.ai/docs
- **Worker Logs**: Check platform-specific log viewer

## Security Checklist

- [ ] `.env` file not committed to git
- [ ] Service role key kept secure (never exposed to frontend)
- [ ] Storage bucket has appropriate permissions
- [ ] Row Level Security enabled on jobs table
- [ ] Worker runs as non-root user (Docker)
- [ ] Secrets set as environment variables in deployment platform
- [ ] Regular dependency updates (`npm audit`, `npm update`)

## Next Steps After Deployment

1. Monitor logs for first few jobs
2. Verify audio files are uploaded correctly
3. Test failed job handling (invalid API key)
4. Set up log aggregation/monitoring
5. Configure alerts for errors
6. Plan for scaling based on usage

---

For detailed information, see the full README.md and DEPLOYMENT.md files.
