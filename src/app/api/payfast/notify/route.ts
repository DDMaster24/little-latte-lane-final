import { NextRequest, NextResponse } from 'next/server';
import { payfast } from '@/lib/payfast';
import { supabaseServer } from '@/lib/supabaseServer';
import { confirmPaymentAndDecrementStock } from '@/lib/orderActions';
import { Resend } from 'resend';

async function sendEmail(to: string, subject: string, html: string) {
  try {
    // Only initialize Resend if API key is available and valid
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.startsWith('re_YourActual') || apiKey === 're_YourActualResendApiKey_Here') {
      console.log('Resend API key not configured, skipping email notification');
      return;
    }

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'Little Latte Lane <no-reply@yourdomain.com>', // Replace with your verified domain
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get form data from PayFast notification
    const formData = await request.formData();
    const notificationData: Record<string, string> = {};

    // Convert form data to object
    formData.forEach((value, key) => {
      notificationData[key] = value.toString();
    });

    console.log('PayFast notification received:', notificationData);

    // Verify PayFast signature
    const isValidSignature = payfast.verifyNotification(notificationData);
    if (!isValidSignature) {
      console.error('PayFast notification signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Additional security: verify IP (optional)
    const xff = request.headers.get('x-forwarded-for');
    const requestIP = xff ? xff.split(',')[0].trim() : null;
    if (requestIP && !payfast.isValidPayFastIP(requestIP)) {
      console.warn('PayFast notification from unverified IP:', requestIP);
      // Note: Not blocking on IP validation as it can be unreliable
    }

    const {
      payment_status,
      m_payment_id,
      pf_payment_id,
      payment_id,
      custom_int1: orderId,
      custom_str1: userId,
      custom_str2: deliveryType,
      custom_str4: address,
      amount_gross,
      amount_fee,
      amount_net,
    } = notificationData;

    if (payment_status === 'COMPLETE') {
      // Update order status in database
      const { error: orderError } = await supabaseServer
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: 'payfast',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
        return NextResponse.json(
          { error: 'Database update failed' },
          { status: 500 }
        );
      }

      // Create payment record
      const { error: paymentError } = await supabaseServer
        .from('payments')
        .insert([
          {
            order_id: parseInt(orderId),
            user_id: userId,
            amount: parseFloat(amount_gross),
            fee: parseFloat(amount_fee || '0'),
            net_amount: parseFloat(amount_net || amount_gross),
            status: 'completed',
            payment_method: 'payfast',
            payfast_payment_id: pf_payment_id,
            payment_id: payment_id,
            m_payment_id: m_payment_id,
            notification_data: notificationData,
            created_at: new Date().toISOString(),
          },
        ]);

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
      }

      // Decrement stock now that payment is confirmed
      const stockResult = await confirmPaymentAndDecrementStock(
        parseInt(orderId)
      );
      if (!stockResult.success) {
        console.error('Error decrementing stock:', stockResult.error);
      }

      // Get user details and send confirmation email
      const { data: profile } = await supabaseServer
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (profile?.username) {
        const emailBody = `
          <h2>Payment Confirmation - Little Latte Lane</h2>
          <p>Dear ${profile.username},</p>
          <p>Your payment has been successfully processed!</p>
          <p><strong>Order Details:</strong></p>
          <ul>
            <li>Order #: ${orderId}</li>
            <li>Amount: R${amount_gross}</li>
            <li>Payment Method: PayFast</li>
            <li>Payment ID: ${pf_payment_id}</li>
            <li>Delivery Type: ${deliveryType}</li>
            ${address ? `<li>Address: ${address}</li>` : ''}
          </ul>
          <p>Your order is now being prepared. We'll notify you when it's ready!</p>
          <p>Thank you for choosing Little Latte Lane!</p>
        `;

        await sendEmail(
          `${profile.username}@example.com`, // You may need to get actual email
          `Payment Confirmation - Order #${orderId}`,
          emailBody
        );
      }

      console.log(`Payment completed for order ${orderId}`);
    } else {
      // Handle failed/cancelled payments
      const { error: orderError } = await supabaseServer
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating failed order:', orderError);
      }

      console.log(`Payment ${payment_status} for order ${orderId}`);
    }

    // Return 200 OK to PayFast
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('PayFast notification error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
