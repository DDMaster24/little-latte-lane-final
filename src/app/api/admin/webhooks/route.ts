/**
 * Yoco Webhook Management API
 * Admin endpoint for registering/managing webhooks with Yoco
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  setupYocoWebhooks, 
  listYocoWebhooks, 
  deleteYocoWebhook,
  getCurrentWebhookUrl 
} from '@/lib/yoco-webhook-registration';

export async function GET(request: NextRequest) {
  try {
    // Skip execution during build time or when using placeholder environment
    if (process.env.NEXT_PHASE === 'phase-production-build' || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://build-placeholder.supabase.co') {
      return NextResponse.json({
        status: 'Webhook management not available during build time',
        timestamp: new Date().toISOString()
      });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'list';
    
    if (action === 'list') {
      console.log('📋 Listing Yoco webhooks...');
      const webhooks = await listYocoWebhooks();
      
      return NextResponse.json({
        success: true,
        webhooks,
        currentUrl: getCurrentWebhookUrl(),
      });
    }
    
    if (action === 'status') {
      const currentUrl = getCurrentWebhookUrl();
      const webhooks = await listYocoWebhooks();
      const matchingWebhook = webhooks.find(w => w.url === currentUrl);
      
      return NextResponse.json({
        success: true,
        currentUrl,
        isRegistered: !!matchingWebhook,
        webhook: matchingWebhook || null,
        allWebhooks: webhooks,
      });
    }
    
    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ Webhook management GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to manage webhooks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'register') {
      console.log('🔗 Registering Yoco webhook...');
      const result = await setupYocoWebhooks();
      
      if (result.registered) {
        return NextResponse.json({
          success: true,
          message: 'Webhook registered successfully',
          webhook: result.webhook,
        });
      } else {
        return NextResponse.json(
          { 
            success: false,
            error: result.error || 'Failed to register webhook'
          },
          { status: 500 }
        );
      }
    }
    
    if (action === 'delete' && body.webhookId) {
      console.log('🗑️ Deleting Yoco webhook:', body.webhookId);
      await deleteYocoWebhook(body.webhookId);
      
      return NextResponse.json({
        success: true,
        message: 'Webhook deleted successfully',
      });
    }
    
    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ Webhook management POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to manage webhooks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
