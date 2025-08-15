/**
 * Notification Service
 * Handles email and SMS notifications for orders and bookings
 */

interface OrderConfirmationData {
  orderId: number;
  total: number;
  userEmail: string;
  userName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryType: string;
  estimatedReadyTime?: string;
}

interface BookingConfirmationData {
  bookingId: number;
  userEmail: string;
  userName?: string;
  date: string;
  time: string;
  type: 'table' | 'golf' | 'event';
  numberOfPeople: number;
  confirmationCode: string;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData
): Promise<boolean> {
  try {
    // If we have email service configured, send real email
    if (process.env.RESEND_API_KEY) {
      return await sendEmailViaResend(data);
    }

    // Fallback: Log email content for development/testing
    console.log('📧 Order Confirmation Email (Development Mode):', {
      to: data.userEmail,
      subject: `Order Confirmation #${data.orderId} - Little Latte Lane`,
      content: generateOrderEmailContent(data),
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
    return false;
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  data: BookingConfirmationData
): Promise<boolean> {
  try {
    if (process.env.RESEND_API_KEY) {
      return await sendBookingEmailViaResend(data);
    }

    // Fallback: Log email content
    console.log('📧 Booking Confirmation Email (Development Mode):', {
      to: data.userEmail,
      subject: `Booking Confirmation #${data.confirmationCode} - Little Latte Lane`,
      content: generateBookingEmailContent(data),
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error);
    return false;
  }
}

/**
 * Send SMS notification (placeholder for future implementation)
 */
export async function sendOrderSMSNotification(
  phoneNumber: string,
  orderId: number,
  status: string
): Promise<boolean> {
  try {
    // Future: Implement SMS service (e.g., Twilio, AWS SNS)
    console.log('📱 SMS Notification (Development Mode):', {
      to: phoneNumber,
      message: `Little Latte Lane: Your order #${orderId} is ${status}. Track at https://littlelattlane.com/orders`,
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to send SMS notification:', error);
    return false;
  }
}

/**
 * Send email using Resend service
 */
async function sendEmailViaResend(data: OrderConfirmationData): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'orders@littlelattlane.com',
      to: data.userEmail,
      subject: `Order Confirmation #${data.orderId} - Little Latte Lane`,
      html: generateOrderEmailHTML(data),
    }),
  });

  return response.ok;
}

/**
 * Send booking email using Resend service
 */
async function sendBookingEmailViaResend(data: BookingConfirmationData): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'bookings@littlelattlane.com',
      to: data.userEmail,
      subject: `Booking Confirmation #${data.confirmationCode} - Little Latte Lane`,
      html: generateBookingEmailHTML(data),
    }),
  });

  return response.ok;
}

/**
 * Generate order email content (plain text)
 */
function generateOrderEmailContent(data: OrderConfirmationData): string {
  const itemsList = data.items
    .map(item => `  ${item.quantity}x ${item.name} - R${item.price.toFixed(2)}`)
    .join('\n');

  return `
Dear ${data.userName || 'Valued Customer'},

Thank you for your order at Little Latte Lane!

Order Details:
- Order Number: #${data.orderId}
- Total Amount: R${data.total.toFixed(2)}
- Delivery Type: ${data.deliveryType}
${data.estimatedReadyTime ? `- Estimated Ready Time: ${data.estimatedReadyTime}` : ''}

Items Ordered:
${itemsList}

You can track your order status at: https://littlelattlane.com/orders

Thank you for choosing Little Latte Lane!

Best regards,
The Little Latte Lane Team
`;
}

/**
 * Generate booking email content (plain text)
 */
function generateBookingEmailContent(data: BookingConfirmationData): string {
  return `
Dear ${data.userName || 'Valued Customer'},

Your booking at Little Latte Lane has been confirmed!

Booking Details:
- Confirmation Code: ${data.confirmationCode}
- Type: ${data.type.charAt(0).toUpperCase() + data.type.slice(1)} booking
- Date: ${data.date}
- Time: ${data.time}
- Party Size: ${data.numberOfPeople} people

Please bring this confirmation code with you when you arrive.

You can manage your booking at: https://littlelattlane.com/bookings

Thank you for choosing Little Latte Lane!

Best regards,
The Little Latte Lane Team
`;
}

/**
 * Generate order email HTML
 */
function generateOrderEmailHTML(data: OrderConfirmationData): string {
  const itemsHTML = data.items
    .map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R${item.price.toFixed(2)}</td>
      </tr>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
    <h1 style="color: #8B4513; text-align: center;">Little Latte Lane</h1>
    <h2 style="color: #333;">Order Confirmation #${data.orderId}</h2>
    
    <p>Dear ${data.userName || 'Valued Customer'},</p>
    <p>Thank you for your order! Here are your order details:</p>
    
    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Order Number:</strong> #${data.orderId}</p>
      <p><strong>Total Amount:</strong> R${data.total.toFixed(2)}</p>
      <p><strong>Delivery Type:</strong> ${data.deliveryType}</p>
      ${data.estimatedReadyTime ? `<p><strong>Estimated Ready Time:</strong> ${data.estimatedReadyTime}</p>` : ''}
    </div>
    
    <h3>Items Ordered:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #8B4513; color: white;">
        <th style="padding: 12px; text-align: left;">Item</th>
        <th style="padding: 12px; text-align: center;">Qty</th>
        <th style="padding: 12px; text-align: right;">Price</th>
      </tr>
      ${itemsHTML}
      <tr style="background: #f9f9f9; font-weight: bold;">
        <td style="padding: 12px;" colspan="2">Total:</td>
        <td style="padding: 12px; text-align: right;">R${data.total.toFixed(2)}</td>
      </tr>
    </table>
    
    <p style="margin-top: 20px;">You can track your order status at: <a href="https://littlelattlane.com/orders" style="color: #8B4513;">https://littlelattlane.com/orders</a></p>
    
    <p>Thank you for choosing Little Latte Lane!</p>
    <p>Best regards,<br>The Little Latte Lane Team</p>
  </div>
</body>
</html>
`;
}

/**
 * Generate booking email HTML
 */
function generateBookingEmailHTML(data: BookingConfirmationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
    <h1 style="color: #8B4513; text-align: center;">Little Latte Lane</h1>
    <h2 style="color: #333;">Booking Confirmation</h2>
    
    <p>Dear ${data.userName || 'Valued Customer'},</p>
    <p>Your booking at Little Latte Lane has been confirmed!</p>
    
    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Confirmation Code:</strong> ${data.confirmationCode}</p>
      <p><strong>Type:</strong> ${data.type.charAt(0).toUpperCase() + data.type.slice(1)} booking</p>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <p><strong>Party Size:</strong> ${data.numberOfPeople} people</p>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Important:</strong> Please bring this confirmation code with you when you arrive.</p>
    </div>
    
    <p>You can manage your booking at: <a href="https://littlelattlane.com/bookings" style="color: #8B4513;">https://littlelattlane.com/bookings</a></p>
    
    <p>Thank you for choosing Little Latte Lane!</p>
    <p>Best regards,<br>The Little Latte Lane Team</p>
  </div>
</body>
</html>
`;
}

/**
 * Get user contact details from database
 */
export async function getUserContactInfo(_userId: string) {
  // This would integrate with your Supabase client to fetch user details
  // For now, returning a placeholder
  return {
    email: 'customer@example.com',
    phone: '+27123456789',
    firstName: 'Valued',
    lastName: 'Customer',
  };
}
