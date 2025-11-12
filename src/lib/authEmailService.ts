/**
 * Professional Authentication Email Service
 * Handles signup confirmation and password reset emails with branded templates
 */

import { getSupabaseAdmin } from '@/lib/supabase-server';

interface ConfirmationEmailData {
  userEmail: string;
  userName?: string;
  confirmationToken: string;
  userId: string;
}

interface PasswordResetEmailData {
  userEmail: string;
  userName?: string;
  resetToken: string;
}

/**
 * Send professional signup confirmation email
 */
export async function sendSignupConfirmationEmail(data: ConfirmationEmailData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Signup Confirmation Email (Development Mode):', data);
      return true;
    }

    const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token=${data.confirmationToken}&email=${encodeURIComponent(data.userEmail)}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Little Latte Lane <${process.env.FROM_EMAIL || 'welcome@littlelattelane.co.za'}>`,
        to: data.userEmail,
        subject: '🎉 Welcome to Little Latte Lane - Confirm Your Account',
        html: generateSignupConfirmationHTML({ 
          ...data, 
          confirmationUrl 
        }),
        headers: {
          'X-Entity-Ref-ID': `signup-${data.userId}-${Date.now()}`,
        },
      }),
    });

    if (response.ok) {
      console.log('✅ Signup confirmation email sent to:', data.userEmail);
      return true;
    } else {
      const errorData = await response.text();
      console.error('❌ Failed to send signup confirmation:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Signup confirmation email error:', error);
    return false;
  }
}

/**
 * Send professional password reset email
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Password Reset Email (Development Mode):', data);
      return true;
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${data.resetToken}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Little Latte Lane <${process.env.ADMIN_EMAIL || 'admin@littlelattelane.co.za'}>`,
        to: data.userEmail,
        subject: '🔐 Password Reset Request - Little Latte Lane',
        html: generatePasswordResetHTML({ 
          ...data, 
          resetUrl 
        }),
        headers: {
          'X-Entity-Ref-ID': `reset-${Date.now()}`,
        },
      }),
    });

    if (response.ok) {
      console.log('✅ Password reset email sent to:', data.userEmail);
      return true;
    } else {
      const errorData = await response.text();
      console.error('❌ Failed to send password reset:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Password reset email error:', error);
    return false;
  }
}

/**
 * Generate signup confirmation email HTML
 */
function generateSignupConfirmationHTML(data: ConfirmationEmailData & { confirmationUrl: string }): string {
  const firstName = data.userName?.split(' ')[0] || 'Friend';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Account - Little Latte Lane</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background: #000000; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 255, 255, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ff1493 0%, #00ffff 100%); padding: 30px 20px; text-align: center;">
      <div style="background: #000000; border-radius: 12px; padding: 20px; margin: 0 auto; max-width: 300px; border: 2px solid #00ffff; box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);">
        <h1 style="margin: 0; color: #00ffff; font-size: 28px; font-weight: bold; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);">
          ☕ Little Latte Lane
        </h1>
        <p style="margin: 5px 0 0 0; color: #ff1493; font-size: 14px; font-weight: 600;">
          WHERE FLAVOR MEETS FUTURE
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #00ffff; font-size: 32px; margin: 0 0 20px 0; text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);">
        🎉 Welcome ${firstName}!
      </h2>
      
      <p style="color: #ffffff; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">
        Thank you for joining our futuristic coffee experience! To complete your account setup, please confirm your email address.
      </p>

      <!-- Confirmation Button -->
      <div style="margin: 40px 0;">
        <a href="${data.confirmationUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #00ffff 0%, #ff1493 100%); 
                  color: #000000; text-decoration: none; font-weight: bold; font-size: 18px; 
                  padding: 16px 40px; border-radius: 50px; box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3); 
                  transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px;">
          ✨ Confirm My Account ✨
        </a>
      </div>

      <p style="color: #888888; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${data.confirmationUrl}" style="color: #00ffff; word-break: break-all;">${data.confirmationUrl}</a>
      </p>

      <div style="background: linear-gradient(135deg, #ff1493, #00ffff); padding: 2px; border-radius: 12px; margin: 30px 0;">
        <div style="background: #000000; padding: 20px; border-radius: 10px;">
          <p style="color: #ffffff; margin: 0; font-size: 16px;">
            🚀 <strong>What's Next?</strong><br>
            Once confirmed, you'll have access to our full menu, exclusive deals, and seamless ordering experience!
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #111111; padding: 30px; text-align: center; border-top: 1px solid #333333;">
      <p style="color: #888888; font-size: 14px; margin: 0 0 10px 0;">
        Need help? Contact us at <a href="mailto:admin@littlelattelane.co.za" style="color: #00ffff;">admin@littlelattelane.co.za</a>
      </p>
      <p style="color: #666666; font-size: 12px; margin: 0;">
        © 2025 Little Latte Lane. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Generate password reset email HTML
 */
function generatePasswordResetHTML(data: PasswordResetEmailData & { resetUrl: string }): string {
  const firstName = data.userName?.split(' ')[0] || 'Friend';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - Little Latte Lane</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background: #000000; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 255, 255, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ff1493 0%, #00ffff 100%); padding: 30px 20px; text-align: center;">
      <div style="background: #000000; border-radius: 12px; padding: 20px; margin: 0 auto; max-width: 300px; border: 2px solid #00ffff;">
        <h1 style="margin: 0; color: #00ffff; font-size: 28px; font-weight: bold;">
          ☕ Little Latte Lane
        </h1>
      </div>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #ff1493; font-size: 28px; margin: 0 0 20px 0;">
        🔐 Password Reset Request
      </h2>
      
      <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Hi ${firstName},<br><br>
        You requested a password reset for your Little Latte Lane account. Click the button below to create a new password.
      </p>

      <!-- Reset Button -->
      <div style="margin: 40px 0;">
        <a href="${data.resetUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #ff1493 0%, #00ffff 100%); 
                  color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; 
                  padding: 16px 32px; border-radius: 50px; box-shadow: 0 10px 30px rgba(255, 20, 147, 0.3);">
          🔑 Reset My Password
        </a>
      </div>

      <p style="color: #888888; font-size: 14px; margin: 30px 0;">
        If you didn't request this reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <p style="color: #666666; font-size: 12px; margin: 0;">
        This link will expire in 24 hours for security purposes.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #111111; padding: 30px; text-align: center; border-top: 1px solid #333333;">
      <p style="color: #888888; font-size: 14px; margin: 0;">
        Need help? Contact us at <a href="mailto:support@littlelattelane.co.za" style="color: #00ffff;">support@littlelattelane.co.za</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Confirm user email (called from confirmation link)
 */
export async function confirmUserEmail(userId: string, email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify the user using the admin client
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );

    if (error) {
      console.error('❌ Email confirmation error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email confirmed successfully for:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Email confirmation error:', error);
    return { success: false, error: 'Failed to confirm email' };
  }
}
