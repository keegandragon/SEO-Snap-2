# Complete Stripe Integration Setup Guide

Your SEO Snap app already has comprehensive Stripe integration! However, you need to set up real Stripe products and update your database with actual Price IDs.

## Step 1: Create Products in Stripe Dashboard

1. **Go to your Stripe Dashboard**: https://dashboard.stripe.com/products
2. **Create Starter Plan Product**:
   - Click "Add product"
   - Name: "Starter Plan"
   - Description: "Great for small businesses - 50 generations per month"
   - Add pricing:
     - Monthly: $9.99/month
     - Yearly: $99.99/year (save 17%)

3. **Create Pro Plan Product**:
   - Click "Add product"
   - Name: "Pro Plan" 
   - Description: "For power users and agencies - 200 generations per month"
   - Add pricing:
     - Monthly: $19.99/month
     - Yearly: $199.99/year (save 17%)

## Step 2: Get Your Price IDs

After creating products, copy the Price IDs from Stripe Dashboard:
- Each price will have an ID like `price_1ABC123def456`
- You'll need 4 Price IDs total (2 products × 2 billing cycles)

## Step 3: Update Your Database

Run this SQL in your Supabase SQL Editor, replacing with your actual Price IDs:

```sql
-- Update Starter Plan Prices
UPDATE stripe_prices 
SET id = 'price_YOUR_STARTER_MONTHLY_ID'  -- Replace with actual Price ID
WHERE id = 'price_starter_monthly';

UPDATE stripe_prices 
SET id = 'price_YOUR_STARTER_YEARLY_ID'   -- Replace with actual Price ID
WHERE id = 'price_starter_yearly';

-- Update Pro Plan Prices  
UPDATE stripe_prices 
SET id = 'price_YOUR_PRO_MONTHLY_ID'      -- Replace with actual Price ID
WHERE id = 'price_pro_monthly';

UPDATE stripe_prices 
SET id = 'price_YOUR_PRO_YEARLY_ID'       -- Replace with actual Price ID
WHERE id = 'price_pro_yearly';

-- Verify the updates
SELECT 
  sp.id as price_id,
  sp.unit_amount / 100 as price_dollars,
  sp.recurring_interval,
  spr.name as product_name
FROM stripe_prices sp
JOIN stripe_products spr ON sp.product_id = spr.id
ORDER BY spr.name, sp.recurring_interval;
```

## Step 4: Set Environment Variables

Make sure these are set in your Supabase Edge Functions:

```bash
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_... (from webhook endpoint)
```

## Step 5: Set Up Webhook Endpoint

1. **In Stripe Dashboard**, go to Webhooks
2. **Add endpoint**: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy the webhook secret** and add to Supabase environment variables

## Step 6: Test the Integration

1. **Use the Stripe Debugger**: Visit `/stripe-debug` in your app
2. **Test checkout flow**: Try subscribing to a plan
3. **Check webhook logs**: Verify webhooks are being received
4. **Test subscription management**: Try canceling/reactivating

## Current Stripe Features in Your App

✅ **Payment Processing**
- Secure Stripe Checkout integration
- Multiple subscription plans
- Monthly/yearly billing options

✅ **Subscription Management**
- Real-time subscription status
- Upgrade/downgrade functionality
- Cancellation with period-end access
- Automatic renewal handling

✅ **Webhook Processing**
- Complete webhook event handling
- Automatic user status updates
- Payment failure handling
- Subscription lifecycle management

✅ **Customer Portal**
- Self-service subscription management
- Billing history access
- Payment method updates

✅ **Admin Tools**
- Subscription health monitoring
- Manual subscription management
- Stripe integration debugging

## Troubleshooting

### Common Issues:
1. **"Invalid Price ID"** - Update database with real Stripe Price IDs
2. **Webhook failures** - Check webhook secret and endpoint URL
3. **Payment failures** - Verify Stripe keys are correct
4. **User not upgraded** - Check webhook processing logs

### Debug Tools:
- Visit `/stripe-debug` to test Price IDs
- Check Supabase Edge Function logs
- Monitor Stripe Dashboard for webhook delivery
- Use `/admin` dashboard for subscription monitoring

## Production Checklist

Before going live:
- [ ] Replace test Stripe keys with live keys
- [ ] Update webhook endpoint to production URL
- [ ] Test complete payment flow
- [ ] Verify subscription management works
- [ ] Test webhook event handling
- [ ] Monitor subscription health dashboard

Your Stripe integration is already production-ready! You just need to connect it to real Stripe products and prices.