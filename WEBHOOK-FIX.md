# Webhook URL Fix for PayFast Integration

## Critical Issue Identified
PayFast webhooks are failing because the webhook URLs are pointing to `https://undefined/api/payfast/notify`

## Root Cause
Missing `BASE_URL` environment variable in production deployment

## Solution
Add the correct BASE_URL to Vercel environment variables

## Expected Production Domain
Based on repository name: `little-latte-lane-final.vercel.app`

## Required Environment Variable
BASE_URL=https://little-latte-lane-final.vercel.app

## Deployment Steps
1. Add BASE_URL environment variable in Vercel dashboard
2. Redeploy the application
3. Test payment flow again

## Verification
After fix, webhook URL should be:
https://little-latte-lane-final.vercel.app/api/payfast/notify
