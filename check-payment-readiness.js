/**
 * Payment System Readiness Check
 * Verifies all components are ready for real payments
 */

const checkPaymentReadiness = async () => {
  console.log('🔍 Little Latte Lane - Payment System Readiness Check\n');
  
  const checks = [];
  
  // Check 1: Webhook endpoint is responding
  try {
    console.log('1️⃣ Testing webhook endpoint...');
    const webhookResponse = await fetch('https://www.littlelattelane.co.za/api/yoco/webhook', {
      method: 'GET'
    });
    
    if (webhookResponse.status === 405) {
      console.log('   ✅ Webhook endpoint is live (405 Method Not Allowed is expected for GET)');
      checks.push({ name: 'Webhook Endpoint', status: 'READY' });
    } else {
      console.log(`   ⚠️ Unexpected response: ${webhookResponse.status}`);
      checks.push({ name: 'Webhook Endpoint', status: 'WARNING', details: `Status: ${webhookResponse.status}` });
    }
  } catch (error) {
    console.log('   ❌ Webhook endpoint not accessible');
    checks.push({ name: 'Webhook Endpoint', status: 'FAILED', details: error.message });
  }
  
  // Check 2: Yoco checkout API
  try {
    console.log('\n2️⃣ Testing Yoco checkout API...');
    const checkoutResponse = await fetch('https://www.littlelattelane.co.za/api/yoco/checkout', {
      method: 'GET'
    });
    
    const checkoutData = await checkoutResponse.json();
    if (checkoutResponse.ok && checkoutData.message?.includes('working')) {
      console.log('   ✅ Yoco checkout API is responding');
      checks.push({ name: 'Yoco Checkout API', status: 'READY' });
    } else {
      console.log('   ⚠️ Unexpected checkout API response');
      checks.push({ name: 'Yoco Checkout API', status: 'WARNING', details: JSON.stringify(checkoutData) });
    }
  } catch (error) {
    console.log('   ❌ Yoco checkout API not accessible');
    checks.push({ name: 'Yoco Checkout API', status: 'FAILED', details: error.message });
  }
  
  // Check 3: Order system
  try {
    console.log('\n3️⃣ Testing order management...');
    const orderResponse = await fetch('https://www.littlelattelane.co.za/api/admin/webhook-status');
    
    if (orderResponse.ok) {
      console.log('   ✅ Order management system is accessible');
      checks.push({ name: 'Order Management', status: 'READY' });
    } else {
      console.log('   ⚠️ Order management system issue');
      checks.push({ name: 'Order Management', status: 'WARNING', details: `Status: ${orderResponse.status}` });
    }
  } catch (error) {
    console.log('   ❌ Order management system not accessible');
    checks.push({ name: 'Order Management', status: 'FAILED', details: error.message });
  }
  
  // Check 4: Health endpoint
  try {
    console.log('\n4️⃣ Testing application health...');
    const healthResponse = await fetch('https://www.littlelattelane.co.za/api/health');
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Application health check passed');
      console.log(`   📊 Status: ${healthData.status || 'Unknown'}`);
      checks.push({ name: 'Application Health', status: 'READY' });
    } else {
      console.log('   ⚠️ Health check issues');
      checks.push({ name: 'Application Health', status: 'WARNING', details: `Status: ${healthResponse.status}` });
    }
  } catch (error) {
    console.log('   ❌ Health check failed');
    checks.push({ name: 'Application Health', status: 'FAILED', details: error.message });
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 PAYMENT SYSTEM READINESS SUMMARY');
  console.log('='.repeat(60));
  
  const readyCount = checks.filter(c => c.status === 'READY').length;
  const warningCount = checks.filter(c => c.status === 'WARNING').length;
  const failedCount = checks.filter(c => c.status === 'FAILED').length;
  
  checks.forEach(check => {
    const icon = check.status === 'READY' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.status}`);
    if (check.details) {
      console.log(`   └─ ${check.details}`);
    }
  });
  
  console.log('\n📈 OVERALL STATUS:');
  console.log(`✅ Ready: ${readyCount}/${checks.length}`);
  console.log(`⚠️ Warnings: ${warningCount}/${checks.length}`);
  console.log(`❌ Failed: ${failedCount}/${checks.length}`);
  
  if (failedCount === 0 && warningCount <= 1) {
    console.log('\n🎉 SYSTEM IS READY FOR REAL PAYMENTS!');
    console.log('\n📋 Next steps:');
    console.log('1. Get live Yoco credentials from your dashboard');
    console.log('2. Register webhook: https://www.littlelattelane.co.za/api/yoco/webhook');
    console.log('3. Update environment variables in Vercel');
    console.log('4. Test with a small real payment (R1-R5)');
    console.log('5. 🚀 Launch live payments!');
  } else if (failedCount === 0) {
    console.log('\n⚠️ SYSTEM IS MOSTLY READY');
    console.log('Minor issues detected but should work for real payments.');
    console.log('Consider investigating warnings before going live.');
  } else {
    console.log('\n❌ SYSTEM NEEDS ATTENTION');
    console.log('Critical issues detected. Fix failed components before going live.');
  }
  
  console.log('\n🔗 Important URLs:');
  console.log('• Production Site: https://www.littlelattelane.co.za');
  console.log('• Webhook Endpoint: https://www.littlelattelane.co.za/api/yoco/webhook');
  console.log('• Yoco Dashboard: https://portal.yoco.com/');
  console.log('• Vercel Dashboard: https://vercel.com/dashboard');
  
  return {
    overall: failedCount === 0 && warningCount <= 1 ? 'READY' : failedCount === 0 ? 'WARNING' : 'FAILED',
    checks,
    readyCount,
    warningCount,
    failedCount
  };
};

// Run the readiness check
checkPaymentReadiness().catch(console.error);
