import { NextRequest, NextResponse } from 'next/server';
import { sendSignupConfirmationEmail } from '@/lib/authEmailService';

interface WelcomeEmailRequest {
  userEmail: string;
  userName?: string;
  userId: string;
}

/**
 * Send Welcome Email API
 * Sends a branded confirmation email to new users
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

    console.log('📧 Sending signup confirmation email to:', userEmail);

    // Send the branded confirmation email with proper token
    const emailSent = await sendSignupConfirmationEmail({
      userEmail,
      userName,
      confirmationToken: userId, // Using userId as token for now
      userId,
    });

    if (emailSent) {
      console.log('✅ Signup confirmation email sent successfully to:', userEmail);
      return NextResponse.json({ 
        success: true, 
        message: 'Confirmation email sent successfully' 
      });
    } else {
      console.error('❌ Failed to send confirmation email to:', userEmail);
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Confirmation email API error:', error);
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
