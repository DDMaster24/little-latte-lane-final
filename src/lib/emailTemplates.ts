/**
 * Email Templates for Little Latte Lane
 * Branded email templates for signup, confirmation, and other notifications
 */

interface WelcomeEmailData {
  userEmail: string;
  userName?: string;
  confirmationUrl: string;
}

interface PasswordResetData {
  userEmail: string;
  userName?: string;
  resetUrl: string;
}

/**
 * Generate welcome/signup confirmation email HTML
 */
export function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  const firstName = data.userName?.split(' ')[0] || 'Friend';
  
  return `
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
        🎉 Welcome ${firstName}!
      </h2>
      
      <p style="color: #ffffff; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">
        You're one step away from experiencing the <strong style="color: #ff1493;">future of dining</strong> at Little Latte Lane!
      </p>

      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border: 2px solid #00ffff; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);">
        <h3 style="color: #ff1493; margin: 0 0 15px 0; font-size: 20px;">
          🚀 What Awaits You:
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0; text-align: left;">
          <li style="color: #ffffff; margin: 10px 0; padding-left: 25px; position: relative;">
            <span style="color: #00ffff; position: absolute; left: 0;">⚡</span>
            Lightning-fast mobile ordering
          </li>
          <li style="color: #ffffff; margin: 10px 0; padding-left: 25px; position: relative;">
            <span style="color: #00ffff; position: absolute; left: 0;">🎯</span>
            Real-time order tracking
          </li>
          <li style="color: #ffffff; margin: 10px 0; padding-left: 25px; position: relative;">
            <span style="color: #00ffff; position: absolute; left: 0;">🍕</span>
            Gourmet pizzas, burgers & drinks
          </li>
          <li style="color: #ffffff; margin: 10px 0; padding-left: 25px; position: relative;">
            <span style="color: #00ffff; position: absolute; left: 0;">📱</span>
            QR code table ordering
          </li>
        </ul>
      </div>

      <!-- Call to Action Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #ff1493 0%, #00ffff 100%); color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: bold; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 20px rgba(255, 20, 147, 0.3); transition: all 0.3s ease;">
          ✨ Confirm Your Account ✨
        </a>
      </div>

      <p style="color: #cccccc; font-size: 14px; margin: 30px 0 0 0; line-height: 1.5;">
        Click the button above to verify your email and start your culinary journey with us!
      </p>
    </div>

    <!-- QR Code Section -->
    <div style="background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%); border-top: 2px solid #00ffff; padding: 30px; text-align: center;">
      <h3 style="color: #00ffff; margin: 0 0 15px 0; font-size: 18px;">
        📱 Try Our QR Menu Experience
      </h3>
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 20px 0;">
        Visit us and scan any QR code to order directly from your table!
      </p>
      <div style="background: #ffffff; border-radius: 8px; padding: 15px; display: inline-block; margin: 10px 0;">
        <div style="width: 80px; height: 80px; background: #000000; border-radius: 4px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #ffffff;">
          QR CODE<br>PLACEHOLDER
        </div>
      </div>
      <p style="color: #cccccc; font-size: 12px; margin: 15px 0 0 0;">
        Visit: <strong style="color: #00ffff;">www.littlelattelane.co.za</strong>
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
</html>`;
}

/**
 * Generate password reset email HTML
 */
export function generatePasswordResetHTML(data: PasswordResetData): string {
  const firstName = data.userName?.split(' ')[0] || 'Friend';
  
  return `
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
        Hi ${firstName}, we received a request to reset your password for your Little Latte Lane account.
      </p>

      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border: 2px solid #ff1493; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 0 15px rgba(255, 20, 147, 0.2);">
        <p style="color: #ffffff; margin: 0; font-size: 14px; line-height: 1.6;">
          Click the button below to create a new password. This link will expire in 1 hour for security.
        </p>
      </div>

      <!-- Reset Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ff1493 0%, #ff6b6b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: bold; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 20px rgba(255, 20, 147, 0.3);">
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
        Questions? Contact us at security@littlelattelane.co.za
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
</html>`;
}

/**
 * Send welcome email via Resend
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Welcome Email (Development Mode):', {
        to: data.userEmail,
        subject: '🎉 Welcome to Little Latte Lane - Confirm Your Account!',
        html: generateWelcomeEmailHTML(data),
      });
      return true;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Little Latte Lane <${process.env.FROM_EMAIL || 'welcome@littlelattelane.co.za'}>`,
        to: data.userEmail,
        subject: '🎉 Welcome to Little Latte Lane - Confirm Your Account!',
        html: generateWelcomeEmailHTML(data),
        headers: {
          'X-Entity-Ref-ID': `welcome-${Date.now()}`,
        },
      }),
    });

    if (response.ok) {
      console.log('✅ Welcome email sent successfully to:', data.userEmail);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return false;
  }
}

/**
 * Send password reset email via Resend
 */
export async function sendPasswordResetEmail(data: PasswordResetData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Password Reset Email (Development Mode):', {
        to: data.userEmail,
        subject: '🔐 Reset Your Password - Little Latte Lane',
        html: generatePasswordResetHTML(data),
      });
      return true;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'security@littlelattelane.co.za',
        to: data.userEmail,
        subject: '🔐 Reset Your Password - Little Latte Lane',
        html: generatePasswordResetHTML(data),
      }),
    });

    if (response.ok) {
      console.log('✅ Password reset email sent successfully to:', data.userEmail);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Password reset email error:', error);
    return false;
  }
}
