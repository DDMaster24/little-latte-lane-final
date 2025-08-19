import { NextRequest, NextResponse } from 'next/server';
import { payfast } from '@/lib/payfast';
import { supabaseServer } from '@/lib/supabaseServer';
import { confirmPaymentAndDecrementStock } from '@/lib/orderActions';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 PayFast notification received');
    
    // Get form data from PayFast notification
    const formData = await request.formData();
    const notificationData: Record<string, string> = {};

    // Convert form data to object
    formData.forEach((value, key) => {
      notificationData[key] = value.toString();
    });

    console.log('📋 PayFast notification data:', notificationData);

    // Verify PayFast signature
    const isValidSignature = payfast.verifyNotification(notificationData);
    if (!isValidSignature) {
      console.error('❌ PayFast notification signature verification failed');
      console.error('❌ Received data:', JSON.stringify(notificationData, null, 2));
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ PayFast signature verified successfully');

    // Additional security: verify IP (optional)
    const xff = request.headers.get('x-forwarded-for');
    const requestIP = xff ? xff.split(',')[0].trim() : null;
    console.log('📍 Request IP:', requestIP);
    
    if (requestIP && !payfast.isValidPayFastIP(requestIP)) {
      console.warn('⚠️ PayFast notification from unverified IP:', requestIP);
      // Note: Not blocking on IP validation as it can be unreliable in production
    }

    const {
      payment_status,
      m_payment_id,
      pf_payment_id,
      custom_int1: orderIdString,
      custom_str1: userId,
      amount_gross,
    } = notificationData;

    console.log('💰 Payment details:', {
      payment_status,
      m_payment_id,
      pf_payment_id,
      orderIdString,
      userId,
      amount_gross
    });

    // Validate that we have an order ID
    if (!orderIdString) {
      console.error('❌ No order ID found in PayFast notification');
      return NextResponse.json({ error: 'No order ID provided' }, { status: 400 });
    }

    const orderId = orderIdString; // Keep as string since database uses string IDs

    if (payment_status === 'COMPLETE') {
      console.log('✅ Payment completed for order:', orderId);
      
      // Update order status in database
      const { error: orderError } = await supabaseServer
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('❌ Error updating order:', orderError);
        return NextResponse.json(
          { error: 'Database update failed', details: orderError.message },
          { status: 500 }
        );
      }

      console.log('✅ Order status updated successfully');

      // Decrement stock now that payment is confirmed
      try {
        const stockResult = await confirmPaymentAndDecrementStock(orderId);
        if (!stockResult.success) {
          console.error('⚠️ Stock decrement failed:', stockResult.error);
          // Don't fail the whole process for stock issues
        } else {
          console.log('✅ Stock decremented successfully');
        }
      } catch (stockError) {
        console.error('⚠️ Stock decrement error:', stockError);
        // Don't fail the whole process for stock issues
      }

      // Get user details for confirmation (optional)
      try {
        const { data: profile } = await supabaseServer
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();

        console.log('👤 User profile found:', profile?.full_name);

        // Log payment completion for admin records
        console.log('📝 Payment completed:', {
          orderId,
          userId,
          userEmail: profile?.email,
          amount: amount_gross,
          paymentId: pf_payment_id,
          merchantPaymentId: m_payment_id
        });

      } catch (profileError) {
        console.warn('⚠️ Could not fetch user profile:', profileError);
        // Don't fail for profile fetch issues
      }

      console.log('🎉 Payment processing completed successfully for order:', orderId);
      
    } else {
      console.log('❌ Payment failed/cancelled for order:', orderId, 'Status:', payment_status);
      
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
        console.error('❌ Error updating failed order:', orderError);
      } else {
        console.log('✅ Failed order status updated');
      }
    }

    // Return 200 OK to PayFast
    console.log('✅ Sending OK response to PayFast');
    return NextResponse.json({ message: 'OK' }, { status: 200 });
    
  } catch (error) {
    console.error('💥 PayFast notification processing error:', error);
    return NextResponse.json({ 
      error: 'Processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
