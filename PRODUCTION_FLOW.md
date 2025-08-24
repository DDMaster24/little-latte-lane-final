/* 
PRODUCTION DATA FLOW ON VERCEL

1. ADMIN MAKES EDIT:
   admin.yourdomain.com/?editor=true&admin=true
   ↓
   Clicks "Save to DB"
   ↓
   POST request to Vercel serverless function
   ↓
   Function calls Supabase API
   ↓
   Data saved to theme_settings table

2. USER VISITS SITE:
   yourdomain.com
   ↓
   Vercel serves Next.js app
   ↓
   VisualContentLoader runs on client
   ↓
   Fetches data from Supabase
   ↓
   Applies custom content to DOM

3. DATA LOCATION:
   ┌─────────────────────────────────────┐
   │         SUPABASE DATABASE           │
   │                                     │
   │  Table: theme_settings              │
   │  ┌─────────────────────────────────┐ │
   │  │ id    | setting_key | value     │ │
   │  │ uuid  | visual_text_h1... | Hi! │ │
   │  │ uuid  | visual_text_p... | New │ │
   │  └─────────────────────────────────┘ │
   └─────────────────────────────────────┘
   
4. REPOSITORY (GITHUB):
   ┌─────────────────────────────────────┐
   │         STATIC CODE ONLY            │
   │                                     │
   │  ✅ React Components               │
   │  ✅ Styling (CSS/Tailwind)         │
   │  ✅ Business Logic                 │
   │  ✅ Database Queries               │
   │                                     │
   │  ❌ NO Content Data                │
   │  ❌ NO Admin Edits                 │
   └─────────────────────────────────────┘

RESULT: Content and Code are completely separate!
*/
