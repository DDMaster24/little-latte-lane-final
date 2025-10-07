/**
 * Send Push Notification API
 * Server-side endpoint for sending push notifications to users
 * Supports:
 * - Web Push (VAPID) for website users
 * - Firebase Cloud Messaging (FCM) for Android native app
 * - Apple Push Notification Service (APNS) for iOS native app
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import webpush from 'web-push';
import admin from 'firebase-admin';
import apn from '@parse/node-apn';

// Configure web-push with VAPID details
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@littlelattelane.co.za',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Initialize Firebase Admin SDK
if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
  }
}

// Initialize APNS Provider
let apnsProvider: apn.Provider | null = null;
if (process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID && process.env.APNS_PRIVATE_KEY) {
  try {
    apnsProvider = new apn.Provider({
      token: {
        key: process.env.APNS_PRIVATE_KEY,
        keyId: process.env.APNS_KEY_ID,
        teamId: process.env.APNS_TEAM_ID,
      },
      production: true, // Use production APNs servers
    });
    console.log('✅ APNS Provider initialized');
  } catch (error) {
    console.error('❌ APNS Provider initialization failed:', error);
  }
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

    // Send Web Push notification if subscription exists
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

        deliveryMethods.push('web-push');
        pushSent = true;
        console.log('✅ Web push notification sent successfully');
      } catch (pushError) {
        console.error('❌ Web push notification failed:', pushError);
        
        // If push failed due to invalid subscription, clear it
        if (pushError instanceof Error && (pushError.message.includes('410') || pushError.message.includes('404'))) {
          console.log('🗑️ Clearing invalid web push subscription');
          await supabase
            .from('notifications')
            .update({ push_subscription: null })
            .eq('user_id', user_id);
        }
      }
    }

    // Send Firebase Cloud Messaging (Android) notification
    if (userPrefs?.fcm_token && admin.apps.length > 0) {
      try {
        const fcmPayload = {
          notification: {
            title,
            body,
            imageUrl: image_url,
          },
          data: {
            url: action_url || '/account',
            notification_type,
            category: category || '',
            ...(data ? Object.fromEntries(
              Object.entries(data).map(([k, v]) => [k, String(v)])
            ) : {}),
          },
          token: userPrefs.fcm_token,
          android: {
            priority: 'high' as const,
            notification: {
              sound: 'default',
              clickAction: 'FLUTTER_NOTIFICATION_CLICK',
              channelId: 'order_updates',
            },
          },
        };

        await admin.messaging().send(fcmPayload);
        deliveryMethods.push('fcm');
        pushSent = true;
        console.log('✅ FCM notification sent successfully (Android)');
      } catch (fcmError) {
        console.error('❌ FCM notification failed:', fcmError);
        
        // Clear invalid FCM token
        if (fcmError instanceof Error && (
          fcmError.message.includes('not-found') || 
          fcmError.message.includes('invalid-registration-token')
        )) {
          console.log('🗑️ Clearing invalid FCM token');
          await supabase
            .from('notifications')
            .update({ fcm_token: null })
            .eq('user_id', user_id);
        }
      }
    }

    // Send Apple Push Notification (iOS)
    if (userPrefs?.apns_token && apnsProvider) {
      try {
        const notification = new apn.Notification();
        notification.alert = {
          title,
          body,
        };
        notification.badge = 1;
        notification.sound = 'default';
        notification.topic = 'com.littlelattelane.app'; // Your iOS Bundle ID
        notification.payload = {
          url: action_url || '/account',
          notification_type,
          category: category || '',
          ...data,
        };
        notification.pushType = 'alert';
        
        if (image_url) {
          notification.mutableContent = true;
          notification.payload.imageUrl = image_url;
        }

        const result = await apnsProvider.send(notification, userPrefs.apns_token);
        
        if (result.sent.length > 0) {
          deliveryMethods.push('apns');
          pushSent = true;
          console.log('✅ APNS notification sent successfully (iOS)');
        }
        
        if (result.failed.length > 0) {
          console.error('❌ APNS notification failed:', result.failed[0].response);
          
          // Clear invalid APNS token if permanently failed
          const failure = result.failed[0];
          if (failure.status === 410 || failure.status === 400) {
            console.log('🗑️ Clearing invalid APNS token');
            await supabase
              .from('notifications')
              .update({ apns_token: null })
              .eq('user_id', user_id);
          }
        }
      } catch (apnsError) {
        console.error('❌ APNS notification failed:', apnsError);
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
