// Quick test script to verify API endpoint
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing /api/events endpoint...');
    
    const response = await fetch('https://www.littlelattelane.co.za/api/events');
    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ API endpoint working perfectly!');
      console.log('📋 Events found:', data.events?.length || 0);
      console.log('⚙️ Settings loaded:', data.settings ? 'Yes' : 'No');
    } else {
      console.error('❌ API still failing:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
