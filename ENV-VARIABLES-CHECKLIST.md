# 🔐 ENVIRONMENT VARIABLES VERIFICATION CHECKLIST
**Project:** Little Latte Lane  
**Date:** October 6, 2025  
**Platform:** Vercel

---

## 📋 YOUR CURRENT ENV VARS (From Screenshot)

✅ **Currently Set:**
1. `NODE_ENV` - All Environments
2. `SUPABASE_DB_PASSWORD` - All Environments
3. `NEXT_PUBLIC_SENTRY_DSN` - All Environments
4. `SENTRY_ORG` - All Environments
5. `SENTRY_PROJECT` - All Environments
6. `SENTRY_AUTH_TOKEN` - All Environments
7. `FROM_EMAIL` - All Environments
8. `ADMIN_EMAIL` - All Environments

---

## ❌ CRITICAL MISSING VARIABLES (REQUIRED)

### 🔴 **PRIORITY 1: SUPABASE (Database) - CRITICAL**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-service-role-key
NEXT_PUBLIC_SUPABASE_PROJECT_ID=awytuszmunxvthuizyur
```
**Status:** ❌ MISSING (App won't work without these!)  
**Where to find:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/awytuszmunxvthuizyur/settings/api)
2. Copy URL, Anon Key, and Service Role Key
3. Add to Vercel

---

### 🔴 **PRIORITY 1: YOCO PAYMENTS - CRITICAL**
```env
NEXT_PUBLIC_YOCO_PUBLIC_KEY=pk_live_...
YOCO_SECRET_KEY=sk_live_...
YOCO_WEBHOOK_SECRET=wh_sec_...
```
**Status:** ❌ MISSING (Payments won't work!)  
**Where to find:**
1. Go to [Yoco Dashboard](https://portal.yoco.com/developers)
2. Get API keys from Developer section
3. Get webhook secret from Webhooks section
4. Add to Vercel

---

### 🔴 **PRIORITY 1: PUSH NOTIFICATIONS (VAPID) - CRITICAL**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BN4Q...your-public-key
VAPID_PRIVATE_KEY=_TG...your-private-key
VAPID_SUBJECT=mailto:support@littlelattelane.co.za
```
**Status:** ❌ MISSING (Push notifications won't work!)  
**Where to find:** These should be in your `.env.local` file from Week 1  
**If lost, regenerate:**
```bash
npx web-push generate-vapid-keys
```

---

### 🟡 **PRIORITY 2: RESEND (Email Sending) - HIGH**
```env
RESEND_API_KEY=re_...your-resend-key
ORDERS_EMAIL=orders@littlelattelane.co.za
SUPPORT_EMAIL=support@littlelattelane.co.za
```
**Status:** ⚠️ PARTIALLY SET (You have `FROM_EMAIL`, need `RESEND_API_KEY`)  
**Where to find:**
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create API key
3. Add to Vercel

---

### 🟡 **PRIORITY 2: SITE URL - HIGH**
```env
NEXT_PUBLIC_SITE_URL=https://littlelattelane.co.za
```
**Status:** ❌ MISSING (OAuth callbacks won't work)  
**Value:** Your production domain  
**Used for:** Email confirmation links, Yoco redirects, OAuth

---

### 🟢 **PRIORITY 3: REACT BRICKS CMS - MEDIUM**
```env
NEXT_PUBLIC_API_KEY=your-react-bricks-api-key
```
**Status:** ❌ MISSING (CMS preview won't work)  
**Where to find:** React Bricks dashboard (if using)  
**Can skip if:** Not using React Bricks CMS

---

### 🟢 **PRIORITY 3: GOOGLE MAPS - MEDIUM**
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...your-google-key
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIza...your-google-key
```
**Status:** ❌ MISSING (Address autocomplete won't work)  
**Where to find:**
1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Enable Maps JavaScript API and Places API
3. Create API key
4. Add to Vercel

---

## ✅ CORRECTLY SET VARIABLES

1. ✅ **NODE_ENV** - Automatically set by Vercel
2. ✅ **SUPABASE_DB_PASSWORD** - Good (but not used directly in app)
3. ✅ **NEXT_PUBLIC_SENTRY_DSN** - Good for error monitoring
4. ✅ **SENTRY_ORG** - Good for Sentry integration
5. ✅ **SENTRY_PROJECT** - Good for Sentry integration
6. ✅ **SENTRY_AUTH_TOKEN** - Good for Sentry uploads
7. ✅ **FROM_EMAIL** - Good for email sending
8. ✅ **ADMIN_EMAIL** - Good for admin notifications

---

## 📝 COMPLETE ENVIRONMENT VARIABLES LIST

### **Supabase (Database) - REQUIRED** ✅
- [x] `NODE_ENV` (auto-set by Vercel)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_PROJECT_ID`
- [x] `SUPABASE_DB_PASSWORD` (optional, not used in app)

### **Yoco Payments - REQUIRED** ✅
- [ ] `NEXT_PUBLIC_YOCO_PUBLIC_KEY`
- [ ] `YOCO_SECRET_KEY`
- [ ] `YOCO_WEBHOOK_SECRET`

### **Push Notifications (VAPID) - REQUIRED** ✅
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- [ ] `VAPID_PRIVATE_KEY`
- [ ] `VAPID_SUBJECT`

### **Email (Resend) - HIGH PRIORITY** ✅
- [ ] `RESEND_API_KEY`
- [x] `FROM_EMAIL`
- [ ] `ORDERS_EMAIL`
- [ ] `SUPPORT_EMAIL`
- [x] `ADMIN_EMAIL`

### **Site Configuration - HIGH PRIORITY** ✅
- [ ] `NEXT_PUBLIC_SITE_URL`

### **Monitoring (Sentry) - OPTIONAL** ✅
- [x] `NEXT_PUBLIC_SENTRY_DSN`
- [x] `SENTRY_ORG`
- [x] `SENTRY_PROJECT`
- [x] `SENTRY_AUTH_TOKEN`

### **Google Maps - OPTIONAL** ✅
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`

### **React Bricks CMS - OPTIONAL** ✅
- [ ] `NEXT_PUBLIC_API_KEY`

### **Debug/Development - OPTIONAL** ✅
- [ ] `DEBUG_AUTH` (optional for auth debugging)

---

## 🚨 IMMEDIATE ACTION REQUIRED

### **Step 1: Add Supabase Variables** (5 minutes)
1. Go to Vercel Project Settings → Environment Variables
2. Add these 4 variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_SUPABASE_PROJECT_ID
   ```
3. Set scope: Production, Preview, Development

### **Step 2: Add Yoco Variables** (3 minutes)
1. Get keys from Yoco Dashboard
2. Add these 3 variables:
   ```
   NEXT_PUBLIC_YOCO_PUBLIC_KEY
   YOCO_SECRET_KEY
   YOCO_WEBHOOK_SECRET
   ```

### **Step 3: Add VAPID Keys** (2 minutes)
1. Check your `.env.local` file for existing keys
2. Add these 3 variables:
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY
   VAPID_PRIVATE_KEY
   VAPID_SUBJECT
   ```

### **Step 4: Add Resend Key** (2 minutes)
1. Get from Resend Dashboard
2. Add this 1 variable:
   ```
   RESEND_API_KEY
   ```

### **Step 5: Add Site URL** (1 minute)
1. Add this 1 variable:
   ```
   NEXT_PUBLIC_SITE_URL=https://littlelattelane.co.za
   ```

### **Step 6: Redeploy** (1 minute)
1. Go to Vercel Deployments
2. Click "Redeploy" on latest deployment
3. Wait for build to complete

---

## 🔍 HOW TO FIND YOUR KEYS

### **Supabase Keys:**
```bash
# Local file (if you have it)
cat .env.local | grep SUPABASE

# Or go to:
https://supabase.com/dashboard/project/awytuszmunxvthuizyur/settings/api
```

### **VAPID Keys:**
```bash
# Check local file
cat .env.local | grep VAPID

# Or regenerate:
npx web-push generate-vapid-keys
```

### **Yoco Keys:**
```
https://portal.yoco.com/developers
```

### **Resend Key:**
```
https://resend.com/api-keys
```

---

## ✅ VERIFICATION SCRIPT

After adding all variables, run this to verify:

```bash
# Check if all required vars are set
curl https://littlelattelane.co.za/api/health

# Should return:
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "payments": "configured"
  }
}
```

---

## 📊 SUMMARY

**Total Variables Needed:** 18  
**Currently Set:** 8 (44%)  
**Missing Critical:** 10 (56%)  

**Status:** ⚠️ **INCOMPLETE - CRITICAL VARIABLES MISSING**

**Estimated Time to Fix:** 15 minutes

---

## 🎯 QUICK COPY-PASTE TEMPLATE

Use this template in Vercel:

```env
# === SUPABASE (CRITICAL) ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_PROJECT_ID=awytuszmunxvthuizyur

# === YOCO PAYMENTS (CRITICAL) ===
NEXT_PUBLIC_YOCO_PUBLIC_KEY=
YOCO_SECRET_KEY=
YOCO_WEBHOOK_SECRET=

# === PUSH NOTIFICATIONS (CRITICAL) ===
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:support@littlelattelane.co.za

# === EMAIL (HIGH) ===
RESEND_API_KEY=
ORDERS_EMAIL=orders@littlelattelane.co.za
SUPPORT_EMAIL=support@littlelattelane.co.za

# === SITE CONFIGURATION (HIGH) ===
NEXT_PUBLIC_SITE_URL=https://littlelattelane.co.za

# === GOOGLE MAPS (OPTIONAL) ===
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=

# === ALREADY SET ===
# NODE_ENV (auto)
# SUPABASE_DB_PASSWORD
# NEXT_PUBLIC_SENTRY_DSN
# SENTRY_ORG
# SENTRY_PROJECT
# SENTRY_AUTH_TOKEN
# FROM_EMAIL
# ADMIN_EMAIL
```

---

**Need help finding any of these keys? Let me know which ones and I'll guide you through getting them!**
