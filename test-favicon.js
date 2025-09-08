/**
 * Favicon Validation Test
 * Tests all favicon endpoints to ensure they're working
 */

const { createClient } = require('@supabase/supabase-js');
const http = require('http');

async function testFaviconEndpoints() {
  console.log('🔍 Testing Favicon Endpoints...\n');
  
  const baseUrl = 'http://localhost:3000';
  const faviconPaths = [
    '/favicon.ico',
    '/icon-192x192.png', 
    '/icon-512x512.png',
    '/manifest.json',
    '/browserconfig.xml'
  ];

  for (const path of faviconPaths) {
    try {
      const response = await fetch(`${baseUrl}${path}`);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        console.log(`✅ ${path} - ${response.status} (${contentType}, ${contentLength} bytes)`);
      } else {
        console.log(`❌ ${path} - ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${path} - Error: ${error.message}`);
    }
  }

  console.log('\n🎯 Favicon System Status:');
  console.log('- All favicon files should return 200 status');
  console.log('- favicon.ico should be image/x-icon or image/vnd.microsoft.icon');
  console.log('- PNG files should be image/png');
  console.log('- manifest.json should be application/json');
  console.log('- browserconfig.xml should be application/xml or text/xml');
}

// Run the test
testFaviconEndpoints();
