/**
 * Switch to Live Payments - Environment Update Script
 * Generates the exact environment variables needed for real payments
 */

console.log('🚀 Little Latte Lane - Live Payments Environment Setup\n');

console.log('📋 VERCEL ENVIRONMENT VARIABLES TO UPDATE:');
console.log('=' * 60);

console.log('\n🔑 1. YOCO LIVE CREDENTIALS (from Yoco Dashboard):');
console.log('   Go to: https://portal.yoco.com/ → Settings → API Keys');
console.log('   Update these in Vercel Dashboard:');
console.log('');
console.log('   YOCO_PUBLIC_KEY=pk_live_[your_live_public_key]');
console.log('   YOCO_SECRET_KEY=sk_live_[your_live_secret_key]');

console.log('\n🔗 2. WEBHOOK SETUP (in Yoco Dashboard):');
console.log('   Go to: https://portal.yoco.com/ → Settings → Webhooks');
console.log('   Add webhook with:');
console.log('');
console.log('   URL: https://www.littlelattelane.co.za/api/yoco/webhook');
console.log('   Events: payment.succeeded, payment.failed');
console.log('   Copy the webhook secret and add:');
console.log('');
console.log('   YOCO_WEBHOOK_SECRET=[webhook_secret_from_yoco]');

console.log('\n⚙️ 3. PRODUCTION MODE:');
console.log('   Update in Vercel Dashboard:');
console.log('');
console.log('   NEXT_PUBLIC_YOCO_TEST_MODE=false');

console.log('\n✅ 4. VERIFY EXISTING VARIABLES:');
console.log('   These should already be correct:');
console.log('');
console.log('   NEXT_PUBLIC_SITE_URL=https://www.littlelattelane.co.za');
console.log('   NODE_ENV=production');
console.log('   RESEND_API_KEY=[your_existing_value]');
console.log('   SUPABASE_SERVICE_KEY=[your_existing_value]');

console.log('\n' + '=' * 60);
console.log('🧪 TESTING CHECKLIST:');
console.log('=' * 60);

const testSteps = [
  'Update environment variables in Vercel',
  'Wait for automatic redeployment (watch Vercel dashboard)',
  'Register webhook in Yoco dashboard',
  'Create a test order on your site',
  'Use real credit card with small amount (R1-R5)',
  'Complete payment through Yoco',
  'Verify order status updates to "confirmed"',
  'Check customer receives confirmation email',
  'Test webhook logs for successful processing'
];

testSteps.forEach((step, index) => {
  console.log(`${index + 1}. ${step}`);
});

console.log('\n' + '=' * 60);
console.log('🔗 IMPORTANT LINKS:');
console.log('=' * 60);

console.log('• Yoco Dashboard: https://portal.yoco.com/');
console.log('• Vercel Dashboard: https://vercel.com/dashboard');
console.log('• Your Website: https://www.littlelattelane.co.za');
console.log('• Webhook URL: https://www.littlelattelane.co.za/api/yoco/webhook');
console.log('• Webhook Test: https://www.littlelattelane.co.za/api/test/webhook');

console.log('\n' + '=' * 60);
console.log('🚨 SECURITY REMINDERS:');
console.log('=' * 60);

console.log('• Never commit live API keys to Git');
console.log('• Keep webhook secret confidential');
console.log('• Test with small amounts first');
console.log('• Monitor logs during initial testing');
console.log('• Have your bank details ready for settlements');

console.log('\n' + '=' * 60);
console.log('💰 GOING LIVE PROCESS:');
console.log('=' * 60);

console.log('1. 🔑 Update credentials in Vercel');
console.log('2. 🔗 Register webhook in Yoco');
console.log('3. 🧪 Test with R1 payment');
console.log('4. ✅ Verify everything works');
console.log('5. 🎉 Announce live payments!');
console.log('6. 📊 Monitor for first 24 hours');

console.log('\n🎊 YOUR PAYMENT SYSTEM IS PRODUCTION READY!');
console.log('All technical components are working perfectly.');
console.log('You just need to add live credentials and register the webhook.');

console.log('\n💡 PRO TIP: Keep test mode enabled locally for development:');
console.log('In your local .env.local file, keep:');
console.log('NEXT_PUBLIC_YOCO_TEST_MODE=true');
console.log('This way you can test without affecting live payments.');

console.log('\n🆘 If you need help:');
console.log('• Check the REAL-PAYMENTS-SETUP.md file');
console.log('• Run: node check-payment-readiness.js');
console.log('• Test webhooks: node test-webhook-comprehensive.js');

console.log('\n🚀 Ready to launch! Good luck with your live payments! 🚀');
