# Sona Audio Worker Service

A standalone Node.js background worker service for processing audio generation jobs from the Sona plugin. This service polls the Supabase database for queued jobs, generates audio using the Stable Audio API, and uploads the results to Supabase Storage.

## Features

- ✅ Polls Supabase database for pending/queued jobs
- ✅ Atomic job locking to prevent duplicate processing
- ✅ Configurable concurrency (default: 2 concurrent jobs)
- ✅ Automatic retry logic with exponential backoff
- ✅ Generates and stores both WAV (master) and MP3 (preview) formats
- ✅ Graceful shutdown handling
- ✅ Comprehensive error handling and logging
- ✅ Failed jobs do not upload to storage
- ✅ TypeScript for type safety

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project with:
  - Jobs table (see [Database Schema](#database-schema))
  - Storage bucket for audio files
  - Service role key (not anonymous key!)
- Stable Audio API key

## Quick Start

### 1. Install Dependencies

```bash
cd service-worker
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stable Audio API Configuration
STABLE_AUDIO_API_KEY=your-stable-audio-api-key-here
STABLE_AUDIO_API_URL=https://api.stability.ai/v2beta/stable-audio

# Worker Configuration
MAX_CONCURRENT_JOBS=2
POLL_INTERVAL_MS=5000
JOB_TIMEOUT_MS=300000

# Storage Configuration
SUPABASE_STORAGE_BUCKET=audio-files
STORAGE_PATH_PREFIX=generated

# Retry Configuration
MAX_RETRIES=3
RETRY_DELAY_MS=2000

# Logging
LOG_LEVEL=info
```

### 3. Run the Worker

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | Yes | - | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | - | Supabase service role key (NOT anon key) |
| `STABLE_AUDIO_API_KEY` | Yes | - | Your Stable Audio API key |
| `STABLE_AUDIO_API_URL` | No | `https://api.stability.ai/v2beta/stable-audio` | Stable Audio API endpoint |
| `MAX_CONCURRENT_JOBS` | No | `2` | Maximum number of concurrent jobs (1-10) |
| `POLL_INTERVAL_MS` | No | `5000` | Polling interval in milliseconds (min 1000) |
| `JOB_TIMEOUT_MS` | No | `300000` | Job timeout in milliseconds (min 10000) |
| `SUPABASE_STORAGE_BUCKET` | No | `audio-files` | Storage bucket name for audio files |
| `STORAGE_PATH_PREFIX` | No | `generated` | Path prefix for stored files |
| `MAX_RETRIES` | No | `3` | Maximum retry attempts for failed API calls (0-10) |
| `RETRY_DELAY_MS` | No | `2000` | Base delay between retries in milliseconds |
| `LOG_LEVEL` | No | `info` | Logging level: `debug`, `info`, `warn`, `error` |

## Database Schema

The worker requires the following database schema. Apply the migrations in the `/supabase/migrations` directory:

```sql
-- Apply migrations
-- 1. 20251226_create_jobs_table.sql
-- 2. 20251226_add_audio_urls.sql
```

Key columns used by the worker:
- `status`: Job status (`pending`, `queued`, `processing`, `completed`, `failed`)
- `wav_url`: URL to the master WAV file
- `mp3_url`: URL to the preview MP3 file
- `error_message`: Error details if job fails

## How It Works

### Job Processing Flow

1. **Poll Database**: Worker polls for jobs with status `pending` or `queued`
2. **Lock Job**: Atomically updates job status to `processing` to prevent race conditions
3. **Generate Audio**: Calls Stable Audio API with the job parameters
4. **Process Audio**: Ensures WAV format and creates MP3 version
5. **Upload Files**: 
   - Uploads master WAV file to Supabase Storage
   - Uploads preview MP3 file to Supabase Storage
6. **Update Job**: Updates job record with file URLs and `completed` status
7. **Error Handling**: If any step fails, marks job as `failed` with error message

### Concurrency Control

The worker uses `p-limit` to control concurrency:
- Maximum concurrent jobs set by `MAX_CONCURRENT_JOBS`
- Each job runs in its own async context
- New jobs are queued if limit is reached

### Retry Logic

API calls use exponential backoff retry:
- Configurable retry attempts (`MAX_RETRIES`)
- Exponential delay: `RETRY_DELAY_MS * attemptNumber`
- Failed jobs after all retries are marked as `failed`

### Storage Organization

Files are stored with the following naming convention:

```
{STORAGE_PATH_PREFIX}/{job_id}_{timestamp}.{wav|mp3}
```

Example:
```
generated/550e8400-e29b-41d4-a716-446655440000_1703601234567.wav
generated/550e8400-e29b-41d4-a716-446655440000_1703601234567.mp3
```

## Deployment

### Fly.io

1. Install Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Login and create app:
   ```bash
   fly auth login
   fly launch
   ```

3. Set environment secrets:
   ```bash
   fly secrets set SUPABASE_URL="https://your-project.supabase.co"
   fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-key"
   fly secrets set STABLE_AUDIO_API_KEY="your-key"
   ```

4. Deploy:
   ```bash
   fly deploy
   ```

### Render

1. Create new **Web Service** on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard
6. Deploy

### Railway

1. Create new project on Railway
2. Connect GitHub repository
3. Add environment variables
4. Railway auto-detects Node.js and deploys

### VPS (Ubuntu/Debian)

1. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. Clone and setup:
   ```bash
   git clone <your-repo>
   cd service-worker
   npm install
   npm run build
   ```

3. Create systemd service `/etc/systemd/system/sona-worker.service`:
   ```ini
   [Unit]
   Description=Sona Audio Worker
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/service-worker
   Environment=NODE_ENV=production
   EnvironmentFile=/path/to/service-worker/.env
   ExecStart=/usr/bin/node /path/to/service-worker/dist/index.js
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

4. Start service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable sona-worker
   sudo systemctl start sona-worker
   sudo systemctl status sona-worker
   ```

## Monitoring

### Logs

**Development:**
```bash
npm run dev
```

**Production (systemd):**
```bash
sudo journalctl -u sona-worker -f
```

**Production (Fly.io):**
```bash
fly logs
```

### Health Checks

Monitor the following metrics:
- Jobs processed per minute
- Failed job rate
- API response times
- Storage upload success rate

Check logs for:
- `Job completed successfully` - successful processing
- `Job failed:` - processing errors
- `Error polling for jobs:` - database connection issues

## Troubleshooting

### Worker not picking up jobs

**Check:**
1. Database connection: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Job status: Ensure jobs have status `pending` or `queued`
3. Logs: Check for error messages

### API errors

**Check:**
1. API key: Verify `STABLE_AUDIO_API_KEY` is valid
2. API URL: Ensure `STABLE_AUDIO_API_URL` is correct
3. Retry configuration: Increase `MAX_RETRIES` if needed

### Storage upload failures

**Check:**
1. Storage bucket exists and is public
2. Service role key has storage permissions
3. Bucket name matches `SUPABASE_STORAGE_BUCKET`

### High memory usage

**Solutions:**
1. Reduce `MAX_CONCURRENT_JOBS`
2. Increase `POLL_INTERVAL_MS`
3. Add memory limits in deployment platform

## Development

### Project Structure

```
service-worker/
├── src/
│   ├── index.ts              # Main entry point
│   ├── worker.ts             # Main worker orchestration
│   ├── config.ts             # Configuration loader
│   ├── logger.ts             # Logging utility
│   ├── supabase.ts           # Supabase client
│   ├── stable-audio.ts       # Stable Audio API client
│   ├── audio-processor.ts    # Audio processing
│   └── types.ts              # TypeScript types
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Type Checking

```bash
npm run type-check
```

### Building

```bash
npm run build
```

Output goes to `dist/` directory.

## Future Enhancements

- [ ] Implement proper WAV to MP3 conversion using `lamejs` or `ffmpeg`
- [ ] Add Prometheus metrics export
- [ ] Implement job priority queue
- [ ] Add webhook notifications for job completion
- [ ] Health check endpoint for monitoring
- [ ] Docker container support
- [ ] Rate limiting for API calls

## Security Considerations

- ✅ Uses service role key (never expose in frontend)
- ✅ No API keys in logs or error messages
- ✅ Environment variables for all secrets
- ✅ Row Level Security policies on database
- ⚠️ Ensure service role key is kept secure
- ⚠️ Restrict network access to worker service
- ⚠️ Use HTTPS for all API communications

## Support

For issues or questions:
- Check the [Supabase documentation](https://supabase.com/docs)
- Check the [Stable Audio API documentation](https://platform.stability.ai/docs/api-reference)
- Review worker logs for error details

## License

[Your License Here]
