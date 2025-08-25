import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/emailTemplates';
import { getSupabaseAdmin } from '@/lib/supabase-server';

/**
 * Auth Event Webhook Handler
 * Handles Supabase auth events to send custom branded emails
 */
export async function POST(request: NextRequest) {
  try {
    const authEvent = await request.json();
    console.log('🔔 Auth webhook received:', authEvent.type);

    // Verify webhook authenticity (basic check)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('Bearer')) {
      console.log('❌ Unauthorized webhook request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, user } = authEvent;

    switch (type) {
      case 'user.created':
      case 'signup':
        await handleUserSignup(user);
        break;
        
      case 'password_recovery':
        await handlePasswordReset(user);
        break;
        
      case 'email_change':
        await handleEmailChange(user);
        break;
        
      default:
        console.log('📝 Unhandled auth event:', type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Auth webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle new user signup
 */
async function handleUserSignup(user: any) {
  try {
    console.log('🎉 Processing new user signup:', user.email);

    // Get user profile information if available
    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Generate confirmation URL (this would typically come from the auth event)
    const confirmationUrl = user.confirmation_url || 
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token=${user.confirmation_token}`;

    // Send branded welcome email
    const emailSent = await sendWelcomeEmail({
      userEmail: user.email,
      userName: profile?.full_name || user.user_metadata?.full_name,
      confirmationUrl,
    });

    if (emailSent) {
      console.log('✅ Welcome email sent to:', user.email);
    } else {
      console.log('⚠️ Failed to send welcome email to:', user.email);
    }
  } catch (error) {
    console.error('❌ Error handling user signup:', error);
  }
}

/**
 * Handle password reset request
 */
async function handlePasswordReset(user: any) {
  try {
    console.log('🔐 Processing password reset for:', user.email);

    // Get user profile information
    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Generate reset URL
    const resetUrl = user.recovery_url || 
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset?token=${user.recovery_token}`;

    // Send branded password reset email
    const emailSent = await sendPasswordResetEmail({
      userEmail: user.email,
      userName: profile?.full_name || user.user_metadata?.full_name,
      resetUrl,
    });

    if (emailSent) {
      console.log('✅ Password reset email sent to:', user.email);
    } else {
      console.log('⚠️ Failed to send password reset email to:', user.email);
    }
  } catch (error) {
    console.error('❌ Error handling password reset:', error);
  }
}

/**
 * Handle email change request
 */
async function handleEmailChange(user: any) {
  try {
    console.log('📧 Processing email change for:', user.email);
    
    // For now, just log the event
    // In the future, you could send confirmation emails for email changes
    console.log('📝 Email change event logged');
  } catch (error) {
    console.error('❌ Error handling email change:', error);
  }
}

// Handle GET requests (for webhook verification)
export async function GET() {
  return NextResponse.json({ 
    status: 'Auth webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
