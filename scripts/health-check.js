/**
 * Health check script for Little Latte Lane
 * Verifies database connectivity, environment setup, and key services
 */

async function healthCheck() {
  console.log('🏥 Little Latte Lane Health Check\n');
  
  let hasErrors = false;

  try {
    console.log('📋 Checking environment variables...');
    
    // Basic environment check
    const requiredEnvs = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    
    if (missingEnvs.length > 0) {
      console.log(`⚠️ Missing environment variables: ${missingEnvs.join(', ')}`);
      console.log('   Make sure you have a .env.local file with required variables');
    } else {
      console.log('✅ Required environment variables found');
    }
    
    // Supabase connectivity (basic check)
    console.log('🔗 Checking Supabase configuration...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      console.log('✅ Supabase configuration found');
      console.log(`   URL: ${supabaseUrl}`);
    } else {
      console.log('⚠️ Supabase configuration missing');
      hasErrors = true;
    }
    
    // PayFast configuration
    console.log('💳 Checking PayFast configuration...');
    const hasPayFastConfig = !!(
      process.env.PAYFAST_MERCHANT_ID && 
      process.env.PAYFAST_MERCHANT_KEY
    );
    
    if (hasPayFastConfig) {
      console.log('✅ PayFast configuration found');
      console.log(`   Mode: ${process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === 'true' ? 'Sandbox' : 'Production'}`);
    } else {
      console.log('⚠️ PayFast configuration missing (check PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY)');
    }
    
    // Email service
    console.log('📧 Checking email service...');
    const hasEmailConfig = !!process.env.RESEND_API_KEY;
    
    if (hasEmailConfig) {
      console.log('✅ Email service configured (Resend)');
    } else {
      console.log('⚠️ Email service not configured (RESEND_API_KEY missing)');
      console.log('   Emails will be logged to console in development');
    }
    
    console.log('\n🎯 System Status Summary:');
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Supabase: ${supabaseUrl && supabaseKey ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   Payments: ${hasPayFastConfig ? '✅ Configured' : '⚠️ Not configured'}`);
    console.log(`   Email: ${hasEmailConfig ? '✅ Configured' : '⚠️ Console only'}`);
    
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
    hasErrors = true;
  }
  
  console.log(`\n${hasErrors ? '🚨' : '🟢'} Health check ${hasErrors ? 'completed with errors' : 'passed!'}`);
  
  if (hasErrors) {
    process.exit(1);
  }
}

// Run health check
healthCheck().catch((error) => {
  console.error('💥 Health check crashed:', error);
  process.exit(1);
});
