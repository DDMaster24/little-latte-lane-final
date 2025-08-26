/**
 * Check Yoco Webhook Registration Status
 * Simple script to check if our webhook is registered with Yoco
 */

const checkWebhookStatus = async () => {
  try {
    console.log('🔍 Checking webhook registration status...');
    
    const response = await fetch('https://www.littlelattelane.co.za/api/admin/webhooks?action=status');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook status check successful:');
      console.log(`📍 Current webhook URL: ${data.currentUrl}`);
      console.log(`📌 Is registered with Yoco: ${data.isRegistered ? 'YES' : 'NO'}`);
      
      if (data.webhook) {
        console.log('🔗 Registered webhook details:');
        console.log(`   - ID: ${data.webhook.id}`);
        console.log(`   - Status: ${data.webhook.status}`);
        console.log(`   - Events: ${data.webhook.events?.join(', ') || 'Unknown'}`);
        console.log(`   - Created: ${data.webhook.createdDate || 'Unknown'}`);
      }
      
      if (data.allWebhooks && data.allWebhooks.length > 0) {
        console.log(`\n📋 All registered webhooks (${data.allWebhooks.length}):`);
        data.allWebhooks.forEach((webhook, index) => {
          console.log(`   ${index + 1}. ${webhook.url} (${webhook.status})`);
        });
      }
      
      return data;
    } else {
      console.error('❌ Failed to check webhook status:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking webhook status:', error);
    return null;
  }
};

const registerWebhook = async () => {
  try {
    console.log('🔗 Registering webhook with Yoco...');
    
    const response = await fetch('https://www.littlelattelane.co.za/api/admin/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'register'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Webhook registered successfully!');
      console.log(`🆔 Webhook ID: ${data.webhook?.id}`);
      console.log(`🔐 Webhook Secret: ${data.webhook?.secret}`);
      console.log('⚠️ IMPORTANT: Save the webhook secret - you\'ll need it for environment variables!');
      return data.webhook;
    } else {
      console.error('❌ Failed to register webhook:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error registering webhook:', error);
    return null;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Yoco Webhook Setup for Real Payments\n');
  
  // First check current status
  const status = await checkWebhookStatus();
  
  console.log('\n' + '='.repeat(50));
  
  if (status && !status.isRegistered) {
    console.log('\n🎯 Webhook is not registered. Let\'s register it...');
    const webhook = await registerWebhook();
    
    if (webhook) {
      console.log('\n✅ Setup complete! Next steps:');
      console.log('1. Add YOCO_WEBHOOK_SECRET to your environment variables');
      console.log(`2. Set YOCO_WEBHOOK_SECRET=${webhook.secret}`);
      console.log('3. Switch to live Yoco credentials when ready');
    }
  } else if (status && status.isRegistered) {
    console.log('\n✅ Webhook is already registered and ready!');
    console.log('\n🎯 For real payments, make sure to:');
    console.log('1. Update YOCO_PUBLIC_KEY and YOCO_SECRET_KEY to live credentials');
    console.log('2. Set NEXT_PUBLIC_YOCO_TEST_MODE=false');
    console.log('3. Add YOCO_WEBHOOK_SECRET if not already set');
  }
  
  console.log('\n🔧 Current webhook URL: https://www.littlelattelane.co.za/api/yoco/webhook');
  console.log('📋 This URL should be registered in your Yoco dashboard');
  console.log('🎉 Ready for real payments!');
};

main().catch(console.error);
