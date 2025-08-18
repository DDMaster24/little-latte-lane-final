const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://awytuszmunxvthuizyur.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM'
);

async function addAddressField() {
  console.log('🔄 Adding address field to profiles table...\n');
  
  // Add address column
  const { data, error } = await supabase
    .rpc('exec', { 
      query: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;`
    });
    
  if (error) {
    console.error('❌ Error adding address field:', error);
    return false;
  }
  
  console.log('✅ Address field added successfully!');
  
  // Verify the change
  const { data: testData, error: testError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (testData && testData.length > 0) {
    console.log('✅ Updated schema columns:', Object.keys(testData[0]));
  }
  
  return true;
}

addAddressField().then((success) => {
  if (success) {
    console.log('\n🎉 Database schema updated successfully!');
  }
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
