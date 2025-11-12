/**
 * Yoco Webhook Utilities - CORRECTED IMPLEMENTATION
 * Handles webhook signature verification and payload validation
 * Based on: https://developer.yoco.com/guides/online-payments/webhooks/verifying-the-events
 */

import crypto from 'crypto';

/**
 * Verify Yoco webhook signature using the official method
 * According to Yoco docs: webhook-id.webhook-timestamp.raw_body signed with HMAC-SHA256
 */
export function verifyYocoWebhookSignature(
  payload: string,
  signature: string,
  webhookId: string,
  webhookTimestamp: string,
  secret: string
): boolean {
  try {
    // Construct the signed content: webhook-id.webhook-timestamp.raw_body
    const signedContent = `${webhookId}.${webhookTimestamp}.${payload}`;
    
    // Extract secret bytes (remove whsec_ prefix and decode base64)
    const secretBytes = Buffer.from(secret.split('_')[1], 'base64');
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64');
    
    // Extract signature from header (format: v1,signature)
    const receivedSignature = signature.split(' ')[0].split(',')[1];
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Simple signature verification fallback (for testing)
 */
export function verifyYocoWebhookSignatureSimple(
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
    
    // Yoco signature format might include prefixes
    const receivedSignature = signature.startsWith('sha256=')
      ? signature.slice(7)
      : signature;
    
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
 */
export function getYocoWebhookSecret(): string | null {
  return process.env.YOCO_WEBHOOK_SECRET || null;
}

/**
 * Validate webhook timestamp to prevent replay attacks
 */
export function validateWebhookTimestamp(
  timestamp: string,
  thresholdMinutes: number = 3
): boolean {
  try {
    const webhookTime = parseInt(timestamp) * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const thresholdMs = thresholdMinutes * 60 * 1000;
    
    return Math.abs(currentTime - webhookTime) <= thresholdMs;
  } catch (error) {
    console.error('Error validating webhook timestamp:', error);
    return false;
  }
}

/**
 * Log webhook event for debugging
 */
export function logWebhookEvent(event: Record<string, unknown>, prefix: string = '📊'): void {
  console.log(`${prefix} Webhook Event Details:`, {
    id: event.id,
    type: event.type,
    createdDate: event.createdDate,
    payloadId: (event.payload as Record<string, unknown>)?.id,
    status: (event.payload as Record<string, unknown>)?.status,
    amount: (event.payload as Record<string, unknown>)?.amount,
    currency: (event.payload as Record<string, unknown>)?.currency,
    metadata: (event.payload as Record<string, unknown>)?.metadata,
  });
}
