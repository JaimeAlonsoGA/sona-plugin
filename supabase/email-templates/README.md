# SONA Email Templates

Professional email templates for the SONA beta onboarding flow.

## Templates

### 1. `confirm-email.html`
**Purpose:** Email confirmation for new user signups
**Supabase Template:** Confirm signup

**Variables used:**
- `{{ .ConfirmationURL }}` - The email confirmation link

### 2. `beta-approved.html`  
**Purpose:** Notification when a beta application is approved
**Usage:** Send via Supabase Edge Function when admin approves a user

**Variables used:**
- `{{ .FirstName }}` - User's first name from beta_applications table

---

## Assets Required

### Logo Image
The templates use the SONA icon from **Supabase Storage** bucket `sona-branding`:

```
https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/sona-branding/sona-icon.png
```

**Setup:**
1. Create a public bucket called `sona-branding` in Supabase Storage
2. Upload `sona-icon.png` to the bucket
3. Replace `YOUR_PROJECT_REF` in both email templates with your actual Supabase project reference
   - Find it in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

---

## Setup Instructions

### Step 1: Configure Email Confirmation Template in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Copy the contents of `confirm-email.html`
4. Paste into the **Body HTML** field
5. Set the **Subject** to: `Welcome to SONA - Confirm Your Email ✨`
6. Click **Save**

### Step 2: Configure Resend for Transactional Emails

The beta approval emails are sent via **Resend** (recommended):

1. Go to [resend.com](https://resend.com) and create an account
2. Verify your domain (`sona.audio`) in Resend dashboard
3. Create an API key
4. Add the secret to Supabase:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   ```
5. Deploy the edge function:
   ```bash
   supabase functions deploy beta-approval
   ```

See [supabase/functions/beta-approval/README.md](../functions/beta-approval/README.md) for detailed setup.

### Step 3: Update Email Settings in Supabase Auth

1. Go to **Authentication** → **Settings** → **Email**
2. Set **Site URL** to your plugin URL: `https://plugin.sona.audio`
3. Set **Redirect URLs** to include:
   - `https://plugin.sona.audio` (plugin app)
   - `https://sona.audio` (landing page)
   - `http://localhost:5173` (development)

---

## Email Flow

### 1. Email Confirmation (Supabase Auth)
- **Trigger:** User signs up
- **Template:** `confirm-email.html` (configured in Supabase Auth → Email Templates)
- **Provider:** Supabase's built-in email

### 2. Beta Approval (Resend via Edge Function)
- **Trigger:** 
  - Automatic: User submits application with valid referral code
  - Manual: Admin approves via dashboard/direct DB update
- **Template:** Embedded in `beta-approval` edge function
- **Provider:** Resend API

**Automatic approval flow:**
```
User enters referral code → submitBetaApplication() → 
status = 'approved' → sendApprovalEmail() → 
Edge Function → Resend API → Email delivered
```

**Manual approval flow:**
```
Admin updates status in DB → (optional trigger) →
Edge Function → Resend API → Email delivered
```

---

## Email Design Features

### Branding
- **Primary Color:** `#d97706` (SONA amber/gold)
- **Background:** `#0a0a0b` (dark)
- **Text:** `#fafafa` (headings), `#a1a1aa` (body)

### Mode Colors
- **Designer:** `#c084fc` (purple)
- **Producer:** `#60a5fa` (blue)  
- **Creator:** `#f472b6` (pink)

### Typography
- Font: System fonts (SF Pro, Segoe UI, Roboto)
- Headings: 500 weight
- Body: 400 weight

### Features
- ✅ Dark mode design
- ✅ Mobile responsive
- ✅ Outlook/Windows Mail compatible
- ✅ Gmail-optimized
- ✅ Apple Mail compatible
- ✅ Preheader text for previews

---

## Testing Emails

### Litmus/Email on Acid
Upload the HTML to test across email clients.

### Manual Testing
1. Sign up with a test email
2. Check inbox for confirmation email
3. Verify links work correctly
4. Test on mobile and desktop

### Recommended Test Clients
- Gmail (web & mobile)
- Apple Mail (macOS & iOS)
- Outlook (desktop & web)
- Yahoo Mail

---

## Customization

### Changing Colors
Search and replace the color values:
- Primary: `#d97706` → your color
- Background: `#0a0a0b` → your color

### Adding Logo Image
Replace the text logo with an image:
```html
<img src="https://your-domain.com/logo.png" alt="SONA" width="48" height="48" />
```

### Social Links
Update the social links in the footer section with your actual URLs.
