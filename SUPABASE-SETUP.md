# Supabase Extension Setup Guide

## 🚀 Setting Up Supabase Extension in VS Code

### Step 1: Initialize Supabase in Your Project
1. Open VS Code Command Palette (Ctrl+Shift+P)
2. Type: `Supabase: Initialize`
3. This creates a `.supabase` folder in your project

### Step 2: Connect to Your Project
1. Command Palette → `Supabase: Link to Remote Project`
2. Enter your project reference ID: `awytuszmunxvthuizyur`
3. You'll need your Supabase access token

### Step 3: Get Your Access Token
1. Go to https://supabase.com/dashboard/account/tokens
2. Generate a new access token
3. Copy and save it securely

### Step 4: Alternative - Manual Configuration
If automatic setup doesn't work, we can manually configure:

1. Create `.supabase/config.toml` with your project details
2. Set up environment variables
3. Configure VS Code settings

## 🔌 Database Connection String Format
From your screenshot, your connection string should look like:
```
postgresql://postgres:[PASSWORD]@db.awytuszmunxvthuizyur.supabase.co:5432/postgres
```

Replace [PASSWORD] with your actual database password from the Supabase dashboard.

## 🛠️ Next Steps
1. Get the connection string with real password
2. Update .env.local file
3. Configure both Supabase and SQLTools extensions
4. Test connections
5. Apply RLS policy fixes
