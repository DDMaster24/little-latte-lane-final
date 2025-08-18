const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://awytuszmunxvthuizyur.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM'
);

async function testProfileUpdate() {
  console.log('🧪 Testing profile update functionality...\n');
  
  const userId = '686ba8b3-43c3-44ed-b614-3ef547cb1022';
  
  // Test update
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: 'Darius Schutte',
      phone: '+27 123 456 789',
      address: '123 Test Street, Cape Town, South Africa',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('*')
    .single();
    
  if (error) {
    console.error('❌ Update Error:', error);
    return;
  }
  
  console.log('✅ Update successful!');
  console.log('📋 Updated Data:');
  console.log('- Full Name:', data.full_name);
  console.log('- Phone:', data.phone);
  console.log('- Address:', data.address);
  console.log('- Updated At:', data.updated_at);
}

testProfileUpdate().then(() => {
  console.log('\n✅ Test complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
