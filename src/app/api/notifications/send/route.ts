/**
 * Send Push Notification API
 * Server-side endpoint for sending push notifications to users
 * Used internally for order status updates and system notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import webpush from 'web-push';

// Configure web-push with VAPID details
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@littlelattelane.co.za',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface NotificationPayload {
  user_id: string;
  title: string;
  body: string;
  notification_type: 'order_status' | 'promotional' | 'event' | 'system';
  category?: string;
  image_url?: string;
  icon_url?: string;
  action_url?: string;
  data?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    
    // Parse request body
    const payload: NotificationPayload = await request.json();
    const {
      user_id,
      title,
      body,
      notification_type,
      category,
      image_url,
      icon_url,
      action_url,
      data,
    } = payload;

    // Validate required fields
    if (!user_id || !title || !body || !notification_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`📤 Sending ${notification_type} notification to user:`, user_id);

    // Get user's notification preferences
    const { data: userPrefs, error: prefsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (prefsError) {
      console.warn('⚠️ No notification preferences found for user:', user_id);
      // Continue anyway - user might want notifications even without explicit preferences
    }

    // Check if user has push enabled and type-specific preferences
    const pushEnabled = userPrefs?.push_enabled !== false;
    const typeEnabled = checkTypeEnabled(notification_type, userPrefs ? {
      order_updates_enabled: userPrefs.order_updates_enabled ?? true,
      promotional_enabled: userPrefs.promotional_enabled ?? true,
      event_announcements_enabled: userPrefs.event_announcements_enabled ?? true,
    } : null);

    if (!pushEnabled || !typeEnabled) {
      console.log(`⏭️ Skipping notification - user preferences disabled`);
      return NextResponse.json({
        success: true,
        message: 'Notification skipped due to user preferences',
        sent: false,
      });
    }

    const deliveryMethods: string[] = [];
    let pushSent = false;

    // Send push notification if subscription exists
    if (userPrefs?.push_subscription) {
      try {
        const pushPayload = {
          title,
          body,
          icon: icon_url || '/icon-192x192.png',
          badge: '/icon-192x192.png',
          image: image_url,
          data: {
            url: action_url || '/account',
            notification_type,
            category,
            ...data,
          },
        };

        await webpush.sendNotification(
          userPrefs.push_subscription as unknown as webpush.PushSubscription,
          JSON.stringify(pushPayload)
        );

        deliveryMethods.push('push');
        pushSent = true;
        console.log('✅ Push notification sent successfully');
      } catch (pushError) {
        console.error('❌ Push notification failed:', pushError);
        
        // If push failed due to invalid subscription, clear it
        if (pushError instanceof Error && (pushError.message.includes('410') || pushError.message.includes('404'))) {
          console.log('🗑️ Clearing invalid push subscription');
          await supabase
            .from('notifications')
            .update({ push_subscription: null })
            .eq('user_id', user_id);
        }
      }
    }

    // Record notification in history
    const { error: historyError } = await supabase
      .from('notification_history')
      .insert({
        user_id,
        notification_type,
        category,
        title,
        body,
        image_url,
        icon_url,
        action_url,
        data: data ? JSON.parse(JSON.stringify(data)) : null,
        delivery_method: deliveryMethods,
        delivery_status: pushSent ? 'delivered' : 'failed',
        sent_at: new Date().toISOString(),
        delivered_at: pushSent ? new Date().toISOString() : null,
      });

    if (historyError) {
      console.error('❌ Failed to record notification history:', historyError);
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      sent: pushSent,
      delivery_methods: deliveryMethods,
    });
  } catch (error) {
    console.error('❌ Send notification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

function checkTypeEnabled(type: string, prefs: { order_updates_enabled?: boolean; promotional_enabled?: boolean; event_announcements_enabled?: boolean } | null): boolean {
  if (!prefs) return true; // Default to enabled if no preferences set

  switch (type) {
    case 'order_status':
      return prefs.order_updates_enabled !== false;
    case 'promotional':
      return prefs.promotional_enabled !== false;
    case 'event':
      return prefs.event_announcements_enabled !== false;
    case 'system':
      return true; // System notifications always enabled
    default:
      return true;
  }
}
