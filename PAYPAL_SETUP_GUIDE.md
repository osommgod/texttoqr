# PayPal Backend Verification Setup Guide

This guide will help you set up secure server-side PayPal payment verification using Supabase Edge Functions.

## What We Built

1. **Edge Function**: `verify-paypal-payment` - Verifies PayPal payments server-side
2. **Database Table**: `payment_logs` - Stores all payment transactions
3. **Frontend Integration**: Updated `PayPalPayment` component to verify payments before upgrading users

## Setup Steps

### 1. Run Database Migration

First, apply the migration to create the `payment_logs` table:

```bash
# If using Supabase CLI locally
supabase db push

# Or manually run the SQL in Supabase Dashboard > SQL Editor
```

The migration file is located at: `supabase/migrations/20250129_create_payment_logs.sql`

### 2. Set Environment Variables in Supabase

Go to your Supabase Dashboard → Project Settings → Edge Functions → Secrets

Add the following environment variables:

```
PAYPAL_CLIENT_ID=AXDxaxcS_REDZTiIh4-0QJZgYIWEuyTo_12UVbP4YuhM-Qc2IdhYY4L4EwEq4ci-TX8fOulA5u2er-8x
PAYPAL_SECRET=<your-paypal-secret-from-dashboard>
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
```

**Important**: 
- For production, change `PAYPAL_API_URL` to `https://api-m.paypal.com`
- Use production credentials instead of sandbox credentials

### 3. Deploy the Edge Function

```bash
# Login to Supabase (if not already logged in)
npx supabase login

# Link your project
npx supabase link --project-ref <your-project-ref>

# Deploy the function
npx supabase functions deploy verify-paypal-payment
```

### 4. Test the Integration

1. Start your dev server: `npm run dev`
2. Navigate to the checkout page
3. Select PayPal as payment method
4. Complete a test payment using PayPal sandbox credentials
5. Check the console for verification logs
6. Verify the user's plan was updated in the database
7. Check the `payment_logs` table for the transaction record

## How It Works

### Payment Flow

1. **User clicks PayPal button** → PayPal modal opens
2. **User completes payment** → PayPal captures the payment
3. **Frontend calls Edge Function** → Sends order ID to verify
4. **Edge Function verifies with PayPal** → Checks payment status
5. **If verified** → Updates user plan in database
6. **Logs transaction** → Stores record in `payment_logs` table
7. **Returns success** → Frontend shows success message

### Security Benefits

✅ **Server-side verification** - Can't be bypassed by malicious users  
✅ **Double-check with PayPal** - Confirms payment actually completed  
✅ **Audit trail** - All transactions logged in database  
✅ **Secret key protected** - PayPal secret never exposed to frontend  

## Troubleshooting

### Function not found error
- Make sure you deployed the function: `npx supabase functions deploy verify-paypal-payment`
- Check function name matches exactly in the code

### Payment verification fails
- Check environment variables are set correctly in Supabase Dashboard
- Verify PayPal credentials are correct
- Check Edge Function logs in Supabase Dashboard

### Database update fails
- Ensure migration was applied successfully
- Check RLS policies allow service role to update users_custom table

## Production Checklist

Before going live:

- [ ] Switch to PayPal production credentials
- [ ] Change `PAYPAL_API_URL` to production URL
- [ ] Test with real (small amount) transactions
- [ ] Set up webhook listeners for refunds/disputes
- [ ] Monitor `payment_logs` table for anomalies
- [ ] Set up alerts for failed verifications

## Next Steps

Consider adding:
- Email receipts after successful payment
- Webhook handler for PayPal events (refunds, disputes)
- Admin dashboard to view payment logs
- Automatic retry logic for failed verifications
