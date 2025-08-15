/**
 * Test script for the notification system
 * Run with: npm run test:notifications
 */
import { sendOrderConfirmationEmail, sendBookingConfirmationEmail } from '../src/lib/notifications.js';

const testOrder = {
  id: 'test-order-123',
  total_amount: 125.50,
  phone_number: '+27821234567',
  items: [
    { name: 'Cappuccino', quantity: 2, price: 35.00 },
    { name: 'Grilled Chicken Sandwich', quantity: 1, price: 85.00 }
  ]
};

const testBooking = {
  id: 'test-booking-456',
  date: '2024-01-15',
  time: '19:00',
  party_size: 4,
  phone_number: '+27821234567',
  special_requests: 'Window seat please'
};

async function testNotifications() {
  console.log('🧪 Testing notification system...\n');

  try {
    console.log('📧 Testing order confirmation email...');
    const orderResult = await sendOrderConfirmationEmail(
      'test@example.com',
      'John Doe',
      testOrder
    );
    console.log('✅ Order email result:', orderResult);
  } catch (error) {
    console.error('❌ Order email failed:', error);
  }

  try {
    console.log('\n📧 Testing booking confirmation email...');
    const bookingResult = await sendBookingConfirmationEmail(
      'test@example.com',
      'Jane Doe',
      testBooking
    );
    console.log('✅ Booking email result:', bookingResult);
  } catch (error) {
    console.error('❌ Booking email failed:', error);
  }

  console.log('\n🏁 Test completed!');
}

// Run the test
testNotifications().catch(console.error);
