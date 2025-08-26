#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🎯 Little Latte Lane - Yoco Webhook Registration (FIXED)\n');

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
const WEBHOOK_URL = 'https://www.littlelattelane.co.za/api/yoco/webhook';

if (!YOCO_SECRET_KEY) {
  console.error('❌ Error: YOCO_SECRET_KEY not found in .env.local');
  process.exit(1);
}

console.log('📋 WEBHOOK REGISTRATION DETAILS (CORRECTED):');
console.log('==================================================');
console.log(`🔐 Secret Key: ${YOCO_SECRET_KEY.substring(0, 15)}...`);
console.log(`🌐 Webhook URL: ${WEBHOOK_URL}`);
console.log(`📅 Event Types: payment.succeeded, payment.failed`);
console.log(`� API Endpoint: https://payments.yoco.com/api/webhooks`);

async function registerWebhook() {
  try {
    console.log('\n🚀 REGISTERING WEBHOOK WITH YOCO (CORRECT API)...');
    console.log('==================================================');

    // FIXED: Using correct format according to Yoco Checkout API documentation
    const webhookData = {
      name: "Little Latte Lane Payment Webhook",
      url: WEBHOOK_URL
    };

    console.log('📤 Sending request to Yoco Checkout API...');
    console.log('Request data:', JSON.stringify(webhookData, null, 2));

    // FIXED: Using correct endpoint and Bearer authentication
    const response = await fetch('https://payments.yoco.com/api/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    const responseData = await response.json();

    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('📋 Response Data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS! Webhook registered successfully!');
      console.log('==================================================');
      console.log(`🆔 Webhook ID: ${responseData.id}`);
      console.log(`🔐 Webhook Secret: ${responseData.secret}`);
      console.log(`🌐 URL: ${responseData.url}`);
      console.log(`� Mode: ${responseData.mode}`);
      
      console.log('\n🔧 IMPORTANT: ADD WEBHOOK SECRET TO .env.local');
      console.log('==================================================');
      console.log('Add this line to your .env.local file:');
      console.log(`YOCO_WEBHOOK_SECRET=${responseData.secret}`);
      
      console.log('\n🔧 AND UPDATE YOUR VERCEL ENVIRONMENT:');
      console.log('==================================================');
      console.log('1. Go to: https://vercel.com/dashboard');
      console.log('2. Find your Little Latte Lane project');
      console.log('3. Go to Settings → Environment Variables');
      console.log('4. Add new variable:');
      console.log('   Name: YOCO_WEBHOOK_SECRET');
      console.log(`   Value: ${responseData.secret}`);
      console.log('5. Redeploy your application');
      
      console.log('\n🎯 WHAT HAPPENS NEXT:');
      console.log('==================================================');
      console.log('1. ✅ Webhook is now registered with Yoco');
      console.log('2. 🔐 Copy the webhook secret to both .env.local AND Vercel');
      console.log('3. 🚀 Redeploy your app to activate webhook verification');
      console.log('4. 💳 Test a payment to see webhook in action');
      console.log('5. 📊 Orders will now auto-update their status!');

    } else {
      console.log('\n❌ WEBHOOK REGISTRATION FAILED');
      console.log('==================================================');
      
      if (response.status === 400) {
        console.log('🔍 Common causes for 400 errors:');
        console.log('• Webhook URL must be HTTPS and publicly accessible');
        console.log('• URL format might be invalid');
        console.log('• Missing or invalid fields in request');
        console.log(`• Your URL: ${WEBHOOK_URL}`);
      } else if (response.status === 401) {
        console.log('🔍 Authentication failed (401):');
        console.log('• Check your YOCO_SECRET_KEY in .env.local');
        console.log('• Make sure you\'re using the secret key (starts with sk_)');
        console.log('• Verify the key is for the correct environment (test/live)');
      } else if (response.status === 403) {
        console.log('🔍 Permission denied (403):');
        console.log('• Your API key might not have webhook permissions');
        console.log('• Contact Yoco support to enable webhook access');
        console.log('• Make sure you\'re using the secret key, not public key');
      } else if (response.status === 409) {
        console.log('🔍 Conflict (409):');
        console.log('• Webhook might already be registered for this URL');
        console.log('• Check existing webhooks below');
      }
      
      console.log('\n🛠️ TROUBLESHOOTING OPTIONS:');
      console.log('==================================================');
      console.log('1. 📞 Contact Yoco Support:');
      console.log('   • Email: support@yoco.com');
      console.log('   • Tell them: "I need help registering a webhook for Checkout API"');
      console.log(`   • Give them this URL: ${WEBHOOK_URL}`);
      console.log('   • Mention you\'re using the new Checkout API, not the old Payments API');
      console.log('');
      console.log('2. 🌐 Manual Setup via Yoco Dashboard:');
      console.log('   • Login to: https://portal.yoco.com/');
      console.log('   • Look for Settings → Webhooks or Integrations');
      console.log(`   • Add URL: ${WEBHOOK_URL}`);
      console.log('   • Select events: payment.succeeded, payment.failed');
      console.log('');
      console.log('3. ⏭️ Skip Webhooks Temporarily:');
      console.log('   • Your payments will work without webhooks');
      console.log('   • Orders won\'t auto-update status (manual updates needed)');
      console.log('   • You can add webhooks later');
    }

  } catch (error) {
    console.log('\n💥 ERROR OCCURRED:');
    console.log('==================================================');
    console.error('Error details:', error.message);
    console.log('\n🔧 This might be due to:');
    console.log('• Network connection issues');
    console.log('• Yoco API is temporarily unavailable');
    console.log('• Your webhook URL is not accessible from internet');
    
    console.log('\n📞 NEXT STEPS:');
    console.log('==================================================');
    console.log('1. Check your internet connection');
    console.log('2. Verify your webhook URL is accessible');
    console.log('3. Try again in a few minutes');
    console.log('4. Contact Yoco support if problem persists');
  }
}

// Check existing webhooks using correct API
async function checkExistingWebhooks() {
  try {
    console.log('\n🔍 CHECKING EXISTING WEBHOOKS (CORRECT API)...');
    console.log('==================================================');

    const response = await fetch('https://payments.yoco.com/api/webhooks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();

    if (response.ok) {
      const webhooks = responseData.webhooks || responseData || [];
      console.log(`📊 Found ${webhooks.length} existing webhooks:`);
      
      if (webhooks.length > 0) {
        webhooks.forEach((webhook, index) => {
          console.log(`\n${index + 1}. ${webhook.name || 'Unnamed webhook'}`);
          console.log(`   🆔 ID: ${webhook.id}`);
          console.log(`   🌐 URL: ${webhook.url}`);
          console.log(`   📋 Mode: ${webhook.mode || 'unknown'}`);
          console.log(`   � Secret: ${webhook.secret ? webhook.secret.substring(0, 8) + '...' : 'Not shown'}`);
          
          // Check if this is our webhook
          if (webhook.url === WEBHOOK_URL) {
            console.log(`   ⚠️  THIS IS YOUR WEBHOOK! Already registered.`);
            if (webhook.secret) {
              console.log(`   🔧 Use this secret: YOCO_WEBHOOK_SECRET=${webhook.secret}`);
            }
          }
        });
      } else {
        console.log('📭 No existing webhooks found');
      }
    } else {
      console.log('❌ Could not fetch existing webhooks');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Response:', JSON.stringify(responseData, null, 2));
    }
  } catch (error) {
    console.log('❌ Error checking existing webhooks:', error.message);
  }
}

// Run the registration
async function main() {
  await checkExistingWebhooks();
  await registerWebhook();
}

main().catch(console.error);
