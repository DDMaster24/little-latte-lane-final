/**
 * Send Order Status Notifications
 * Helper function to send push notifications when order status changes
 */

export interface OrderNotificationPayload {
  user_id: string;
  order_id: string;
  order_number: string;
  status: 'ready' | 'preparing' | 'completed';
  customer_name?: string;
  total_amount?: number;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  delivered?: boolean;
}

/**
 * Send push notification when order status changes
 * Handles 'ready' and future 'preparing' status notifications
 */
export async function sendOrderStatusNotification(
  payload: OrderNotificationPayload
): Promise<NotificationResponse> {
  try {
    console.log('📤 Sending order status notification:', payload);

    // Determine notification content based on status
    const notificationContent = getNotificationContent(payload);

    // Send notification via API
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: payload.user_id,
        title: notificationContent.title,
        body: notificationContent.body,
        notification_type: 'order_status',
        category: `order_${payload.status}`,
        action_url: '/account',
        data: {
          order_id: payload.order_id,
          order_number: payload.order_number,
          status: payload.status,
          timestamp: Date.now(),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Failed to send notification:', errorData);
      
      return {
        success: false,
        message: errorData.error || 'Failed to send notification',
      };
    }

    const data = await response.json();
    console.log('✅ Notification sent successfully:', data);

    return {
      success: true,
      message: 'Notification sent successfully',
      delivered: data.delivered || false,
    };
  } catch (error) {
    console.error('💥 Error sending order status notification:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unexpected error occurred',
    };
  }
}

/**
 * Get notification content based on order status
 */
function getNotificationContent(payload: OrderNotificationPayload): {
  title: string;
  body: string;
} {
  const orderNum = payload.order_number || payload.order_id.slice(0, 8);
  const customerGreeting = payload.customer_name 
    ? `${payload.customer_name.split(' ')[0]}, your` 
    : 'Your';

  switch (payload.status) {
    case 'ready':
      return {
        title: '✅ Order Ready for Pickup!',
        body: `${customerGreeting} order #${orderNum} is ready! Come collect it at Little Latte Lane.`,
      };

    case 'preparing':
      return {
        title: '👨‍🍳 Order Being Prepared',
        body: `${customerGreeting} order #${orderNum} is now being prepared by our kitchen.`,
      };

    case 'completed':
      return {
        title: '🎉 Order Completed',
        body: `Thank you! Order #${orderNum} has been completed. We hope you enjoy your meal!`,
      };

    default:
      return {
        title: '📦 Order Update',
        body: `Your order #${orderNum} has been updated.`,
      };
  }
}

/**
 * Check if user has notifications enabled
 * (Future enhancement - can be used to show UI hints)
 */
export async function checkUserNotificationStatus(
  user_id: string
): Promise<{
  enabled: boolean;
  subscription_exists: boolean;
}> {
  try {
    const response = await fetch(`/api/notifications/preferences?user_id=${user_id}`);
    
    if (!response.ok) {
      return { enabled: false, subscription_exists: false };
    }

    const data = await response.json();
    
    return {
      enabled: data.preferences?.push_enabled || false,
      subscription_exists: !!data.preferences?.push_subscription,
    };
  } catch (error) {
    console.error('Error checking notification status:', error);
    return { enabled: false, subscription_exists: false };
  }
}
