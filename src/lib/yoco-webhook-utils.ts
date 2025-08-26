/**
 * Yoco Webhook Utilities
 * Handles webhook signature verification and payload validation
 */

import crypto from 'crypto';

/**
 * Verify Yoco webhook signature using HMAC-SHA256
 * According to Yoco docs: https://developer.yoco.com/online/resources/webhooks
 * 
 * @param payload - Raw request body as string
 * @param signature - webhook-signature header value
 * @param secret - Webhook secret from Yoco dashboard
 * @returns boolean indicating if signature is valid
 */
export function verifyYocoWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Generate HMAC-SHA256 hash of the payload using the webhook secret
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Yoco signature format might include "sha256=" prefix
    const receivedSignature = signature.startsWith('sha256=') 
      ? signature.slice(7) 
      : signature;

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Get webhook secret from environment variables
 * This should be set in your environment (.env.local or Vercel dashboard)
 */
export function getYocoWebhookSecret(): string | null {
  return process.env.YOCO_WEBHOOK_SECRET || null;
}

/**
 * Validate Yoco webhook event structure
 * Ensures the payload matches the expected format from Yoco docs
 */
export function validateYocoWebhookEvent(event: any): {
  isValid: boolean;
  error?: string;
} {
  // Check required top-level fields
  if (!event.id || typeof event.id !== 'string') {
    return { isValid: false, error: 'Missing or invalid event.id' };
  }

  if (!event.type || typeof event.type !== 'string') {
    return { isValid: false, error: 'Missing or invalid event.type' };
  }

  if (!['payment.succeeded', 'payment.failed'].includes(event.type)) {
    return { isValid: false, error: `Unsupported event type: ${event.type}` };
  }

  // Check payload structure
  if (!event.payload || typeof event.payload !== 'object') {
    return { isValid: false, error: 'Missing or invalid event.payload' };
  }

  const payload = event.payload;

  // Check required payload fields
  if (!payload.id || typeof payload.id !== 'string') {
    return { isValid: false, error: 'Missing or invalid payload.id' };
  }

  if (typeof payload.amount !== 'number') {
    return { isValid: false, error: 'Missing or invalid payload.amount' };
  }

  if (!payload.currency || typeof payload.currency !== 'string') {
    return { isValid: false, error: 'Missing or invalid payload.currency' };
  }

  if (!payload.status || typeof payload.status !== 'string') {
    return { isValid: false, error: 'Missing or invalid payload.status' };
  }

  // Check metadata for order identification
  if (!payload.metadata || typeof payload.metadata !== 'object') {
    return { isValid: false, error: 'Missing or invalid payload.metadata' };
  }

  if (!payload.metadata.checkoutId) {
    return { isValid: false, error: 'Missing payload.metadata.checkoutId' };
  }

  // Check for order ID (this is how we identify which order to update)
  if (!payload.metadata.orderId && !payload.metadata.order_id) {
    return { isValid: false, error: 'Missing orderId in payload.metadata' };
  }

  return { isValid: true };
}

/**
 * Extract order ID from Yoco webhook payload
 * Handles different possible field names
 */
export function extractOrderIdFromWebhook(event: any): string | null {
  const metadata = event?.payload?.metadata;
  if (!metadata) return null;

  return metadata.orderId || metadata.order_id || null;
}

/**
 * Log webhook event details for debugging
 */
export function logYocoWebhookEvent(event: any, prefix = '🔔') {
  console.log(`${prefix} Yoco Webhook Event:`, {
    eventId: event.id,
    eventType: event.type,
    createdDate: event.createdDate,
    paymentId: event.payload?.id,
    amount: event.payload?.amount,
    currency: event.payload?.currency,
    status: event.payload?.status,
    mode: event.payload?.mode,
    checkoutId: event.payload?.metadata?.checkoutId,
    orderId: extractOrderIdFromWebhook(event),
  });
}
