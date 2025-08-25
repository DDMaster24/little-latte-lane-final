# 🚀 Vercel Environment Variables Setup

## 📋 Required Environment Variables for Production Deployment

### 🔐 **CRITICAL - Core Database & Authentication**
```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://awytuszmunxvthuizyur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTA0MzAsImV4cCI6MjA3MDgyNjQzMH0.UaljSLQF38JBcZ05JbuMGfzvDlSOFr_frBdSb8ATWlY
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM
NEXT_PUBLIC_SUPABASE_PROJECT_ID=awytuszmunxvthuizyur
```

### 💳 **PAYMENT GATEWAY - Yoco Integration**
```bash
# Yoco Payment Configuration (REQUIRED for payments)
YOCO_PUBLIC_KEY=pk_test_97c6b771z6ZX19397c74
YOCO_SECRET_KEY=sk_test_021f32a3zapZ2D6c4884cff99db6
NEXT_PUBLIC_YOCO_TEST_MODE=true
```

### 🌐 **PRODUCTION SETTINGS**
```bash
# Site Configuration (REQUIRED)
NEXT_PUBLIC_SITE_URL=https://www.littlelattelane.co.za
NODE_ENV=production
```

### 📧 **EMAIL NOTIFICATIONS** (Optional but Recommended)
```bash
# Resend API for Order Confirmations & Welcome Emails
RESEND_API_KEY=re_f8WW7SKj_P2r4W29fbNv3PNKm19U3EiFM
FROM_EMAIL=welcome@littlelattelane.co.za
ADMIN_EMAIL=admin@littlelattelane.co.za
```

### 🔧 **DEBUGGING & MONITORING** (Optional)
```bash
# Enable debug logging for payments
YOCO_DEBUG=true

# Sentry Error Tracking (Optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_sentry_org_here
SENTRY_PROJECT=little-latte-lane
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
```

## 📝 **Vercel Deployment Instructions**

### 1. **Add Environment Variables to Vercel**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `little-latte-lane` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable above, selecting appropriate environments:
   - **Production**: All variables
   - **Preview**: All variables (for testing)
   - **Development**: All variables (for local dev branch testing)

### 2. **Critical Variables for Payment Testing**
⚠️ **MINIMUM REQUIRED** for payment system to work:
- `YOCO_PUBLIC_KEY` - For frontend payment forms
- `YOCO_SECRET_KEY` - For backend payment processing
- `NEXT_PUBLIC_YOCO_TEST_MODE=true` - Enable test mode
- `NEXT_PUBLIC_SITE_URL` - For payment callbacks
- All Supabase variables - For order processing

### 3. **Test Payment Flow**
After setting environment variables:
1. Push changes to GitHub (triggers automatic deployment)
2. Test complete payment flow on live site
3. Verify payment success redirects to `/account?payment=success`
4. Check order appears in customer's active orders
5. Verify admin can see order in dashboard

## 🎯 **Payment Testing Checklist**
- [ ] Test credit card payment (use test card: 4000 0000 0000 0002)
- [ ] Verify payment success callback works
- [ ] Check order status updates in real-time
- [ ] Test payment failure scenarios
- [ ] Verify email notifications are sent
- [ ] Test on mobile devices (PWA functionality)

## 🔄 **Live vs Test Mode**
- **Test Mode**: `NEXT_PUBLIC_YOCO_TEST_MODE=true` (current setup)
- **Live Mode**: `NEXT_PUBLIC_YOCO_TEST_MODE=false` + live Yoco keys

## 📱 **Mobile Testing**
- Test PWA installation on mobile
- Verify QR code scanning works
- Test payment flow on tablet (kitchen view)
- Check offline functionality

---

**✅ READY FOR PRODUCTION TESTING**
Once these environment variables are set in Vercel, the payment system will be fully functional for testing every menu item and payment scenario.
