# Environment Variables Setup

## Supabase Edge Function Secrets

You need to add these secrets to your Supabase project:

### How to Add Secrets

1. Go to: https://supabase.com/dashboard/project/tqcaiytfzytdqxkodlvf/settings/functions
2. Click on "Edge Functions" in the left sidebar
3. Scroll to "Function Secrets" section
4. Add the following secrets:

### Required Secrets

```
PAYPAL_CLIENT_ID=AXDxaxcS_REDZTiIh4-0QJZgYIWEuyTo_12UVbP4YuhM-Qc2IdhYY4L4EwEq4ci-TX8fOulA5u2er-8x
```

```
PAYPAL_SECRET=<YOUR_SECRET_FROM_PAYPAL_DASHBOARD>
```

```
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
```

### Where to Find PayPal Secret

1. Go to: https://developer.paypal.com/dashboard/applications/sandbox
2. Click on your application (Default Application)
3. Under "SANDBOX API CREDENTIALS", click "Show" next to "Secret"
4. Copy the secret value

### Important Notes

- The `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in Edge Functions
- For production, change `PAYPAL_API_URL` to `https://api-m.paypal.com`
- Never commit secrets to Git

## Testing

After adding the secrets, test the function by:
1. Making a test payment through your app
2. Checking the Edge Function logs in Supabase Dashboard
3. Verifying the payment appears in the `payment_logs` table
