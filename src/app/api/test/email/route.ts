import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/emailTemplates';

/**
 * Test Email Endpoint
 * For testing the branded welcome email template
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing welcome email for:', email);

    const testEmailSent = await sendWelcomeEmail({
      userEmail: email,
      userName: name || 'Test User',
      confirmationUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?test=true`,
    });

    if (testEmailSent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test welcome email sent successfully!' 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Email test endpoint is active',
    timestamp: new Date().toISOString(),
    note: 'POST with { email, name } to test welcome email'
  });
}
