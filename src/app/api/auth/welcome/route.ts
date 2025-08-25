import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/emailTemplates';

interface WelcomeEmailRequest {
  userEmail: string;
  userName?: string;
  userId: string;
}

/**
 * Send Welcome Email API
 * Sends a branded welcome email to new users
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, userId }: WelcomeEmailRequest = await request.json();

    if (!userEmail || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail, userId' },
        { status: 400 }
      );
    }

    console.log('📧 Sending welcome email to:', userEmail);

    // Generate confirmation URL
    const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm-signup`;

    // Send the welcome email
    const emailSent = await sendWelcomeEmail({
      userEmail,
      userName,
      confirmationUrl,
    });

    if (emailSent) {
      console.log('✅ Welcome email sent successfully to:', userEmail);
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email sent successfully' 
      });
    } else {
      console.error('❌ Failed to send welcome email to:', userEmail);
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Welcome email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for endpoint verification
export async function GET() {
  return NextResponse.json({ 
    status: 'Welcome email endpoint is active',
    timestamp: new Date().toISOString()
  });
}
