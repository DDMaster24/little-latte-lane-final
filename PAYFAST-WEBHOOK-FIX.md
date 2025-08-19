# URGENT: PayFast Webhook Fix

## Critical Issue
PayFast webhooks failing due to missing BASE_URL environment variable.
Current webhook URL: `https://undefined/api/payfast/notify` ❌

## Required Fix
Add BASE_URL environment variable in Vercel:

### Environment Variable to Add:
- **Name**: `BASE_URL`
- **Value**: `https://littlelattelane.co.za`

### Steps:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - Name: `BASE_URL`
   - Value: `https://littlelattelane.co.za`
   - Environment: Production
3. Click "Save"
4. Redeploy the application (or trigger new deployment)

### After Fix:
- Webhook URL will be: `https://littlelattelane.co.za/api/payfast/notify` ✅
- PayFast will be able to send payment confirmations
- Orders will automatically update from "pending" to "paid"
- Staff panel will show confirmed orders in real-time

### Test:
1. Try a new R15 Test Burger payment
2. Complete payment on PayFast
3. Check that order status updates automatically in database
4. Verify staff panel shows updated order

## Current Pending Orders
You have 4 orders with pending payment status that should have been confirmed:
- R30 order (12:38)
- R1 orders (14:02, 14:12) 
- R25 order (14:13)

These will remain pending (historical), but new payments will work correctly after the fix.
