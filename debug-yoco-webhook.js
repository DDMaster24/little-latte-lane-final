/**
 * Debug Yoco Configuration
 * Check what webhook URLs are being sent to Yoco and test connectivity
 */

require('dotenv').config({ path: '.env.local' });

async function debugYocoWebhook() {
  try {
    console.log('🔍 Debugging Yoco webhook configuration...\n');
    
    // Check environment variables
    console.log('📋 Environment Configuration:');
    console.log(`  NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL}`);
    console.log(`  VERCEL_URL: ${process.env.VERCEL_URL}`);
    console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`  YOCO_SECRET_KEY: ${process.env.YOCO_SECRET_KEY ? 'Set ✅' : 'Missing ❌'}`);
    console.log(`  YOCO_PUBLIC_KEY: ${process.env.YOCO_PUBLIC_KEY ? 'Set ✅' : 'Missing ❌'}\n`);
    
    // Generate webhook URL like the app does
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                   'https://www.littlelattelane.co.za';
    
    const webhookUrl = `${baseUrl}/api/yoco/webhook`;
    
    console.log('🌐 Generated Webhook URL:', webhookUrl);
    
    // Test if webhook endpoint is accessible
    console.log('\n🧪 Testing webhook endpoint accessibility...');
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Yoco-Webhook-Test/1.0'
        }
      });
      
      console.log(`📡 GET ${webhookUrl}`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 200)}...`);
      }
    } catch (fetchError) {
      console.log(`❌ Webhook endpoint test failed: ${fetchError.message}`);
    }
    
    // Test the test webhook endpoint
    console.log('\n🔧 Testing debug webhook endpoint...');
    const testWebhookUrl = `${baseUrl}/api/test/webhook`;
    
    try {
      const testResponse = await fetch(testWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Debug-Test/1.0'
        },
        body: JSON.stringify({
          test: true,
          type: 'debug_test',
          timestamp: new Date().toISOString()
        })
      });
      
      console.log(`📡 POST ${testWebhookUrl}`);
      console.log(`   Status: ${testResponse.status} ${testResponse.statusText}`);
      
      if (testResponse.ok) {
        const result = await testResponse.json();
        console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
      }
    } catch (testError) {
      console.log(`❌ Test webhook failed: ${testError.message}`);
    }
    
    // Test the webhook status checker
    console.log('\n📊 Checking webhook status endpoint...');
    const statusUrl = `${baseUrl}/api/admin/webhook-status`;
    
    try {
      const statusResponse = await fetch(statusUrl);
      console.log(`📡 GET ${statusUrl}`);
      console.log(`   Status: ${statusResponse.status} ${statusResponse.statusText}`);
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log(`   Stuck Orders: ${statusData.ordersChecked}`);
        console.log(`   Webhook URL: ${statusData.webhookInfo.webhookUrl}`);
      }
    } catch (statusError) {
      console.log(`❌ Status check failed: ${statusError.message}`);
    }
    
    console.log('\n💡 Recommendations:');
    console.log('1. Check if Yoco is configured to call webhook in test mode');
    console.log('2. Verify webhook URL is correctly set in Yoco dashboard');
    console.log('3. Check if Yoco requires webhook registration for test payments');
    console.log('4. Consider contacting Yoco support about webhook configuration');
    
    console.log('\n🔗 Key URLs to verify:');
    console.log(`   Main Webhook: ${webhookUrl}`);
    console.log(`   Test Webhook: ${testWebhookUrl}`);
    console.log(`   Admin Status: ${statusUrl}`);
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugYocoWebhook();
