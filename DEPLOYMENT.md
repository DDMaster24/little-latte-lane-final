# 🚀 Little Latte Lane - Production Deployment Guide

This guide provides step-by-step instructions for deploying Little Latte Lane to production.

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Security Fixes Completed
All critical security issues have been resolved:
- [x] Account deletion authentication
- [x] Mandatory webhook signature verification
- [x] Rate limiting on critical endpoints
- [x] Payment amount validation (R5-R10,000 limits)
- [x] Safe logging utility (sanitizes sensitive data)
- [x] Order confirmation emails enabled
- [x] Environment validation for production
- [x] Authentication middleware

### ⚠️ Before You Deploy

1. **Review all environment variables** (see below)
2. **Rotate all secrets** from development
3. **Test payment flow** in Yoco sandbox first
4. **Verify database backups** are configured
5. **Set up monitoring** (Sentry, Vercel Analytics)

---

## 🔐 REQUIRED ENVIRONMENT VARIABLES

### 🔴 CRITICAL (App will not start without these)

#### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your-project-id
```

**How to get:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy URL, anon key, and service role key

#### Yoco Payment Gateway
```bash
YOCO_SECRET_KEY=sk_live_yourSecretKey123456
YOCO_PUBLIC_KEY=pk_live_yourPublicKey123456
YOCO_WEBHOOK_SECRET=whsec_yourWebhookSecret123456
NEXT_PUBLIC_YOCO_TEST_MODE=false
```

**How to get:**
1. Log in to [Yoco Dashboard](https://portal.yoco.com/)
2. Go to Settings → API Keys
3. Copy Live Secret Key and Live Public Key
4. Go to Settings → Webhooks
5. Copy Webhook Secret

**⚠️ CRITICAL:** Set `NEXT_PUBLIC_YOCO_TEST_MODE=false` for production!

#### Webhook Security
```bash
SUPABASE_WEBHOOK_SECRET=your-random-secret-string-here
```

**How to generate:**
```bash
# Generate a secure random string (32+ characters)
openssl rand -base64 32
```

**How to configure in Supabase:**
1. Go to Authentication → Webhooks
2. Create webhook for: `https://yourdomain.com/api/auth/webhook`
3. Add the secret to the webhook configuration
4. Enable events: `user.created`, `password_recovery`

---

## 🟡 IMPORTANT (Features won't work without these)

### Email Notifications (Resend)
```bash
RESEND_API_KEY=re_yourResendApiKey123456
VAPID_SUBJECT=mailto:your-email@domain.com
```

**How to get:**
1. Create account at [Resend.com](https://resend.com/)
2. Go to API Keys
3. Create new API key
4. Verify your sending domain

### Push Notifications (Firebase)
```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

**How to get:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Cloud Messaging
4. Generate Web Push certificates

### Monitoring (Sentry)
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

**How to get:**
1. Create account at [Sentry.io](https://sentry.io/)
2. Create new project
3. Copy DSN from project settings
4. Create auth token for releases

---

## 📱 MOBILE APP CONFIGURATION

### Android Keystore
```bash
ANDROID_KEYSTORE_PASSWORD=your-secure-password
ANDROID_KEY_ALIAS=your-key-alias
ANDROID_KEY_PASSWORD=your-key-password
```

**Note:** Keep keystore file (`android/app/release.keystore`) secure! Loss = cannot update app.

### iOS Certificates
- Distribution Certificate: Managed in Apple Developer Portal
- Provisioning Profile: Managed in Xcode

---

## 🚀 DEPLOYMENT STEPS

### Option A: Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "chore: prepare for production deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/)
   - Click "Import Project"
   - Select your GitHub repository
   - Choose framework: Next.js

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from above (CRITICAL section minimum)
   - Set environment: Production

4. **Configure Domain**
   - Go to Project Settings → Domains
   - Add custom domain: `www.littlelattelane.co.za`
   - Configure DNS records as instructed

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Verify deployment works

### Option B: Self-Hosted (DigitalOcean, AWS, etc.)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```bash
   # Create production .env.local (never commit this!)
   cp .env.example .env.local
   # Edit .env.local with production values
   ```

3. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "little-latte-lane" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name littlelattelane.co.za www.littlelattelane.co.za;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d littlelattelane.co.za -d www.littlelattelane.co.za
   ```

---

## 📱 MOBILE APP DEPLOYMENT

### Android (Google Play Store)

1. **Build signed AAB**
   - Open project in Android Studio
   - Build → Generate Signed Bundle / APK
   - Select Android App Bundle
   - Use your release keystore
   - Build variant: Release

2. **Upload to Google Play Console**
   - Go to [Play Console](https://play.google.com/console)
   - Select app → Production → Create new release
   - Upload AAB file
   - Fill in release notes
   - Review and rollout

### iOS (App Store)

1. **Archive in Xcode**
   - Open project in Xcode
   - Select "Any iOS Device" as destination
   - Product → Archive
   - Wait for archiving to complete

2. **Upload to App Store Connect**
   - In Organizer, click "Distribute App"
   - Select "App Store Connect"
   - Upload
   - Wait for processing

3. **Submit for Review**
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - Select app → App Store → Add version
   - Fill in metadata, screenshots
   - Submit for review

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Test Critical Flows

- [ ] **User registration & login**
  - Create new account
  - Receive welcome email
  - Confirm email works

- [ ] **Order placement**
  - Browse menu
  - Add items to cart
  - Complete checkout
  - Verify payment processes
  - Receive order confirmation email

- [ ] **Payment webhooks**
  - Complete a real payment
  - Verify order status updates to "confirmed"
  - Check admin dashboard shows order

- [ ] **Admin access**
  - Log in as admin
  - Access `/admin` dashboard
  - Verify all admin features work

- [ ] **Rate limiting**
  - Try making 20+ rapid API calls
  - Verify 429 rate limit responses

### 2. Monitor Logs

- Check Vercel logs for errors
- Monitor Sentry for exceptions
- Watch Supabase logs for database issues

### 3. Performance Check

- Run Lighthouse audit (aim for 90+ scores)
- Test on mobile devices
- Verify page load times < 2 seconds

### 4. Security Verification

- [ ] HTTPS working correctly
- [ ] No console.log with sensitive data in production
- [ ] Webhook signatures being verified
- [ ] Rate limiting active
- [ ] Environment validation passing

---

## 🔄 UPDATING THE APP

### Web App Updates
```bash
# Make your changes
git add .
git commit -m "feat: add new feature"
git push origin main
# Vercel automatically deploys
```

### Mobile App Updates
1. Update version in:
   - `package.json` → `version`
   - `android/app/build.gradle` → `versionCode` and `versionName`
   - `ios/App/App.xcodeproj` → Version and Build
2. Build new AAB/IPA
3. Upload to respective stores
4. Submit for review

---

## 🆘 TROUBLESHOOTING

### "Environment validation failed" error
**Problem:** Missing required environment variables
**Solution:** Check Vercel environment variables, ensure all CRITICAL vars are set

### "Invalid webhook signature" error
**Problem:** Webhook secret mismatch
**Solution:** Regenerate webhook secret, update in both Yoco/Supabase and Vercel

### Payments not processing
**Problem:** Yoco configuration issue
**Solution:**
1. Verify `NEXT_PUBLIC_YOCO_TEST_MODE=false`
2. Check Yoco webhook is configured: `https://yourdomain.com/api/yoco/webhook`
3. Verify webhook secret matches

### Rate limit blocking legitimate users
**Problem:** Rate limits too strict
**Solution:** Adjust limits in `src/lib/rate-limit.ts` → `RateLimitPresets`

### Emails not sending
**Problem:** Resend API key invalid or domain not verified
**Solution:**
1. Verify domain in Resend dashboard
2. Check API key is correct
3. Check Resend logs for errors

---

## 📞 SUPPORT

For deployment issues:
- Check Vercel documentation: https://vercel.com/docs
- Check Supabase documentation: https://supabase.com/docs
- Contact Yoco support: https://www.yoco.com/za/support

For code issues:
- Review CLAUDE.md for architecture guidance
- Check TECHNICAL-INFO.md for detailed schemas
- Review security fixes in recent commits

---

## 🔒 SECURITY REMINDERS

1. **Never commit `.env.local`** - It's in .gitignore, keep it that way
2. **Rotate all secrets** when transferring ownership
3. **Use different credentials** for dev/staging/production
4. **Backup Supabase database** regularly
5. **Monitor Sentry** for suspicious activity
6. **Keep dependencies updated** with `npm audit fix`

---

**Last Updated:** 2025-11-06
**Current Version:** 1.4.1 (Build 17)
