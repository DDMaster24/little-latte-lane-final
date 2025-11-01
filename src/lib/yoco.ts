/**
 * Yoco Payment Service
 * Handles Yoco payment gateway integration
 * Documentation: https://developer.yoco.com/online/resources/
 */

import { env } from './env';

export interface YocoCheckoutRequest {
  amount: number; // Amount in cents (R10.00 = 1000)
  currency: string; // ZAR for South African Rand
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  webhookUrl: string;
  metadata?: {
    orderId: string;
    userId: string;
    [key: string]: string | number;
  };
}

export interface YocoCheckoutResponse {
  id: string;
  redirectUrl: string;
  status: 'created' | 'succeeded' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  metadata?: Record<string, string | number>;
}

export interface YocoWebhookPayload {
  id: string;
  type: 'checkout.succeeded' | 'checkout.failed' | 'checkout.cancelled';
  createdDate: string;
  payload: {
    id: string;
    status: 'succeeded' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
    metadata?: Record<string, string | number>;
  };
}

/**
 * Yoco API Client
 */
class YocoClient {
  private readonly baseUrl = 'https://payments.yoco.com/api';
  private readonly secretKey: string;

  constructor() {
    if (!env.YOCO_SECRET_KEY) {
      console.warn('⚠️ YOCO_SECRET_KEY not configured - Yoco client will not function');
      this.secretKey = '';
    } else {
      this.secretKey = env.YOCO_SECRET_KEY;
    }
  }

  /**
   * Create a checkout session
   */
  async createCheckout(checkoutData: YocoCheckoutRequest): Promise<YocoCheckoutResponse> {
    if (!this.secretKey) {
      throw new Error('Yoco client not properly configured - missing YOCO_SECRET_KEY');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: checkoutData.amount,
          currency: checkoutData.currency,
          successUrl: checkoutData.successUrl,
          cancelUrl: checkoutData.cancelUrl,
          failureUrl: checkoutData.failureUrl,
          webhookUrl: checkoutData.webhookUrl,
          metadata: checkoutData.metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Yoco API error: ${response.status} ${response.statusText} - ${
            errorData.message || 'Unknown error'
          }`
        );
      }

      const data = await response.json();
      return {
        id: data.id,
        redirectUrl: data.redirectUrl,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        metadata: data.metadata,
      };
    } catch (error) {
      if (env.NODE_ENV === 'development') {
        console.error('Yoco checkout creation failed:', error);
      }
      throw error;
    }
  }

  /**
   * Retrieve checkout status
   */
  async getCheckout(checkoutId: string): Promise<YocoCheckoutResponse> {
    if (!this.secretKey) {
      throw new Error('Yoco client not properly configured - missing YOCO_SECRET_KEY');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/checkouts/${checkoutId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Yoco API error: ${response.status} ${response.statusText} - ${
            errorData.message || 'Unknown error'
          }`
        );
      }

      const data = await response.json();
      return {
        id: data.id,
        redirectUrl: data.redirectUrl,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        metadata: data.metadata,
      };
    } catch (error) {
      if (env.NODE_ENV === 'development') {
        console.error('Yoco checkout retrieval failed:', error);
      }
      throw error;
    }
  }

  /**
   * Verify webhook signature (placeholder - Yoco webhook verification)
   * This would typically verify the webhook signature from Yoco
   */
  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    // TODO: Implement actual signature verification when Yoco provides webhook signing
    // For now, we'll rely on HTTPS and the webhook URL being secret
    return true;
  }
}

// Lazy singleton instance - only initialize when needed
let yocoClientInstance: YocoClient | null = null;

export function getYocoClient(): YocoClient {
  if (!yocoClientInstance) {
    yocoClientInstance = new YocoClient();
  }
  return yocoClientInstance;
}

// Export for backward compatibility
export const yocoClient = {
  createCheckout: (...args: Parameters<YocoClient['createCheckout']>) => 
    getYocoClient().createCheckout(...args),
  getCheckout: (...args: Parameters<YocoClient['getCheckout']>) => 
    getYocoClient().getCheckout(...args),
  verifyWebhookSignature: (...args: Parameters<YocoClient['verifyWebhookSignature']>) => 
    getYocoClient().verifyWebhookSignature(...args),
};

/**
 * Helper functions for payment processing
 */

/**
 * Convert amount from rands to cents
 */
export function randssToCents(rands: number): number {
  return Math.round(rands * 100);
}

/**
 * Convert amount from cents to rands
 */
export function centsToRands(cents: number): number {
  return cents / 100;
}

/**
 * Format amount for display
 */
export function formatAmount(cents: number): string {
  return `R${centsToRands(cents).toFixed(2)}`;
}

/**
 * Generate callback URLs for checkout
 * Uses multiple fallback strategies to ensure correct URLs
 */
export function generateCallbackUrls(orderId: string, request?: Request) {
  // Try multiple sources for the base URL
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  // Use request host if available (most reliable for dynamic environments)
  if (!baseUrl && request) {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    if (host) {
      baseUrl = `${protocol}://${host}`;
    }
  }
  
  // Fallback to Vercel URL if available
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  }
  
  // Additional Vercel environment variables
  if (!baseUrl && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  
  // Default fallback for development
  if (!baseUrl) {
    baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.littlelattelane.co.za'  // Updated to actual production domain
      : 'http://localhost:3000';
  }
  
  console.log('🌐 Generated callback URLs with base:', baseUrl);
  
  // For native apps, deep links will trigger the app and auto-close browser
  return {
    successUrl: `${baseUrl}/account?payment=success&orderId=${orderId}`,  // Deep link to account page
    cancelUrl: `${baseUrl}/cart/payment/cancelled?orderId=${orderId}`,     // Deep link to cancelled page
    failureUrl: `${baseUrl}/cart/payment/failed?orderId=${orderId}`,       // Deep link to failed page
    webhookUrl: `${baseUrl}/api/yoco/webhook`,
  };
}
