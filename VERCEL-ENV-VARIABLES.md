# Vercel Environment Variables Configuration
# Add these to your Vercel project settings

## React Bricks Configuration
REACT_BRICKS_API_KEY=5b424a63-3b61-4be4-9a11-949ee485ace6
NEXT_PUBLIC_REACT_BRICKS_APP_ID=f66e8afc-ebaf-4609-9b14-1b00b0454228
NEXT_PUBLIC_REACT_BRICKS_ENVIRONMENT=main

## Instructions:
## 1. Go to https://vercel.com/dashboard
## 2. Select your little-latte-lane project
## 3. Go to Settings > Environment Variables
## 4. Add each variable above with:
##    - Name: Variable name (e.g., REACT_BRICKS_API_KEY)
##    - Value: Variable value (e.g., 5b424a63-3b61-4be4-9a11-949ee485ace6)  
##    - Environment: Production, Preview, Development (select all)
## 5. Click "Save"
## 6. Redeploy your application

## Notes:
## - These are the same values from your local .env.local file
## - REACT_BRICKS_API_KEY is server-side only (no NEXT_PUBLIC prefix)
## - The other two are client-side (with NEXT_PUBLIC prefix)
## - All three are required for React Bricks to function properly