/**
 * Simplified Order Status Update Service
 * Handles order status changes with in-app notifications and PWA push notifications only
 * NO EMAIL NOTIFICATIONS for order status updates (only signup/password reset emails)
 */

import { getSupabaseServer } from './supabase-server';

export type SimpleOrderStatus = 'received' | 'making' | 'ready' | 'completed' | 'cancelled';

export interface OrderStatusUpdate {
  orderId: string;
  status: SimpleOrderStatus;
  userEmail?: string;
  estimatedReadyTime?: string;
  completionTime?: string;
}

/**
 * Update order status with simple in-app tracking and PWA push notifications
 * NO EMAIL NOTIFICATIONS - emails only for signup/password reset
 */
export async function updateOrderStatusSimple(
  orderId: string,
  newStatus: SimpleOrderStatus,
  additionalData?: {
    estimatedReadyTime?: string;
    completionTime?: string;
  }
): Promise<boolean> {
  try {
    console.log(`📋 Updating order ${orderId} to status: ${newStatus}`);

    // Update order status in database
    const supabase = await getSupabaseServer();
    const { data: orderData, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(additionalData?.estimatedReadyTime && { estimated_ready_time: additionalData.estimatedReadyTime }),
        ...(additionalData?.completionTime && { completed_at: additionalData.completionTime })
      })
      .eq('id', orderId)
      .select(`
        *,
        profiles:user_id(email, full_name)
      `)
      .single();

    if (updateError) {
      console.error('❌ Failed to update order status:', updateError);
      return false;
    }

    // Send PWA push notification (if user has app installed)
    const pushSent = await sendPWAPushNotification({
      orderId: orderData.id,
      status: newStatus,
      userEmail: orderData.profiles?.email || '',
      ...additionalData
    });

    console.log(`✅ Order ${orderId} status updated. PWA Push: ${pushSent ? '✅' : '❌'}`);
    return true;

  } catch (error) {
    console.error('❌ Failed to update order status:', error);
    return false;
  }
}

/**
 * Send PWA push notification for order status updates
 * Only sends if user has PWA installed and push notifications enabled
 */
export async function sendPWAPushNotification(data: OrderStatusUpdate): Promise<boolean> {
  try {
    // For now, this is a placeholder for future PWA push notification implementation
    // TODO: Implement actual Web Push API integration
    
    const statusMessages = {
      received: `✅ Order #${data.orderId} received! We're getting started.`,
      making: `🍕 Your order #${data.orderId} is being prepared by our chefs!${data.estimatedReadyTime ? ` Ready in ${data.estimatedReadyTime}` : ''}`,
      ready: `🎉 Order #${data.orderId} is ready for collection!`,
      completed: `✅ Order #${data.orderId} completed! Thank you for choosing Little Latte Lane!`,
      cancelled: `❌ Order #${data.orderId} has been cancelled. Contact us if you have questions.`
    };

    console.log('📱 PWA Push Notification (Development Mode):', {
      title: 'Little Latte Lane',
      body: statusMessages[data.status],
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {
        orderId: data.orderId,
        status: data.status,
        url: `/account#orders`
      }
    });

    // TODO: Implement actual push notification sending
    // This would require:
    // 1. User permission for push notifications
    // 2. Storing push subscription in database
    // 3. Using Web Push API to send notifications
    
    return true;

  } catch (error) {
    console.error('❌ Failed to send PWA push notification:', error);
    return false;
  }
}

/**
 * Get order status display information for UI
 */
export function getOrderStatusDisplay(status: SimpleOrderStatus): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  const statusConfig = {
    received: {
      label: 'Order Received',
      color: 'bg-blue-500',
      icon: '📝',
      description: 'Your order has been received and confirmed'
    },
    making: {
      label: 'Being Prepared',
      color: 'bg-orange-500',
      icon: '🍕',
      description: 'Our chefs are preparing your order'
    },
    ready: {
      label: 'Ready for Collection',
      color: 'bg-green-500',
      icon: '🎉',
      description: 'Your order is ready for pickup or delivery'
    },
    completed: {
      label: 'Completed',
      color: 'bg-gray-500',
      icon: '✅',
      description: 'Order completed - Thank you!'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-500',
      icon: '❌',
      description: 'This order has been cancelled'
    }
  };

  return statusConfig[status] || statusConfig.received;
}

/**
 * Get order progress percentage for progress bar
 */
export function getOrderProgress(status: SimpleOrderStatus): number {
  const progressMap = {
    received: 25,
    making: 50,
    ready: 75,
    completed: 100,
    cancelled: 0
  };

  return progressMap[status] || 0;
}
