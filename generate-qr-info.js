const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function generateOptimizedQRCodes() {
  try {
    console.log('📱 Generating optimized QR codes for PWA installation...');
    
    // Different URLs for different scenarios
    const qrUrls = {
      // Standard QR for general use
      standard: 'https://littlelattelane.co.za/install',
      
      // QR with PWA parameter for better detection
      pwa: 'https://littlelattelane.co.za/install?pwa=true',
      
      // Android Chrome intent URL (opens in Chrome if available)
      androidChrome: 'intent://littlelattelane.co.za/install?pwa=true#Intent;scheme=https;package=com.android.chrome;end',
      
      // iOS Safari URL (works with universal links)
      iosSafari: 'https://littlelattelane.co.za/install?pwa=true&browser=safari',
      
      // Universal URL with browser hints
      universal: 'https://littlelattelane.co.za/install?pwa=true&source=qr'
    };
    
    console.log('🔗 QR Code URLs Generated:');
    console.log('');
    
    console.log('📋 STANDARD QR CODE (Recommended):');
    console.log(`   URL: ${qrUrls.universal}`);
    console.log('   Use: General purpose, works on all devices');
    console.log('');
    
    console.log('🤖 ANDROID CHROME QR CODE (Advanced):');
    console.log(`   URL: ${qrUrls.androidChrome}`);
    console.log('   Use: Forces Chrome on Android (if installed)');
    console.log('');
    
    console.log('🍎 iOS SAFARI QR CODE:');
    console.log(`   URL: ${qrUrls.iosSafari}`);
    console.log('   Use: Optimized for iOS Safari');
    console.log('');
    
    console.log('📱 BROWSER DETECTION INSTRUCTIONS:');
    console.log('   • Standard QR shows install popup immediately');
    console.log('   • Users get Chrome/Safari browser recommendations'); 
    console.log('   • App name now shows "Little Latte Lane" (full name)');
    console.log('   • Install flow is now one-click from QR scan');
    console.log('');
    
    // Test QR code generation with online service
    const qrCodeService = 'https://api.qrserver.com/v1/create-qr-code/';
    const standardQR = `${qrCodeService}?size=300x300&data=${encodeURIComponent(qrUrls.universal)}`;
    const chromeQR = `${qrCodeService}?size=300x300&data=${encodeURIComponent(qrUrls.androidChrome)}`;
    
    console.log('🖼️  QR CODE GENERATION LINKS:');
    console.log(`   Standard: ${standardQR}`);
    console.log(`   Chrome Android: ${chromeQR}`);
    console.log('');
    
    console.log('✅ IMPLEMENTATION NOTES:');
    console.log('   • PWA install popup appears automatically for QR users');
    console.log('   • App name updated to "Little Latte Lane" in manifest');
    console.log('   • Better browser recommendations for users');
    console.log('   • One-click install flow implemented');
    console.log('   • Standard URL works universally: littlelattelane.co.za/install?pwa=true&source=qr');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateOptimizedQRCodes();
