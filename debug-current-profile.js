const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://awytuszmunxvthuizyur.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM'
);

async function checkCurrentProfile() {
  console.log('🔍 Checking current profile data...\n');
  
  // Get current profile data
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'dariusschutte124@gmail.com')
    .single();
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📋 Current Profile Data:');
  console.log('- ID:', data.id);
  console.log('- Email:', data.email);
  console.log('- Full Name:', data.full_name);
  console.log('- Phone:', data.phone);
  console.log('- Phone Number:', data.phone_number);
  console.log('- Address:', data.address);
  console.log('- Created At:', data.created_at);
  console.log('- Updated At:', data.updated_at);
  console.log('- Is Admin:', data.is_admin);
  console.log('- Is Staff:', data.is_staff);
  
  // Check if address field exists
  console.log('\n✅ Available columns:', Object.keys(data));
}

checkCurrentProfile().then(() => {
  console.log('\n✅ Profile check complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
