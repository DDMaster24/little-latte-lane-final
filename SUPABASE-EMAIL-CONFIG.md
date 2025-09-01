# 📧 SUPABASE AUTH EMAIL CONFIGURATION

## 🎯 **CUSTOM EMAIL TEMPLATES SETUP**

To replace default Supabase emails with branded templates, follow these steps:

### **1. Access Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `awytuszmunxvthuizyur`
3. Navigate to: **Settings** → **Authentication** → **Email Templates**

### **2. Configure Signup/Confirmation Email**

**Template Type:** Confirm signup
**From Email:** `admin@littlelattelane.co.za`
**Subject:** `🎉 Welcome to Little Latte Lane - Confirm Your Account!`

**HTML Template:** Use the branded template from `src/lib/emailTemplates.ts` - `generateWelcomeEmailHTML()`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Little Latte Lane!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background: #000000; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 255, 255, 0.1);">
    
    <!-- Header with Logo and Neon Effect -->
    <div style="background: linear-gradient(135deg, #ff1493 0%, #00ffff 100%); padding: 30px 20px; text-align: center; position: relative;">
      <div style="background: #000000; border-radius: 12px; padding: 20px; margin: 0 auto; max-width: 300px; border: 2px solid #00ffff; box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);">
        <h1 style="margin: 0; color: #00ffff; font-size: 28px; font-weight: bold; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);">
          ☕ Little Latte Lane
        </h1>
        <p style="margin: 5px 0 0 0; color: #ff1493; font-size: 14px; font-weight: 600;">
          WHERE FLAVOR MEETS FUTURE
        </p>
      </div>
    </div>

    <!-- Welcome Message -->
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #00ffff; font-size: 32px; margin: 0 0 20px 0; text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);">
        🎉 Welcome!
      </h2>
      
      <p style="color: #ffffff; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">
        You're one step away from experiencing the <strong style="color: #ff1493;">future of dining</strong> at Little Latte Lane!
      </p>

      <!-- Call to Action Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #ff1493 0%, #00ffff 100%); color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: bold; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 20px rgba(255, 20, 147, 0.3);">
          ✨ Confirm Your Account ✨
        </a>
      </div>

      <p style="color: #cccccc; font-size: 14px; margin: 30px 0 0 0; line-height: 1.5;">
        Click the button above to verify your email and start your culinary journey with us!
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #000000; padding: 25px 30px; text-align: center; border-top: 1px solid #333333;">
      <p style="color: #00ffff; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
        The Future of Dining is Here
      </p>
      <p style="color: #cccccc; font-size: 12px; margin: 0 0 15px 0;">
        Questions? Reply to this email or visit our website.
      </p>
      <div style="border-top: 1px solid #333333; padding-top: 15px; margin-top: 15px;">
        <p style="color: #666666; font-size: 11px; margin: 0;">
          Little Latte Lane | www.littlelattelane.co.za<br>
          You're receiving this because you signed up for an account.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
```

### **3. Configure Password Reset Email**

**Template Type:** Reset Password
**From Email:** `admin@littlelattelane.co.za`
**Subject:** `🔐 Reset Your Password - Little Latte Lane`

**HTML Template:** Use the branded template from `src/lib/emailTemplates.ts` - `generatePasswordResetHTML()`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Little Latte Lane</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background: #000000; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(255, 20, 147, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ff1493 0%, #00ffff 100%); padding: 30px 20px; text-align: center;">
      <div style="background: #000000; border-radius: 12px; padding: 20px; margin: 0 auto; max-width: 300px; border: 2px solid #ff1493; box-shadow: 0 0 20px rgba(255, 20, 147, 0.3);">
        <h1 style="margin: 0; color: #ff1493; font-size: 28px; font-weight: bold; text-shadow: 0 0 10px rgba(255, 20, 147, 0.5);">
          ☕ Little Latte Lane
        </h1>
        <p style="margin: 5px 0 0 0; color: #00ffff; font-size: 14px; font-weight: 600;">
          SECURE PASSWORD RESET
        </p>
      </div>
    </div>

    <!-- Reset Message -->
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #ff1493; font-size: 28px; margin: 0 0 20px 0; text-shadow: 0 0 8px rgba(255, 20, 147, 0.4);">
        🔐 Password Reset
      </h2>
      
      <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        We received a request to reset your password for your Little Latte Lane account.
      </p>

      <!-- Reset Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #ff1493 0%, #ff6b6b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: bold; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 20px rgba(255, 20, 147, 0.3);">
          🔑 Reset Password
        </a>
      </div>

      <div style="background: #2d1b1b; border: 1px solid #ff1493; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <p style="color: #ff1493; margin: 0 0 10px 0; font-weight: bold; font-size: 14px;">
          ⚠️ Security Notice:
        </p>
        <p style="color: #ffffff; margin: 0; font-size: 13px; line-height: 1.5;">
          If you didn't request this password reset, please ignore this email. Your account remains secure.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #000000; padding: 25px 30px; text-align: center; border-top: 1px solid #333333;">
      <p style="color: #ff1493; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
        Security is Our Priority
      </p>
      <p style="color: #cccccc; font-size: 12px; margin: 0 0 15px 0;">
        Questions? Contact us at admin@littlelattelane.co.za
      </p>
      <div style="border-top: 1px solid #333333; padding-top: 15px; margin-top: 15px;">
        <p style="color: #666666; font-size: 11px; margin: 0;">
          Little Latte Lane | www.littlelattelane.co.za<br>
          This is an automated security email.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
```

### **4. Configure SMTP Settings**

**SMTP Configuration:**
- **Enable Custom SMTP:** Yes
- **Host:** Use your domain's SMTP server
- **Port:** 587 (TLS) or 465 (SSL)
- **Username:** `admin@littlelattelane.co.za`
- **Password:** Your email password
- **Sender Name:** `Little Latte Lane`
- **Sender Email:** `admin@littlelattelane.co.za`

### **5. Test Email Configuration**

1. **Create Test Account:** Sign up with a test email
2. **Check Email Delivery:** Verify branded email received
3. **Test Password Reset:** Use "Forgot Password" flow
4. **Verify Links:** Ensure confirmation/reset links work

### **6. Environment Variables**

Add to your `.env.local`:
```bash
# Email Configuration
SUPABASE_SMTP_ADMIN_EMAIL=admin@littlelattelane.co.za
SUPABASE_SMTP_ORDERS_EMAIL=orders@littlelattelane.co.za
SUPABASE_SMTP_OWNER_EMAIL=peet@littlelattelane.co.za
```

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Signup email uses branded template
- [ ] Password reset email uses branded template  
- [ ] Emails sent from `admin@littlelattelane.co.za`
- [ ] Email links work correctly
- [ ] No default Supabase styling visible
- [ ] Mobile email rendering tested
- [ ] Spam folder delivery tested

---

## 🚨 **IMPORTANT NOTES**

1. **Template Variables:** Use Supabase template variables like `{{ .ConfirmationURL }}`
2. **Mobile Testing:** Test emails on mobile devices for proper rendering
3. **Spam Prevention:** Ensure sending domain has proper SPF/DKIM records
4. **Backup Templates:** Keep copies of working templates for reference

**After configuration, all auth emails will use your branded templates instead of default Supabase styling.**
