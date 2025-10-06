# Supabase OTP Configuration Guide

## Current Status
✅ **Code improvements completed** - Better UX, 60-second resend cooldown, expiry messaging
⚠️ **Production configuration required** - Supabase Dashboard settings

---

## 🎯 What We Changed (Code Side)

### 1. **OTP Expiry Time Documentation**
- Added `OTP_EXPIRY_TIME_MINUTES = 60` constant
- Shows "⏱️ Code expires in 60 minutes" badge on verification screen
- Better error messages when code expires

### 2. **Resend Cooldown (60 seconds)**
- ✅ Already implemented: `OTP_RESEND_DELAY_MS = 60 * 1000`
- Countdown timer shows: "Resend in 59s, 58s, 57s..."
- Prevents spam/abuse by disabling button during cooldown
- Auto-initializes on signup (prevents immediate resend)

### 3. **Improved User Experience**
- Visual countdown on resend button: "Resend in 45s"
- Clear expiry information: "Code expires in 60 minutes"
- Better error messages for expired codes
- Clears old OTP code when resending new one

---

## ⚙️ Production Configuration (Supabase Dashboard)

### **IMPORTANT: You MUST configure this in production!**

The local config file (`supabase/config.toml`) shows:
```toml
otp_expiry = 3600  # 3600 seconds = 60 minutes
```

**But this is ONLY for local development!** Production uses Supabase Dashboard settings.

### **Steps to Configure Production OTP Expiry:**

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `awytuszmunxvthuizyur`

2. **Open Authentication Settings:**
   - Click **"Authentication"** in left sidebar
   - Go to **"Email Auth"** section

3. **Set OTP Expiry Time:**
   - Look for **"OTP Expiry Duration"** or **"Email OTP Expiry"**
   - Set to: **3600 seconds** (60 minutes)
   - This ensures codes are valid for 1 hour

4. **Optional: Email Rate Limiting:**
   - Find **"Rate Limits"** or **"Email Rate Limits"**
   - Set minimum time between emails: **60 seconds** (matches our cooldown)
   - Prevents server-side abuse even if someone bypasses client code

5. **Save Changes:**
   - Click **"Save"** at bottom of page
   - Changes take effect immediately (no restart needed)

---

## 🧪 Testing Guide

### **Test Scenario 1: Normal OTP Flow**
1. Sign up with new email
2. See message: "Code expires in 60 minutes"
3. Enter correct OTP → Should verify successfully
4. ✅ **Expected:** Login successful

### **Test Scenario 2: Resend Cooldown**
1. Sign up with new email
2. Immediately try to click "Resend Code"
3. ✅ **Expected:** Button disabled showing "Resend in 60s"
4. Wait for countdown to reach 0
5. ✅ **Expected:** Button becomes enabled showing "Resend Code"
6. Click "Resend Code"
7. ✅ **Expected:** New code sent, countdown restarts

### **Test Scenario 3: Expired Code**
1. Sign up with new email
2. Wait 61+ minutes (or manually test with old code)
3. Try to verify with expired code
4. ✅ **Expected:** Error message: "Verification code has expired (codes are valid for 60 minutes). Please click 'Resend Code' to get a new one."
5. Click "Resend Code"
6. Enter new code
7. ✅ **Expected:** Verification successful

### **Test Scenario 4: Spam Prevention**
1. Sign up with new email
2. Click "Resend Code" (after cooldown)
3. Immediately try to click again
4. ✅ **Expected:** Button disabled for 60 seconds
5. Try to spam click during cooldown
6. ✅ **Expected:** Button stays disabled, no requests sent

---

## 📊 Current Configuration Summary

| Setting | Value | Location |
|---------|-------|----------|
| **OTP Length** | 6 digits | Code |
| **OTP Expiry** | 60 minutes (3600s) | ⚠️ **Supabase Dashboard** |
| **Resend Cooldown** | 60 seconds | Code (enforced) |
| **Max Resends** | Unlimited (with cooldown) | Code |
| **Code Type** | Numeric (0-9) | Supabase |
| **Delivery Method** | Email | Supabase |

---

## 🚨 Common Issues & Solutions

### **Issue: "Code expired immediately"**
**Cause:** Supabase Dashboard OTP expiry set to very low value (e.g., 60 seconds instead of 3600)  
**Solution:** Update Supabase Dashboard → Authentication → Email Auth → OTP Expiry → Set to **3600**

### **Issue: "Can resend immediately without cooldown"**
**Cause:** JavaScript disabled or client-side bypass  
**Solution:** Configure server-side rate limiting in Supabase Dashboard (Step 4 above)

### **Issue: "Never receive OTP email"**
**Cause:** Email template not configured or SMTP issues  
**Solution:** Check Supabase → Authentication → Email Templates → Confirm Signup template

### **Issue: "Countdown shows wrong time"**
**Cause:** `OTP_RESEND_DELAY_MS` constant value mismatch  
**Solution:** Verify in `LoginForm.tsx` line 23: Should be `60 * 1000`

---

## 📝 Code Changes Summary

### **Files Modified:**
- `src/components/LoginForm.tsx`

### **Key Improvements:**
1. **New constant:** `OTP_EXPIRY_TIME_MINUTES = 60`
2. **Improved error handling:** Better messages for expired codes
3. **Auto-initialize cooldown:** Prevents immediate resend after signup
4. **Visual countdown:** Shows "Resend in Xs" with real-time countdown
5. **Expiry badge:** Shows "Code expires in 60 minutes" on OTP screen
6. **Clear old code:** Automatically clears when resending

### **Commit Message:**
```
feat(auth): Improve OTP verification UX with expiry info and anti-spam

IMPROVEMENTS:
1. Added 60-minute expiry time display on OTP screen
2. Initialize 60-second resend cooldown immediately after signup
3. Better error messages for expired codes
4. Visual countdown timer on resend button
5. Clear old OTP code when requesting new one

ANTI-SPAM:
- 60-second cooldown prevents resend button spam
- Auto-disabled after signup (prevents immediate resend)
- Clear feedback: "Resend in 45s" countdown display

TESTING:
- TypeScript: ✓ Pass
- Build: ✓ Success (42s)
- UX: Clear expiry messaging and resend controls

REQUIRES:
- Supabase Dashboard configuration (see SUPABASE-OTP-CONFIG.md)
- Production OTP expiry must be set to 3600 seconds (60 minutes)
```

---

## ✅ Next Steps

1. **Review code changes** (already deployed)
2. **Configure Supabase Dashboard** (follow steps above)
3. **Test OTP flow** (follow testing guide)
4. **Verify expiry behavior** (test expired code scenario)
5. **Monitor production** (check for user reports of issues)

---

**Questions?** Check Supabase docs: https://supabase.com/docs/guides/auth/auth-email
