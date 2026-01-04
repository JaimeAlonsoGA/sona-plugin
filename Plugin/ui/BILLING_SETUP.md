# Sona Billing System - Stripe Integration

## Overview

This document describes the Stripe payment integration for the Sona plugin, enabling users to purchase tokens for audio generation.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Plugin UI     │────▶│  Supabase Edge Func  │────▶│     Stripe      │
│  (React/TS)     │     │  stripe-checkout     │     │    Checkout     │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                                                              │
                                                              ▼
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Supabase DB    │◀────│  Supabase Edge Func  │◀────│ Stripe Webhook  │
│  user_tokens    │     │  stripe-webhook      │     │                 │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

## Setup Instructions

### 1. Stripe Dashboard Configuration

#### Create Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add Product**
3. Create the following products:

| Product Name | Price | Price ID Format |
|-------------|-------|-----------------|
| Sona Tokens - Starter (200 tokens) | $2.00 USD (one-time) | `price_xxx` |
| Sona Tokens - Creator (500 tokens) | $5.00 USD (one-time) | `price_xxx` |
| Sona Tokens - Producer (1000 tokens) | $10.00 USD (one-time) | `price_xxx` |

4. Copy the Price IDs for each product.

#### Update Token Packages in Code

Edit `Plugin/ui/src/types/stripe.types.ts` and update the `stripePriceId` for each package:

```typescript
export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'tokens_200',
    name: 'Starter',
    tokens: 200,
    price: 200,
    priceDisplay: '$2',
    description: 'Perfect for trying out Sona',
    stripePriceId: 'price_YOUR_200_PRICE_ID', // <-- Update this
  },
  // ... update others
]
```

#### Configure Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL:
   ```
   https://YOUR-PROJECT-ID.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### 2. Environment Variables

#### Supabase Edge Functions

Set these secrets in Supabase:

```bash
# Using Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Or via Supabase Dashboard:
1. Go to **Project Settings** → **Edge Functions**
2. Add the secrets

#### Plugin UI (.env.local)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
# Note: Stripe publishable key is not needed for hosted checkout
```

### 3. Database Migration

Run the migration to create token tables:

```bash
supabase db push
# or
supabase migration up
```

This creates:
- `user_tokens` - User token balances
- `token_transactions` - Transaction history
- `add_user_tokens()` - Function to credit tokens
- `use_token()` - Function to deduct tokens
- `check_user_tokens()` - Function to check balance

### 4. Deploy Edge Functions

```bash
# Deploy checkout function
supabase functions deploy stripe-checkout

# Deploy webhook function  
supabase functions deploy stripe-webhook
```

## Testing

### Test Mode

Stripe provides test mode with test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

Use any future expiry date and any CVC.

### Test the Flow

1. Open the plugin
2. Navigate to Profile → Tokens → Buy More
3. Select a token package
4. Complete checkout with test card
5. Verify tokens are credited

### Webhook Testing (Local)

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local function
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# In another terminal, trigger test events
stripe trigger checkout.session.completed
```

## Going to Production

### 1. Switch to Live Keys

1. Toggle to **Live mode** in Stripe Dashboard
2. Get live API keys (Settings → Developers → API Keys)
3. Update secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx_live
   ```

### 2. Create Live Products

Recreate products in live mode with the same structure.

### 3. Update Price IDs

Update `stripe.types.ts` with live Price IDs.

### 4. Configure Live Webhook

Create a new webhook endpoint in live mode pointing to your production Edge Function URL.

## Future: Subscriptions

The system is prepared for subscription tiers. To enable:

1. Create subscription products in Stripe with `recurring` pricing
2. Update `SUBSCRIPTION_PLANS` in `stripe.types.ts`
3. Modify checkout function to support `mode: 'subscription'`
4. Add webhook handlers for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`

## Security Notes

- Never expose `STRIPE_SECRET_KEY` to the frontend
- Always verify webhook signatures
- Use Supabase RLS to protect user data
- The webhook function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS

## Troubleshooting

### Webhook not receiving events
- Verify endpoint URL is correct
- Check webhook secret is set correctly
- Review Stripe webhook logs in Dashboard

### Tokens not credited
- Check Edge Function logs in Supabase Dashboard
- Verify `checkout.session.completed` event is received
- Ensure metadata (user_id, package_id, tokens) is present

### Checkout session fails
- Verify Price ID exists in Stripe
- Check user is authenticated
- Review Edge Function logs

## Support

For issues with:
- **Stripe Integration**: Check [Stripe Docs](https://stripe.com/docs)
- **Supabase Functions**: Check [Supabase Docs](https://supabase.com/docs/guides/functions)
- **Sona Plugin**: Open an issue in the repository
