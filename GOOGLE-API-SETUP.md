# 🔑 Google Places API Setup Guide

## ✅ Current Status
- ✅ Code is ready and deployed
- ✅ New signup component with location confirmation checkboxes
- ✅ No delivery fees shown on signup (only during checkout)
- ⏳ **WAITING FOR API KEY** - Follow steps below

---

## 📋 Step-by-Step: Get Your Google API Key

### **Step 1: Access Google Cloud Console**
**Link:** https://console.cloud.google.com/

1. Sign in with your Google account
2. Accept Terms of Service if prompted

---

### **Step 2: Create New Project**
1. Click the **project dropdown** at the top (next to "Google Cloud")
2. Click **"NEW PROJECT"**
3. Enter project details:
   - **Project name:** `Little Latte Lane`
   - **Organization:** (leave default or select if you have one)
4. Click **"CREATE"**
5. Wait 10-20 seconds for project creation
6. Select your new project from the dropdown

---

### **Step 3: Enable Billing (Required for Google Maps)**
1. Go to: https://console.cloud.google.com/billing
2. Click **"LINK A BILLING ACCOUNT"**
3. If you don't have one:
   - Click **"CREATE BILLING ACCOUNT"**
   - Enter your credit card details
   - **Don't worry:** Google gives $200 free credit monthly
   - Your expected usage: ~$0-5/month (very low traffic)

---

### **Step 4: Enable Required APIs**
**Link:** https://console.cloud.google.com/apis/library

Enable each of these (search → click → "ENABLE"):

#### **A. Places API (New)** ⭐ MOST IMPORTANT
- Search: "Places API New"
- Click the card
- Click **"ENABLE"**

#### **B. Maps JavaScript API**
- Search: "Maps JavaScript API"
- Click **"ENABLE"**

#### **C. Geocoding API**
- Search: "Geocoding API"
- Click **"ENABLE"**

*Note: Wait 1-2 minutes after enabling for APIs to activate*

---

### **Step 5: Create API Key**
**Link:** https://console.cloud.google.com/apis/credentials

1. Click **"CREATE CREDENTIALS"** button (top of page)
2. Select **"API Key"**
3. **COPY THE KEY** immediately (starts with `AIza...`)
   - Example: `AIzaSyB1xxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Keep this window open for next step

---

### **Step 6: Restrict API Key (IMPORTANT FOR SECURITY)**

1. Click **"RESTRICT KEY"** or click the key name
2. Give it a name: `Little Latte Lane - Production`

#### **A. Application Restrictions:**
- Select: **"HTTP referrers (web sites)"**
- Click **"ADD AN ITEM"** for each:
  ```
  https://little-latte-lane-final.vercel.app/*
  https://*.vercel.app/*
  http://localhost:3000/*
  http://localhost:*/*
  ```

#### **B. API Restrictions:**
- Select: **"Restrict key"**
- Check these APIs:
  - ✅ Places API (New)
  - ✅ Maps JavaScript API
  - ✅ Geocoding API

3. Click **"SAVE"**

---

## 🚀 **Step 7: Add API Key to Your Project**

### **A. Update Local Environment (.env.local)**

Open your `.env.local` file and replace the placeholder:

```env
# Replace this line:
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# With your actual key:
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyB1xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Save the file.

---

### **B. Update Vercel Environment Variables**

1. Go to: **https://vercel.com/ddmaster24/little-latte-lane-final/settings/environment-variables**

2. Click **"Add New"** button

3. Enter:
   - **Key:** `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`
   - **Value:** `AIzaSyB1xxxxxxxxxxxxxxxxxxxxxxxxxxx` (your actual key)
   - **Environments:** Check all three: ✅ Production ✅ Preview ✅ Development

4. Click **"Save"**

5. **Redeploy:**
   - Go to: https://vercel.com/ddmaster24/little-latte-lane-final
   - Click **"Deployments"** tab
   - Click **"..."** menu on latest deployment
   - Click **"Redeploy"**
   - OR: Just push any commit and Vercel will auto-redeploy

---

## ✅ **Step 8: Test Locally**

```bash
# Restart your dev server to load new env variable
npm run dev
```

Then test:
1. Go to: http://localhost:3000
2. Click signup → Step 2
3. Type an address in Middleburg
4. ✅ Should see dropdown suggestions appear
5. Select an address
6. ✅ Should auto-fill all fields
7. ✅ Checkboxes should auto-check based on detected zone

---

## 🧪 **Step 9: Test on Live Site**

Once Vercel redeploys (2-3 minutes):
1. Go to your live site
2. Click signup → Step 2
3. Start typing an address
4. ✅ Should see Google autocomplete suggestions
5. Select address
6. ✅ All fields auto-fill
7. ✅ GPS zone detected
8. ✅ Checkboxes show location confirmation

---

## 📊 Expected Costs

**Google Maps Pricing:**
- **Autocomplete:** $2.83 per 1,000 requests
- **Geocoding:** $5.00 per 1,000 requests
- **Free tier:** $200 credit/month = ~70,000 autocompletes/month FREE

**Your Expected Usage:**
- ~10-50 signups/day = ~300-1,500 signups/month
- Cost: **$0-5/month** (well within free tier)

---

## 🔒 Security Notes

- ✅ API key is restricted to your domain only
- ✅ Key is restricted to specific APIs only
- ✅ Environment variable is secure (not in git)
- ✅ Can revoke/regenerate key anytime if compromised

---

## ❓ Troubleshooting

### **Problem: "Google Maps loading..." message persists**
**Solution:**
1. Check browser console (F12) for errors
2. Verify API key in Vercel environment variables
3. Ensure all 3 APIs are enabled in Google Cloud
4. Wait 1-2 minutes after enabling APIs
5. Hard refresh browser (Ctrl+Shift+R)

### **Problem: "This API key is not authorized to use this service or API"**
**Solution:**
1. Go back to API Key restrictions
2. Ensure "Places API (New)" is checked
3. Verify your domain is in HTTP referrers list
4. Wait 5 minutes for changes to propagate

### **Problem: Autocomplete shows but no results**
**Solution:**
1. Check billing is enabled in Google Cloud
2. Verify you have billing account linked
3. Check API quotas haven't been exceeded

---

## 📞 Need Help?

If you encounter any issues:
1. Share the API key error message from browser console
2. Share screenshot of Google Cloud APIs enabled
3. Verify billing is active

---

## ✅ What's New in This Update

1. **Google Places Autocomplete:**
   - Real-time address suggestions as you type
   - Auto-fills all address fields
   - GPS coordinate validation

2. **Location Confirmation Checkboxes:**
   - ✅ "I confirm this address is within Middleburg area"
   - 🏡 "I am a Roberts Estate resident" (optional)
   - Auto-checks based on GPS detection
   - No delivery fees shown during signup

3. **Better Address Accuracy:**
   - Forces users to select from Google suggestions
   - No manual entry = fewer address errors
   - GPS validation ensures correct delivery zone

---

**Ready to proceed?** Follow the steps above and paste your API key when you get to Step 7! 🚀
