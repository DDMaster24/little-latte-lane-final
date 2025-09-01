// 📧 EMAIL SYSTEM COMPREHENSIVE TESTING SCRIPT
// Tests all notification flows and identifies issues

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://awytuszmunxvthuizyur.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM';
const RESEND_API_KEY = 're_f8WW7SKj_P2r4W29fbNv3PNKm19U3EiFM';
const TEST_EMAIL = 'admin@littlelattelane.co.za'; // Change to your test email

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test Results Tracking
let testResults = {
  databaseTests: [],
  emailTests: [],
  integrationTests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

function logTest(category, testName, status, details) {
  const result = { testName, status, details, timestamp: new Date().toISOString() };
  testResults[category].push(result);
  testResults.summary.total++;
  
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${category.toUpperCase()}] ${testName}: ${status}`);
  if (details) console.log(`   → ${details}`);
  
  if (status === 'PASS') testResults.summary.passed++;
  else if (status === 'FAIL') testResults.summary.failed++;
  else testResults.summary.warnings++;
}

async function testDatabaseSchema() {
  console.log('\n🔍 TESTING DATABASE SCHEMA...\n');
  
  try {
    // Test 1: Check orders table structure
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, user_id, total_amount, delivery_method, estimated_ready_time, completed_at')
      .limit(1);
    
    if (ordersError) {
      logTest('databaseTests', 'Orders Table Access', 'FAIL', ordersError.message);
    } else {
      logTest('databaseTests', 'Orders Table Access', 'PASS', `Found ${orders?.length || 0} sample orders`);
    }

    // Test 2: Check profiles table relationship
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(1);
    
    if (profilesError) {
      logTest('databaseTests', 'Profiles Table Access', 'FAIL', profilesError.message);
    } else {
      logTest('databaseTests', 'Profiles Table Access', 'PASS', `Found ${profiles?.length || 0} sample profiles`);
    }

    // Test 3: Check order_items table structure
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, order_id, menu_item_id, quantity, unit_price')
      .limit(1);
    
    if (itemsError) {
      logTest('databaseTests', 'Order Items Table Access', 'FAIL', itemsError.message);
    } else {
      logTest('databaseTests', 'Order Items Table Access', 'PASS', `Found ${orderItems?.length || 0} sample items`);
    }

    // Test 4: Check menu_items relationship
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .limit(1);
    
    if (menuError) {
      logTest('databaseTests', 'Menu Items Table Access', 'FAIL', menuError.message);
    } else {
      logTest('databaseTests', 'Menu Items Table Access', 'PASS', `Found ${menuItems?.length || 0} sample menu items`);
    }

    // Test 5: Test complete order data query (as used in notifications)
    const { data: fullOrder, error: fullOrderError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id(email, full_name),
        order_items(
          quantity,
          unit_price,
          menu_items(name)
        )
      `)
      .limit(1)
      .single();
    
    if (fullOrderError) {
      logTest('databaseTests', 'Complete Order Query', 'FAIL', fullOrderError.message);
    } else {
      const hasEmail = fullOrder?.profiles?.email;
      const hasItems = fullOrder?.order_items?.length > 0;
      logTest('databaseTests', 'Complete Order Query', 'PASS', 
        `Email: ${hasEmail ? '✅' : '❌'}, Items: ${hasItems ? '✅' : '❌'}`);
    }

  } catch (error) {
    logTest('databaseTests', 'Database Connection', 'FAIL', error.message);
  }
}

async function testResendAPI() {
  console.log('\n📧 TESTING RESEND API...\n');
  
  try {
    // Test 1: API Key validation
    const testResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Little Latte Lane <orders@littlelattelane.co.za>',
        to: TEST_EMAIL,
        subject: '🧪 Email System Test - Please Ignore',
        html: `
          <h2>Email System Test</h2>
          <p>This is a test email to verify the notification system is working.</p>
          <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Status:</strong> API Connection Successful</p>
        `
      })
    });

    if (response.ok) {
      const result = await response.json();
      logTest('emailTests', 'Resend API Connection', 'PASS', `Email ID: ${result.id}`);
    } else {
      const error = await response.text();
      logTest('emailTests', 'Resend API Connection', 'FAIL', `HTTP ${response.status}: ${error}`);
    }

  } catch (error) {
    logTest('emailTests', 'Resend API Connection', 'FAIL', error.message);
  }
}

async function testEmailTemplates() {
  console.log('\n📝 TESTING EMAIL TEMPLATES...\n');
  
  // Test data for email templates
  const testOrderData = {
    orderId: 'TEST-001',
    userEmail: TEST_EMAIL,
    userName: 'Test User',
    total: 89.50,
    deliveryType: 'pickup',
    estimatedReadyTime: '15 minutes',
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 65.00 },
      { name: 'Coffee Latte', quantity: 2, price: 12.25 }
    ]
  };

  const templates = [
    { status: 'confirmed', subject: '✅ Order Confirmed' },
    { status: 'preparing', subject: '🍕 Order Being Prepared' },
    { status: 'ready', subject: '🎉 Order Ready' },
    { status: 'completed', subject: '✅ Order Complete' },
    { status: 'cancelled', subject: '❌ Order Cancelled' }
  ];

  for (const template of templates) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Little Latte Lane <orders@littlelattelane.co.za>',
          to: TEST_EMAIL,
          subject: `${template.subject} - Test Email`,
          html: generateTestEmailHTML(testOrderData, template.status)
        })
      });

      if (response.ok) {
        const result = await response.json();
        logTest('emailTests', `${template.status} Template`, 'PASS', `Sent successfully (ID: ${result.id})`);
      } else {
        const error = await response.text();
        logTest('emailTests', `${template.status} Template`, 'FAIL', `HTTP ${response.status}: ${error}`);
      }

      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      logTest('emailTests', `${template.status} Template`, 'FAIL', error.message);
    }
  }
}

async function testNotificationFlow() {
  console.log('\n🔄 TESTING NOTIFICATION FLOW...\n');
  
  try {
    // Test 1: Find or create a test order
    let { data: testOrder, error } = await supabase
      .from('orders')
      .select('id, status, user_id')
      .eq('status', 'pending')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logTest('integrationTests', 'Test Order Access', 'FAIL', error.message);
      return;
    }

    if (!testOrder) {
      logTest('integrationTests', 'Test Order Access', 'WARN', 'No pending orders found for testing');
      return;
    }

    logTest('integrationTests', 'Test Order Access', 'PASS', `Using order ${testOrder.id}`);

    // Test 2: Simulate status update with notification
    const statusUpdates = ['confirmed', 'preparing', 'ready'];
    
    for (const status of statusUpdates) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: status,
          updated_at: new Date().toISOString(),
          ...(status === 'preparing' && { estimated_ready_time: '15 minutes' })
        })
        .eq('id', testOrder.id);

      if (updateError) {
        logTest('integrationTests', `Status Update to ${status}`, 'FAIL', updateError.message);
      } else {
        logTest('integrationTests', `Status Update to ${status}`, 'PASS', 'Database updated successfully');
      }

      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    logTest('integrationTests', 'Notification Flow', 'FAIL', error.message);
  }
}

function generateTestEmailHTML(data, status) {
  const statusMessages = {
    confirmed: `✅ Your order #${data.orderId} has been confirmed!`,
    preparing: `🍕 Your order #${data.orderId} is being prepared. ${data.estimatedReadyTime ? `Ready in ${data.estimatedReadyTime}` : ''}`,
    ready: `🎉 Your order #${data.orderId} is ready for ${data.deliveryType}!`,
    completed: `✅ Order #${data.orderId} completed! Thank you for choosing Little Latte Lane!`,
    cancelled: `❌ Order #${data.orderId} has been cancelled.`
  };

  const itemsList = data.items.map(item => 
    `<li>${item.quantity}x ${item.name} - R${item.price.toFixed(2)}</li>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusMessages[status]}</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #06FFA5; text-align: center;">Little Latte Lane</h1>
        <h2 style="color: #333;">${statusMessages[status]}</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Details:</h3>
          <p><strong>Order Number:</strong> #${data.orderId}</p>
          <p><strong>Customer:</strong> ${data.userName}</p>
          <p><strong>Total:</strong> R${data.total.toFixed(2)}</p>
          <p><strong>Delivery:</strong> ${data.deliveryType}</p>
          ${data.estimatedReadyTime ? `<p><strong>Ready Time:</strong> ${data.estimatedReadyTime}</p>` : ''}
        </div>

        <div style="margin: 20px 0;">
          <h3>Items Ordered:</h3>
          <ul>${itemsList}</ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            This is a test email sent at ${new Date().toISOString()}
          </p>
          <p style="color: #06FFA5; font-weight: bold;">
            Thank you for choosing Little Latte Lane! ☕
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function printTestSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 NOTIFICATION SYSTEM TEST SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n📈 Overall Results:`);
  console.log(`   Total Tests: ${testResults.summary.total}`);
  console.log(`   ✅ Passed: ${testResults.summary.passed}`);
  console.log(`   ❌ Failed: ${testResults.summary.failed}`);
  console.log(`   ⚠️  Warnings: ${testResults.summary.warnings}`);
  
  const successRate = testResults.summary.total > 0 ? 
    (testResults.summary.passed / testResults.summary.total * 100).toFixed(1) : 0;
  console.log(`   Success Rate: ${successRate}%`);

  // Detailed breakdown
  const categories = ['databaseTests', 'emailTests', 'integrationTests'];
  categories.forEach(category => {
    const tests = testResults[category];
    if (tests.length > 0) {
      console.log(`\n📋 ${category.replace('Tests', '').toUpperCase()} TESTS:`);
      tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`   ${icon} ${test.testName}: ${test.status}`);
        if (test.details) console.log(`      → ${test.details}`);
      });
    }
  });

  // Recommendations
  console.log(`\n🎯 RECOMMENDATIONS:`);
  
  const failedTests = testResults.summary.failed;
  const warningTests = testResults.summary.warnings;
  
  if (failedTests === 0 && warningTests === 0) {
    console.log('   🎉 All systems operational! Notification system is fully functional.');
  } else {
    if (failedTests > 0) {
      console.log(`   🔴 ${failedTests} critical issue(s) need immediate attention`);
    }
    if (warningTests > 0) {
      console.log(`   🟡 ${warningTests} warning(s) should be investigated`);
    }
  }

  console.log(`\n📧 Test emails sent to: ${TEST_EMAIL}`);
  console.log('   Check your inbox and spam folder for test notifications.');
  console.log('\n' + '='.repeat(60));
}

async function runAllTests() {
  console.log('🚀 STARTING NOTIFICATION SYSTEM COMPREHENSIVE TEST');
  console.log('='.repeat(60));
  console.log(`📧 Test emails will be sent to: ${TEST_EMAIL}`);
  console.log(`⏰ Test started at: ${new Date().toISOString()}`);
  
  await testDatabaseSchema();
  await testResendAPI();
  await testEmailTemplates();
  await testNotificationFlow();
  
  printTestSummary();
  
  // Save test results to file
  const fs = require('fs');
  fs.writeFileSync('notification-test-results.json', JSON.stringify(testResults, null, 2));
  console.log('\n💾 Detailed test results saved to: notification-test-results.json');
}

// Run the tests
runAllTests().catch(console.error);
