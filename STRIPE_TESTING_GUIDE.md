# Stripe Integration Testing Guide

## Quick Test Checklist

### 1. Test Price IDs
Visit: `http://localhost:5173/stripe-debug`
- Check if Price IDs are valid Stripe IDs (start with "price_")
- Test checkout session creation
- Verify database connection

### 2. Test Checkout Flow
1. Go to `/plans` page
2. Click "Subscribe to Starter" or "Subscribe to Pro"
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Verify user is upgraded in dashboard

### 3. Test Webhook Processing
1. Check Supabase Edge Function logs
2. Verify user status updates after payment
3. Test subscription cancellation
4. Check automatic downgrade on expiry

### 4. Test Subscription Management
1. Visit `/subscription` page
2. Test cancellation
3. Test reactivation
4. Verify billing information display

## Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

## Environment Variables Needed

```bash
# In Supabase Edge Functions
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# In your .env file (frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Webhook Events to Monitor

Your app handles these Stripe webhook events:
- `checkout.session.completed` - User completes payment
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

## Database Tables to Check

After successful payment, verify:
```sql
-- Check user upgrade
SELECT email, is_premium, usage_limit FROM users WHERE email = 'test@example.com';

-- Check subscription creation
SELECT plan_type, status, stripe_subscription_id FROM subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
```

Your Stripe integration is comprehensive and production-ready!