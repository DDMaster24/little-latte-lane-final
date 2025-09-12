# React Bricks Environment Variables Fix

## Issue Fixed
Updated environment variable names to match React Bricks documentation:
- Changed `NEXT_PUBLIC_API_KEY` → `API_KEY` (server-side only)
- Kept `NEXT_PUBLIC_APP_ID` (client-side accessible)

## Vercel Environment Variables Required
Set these in Vercel dashboard under Production and Preview:
- `API_KEY` = 160313a8-2baf-4655-bd60-5c61e95045eb  
- `NEXT_PUBLIC_APP_ID` = 7d0efa3f-60fe-445e-b87f-e0b5ea43d68e

## References
- [React Bricks Vercel Deploy Guide](https://reactbricks.com/docs/deploy/vercel)
- [React Bricks Configuration Docs](https://v2.docs.reactbricks.com/docs/getting-started/configuration)

## Testing
Use `/api/debug-env-vars` endpoint to verify environment variables are loaded correctly.