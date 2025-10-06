# 🚨 SECURITY INCIDENT RESPONSE - API KEY EXPOSURE

**Incident Date:** October 6, 2025  
**Severity:** HIGH  
**Status:** MITIGATING

---

## 📋 INCIDENT SUMMARY

**What Happened:**
GitGuardian detected that the Resend API key and VAPID private key were accidentally exposed in the GitHub repository commit `1a12090` in the file `NOTIFICATION-SYSTEM-ANALYSIS.md`.

**Exposed Credentials:**
- ❌ **Resend API Key:** `re_b2ugGJ2F_Kea1fRxHscc9SyEVJYfZnexA`
- ❌ **VAPID Private Key:** `p7uEYKwyPA9lUCF8K0G157UBgMUhQbM7FeB6GIHY0c0`
- ✅ **VAPID Public Key:** (Not sensitive - safe to expose)

**Repository:** DDMaster24/little-latte-lane-final  
**Commit:** 1a12090  
**File:** NOTIFICATION-SYSTEM-ANALYSIS.md  
**Detection:** GitGuardian automated scan

---

## ⚡ IMMEDIATE ACTIONS (DO RIGHT NOW - IN THIS ORDER)

### **Step 1: Revoke Resend API Key (CRITICAL - 5 minutes)**

1. **Go to Resend Dashboard:**
   - URL: https://resend.com/api-keys
   - Login with your credentials

2. **Delete/Revoke the exposed key:**
   - Find key: `re_b2ugGJ2F_Kea1fRxHscc9SyEVJYfZnexA`
   - Click "Delete" or "Revoke"
   - Confirm deletion

3. **Generate New API Key:**
   - Click "Create API Key"
   - Name: `little-latte-lane-production-october-2025`
   - Permissions: "Sending access"
   - **Copy the new key immediately** (shown only once)

---

### **Step 2: Generate New VAPID Keys (RECOMMENDED - 2 minutes)**

While the VAPID public key is safe to expose, the private key gives access to send push notifications as your app. Generate new keys:

```powershell
# Run in PowerShell from project directory
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Copy these to .env.local:'); console.log(''); console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + keys.publicKey); console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);"
```

**Copy the output** - you'll need it for the next step.

---

### **Step 3: Update Local Environment (2 minutes)**

1. **Open `.env.local` file** in your project root

2. **Replace these values:**
   ```bash
   # OLD (COMPROMISED):
   # RESEND_API_KEY=re_b2ugGJ2F_Kea1fRxHscc9SyEVJYfZnexA
   # VAPID_PRIVATE_KEY=p7uEYKwyPA9lUCF8K0G157UBgMUhQbM7FeB6GIHY0c0
   
   # NEW (PASTE YOUR NEW KEYS):
   RESEND_API_KEY=re_YOUR_NEW_KEY_HERE
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=YOUR_NEW_PUBLIC_KEY_HERE
   VAPID_PRIVATE_KEY=YOUR_NEW_PRIVATE_KEY_HERE
   ```

3. **Save the file** (but DO NOT commit it)

4. **Test locally:**
   ```powershell
   npm run dev
   # Visit http://localhost:3000
   # Test notifications still work
   ```

---

### **Step 4: Update Vercel Production (CRITICAL - 5 minutes)**

1. **Go to Vercel Dashboard:**
   - URL: https://vercel.com/dashboard
   - Select: `little-latte-lane` project

2. **Navigate to Settings → Environment Variables**

3. **Update these variables** (edit, don't delete):
   ```
   RESEND_API_KEY = [paste new Resend key]
   NEXT_PUBLIC_VAPID_PUBLIC_KEY = [paste new public key]
   VAPID_PRIVATE_KEY = [paste new private key]
   ```

4. **Select environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Click "Save"**

6. **Redeploy your application:**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Or: Make any small commit and push to trigger auto-deploy

---

### **Step 5: Clean Git History (ADVANCED - 10 minutes)**

**WARNING:** This rewrites git history and requires force push!

#### **Option A: BFG Repo-Cleaner (RECOMMENDED - Easier)**

1. **Download BFG:**
   - URL: https://rtyley.github.io/bfg-repo-cleaner/
   - Download: `bfg.jar`

2. **Backup your repository:**
   ```powershell
   cd ..
   cp -r little-latte-lane little-latte-lane-backup
   cd little-latte-lane
   ```

3. **Run BFG to remove sensitive data:**
   ```powershell
   # Create file with patterns to remove
   echo "re_b2ugGJ2F_Kea1fRxHscc9SyEVJYfZnexA" > passwords.txt
   echo "p7uEYKwyPA9lUCF8K0G157UBgMUhQbM7FeB6GIHY0c0" >> passwords.txt
   
   # Run BFG (requires Java)
   java -jar bfg.jar --replace-text passwords.txt .git
   
   # Clean up
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

4. **Force push to GitHub:**
   ```powershell
   git push origin main --force
   ```

#### **Option B: Git Filter-Branch (HARDER - Manual)**

```powershell
# Create a backup first!
git clone . ../little-latte-lane-backup

# Remove file from history
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch NOTIFICATION-SYSTEM-ANALYSIS.md" `
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin main --force
```

#### **Option C: GitHub Support (SAFEST - If unsure)**

1. Contact GitHub Support: https://support.github.com/
2. Request: "Remove sensitive data from repository history"
3. Provide: Repository name, commit hash, file path
4. They will clean it for you (may take 24-48 hours)

---

### **Step 6: Verify Remediation (5 minutes)**

After completing steps 1-5, verify everything:

1. **Check Resend Dashboard:**
   - ✅ Old key is deleted/revoked
   - ✅ New key is active

2. **Test Production Site:**
   ```bash
   # Visit your live site
   https://www.littlelattelane.co.za
   
   # Test email notifications:
   - Place a test order
   - Check if confirmation email arrives
   
   # Test push notifications:
   - Allow notifications
   - Send test broadcast from admin
   - Verify notification appears
   ```

3. **Check Git History:**
   ```powershell
   # Search for exposed key in history
   git log --all -S "re_b2ugGJ2F" --oneline
   
   # Should return: (empty) or only commits AFTER the fix
   ```

4. **Verify GitGuardian:**
   - Check your email/GitHub for GitGuardian updates
   - Incident should be marked as "Resolved" after key revocation

---

## 🔒 IMPACT ASSESSMENT

### **What Could Happen with Exposed Keys:**

#### **Resend API Key:**
- ❌ **Risk:** Attacker could send emails from your domain
- ❌ **Impact:** 
  - Spam emails sent as your business
  - Exhaust your email quota (3,000/month free tier)
  - Reputation damage to your domain
  - Potential blacklisting
- ✅ **Mitigation:** Revoke key immediately (Step 1)

#### **VAPID Private Key:**
- ❌ **Risk:** Attacker could send push notifications to your users
- ❌ **Impact:**
  - Spam notifications to all subscribed users
  - Phishing attempts disguised as your app
  - User trust damage
  - Users unsubscribing from notifications
- ✅ **Mitigation:** Generate new keys (Step 2)

#### **What's Safe:**
- ✅ VAPID Public Key (supposed to be public)
- ✅ Supabase URL (public anyway)
- ✅ Supabase Anon Key (public by design)
- ✅ Yoco Public Key (test mode, public)

---

## 📊 TIMELINE

| Time | Event |
|------|-------|
| **October 6, 2025 - 12:21:26 UTC** | Keys pushed to GitHub in commit 1a12090 |
| **October 6, 2025 - ~12:25 UTC** | GitGuardian detection email sent |
| **October 6, 2025 - NOW** | Security response initiated |
| **Next 1 hour** | Complete all immediate actions |
| **Next 24 hours** | Monitor for unauthorized usage |

---

## 🛡️ PREVENTION MEASURES (IMPLEMENT AFTER FIXING)

### **1. Pre-Commit Hooks**

Install `git-secrets` to prevent future leaks:

```powershell
# Install git-secrets (requires Git Bash or WSL)
# Option 1: Manual install
git clone https://github.com/awslabs/git-secrets
cd git-secrets
make install

# Option 2: Use Node alternative
npm install --save-dev @secretlint/secretlint-rule-preset-recommend
```

### **2. Environment Variable Audit**

Create a `.env.example` file:

```bash
# .env.example - SAFE TO COMMIT (no real values)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_your_resend_key_here
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@domain.com
```

### **3. Documentation Best Practices**

When creating documentation:
- ❌ **Never** include full API keys
- ✅ **Always** redact: `re_**********************`
- ✅ **Always** use placeholders: `YOUR_KEY_HERE`
- ✅ **Always** review before committing

### **4. GitHub Secret Scanning**

Enable GitHub's secret scanning:
1. Go to: Repository → Settings → Code security and analysis
2. Enable: "Secret scanning"
3. Enable: "Push protection"

---

## 📞 WHO TO CONTACT

### **If Unauthorized Activity Detected:**

1. **Resend Support:**
   - Email: support@resend.com
   - Report: Unauthorized email sending
   - Request: Account audit

2. **GitHub Support:**
   - URL: https://support.github.com/
   - Report: Security incident
   - Request: Repository audit

3. **Users (if spam sent):**
   - Email your users explaining the situation
   - Apologize for any spam notifications/emails
   - Assure them it's been fixed

---

## 📋 CHECKLIST

Mark each item as you complete it:

### **Immediate Actions:**
- [ ] **1. Revoke old Resend API key** (Resend dashboard)
- [ ] **2. Generate new Resend API key** (Resend dashboard)
- [ ] **3. Generate new VAPID keys** (local terminal)
- [ ] **4. Update `.env.local`** (local file)
- [ ] **5. Test locally** (npm run dev)
- [ ] **6. Update Vercel environment variables** (Vercel dashboard)
- [ ] **7. Redeploy production** (Vercel)
- [ ] **8. Test production** (live site)

### **Git History Cleanup:**
- [ ] **9. Backup repository** (copy folder)
- [ ] **10. Remove keys from git history** (BFG or filter-branch)
- [ ] **11. Force push to GitHub** (git push --force)
- [ ] **12. Verify keys are gone** (git log search)

### **Verification:**
- [ ] **13. Confirm old Resend key doesn't work** (try API call)
- [ ] **14. Confirm new Resend key works** (send test email)
- [ ] **15. Confirm new VAPID keys work** (send test notification)
- [ ] **16. Check GitGuardian status** (should show resolved)

### **Prevention:**
- [ ] **17. Create `.env.example`** (template file)
- [ ] **18. Install git-secrets** (pre-commit hook)
- [ ] **19. Enable GitHub secret scanning** (repository settings)
- [ ] **20. Document incident** (for future reference)

---

## 🎓 LESSONS LEARNED

### **What Went Wrong:**
1. API keys were copied into documentation for clarity
2. Documentation was committed without redaction
3. No pre-commit scanning was in place
4. Keys were not reviewed before commit

### **What Went Right:**
1. `.env.local` is in `.gitignore` (prevented worse leak)
2. GitGuardian detected it quickly
3. Keys can be rotated immediately
4. No evidence of exploitation (yet)

### **Future Improvements:**
1. Always redact keys in documentation
2. Use placeholders like `YOUR_KEY_HERE`
3. Implement pre-commit hooks
4. Regular security audits
5. Code review process for docs

---

## 📚 REFERENCES

- GitGuardian Docs: https://docs.gitguardian.com/
- GitHub Secret Scanning: https://docs.github.com/en/code-security/secret-scanning
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
- Resend Security: https://resend.com/docs/security
- OWASP Secrets Management: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

---

## ✅ COMPLETION SIGN-OFF

After completing ALL actions above:

- [ ] All immediate actions completed
- [ ] All verification tests passed
- [ ] Git history cleaned
- [ ] Prevention measures implemented
- [ ] Team notified (if applicable)
- [ ] Incident documented

**Completed By:** _________________  
**Date:** _________________  
**Time:** _________________  

---

**STATUS:** 🔴 CRITICAL - ACTION REQUIRED  
**PRIORITY:** 🔥 P0 - DO IMMEDIATELY  
**ETA TO RESOLVE:** 1-2 hours (with git history cleanup)

