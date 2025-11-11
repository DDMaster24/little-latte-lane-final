# Payment Debug Instructions

## The Issue

From the console logs, there are two problems:

1. **Google Pay CSP Violations** - Google Pay scripts are being blocked on Yoco's payment page
2. **JSON Parsing Error** - `deviceFingerprintHandler.js` is failing to parse JSON, causing blank screen

## How to Get the Full Debug Logs

The console logs you showed are from **loading the booking page** - not from the payment flow itself.

To see the actual payment debug logs:

### Step 1: Open Console BEFORE Starting
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. **Keep it open** (don't close it)

### Step 2: Clear Console
1. Right-click in console → **Clear console**
2. Or press the 🚫 icon

### Step 3: Fill Out Form
1. Fill in ALL fields on the booking form
2. Upload bank proof
3. Sign signature
4. Accept terms

### Step 4: Watch Console While Clicking
1. Keep watching the console
2. Click **"Proceed to Payment"**
3. You should see these logs appear:
   ```
   📤 Uploading bank proof: ...
   ✅ Bank proof uploaded successfully
   📎 Bank proof URL: ...
   ✅ Booking created: ...
   🎫 Checkout response received: ...
   ✅ Payment session created successfully
   🔗 Redirect URL: https://payments.yoco.com/...
   💳 About to open payment URL...
   📱 Calling openPaymentUrl()...
   🔵 openPaymentUrl called with URL: ...
   🔵 Platform detection: ...
   🌐 Web browser detected - using standard redirect
   🌐 Redirecting to: ...
   ✅ Redirect initiated
   ```

### Step 5: On Payment Page
1. After redirect to Yoco, **keep console open**
2. Watch for:
   - Any CSP errors
   - Any JSON errors
   - Any network errors (red text)

## Current Errors Explained

### 1. Google Pay CSP Error
```
Loading the script 'blob:https://pay.google.com/...' violates the following
Content Security Policy directive: "script-src 'report-sample' 'nonce-...' 'unsafe-inline'"
```

**What it means:**
- This is happening ON the Yoco payment page (pay.google.com)
- It's Yoco's CSP blocking Google Pay scripts
- This is NOT something we can fix (it's Yoco's page)

**Workaround:**
- Try using **"Card"** option instead of Google Pay
- Enter card details manually instead of selecting saved card

### 2. JSON Parsing Error
```
Uncaught SyntaxError: Unexpected end of JSON input
at deviceFingerprintHandler.js:67:23
```

**What it means:**
- Yoco's device fingerprinting script is failing
- It's trying to parse JSON but getting empty/invalid response
- This might be causing the blank screen

**Possible causes:**
- Network connectivity issue
- Adblocker/Privacy extension blocking fingerprinting
- Yoco server issue

## Troubleshooting Steps

### Try 1: Disable Browser Extensions
1. Open Chrome in **Incognito Mode** (Ctrl + Shift + N)
2. Try payment again
3. This disables most extensions

### Try 2: Use Direct Card Entry
1. Don't use Google Pay button
2. Click **"Card"** option on payment page
3. Enter card number, CVV, expiry manually
4. Complete payment

### Try 3: Check Network Tab
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Click "Proceed to Payment"
4. Look for any **red** failed requests
5. Screenshot and send

### Try 4: Different Browser
1. Try Firefox or Edge
2. See if same issue occurs

## What I Need From You

To debug further, please send me:

1. **Full console logs** from clicking "Proceed to Payment" (with emoji logs)
2. **Network tab** screenshot showing any failed requests (red text)
3. **Screenshot** of the blank white area when it appears
4. Confirmation: Are you using any browser extensions? (Adblockers, privacy tools, etc.)

## Quick Test

Try this simple test:
1. Fill out form
2. Click "Proceed to Payment"
3. Do you see these logs appear? ✅ or ❌
   - 🎫 Checkout response received
   - 🔗 Redirect URL
   - 💳 About to open payment URL

If ❌ (not showing), then the booking submission itself is failing.
If ✅ (showing), then the issue is on Yoco's payment page.
