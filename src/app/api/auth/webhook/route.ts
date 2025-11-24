import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/emailTemplates';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { env } from '@/lib/env';
import { createHmac, timingSafeEqual } from 'crypto';
import { checkRateLimit, getClientIdentifier, RateLimitPresets, getRateLimitHeaders } from '@/lib/rate-limit';

/**
 * Auth Event Webhook Handler
 * Handles Supabase auth events to send custom branded emails
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting to prevent webhook flooding
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, {
      id: 'auth-webhook',
      ...RateLimitPresets.WEBHOOK,
    });

    if (!rateLimitResult.success) {
      console.error('Auth webhook rate limit exceeded');
      return NextResponse.json(
        { error: 'Too many webhook requests' },
        {
          status: 429,
          headers: getRateLimitHeaders({
            ...rateLimitResult,
            limit: RateLimitPresets.WEBHOOK.limit,
          }),
        }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();
    const authEvent = JSON.parse(body);

    console.log('Auth webhook received:', authEvent.type);

    // SECURITY: Verify webhook authenticity with HMAC signature
    const webhookSecret = env.SUPABASE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Webhook secret not configured - rejecting webhook');
      return NextResponse.json(
        { error: 'Webhook authentication not configured' },
        { status: 500 }
      );
    }

    const signature = request.headers.get('x-webhook-signature') || request.headers.get('authorization');
    const timestamp = request.headers.get('x-webhook-timestamp');

    if (!signature) {
      console.error('Unauthorized webhook request - missing signature');
      return NextResponse.json({ error: 'Unauthorized - Missing signature' }, { status: 401 });
    }

    // Extract signature from Authorization header if present (format: "Bearer <signature>")
    const signatureValue = signature.startsWith('Bearer ') ? signature.slice(7) : signature;

    // Verify timestamp to prevent replay attacks (must be within 5 minutes)
    if (timestamp) {
      const requestTime = parseInt(timestamp, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeDiff = Math.abs(currentTime - requestTime);

      if (timeDiff > 300) { // 5 minutes
        console.error('Webhook timestamp too old - possible replay attack');
        return NextResponse.json(
          { error: 'Webhook timestamp expired' },
          { status: 401 }
        );
      }
    }

    // Compute HMAC signature
    const signedPayload = timestamp ? `${timestamp}.${body}` : body;
    const computedSignature = createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    try {
      const isValid = timingSafeEqual(
        Buffer.from(signatureValue),
        Buffer.from(computedSignature)
      );

      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } catch {
      console.error('Signature comparison failed - possible format mismatch');
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 401 });
    }

    console.log('Webhook signature verified');

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
async function handleUserSignup(user: { 
  id: string; 
  email: string; 
  confirmation_url?: string; 
  confirmation_token?: string;
  user_metadata?: { full_name?: string };
}) {
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
    // Note: With custom SMTP in Supabase, this webhook is not needed as emails are sent directly
    const confirmationUrl = user.confirmation_url ||
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?token_hash=${user.confirmation_token}&type=email`;

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
async function handlePasswordReset(user: { 
  id: string; 
  email: string; 
  recovery_url?: string; 
  recovery_token?: string;
  user_metadata?: { full_name?: string };
}) {
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
async function handleEmailChange(user: { 
  id: string; 
  email: string; 
  user_metadata?: { full_name?: string };
}) {
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
