/**
 * Order Status Update Service
 * Handles order status changes and       items: [], // TODO: Fix when order_items schema is updated
      // items: orderData.order_items?.map((item: {
      //   quantity: number;
      //   unit_price: number;
      //   menu_items?: { name: string } | null;
      // }) => ({
      //   name: item.menu_items?.name || 'Unknown Item',
      //   quantity: item.quantity,
      //   price: item.unit_price,
      // })) || [],ropriate notifications
 */

import { sendOrderConfirmationEmail } from './notifications';
import { getSupabaseServer } from './supabase-server';

export interface OrderStatusUpdateData {
  orderId: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  userEmail: string;
  userName?: string;
  estimatedReadyTime?: string;
  completionTime?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryType: string;
}

/**
 * Update order status and send appropriate notifications
 */
export async function updateOrderStatusWithNotifications(
  orderId: string,
  newStatus: OrderStatusUpdateData['status'],
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
        profiles:user_id(email, full_name),
        order_items(
          quantity,
          unit_price,
          menu_items(name)
        )
      `)
      .single();

    if (updateError) {
      console.error('❌ Failed to update order status:', updateError);
      return false;
    }

    // Prepare notification data
    const notificationData: OrderStatusUpdateData = {
      orderId: orderData.id,
      status: newStatus,
      userEmail: orderData.profiles?.email || '',
      userName: orderData.profiles?.full_name || '',
      total: orderData.total_amount || 0,
      deliveryType: orderData.delivery_method || 'pickup',
      items: [], // TODO: Fix when order_items schema is updated
      // items: orderData.order_items?.map((item: {
      //   quantity: number;
      //   unit_price: number;
      //   menu_items?: { name: string } | null;
      // }) => ({
      //   name: item.menu_items?.name || 'Unknown Item',
      //   quantity: item.quantity,
      //   price: item.unit_price
      // })) || [],
      ...additionalData
    };

    // Send appropriate notification based on status
    let emailSent = false;
    let pushSent = false;

    switch (newStatus) {
      case 'confirmed':
        emailSent = await sendOrderConfirmationEmail(notificationData);
        pushSent = await sendPushNotification(notificationData, 'confirmed');
        break;
        
      case 'preparing':
        emailSent = await sendOrderPreparingEmail(notificationData);
        pushSent = await sendPushNotification(notificationData, 'preparing');
        break;
        
      case 'ready':
        emailSent = await sendOrderReadyEmail(notificationData);
        pushSent = await sendPushNotification(notificationData, 'ready');
        break;
        
      case 'completed':
        emailSent = await sendOrderCompletedEmail(notificationData);
        pushSent = await sendPushNotification(notificationData, 'completed');
        break;
        
      case 'cancelled':
        emailSent = await sendOrderCancelledEmail(notificationData);
        pushSent = await sendPushNotification(notificationData, 'cancelled');
        break;
    }

    console.log(`✅ Order ${orderId} status updated. Email: ${emailSent ? '✅' : '❌'}, Push: ${pushSent ? '✅' : '❌'}`);
    return true;

  } catch (error) {
    console.error('❌ Failed to update order status with notifications:', error);
    return false;
  }
}

/**
 * Send order preparing notification
 */
export async function sendOrderPreparingEmail(data: OrderStatusUpdateData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Order Preparing Email (Development Mode):', data);
      return true;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Little Latte Lane <${process.env.ORDERS_EMAIL || 'orders@littlelattelane.co.za'}>`,
        to: data.userEmail,
        subject: `🍕 Your Order #${data.orderId} is Being Prepared!`,
        html: generateOrderPreparingHTML(data),
      }),
    });

    const success = response.ok;
    console.log(`📧 Order preparing email ${success ? 'sent' : 'failed'} for order ${data.orderId}`);
    return success;

  } catch (error) {
    console.error('❌ Failed to send order preparing email:', error);
    return false;
  }
}

/**
 * Send order ready notification
 */
export async function sendOrderReadyEmail(data: OrderStatusUpdateData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Order Ready Email (Development Mode):', data);
      return true;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Little Latte Lane <${process.env.ORDERS_EMAIL || 'orders@littlelattelane.co.za'}>`,
        to: data.userEmail,
        subject: `🎉 Your Order #${data.orderId} is Ready for ${data.deliveryType === 'delivery' ? 'Delivery' : 'Collection'}!`,
        html: generateOrderReadyHTML(data),
      }),
    });

    const success = response.ok;
    console.log(`📧 Order ready email ${success ? 'sent' : 'failed'} for order ${data.orderId}`);
    return success;

  } catch (error) {
    console.error('❌ Failed to send order ready email:', error);
    return false;
  }
}

/**
 * Send order completed notification
 */
export async function sendOrderCompletedEmail(data: OrderStatusUpdateData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Order Completed Email (Development Mode):', data);
      return true;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Little Latte Lane <${process.env.ORDERS_EMAIL || 'orders@littlelattelane.co.za'}>`,
        to: data.userEmail,
        subject: `✅ Order #${data.orderId} Complete - Thank You!`,
        html: generateOrderCompletedHTML(data),
      }),
    });

    const success = response.ok;
    console.log(`📧 Order completed email ${success ? 'sent' : 'failed'} for order ${data.orderId}`);
    return success;

  } catch (error) {
    console.error('❌ Failed to send order completed email:', error);
    return false;
  }
}

/**
 * Send order cancelled notification
 */
export async function sendOrderCancelledEmail(data: OrderStatusUpdateData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Order Cancelled Email (Development Mode):', data);
      return true;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Little Latte Lane <${process.env.ORDERS_EMAIL || 'orders@littlelattelane.co.za'}>`,
        to: data.userEmail,
        subject: `❌ Order #${data.orderId} Cancelled`,
        html: generateOrderCancelledHTML(data),
      }),
    });

    const success = response.ok;
    console.log(`📧 Order cancelled email ${success ? 'sent' : 'failed'} for order ${data.orderId}`);
    return success;

  } catch (error) {
    console.error('❌ Failed to send order cancelled email:', error);
    return false;
  }
}

/**
 * Send PWA push notification
 */
export async function sendPushNotification(
  data: OrderStatusUpdateData,
  type: 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
): Promise<boolean> {
  try {
    // Future: Implement actual push notifications using service worker
    // For now, log the notification that would be sent
    
    const messages = {
      confirmed: `✅ Order #${data.orderId} confirmed! We're preparing your delicious meal.`,
      preparing: `🍕 Your order #${data.orderId} is being prepared by our chefs!${data.estimatedReadyTime ? ` Ready in ${data.estimatedReadyTime}` : ''}`,
      ready: `🎉 Order #${data.orderId} is ready for ${data.deliveryType === 'delivery' ? 'delivery' : 'collection'}!`,
      completed: `✅ Order #${data.orderId} completed! Thank you for choosing Little Latte Lane!`,
      cancelled: `❌ Order #${data.orderId} has been cancelled. Contact us if you have questions.`
    };

    console.log('📱 PWA Push Notification (Development Mode):', {
      title: 'Little Latte Lane',
      body: messages[type],
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {
        orderId: data.orderId,
        status: data.status,
        url: `/orders/${data.orderId}`
      }
    });

    // TODO: Implement actual push notification sending
    // This would require setting up a push notification service
    // and storing user push subscriptions in the database

    return true;

  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
    return false;
  }
}

/**
 * HTML template for order preparing email
 */
function generateOrderPreparingHTML(data: OrderStatusUpdateData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Being Prepared</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
    <h1 style="color: #8B4513; text-align: center;">🍕 Little Latte Lane</h1>
    <h2 style="color: #333; text-align: center;">Your Order is Being Prepared!</h2>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <h3 style="margin: 0; font-size: 24px;">🔥 Kitchen Update</h3>
      <p style="margin: 10px 0; font-size: 18px;">Our chefs are now preparing your delicious order!</p>
      <p style="margin: 0; font-size: 16px; opacity: 0.9;">Order #${data.orderId}</p>
    </div>
    
    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Estimated Ready Time:</strong> ${data.estimatedReadyTime || 'We\'ll notify you when ready'}</p>
      <p><strong>Order Type:</strong> ${data.deliveryType === 'delivery' ? 'Delivery' : 'Collection'}</p>
      <p><strong>Total Amount:</strong> R${data.total.toFixed(2)}</p>
    </div>
    
    <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>What happens next?</strong></p>
      <p style="margin: 5px 0;">• Our chefs are carefully preparing your order</p>
      <p style="margin: 5px 0;">• You'll receive another notification when it's ready</p>
      <p style="margin: 5px 0;">• ${data.deliveryType === 'delivery' ? 'Our delivery team will be in touch' : 'Come collect when ready'}</p>
    </div>
    
    <p style="text-align: center; margin-top: 30px;">
      <a href="https://littlelattelane.co.za/orders/${data.orderId}" 
         style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Track Your Order
      </a>
    </p>
    
    <p style="text-align: center; color: #666; margin-top: 20px;">
      Thank you for your patience! Great food takes time. 🍽️
    </p>
  </div>
</body>
</html>
`;
}

/**
 * HTML template for order ready email
 */
function generateOrderReadyHTML(data: OrderStatusUpdateData): string {
  const isDelivery = data.deliveryType === 'delivery';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Ready</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
    <h1 style="color: #8B4513; text-align: center;">🎉 Little Latte Lane</h1>
    <h2 style="color: #333; text-align: center;">Your Order is Ready!</h2>
    
    <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <h3 style="margin: 0; font-size: 24px;">✅ Order Complete</h3>
      <p style="margin: 10px 0; font-size: 18px;">Your delicious meal is ready for ${isDelivery ? 'delivery' : 'collection'}!</p>
      <p style="margin: 0; font-size: 16px; opacity: 0.9;">Order #${data.orderId}</p>
    </div>
    
    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Ready Time:</strong> ${new Date().toLocaleTimeString()}</p>
      <p><strong>Collection/Delivery:</strong> ${isDelivery ? 'Our driver will deliver to you shortly' : 'Ready for collection now'}</p>
      <p><strong>Total Amount:</strong> R${data.total.toFixed(2)}</p>
    </div>
    
    ${isDelivery ? `
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>🚗 Delivery Information:</strong></p>
      <p style="margin: 5px 0;">Our delivery driver will be with you shortly. Please have your order number ready.</p>
    </div>
    ` : `
    <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>📍 Collection Information:</strong></p>
      <p style="margin: 5px 0;">Please come to Little Latte Lane to collect your order. Bring your order number: <strong>#${data.orderId}</strong></p>
    </div>
    `}
    
    <p style="text-align: center; margin-top: 30px;">
      <a href="https://littlelattelane.co.za/orders/${data.orderId}" 
         style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Order Details
      </a>
    </p>
    
    <p style="text-align: center; color: #666; margin-top: 20px;">
      Thank you for choosing Little Latte Lane! Enjoy your meal! 🍽️❤️
    </p>
  </div>
</body>
</html>
`;
}

/**
 * HTML template for order completed email
 */
function generateOrderCompletedHTML(data: OrderStatusUpdateData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Completed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
    <h1 style="color: #8B4513; text-align: center;">❤️ Little Latte Lane</h1>
    <h2 style="color: #333; text-align: center;">Thank You!</h2>
    
    <div style="background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <h3 style="margin: 0; font-size: 24px;">🎉 Order Completed</h3>
      <p style="margin: 10px 0; font-size: 18px;">We hope you enjoyed your meal!</p>
      <p style="margin: 0; font-size: 16px; opacity: 0.9;">Order #${data.orderId}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 18px; color: #333;">How was your experience?</p>
      <p style="margin: 20px 0;">
        <a href="https://littlelattelane.co.za/feedback?order=${data.orderId}" 
           style="background: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
          Leave a Review
        </a>
        <a href="https://littlelattelane.co.za/menu" 
           style="background: #4ECDC4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
          Order Again
        </a>
      </p>
    </div>
    
    <div style="background: #f0f8ff; border: 1px solid #b6d7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0; text-align: center;"><strong>💡 Did you know?</strong></p>
      <p style="margin: 10px 0; text-align: center;">You can install our app for faster ordering and exclusive deals!</p>
      <p style="text-align: center;">
        <a href="https://littlelattelane.co.za?pwa=true" style="color: #0066cc;">Install App Now</a>
      </p>
    </div>
    
    <p style="text-align: center; color: #666; margin-top: 30px;">
      Thank you for being part of the Little Latte Lane family! 🍽️❤️
    </p>
  </div>
</body>
</html>
`;
}

/**
 * HTML template for order cancelled email
 */
function generateOrderCancelledHTML(data: OrderStatusUpdateData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Cancelled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
    <h1 style="color: #8B4513; text-align: center;">Little Latte Lane</h1>
    <h2 style="color: #333; text-align: center;">Order Cancelled</h2>
    
    <div style="background: #ffebee; border: 1px solid #ffcdd2; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <h3 style="margin: 0; font-size: 24px; color: #d32f2f;">❌ Order Cancelled</h3>
      <p style="margin: 10px 0; font-size: 16px; color: #666;">Order #${data.orderId} has been cancelled</p>
    </div>
    
    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Cancelled Amount:</strong> R${data.total.toFixed(2)}</p>
      <p><strong>Refund:</strong> If payment was processed, refunds will be issued within 2-3 business days</p>
    </div>
    
    <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>What happens next?</strong></p>
      <p style="margin: 5px 0;">• Any charges will be refunded automatically</p>
      <p style="margin: 5px 0;">• You'll receive a refund confirmation email</p>
      <p style="margin: 5px 0;">• Contact us if you have any questions</p>
    </div>
    
    <p style="text-align: center; margin-top: 30px;">
      <a href="https://littlelattelane.co.za/menu" 
         style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
        Order Again
      </a>
      <a href="https://littlelattelane.co.za/contact" 
         style="background: #666; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
        Contact Us
      </a>
    </p>
    
    <p style="text-align: center; color: #666; margin-top: 30px;">
      We're sorry for any inconvenience. We hope to serve you again soon! 🍽️
    </p>
  </div>
</body>
</html>
`;
}
