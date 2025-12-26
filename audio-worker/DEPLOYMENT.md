# Deployment Guide

This guide provides step-by-step instructions for deploying the Sona Audio Worker to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. ✅ Completed the database migrations in your Supabase project
2. ✅ Created a Supabase Storage bucket (or let the worker create it)
3. ✅ Obtained your Stable Audio API key
4. ✅ Collected all required environment variables (see `.env.example`)

## Validation

Before deploying, validate your configuration locally:

```bash
# Create .env file with your credentials
cp .env.example .env
# Edit .env with your values

# Validate configuration
npm run validate
```

This will check:
- Configuration loading
- Supabase connection
- Database table access
- Storage bucket availability

---

## Fly.io Deployment

Fly.io is recommended for its simplicity and generous free tier.

### 1. Install Fly CLI

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows:**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Initialize Fly App

```bash
fly launch --no-deploy
```

Follow the prompts:
- **App name:** Choose a unique name (e.g., `sona-audio-worker`)
- **Region:** Select closest to your Supabase region
- **Postgres:** No (we're using Supabase)
- **Redis:** No
- **Deploy now:** No

### 4. Configure fly.toml

Edit the generated `fly.toml`:

```toml
app = "your-app-name"
primary_region = "iad"

[build]

[env]
  NODE_ENV = "production"
  LOG_LEVEL = "info"

[processes]
  worker = "node dist/index.js"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[checks]
  [checks.worker_running]
    type = "script"
    interval = "30s"
    timeout = "5s"
    script = "node -e 'process.exit(0)'"
```

### 5. Set Environment Secrets

**NEVER commit secrets to your repository!** Set them as Fly secrets:

```bash
fly secrets set \
  SUPABASE_URL="https://your-project.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  STABLE_AUDIO_API_KEY="your-stable-audio-key" \
  STABLE_AUDIO_API_URL="https://api.stability.ai/v2beta/stable-audio" \
  MAX_CONCURRENT_JOBS="2" \
  POLL_INTERVAL_MS="5000" \
  SUPABASE_STORAGE_BUCKET="audio-files" \
  STORAGE_PATH_PREFIX="generated"
```

### 6. Deploy

```bash
fly deploy
```

### 7. Monitor

View logs:
```bash
fly logs
```

Check status:
```bash
fly status
```

Scale workers (if needed):
```bash
fly scale count 2
```

---

## Render Deployment

Render offers simple deployment with automatic scaling.

### 1. Create Account

Sign up at [render.com](https://render.com)

### 2. Create New Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Select the `service-worker` directory

### 3. Configure Service

**Settings:**
- **Name:** `sona-audio-worker`
- **Environment:** `Node`
- **Region:** Choose closest to Supabase
- **Branch:** `main` (or your deployment branch)
- **Root Directory:** `service-worker`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 4. Set Environment Variables

In the Render dashboard, add environment variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STABLE_AUDIO_API_KEY=your-stable-audio-key
STABLE_AUDIO_API_URL=https://api.stability.ai/v2beta/stable-audio
MAX_CONCURRENT_JOBS=2
POLL_INTERVAL_MS=5000
SUPABASE_STORAGE_BUCKET=audio-files
STORAGE_PATH_PREFIX=generated
LOG_LEVEL=info
```

### 5. Deploy

Click **Create Web Service** to deploy.

### 6. Monitor

View logs in the Render dashboard under **Logs** tab.

---

## Railway Deployment

Railway provides simple GitHub integration and automatic deployments.

### 1. Create Account

Sign up at [railway.app](https://railway.app)

### 2. Create New Project

1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your repository
4. Select the `service-worker` directory

### 3. Configure Environment Variables

In the Railway dashboard:
1. Go to **Variables** tab
2. Add all required environment variables (same as above)

### 4. Configure Build

Railway auto-detects Node.js. Verify in `Settings`:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `service-worker`

### 5. Deploy

Railway automatically deploys on push to main branch.

### 6. Monitor

View logs in the Railway dashboard.

---

## Docker Deployment (VPS)

For VPS deployment using Docker.

### 1. Build Docker Image

```bash
cd service-worker
docker build -t sona-audio-worker .
```

### 2. Test Locally

```bash
docker run --env-file .env sona-audio-worker
```

### 3. Push to Registry

**Docker Hub:**
```bash
docker tag sona-audio-worker your-username/sona-audio-worker
docker push your-username/sona-audio-worker
```

**Or use your VPS directly:**
```bash
# On your VPS
git clone <your-repo>
cd service-worker
docker build -t sona-audio-worker .
```

### 4. Run on VPS

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  worker:
    image: sona-audio-worker
    restart: unless-stopped
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - STABLE_AUDIO_API_KEY=${STABLE_AUDIO_API_KEY}
      - STABLE_AUDIO_API_URL=${STABLE_AUDIO_API_URL}
      - MAX_CONCURRENT_JOBS=2
      - POLL_INTERVAL_MS=5000
      - SUPABASE_STORAGE_BUCKET=audio-files
      - STORAGE_PATH_PREFIX=generated
      - LOG_LEVEL=info
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Create `.env` file with your secrets.

Start the service:
```bash
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f worker
```

---

## Systemd Service (Linux VPS)

For bare-metal Linux deployment.

### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Setup Application

```bash
cd /opt
sudo git clone <your-repo> sona-worker
cd sona-worker/service-worker
sudo npm install
sudo npm run build
```

### 3. Create Environment File

```bash
sudo nano /opt/sona-worker/service-worker/.env
```

Paste your environment variables.

### 4. Create Systemd Service

```bash
sudo nano /etc/systemd/system/sona-worker.service
```

Paste:

```ini
[Unit]
Description=Sona Audio Worker Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/sona-worker/service-worker
Environment=NODE_ENV=production
EnvironmentFile=/opt/sona-worker/service-worker/.env
ExecStart=/usr/bin/node /opt/sona-worker/service-worker/dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=sona-worker

[Install]
WantedBy=multi-user.target
```

### 5. Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable sona-worker
sudo systemctl start sona-worker
sudo systemctl status sona-worker
```

### 6. View Logs

```bash
sudo journalctl -u sona-worker -f
```

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Worker is running (check logs)
- [ ] Worker connects to Supabase (no connection errors)
- [ ] Jobs are being picked up from the queue
- [ ] Audio files are generated and uploaded
- [ ] Job statuses are updated correctly
- [ ] Failed jobs are marked appropriately
- [ ] Storage bucket is accessible
- [ ] No error loops in logs

## Scaling

### Vertical Scaling (More Resources)

Increase resources per worker instance:
- **Fly.io:** `fly scale vm shared-cpu-2x`
- **Render:** Upgrade instance type
- **Railway:** Upgrade plan
- **VPS:** Upgrade server

### Horizontal Scaling (More Workers)

Run multiple worker instances:
- Set different `MAX_CONCURRENT_JOBS` per instance
- Workers automatically coordinate via database locking
- Total concurrency = sum of all `MAX_CONCURRENT_JOBS`

**Example:**
- Worker 1: `MAX_CONCURRENT_JOBS=2`
- Worker 2: `MAX_CONCURRENT_JOBS=2`
- Total: 4 concurrent jobs across 2 instances

## Troubleshooting

### Worker not starting

Check:
1. All environment variables are set
2. Node.js version is 18+
3. Dependencies installed: `npm install`
4. Build successful: `npm run build`

### Jobs not processing

Check:
1. Database connection works
2. Jobs exist with status `pending` or `queued`
3. No duplicate workers locking jobs
4. Worker logs for errors

### Storage upload failures

Check:
1. Service role key has storage permissions
2. Bucket exists or worker can create it
3. Network connectivity to Supabase
4. File sizes within limits (50MB default)

## Support

For deployment issues:
- Check platform-specific documentation
- Review worker logs
- Verify environment variables
- Test with `npm run validate`

---

**Next Steps:** After successful deployment, monitor your worker and adjust `MAX_CONCURRENT_JOBS` based on your needs and infrastructure.
