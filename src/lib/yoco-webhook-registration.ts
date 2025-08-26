/**
 * Yoco Webhook Registration
 * Register webhooks with Yoco API according to official documentation
 * https://developer.yoco.com/online/resources/webhooks
 */

import { env } from './env';

export interface YocoWebhookRegistration {
  url: string;
  events: ('payment.succeeded' | 'payment.failed')[];
}

export interface YocoWebhookResponse {
  id: string;
  url: string;
  events: string[];
  secret: string; // Webhook secret for HMAC verification
  createdDate: string;
  status: 'active' | 'inactive';
}

/**
 * Register a webhook with Yoco
 * This needs to be done in the Yoco dashboard or via API call
 */
export async function registerYocoWebhook(
  webhookData: YocoWebhookRegistration
): Promise<YocoWebhookResponse> {
  const secretKey = env.YOCO_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('YOCO_SECRET_KEY not configured');
  }

  try {
    const response = await fetch('https://payments.yoco.com/api/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookData.url,
        events: webhookData.events,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Yoco webhook registration failed: ${response.status} ${response.statusText} - ${
          errorData.message || 'Unknown error'
        }`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Yoco webhook registration error:', error);
    throw error;
  }
}

/**
 * List all registered webhooks
 */
export async function listYocoWebhooks(): Promise<YocoWebhookResponse[]> {
  const secretKey = env.YOCO_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('YOCO_SECRET_KEY not configured');
  }

  try {
    const response = await fetch('https://payments.yoco.com/api/webhooks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Yoco webhook listing failed: ${response.status} ${response.statusText} - ${
          errorData.message || 'Unknown error'
        }`
      );
    }

    const data = await response.json();
    return data.webhooks || [];
  } catch (error) {
    console.error('Yoco webhook listing error:', error);
    throw error;
  }
}

/**
 * Delete a webhook
 */
export async function deleteYocoWebhook(webhookId: string): Promise<void> {
  const secretKey = env.YOCO_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('YOCO_SECRET_KEY not configured');
  }

  try {
    const response = await fetch(`https://payments.yoco.com/api/webhooks/${webhookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Yoco webhook deletion failed: ${response.status} ${response.statusText} - ${
          errorData.message || 'Unknown error'
        }`
      );
    }
  } catch (error) {
    console.error('Yoco webhook deletion error:', error);
    throw error;
  }
}

/**
 * Get current webhook URL for this deployment
 */
export function getCurrentWebhookUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
                  'https://www.littlelattelane.co.za';
  
  return `${baseUrl}/api/yoco/webhook`;
}

/**
 * Setup webhook registration
 * Call this during deployment or manually via admin interface
 */
export async function setupYocoWebhooks(): Promise<{
  registered: boolean;
  webhook?: YocoWebhookResponse;
  error?: string;
}> {
  try {
    const webhookUrl = getCurrentWebhookUrl();
    
    console.log('🔗 Setting up Yoco webhooks for:', webhookUrl);
    
    // Check if webhook already exists
    const existingWebhooks = await listYocoWebhooks();
    const existingWebhook = existingWebhooks.find(w => w.url === webhookUrl);
    
    if (existingWebhook) {
      console.log('✅ Webhook already registered:', existingWebhook.id);
      return {
        registered: true,
        webhook: existingWebhook,
      };
    }
    
    // Register new webhook
    const webhook = await registerYocoWebhook({
      url: webhookUrl,
      events: ['payment.succeeded', 'payment.failed'],
    });
    
    console.log('✅ Webhook registered successfully:', webhook.id);
    console.log('🔐 Webhook secret (save this for verification):', webhook.secret);
    
    return {
      registered: true,
      webhook,
    };
  } catch (error) {
    console.error('❌ Webhook setup failed:', error);
    return {
      registered: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
