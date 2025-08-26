/**
 * Yoco API Explorer - Step by Step
 * Let's find your webhook settings together and test API access
 */

require('dotenv').config({ path: '.env.local' });

const exploreYocoAPI = async () => {
  console.log('🔍 Little Latte Lane - Yoco API Explorer\n');
  console.log('Let\'s check what your current Yoco API can access...\n');
  
  // First, let's check what credentials we have
  console.log('📋 CHECKING YOUR CURRENT YOCO SETUP:');
  console.log('='.repeat(50));
  
  // Read environment to see what we have
  const testPublicKey = process.env.YOCO_PUBLIC_KEY || 'Not found';
  const testSecretKey = process.env.YOCO_SECRET_KEY || 'Not found';
  const testMode = process.env.NEXT_PUBLIC_YOCO_TEST_MODE || 'Not found';
  
  console.log(`🔑 Public Key: ${testPublicKey.substring(0, 20)}...`);
  console.log(`🔐 Secret Key: ${testSecretKey.substring(0, 20)}...`);
  console.log(`🧪 Test Mode: ${testMode}`);
  console.log('');
  
  if (testSecretKey.includes('test')) {
    console.log('✅ You have TEST credentials - this is good for learning!');
    console.log('⚠️ You\'ll need LIVE credentials for real payments later');
  } else if (testSecretKey.includes('live')) {
    console.log('✅ You have LIVE credentials - be careful with testing!');
  } else {
    console.log('❌ No valid Yoco credentials found');
    console.log('Please check your .env.local file');
    return;
  }
  
  console.log('\n📡 TESTING YOCO API ACCESS:');
  console.log('='.repeat(50));
  
  // Test 1: Try to access Yoco API directly
  try {
    console.log('1️⃣ Testing webhook API access...');
    
    const response = await fetch('https://payments.yoco.com/api/webhooks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testSecretKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API access successful!');
      console.log(`   📊 Response: ${JSON.stringify(data, null, 2)}`);
      
      if (data.webhooks && data.webhooks.length > 0) {
        console.log('\n🎉 FOUND EXISTING WEBHOOKS:');
        data.webhooks.forEach((webhook, index) => {
          console.log(`   ${index + 1}. URL: ${webhook.url}`);
          console.log(`      ID: ${webhook.id}`);
          console.log(`      Status: ${webhook.status}`);
          console.log(`      Secret: ${webhook.secret ? 'Present' : 'Not shown'}`);
        });
      } else {
        console.log('   📭 No webhooks found - you need to create one');
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ API access failed`);
      console.log(`   Error details: ${errorText}`);
      
      if (response.status === 401) {
        console.log('   🔍 This means: Invalid API key or permissions');
      } else if (response.status === 404) {
        console.log('   🔍 This means: Webhooks API not available for your account type');
      }
    }
  } catch (error) {
    console.log(`   ❌ API connection failed: ${error.message}`);
  }
  
  console.log('\n🎯 WHAT THIS MEANS:');
  console.log('='.repeat(50));
  
  console.log('If API access worked:');
  console.log('• You can create webhooks programmatically');
  console.log('• We can register your webhook automatically');
  console.log('');
  console.log('If API access failed:');
  console.log('• You need to use the Yoco portal manually');
  console.log('• Let\'s find the right section together');
  
  console.log('\n� FINDING WEBHOOKS IN YOCO PORTAL:');
  console.log('='.repeat(50));
  
  console.log('Based on what you described, try these exact steps:');
  console.log('');
  console.log('🔍 Method 1 - Through Your Current Path:');
  console.log('1. Go to: https://portal.yoco.com/');
  console.log('2. Click "Payment Gateways" (as you found)');
  console.log('3. Click "API" button');
  console.log('4. Look for "Webhook Management" or "Webhook Settings"');
  console.log('5. NOT the documentation - look for a settings panel');
  console.log('');
  console.log('🔍 Method 2 - Main Navigation:');
  console.log('1. Look for "Settings" or "Developer" in main menu');
  console.log('2. Look for "Webhooks", "API", or "Integrations"');
  console.log('3. Look for "Notifications" or "Events"');
  console.log('');
  console.log('� Method 3 - Account Level:');
  console.log('1. Click your account/profile name');
  console.log('2. Look for "Developer Settings"');
  console.log('3. Look for "API Configuration"');
  
  console.log('\n🛠️ IF YOU STILL CAN\'T FIND WEBHOOK SETTINGS:');
  console.log('='.repeat(50));
  
  console.log('Don\'t worry! We have alternatives:');
  console.log('');
  console.log('Option 1: Contact Yoco Support');
  console.log('• Ask them: "How do I set up webhooks for payment notifications?"');
  console.log('• Tell them you need to register this URL:');
  console.log('  https://www.littlelattelane.co.za/api/yoco/webhook');
  console.log('');
  console.log('Option 2: Skip Webhooks for Now');
  console.log('• Your payments will work without webhooks');
  console.log('• Orders just won\'t auto-update (you can update manually)');
  console.log('• You can add webhooks later');
  console.log('');
  console.log('Option 3: Alternative Integration');
  console.log('• Use Yoco\'s status polling instead of webhooks');
  console.log('• Check payment status periodically');
  
  return testSecretKey;
};

// Try to create a webhook via API if possible
const tryCreateWebhook = async (secretKey) => {
  console.log('\n🔧 ATTEMPTING TO CREATE WEBHOOK VIA API:');
  console.log('='.repeat(50));
  
  if (!secretKey || secretKey === 'Not found') {
    console.log('❌ No secret key found - skipping API creation');
    return;
  }
  
  try {
    const webhookData = {
      url: 'https://www.littlelattelane.co.za/api/yoco/webhook',
      events: ['payment.succeeded', 'payment.failed']
    };
    
    console.log('📤 Sending webhook creation request...');
    console.log(`Data: ${JSON.stringify(webhookData, null, 2)}`);
    
    const response = await fetch('https://payments.yoco.com/api/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('🎉 WEBHOOK CREATED SUCCESSFULLY!');
      console.log('📊 Webhook details:');
      console.log(`   ID: ${result.id}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Secret: ${result.secret}`);
      console.log(`   Events: ${result.events?.join(', ')}`);
      console.log('');
      console.log('🔐 IMPORTANT: Copy this secret NOW:');
      console.log(`YOCO_WEBHOOK_SECRET=${result.secret}`);
      console.log('');
      console.log('Add this to your Vercel environment variables!');
      return result;
    } else {
      const errorText = await response.text();
      console.log(`❌ Webhook creation failed`);
      console.log(`Error: ${errorText}`);
      console.log('');
      console.log('This means you need to create it manually in the portal.');
    }
  } catch (error) {
    console.log(`❌ Webhook creation error: ${error.message}`);
    console.log('We\'ll need to use the manual method.');
  }
};

// Main function
const main = async () => {
  const secretKey = await exploreYocoAPI();
  
  if (secretKey && secretKey !== 'Not found') {
    await tryCreateWebhook(secretKey);
  }
  
  console.log('\n📞 NEED HELP FINDING WEBHOOK SETTINGS?');
  console.log('='.repeat(50));
  console.log('Tell me exactly what you see when you:');
  console.log('1. Go to https://portal.yoco.com/');
  console.log('2. Click "Payment Gateways"');
  console.log('3. Click "API"');
  console.log('');
  console.log('Describe the page that opens - what buttons/links do you see?');
  console.log('We\'ll figure this out together step by step! 💪');
  
  console.log('\n🚀 ALTERNATIVE: SKIP WEBHOOKS FOR NOW');
  console.log('='.repeat(50));
  console.log('If you can\'t find webhook settings, we can:');
  console.log('1. Set up live payments without webhooks');
  console.log('2. Orders will work but need manual status updates');
  console.log('3. Add webhooks later when you find the settings');
  console.log('4. Your customers can still pay successfully!');
};

main().catch(console.error);
