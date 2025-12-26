# Testing Guide: React Frontend to Supabase Edge Functions Integration

This document provides step-by-step instructions to test the React frontend integration with Supabase Edge Functions for audio job submission.

## Prerequisites

Before testing, ensure you have:

1. ✅ Supabase project set up
2. ✅ Edge Function `generate` deployed
3. ✅ Database migrations applied (jobs table created)
4. ✅ Audio worker running (for actual audio generation)
5. ✅ Environment variables configured in `Plugin/ui/.env.local`

## Environment Setup

Create `Plugin/ui/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Test Scenarios

### 1. Build Verification

**Objective:** Verify TypeScript compilation and build

```bash
cd Plugin/ui
npm install
npm run build
```

**Expected Result:**
- ✅ Build completes successfully
- ✅ No TypeScript errors
- ✅ Output: `dist/` directory created

### 2. Development Server

**Objective:** Start the development server

```bash
npm run dev
```

**Expected Result:**
- ✅ Server starts on http://localhost:5173
- ✅ No console errors
- ✅ UI loads in browser

### 3. Authentication Test

**Objective:** Verify user authentication

**Steps:**
1. Open http://localhost:5173
2. Check browser console for auth state
3. Sign in with test credentials (if AuthExample component is visible)

**Expected Result:**
- ✅ User can sign in
- ✅ JWT token stored in Supabase client
- ✅ `useIsAuthenticated()` returns true

### 4. Job Submission Test

**Objective:** Submit a job and verify it's created

**Steps:**
1. Navigate to the UI
2. Enter a prompt: "peaceful ambient forest sounds"
3. Click "Generate Sound" button

**Expected Result:**
- ✅ Button shows "Generating..." state
- ✅ Job submitted to Edge Function
- ✅ Job ID returned and stored
- ✅ No errors in console

**Browser Console Check:**
```javascript
// Should see:
// "Job submitted: <job-id>"
```

### 5. Job Status Polling Test

**Objective:** Verify job status updates

**Steps:**
1. After submitting a job, watch the AudioPreview component
2. Observe status changes

**Expected Result:**
- ✅ Initial status: "pending" (yellow badge)
- ✅ Status updates to "queued" or "processing" (blue badge)
- ✅ Polling occurs every 2 seconds
- ✅ Real-time subscription active

**Browser Console Check:**
```javascript
// Should see polling requests in Network tab
// Should see Realtime subscription messages
```

### 6. Job Completion Test

**Objective:** Verify job completes and shows download links

**Steps:**
1. Wait for job to complete (requires audio worker)
2. Observe AudioPreview component

**Expected Result:**
- ✅ Status updates to "completed" (green badge)
- ✅ Polling stops automatically
- ✅ Download links appear for MP3/WAV
- ✅ Links are clickable and download files

### 7. Error Handling Test

**Objective:** Test error scenarios

#### 7.1 Empty Prompt
**Steps:**
1. Leave prompt field empty
2. Click "Generate Sound"

**Expected Result:**
- ✅ Button is disabled
- ✅ No API call made

#### 7.2 Prompt Too Long
**Steps:**
1. Enter a prompt > 500 characters
2. Click "Generate Sound"

**Expected Result:**
- ✅ Error message appears
- ✅ Job not submitted
- ✅ Error: "Prompt must be 500 characters or less"

#### 7.3 Not Authenticated
**Steps:**
1. Sign out (if implemented)
2. Try to submit a job

**Expected Result:**
- ✅ Error message appears
- ✅ Error: "Not authenticated. Please sign in to submit a job."

#### 7.4 Job Failed
**Steps:**
1. Submit a job that will fail (e.g., invalid prompt for Stable Audio)
2. Wait for status to update

**Expected Result:**
- ✅ Status updates to "failed" (red badge)
- ✅ Error message displayed
- ✅ No download links shown

### 8. Real-time Subscription Test

**Objective:** Verify real-time updates work

**Steps:**
1. Submit a job in one browser tab
2. Open the same job ID in another tab (if job history UI exists)
3. Watch for status updates

**Expected Result:**
- ✅ Both tabs receive real-time updates
- ✅ Status changes appear instantly
- ✅ No polling required for instant updates

### 9. Multiple Jobs Test

**Objective:** Test submitting multiple jobs

**Steps:**
1. Submit first job
2. Immediately submit second job
3. Watch both jobs

**Expected Result:**
- ✅ Both jobs created successfully
- ✅ Each job has unique ID
- ✅ Status updates independently
- ✅ UI shows current job only

### 10. Download Links Test

**Objective:** Verify download functionality

**Steps:**
1. Wait for a job to complete
2. Click MP3 download link
3. Click WAV download link

**Expected Result:**
- ✅ MP3 file downloads
- ✅ WAV file downloads
- ✅ Files are playable
- ✅ Links open in new tab or download

## Component-Specific Tests

### AudioPreview Component

**Test Cases:**
- [ ] Shows empty state when no job
- [ ] Shows loading spinner when `isLoading=true`
- [ ] Displays pending status correctly
- [ ] Displays processing status with spinner
- [ ] Displays completed status with green badge
- [ ] Displays failed status with red badge and error
- [ ] Shows download links only when completed
- [ ] Renders both MP3 and WAV links when available

### AudioGenerationExample Component

**Test Cases:**
- [ ] Form submits on button click
- [ ] Character counter shows correct count
- [ ] Max length enforced (500 chars)
- [ ] Submit button disabled when empty
- [ ] Submit button disabled when submitting
- [ ] Shows error message on failure
- [ ] Shows job status after submission
- [ ] Displays usage instructions

## Network Inspection

Open browser DevTools → Network tab

**What to check:**

1. **Job Submission:**
   - Method: POST
   - URL: `https://your-project.supabase.co/functions/v1/generate`
   - Headers: `Authorization: Bearer <jwt>`
   - Body: `{ prompt, duration, quality, mode }`
   - Response: `{ success: true, job_id: "...", ... }`

2. **Job Polling:**
   - Method: GET/POST (Supabase REST API)
   - URL: `https://your-project.supabase.co/rest/v1/jobs?id=eq.<job-id>`
   - Headers: `Authorization: Bearer <jwt>`
   - Frequency: Every 2 seconds
   - Stops when job completes

3. **Realtime Subscription:**
   - WebSocket connection
   - URL: `wss://your-project.supabase.co/realtime/v1/websocket`
   - Messages: Job updates when status changes

## Console Checks

**No errors should appear:**
- ❌ TypeScript errors
- ❌ React errors
- ❌ Network errors (except expected failures)
- ❌ Supabase errors

**Expected logs:**
- ✅ "Job submitted: <job-id>"
- ✅ "Message from C++: ..." (if bridge active)
- ✅ Job status updates

## Performance Checks

**Metrics to verify:**
- ⏱️ Job submission: < 1 second
- ⏱️ Status update (polling): ~2 seconds
- ⏱️ Status update (realtime): < 1 second
- ⏱️ Download link click: instant

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

## Mobile Responsiveness

Test UI on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Integration with C++ Plugin

**If C++ bridge is active:**

**Steps:**
1. Load plugin in DAW
2. Submit job from UI
3. Check C++ console

**Expected Result:**
- ✅ Message received: `{ type: 'job-submitted', payload: { jobId, prompt } }`
- ✅ C++ can track job ID
- ✅ C++ can download audio when ready

## Troubleshooting

### Issue: Jobs not updating

**Possible causes:**
- Audio worker not running
- Database migrations not applied
- RLS policies blocking access

**Solution:**
1. Check audio worker logs
2. Verify `jobs` table exists
3. Check RLS policies in Supabase dashboard

### Issue: Download links not working

**Possible causes:**
- Supabase Storage not configured
- Files not uploaded
- Incorrect file paths

**Solution:**
1. Verify storage bucket exists
2. Check worker logs for upload errors
3. Test storage URLs manually

### Issue: Polling not stopping

**Possible causes:**
- Status not updating to final state
- Query cache stale

**Solution:**
1. Check job status in database
2. Invalidate query cache manually
3. Refresh browser

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Jobs submit successfully
✅ Status updates correctly
✅ Download links work
✅ Polling stops when complete
✅ Real-time updates work
✅ Error handling works
✅ Build passes
✅ No TypeScript errors
✅ No security vulnerabilities

## Reporting Issues

If tests fail, collect:
1. Browser console logs
2. Network request/response
3. Supabase logs
4. Error messages
5. Steps to reproduce

## Next Steps

After successful testing:
1. ✅ Mark issue COD-31 as complete
2. Deploy to production
3. Monitor job submission rates
4. Gather user feedback
