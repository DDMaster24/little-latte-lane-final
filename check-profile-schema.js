const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://awytuszmunxvthuizyur.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM'
);

async function checkProfileSchema() {
  console.log('🔍 Checking profiles table schema...\n');
  
  // Get table structure
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('✅ Profiles table columns:', Object.keys(data[0]));
    console.log('📋 Sample data:', data[0]);
  } else {
    console.log('📋 No profile data found, checking via RPC...');
    
    // Alternative: Check via SQL query
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('exec', { query: "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position;" })
      .single();
      
    if (!schemaError && schemaData) {
      console.log('Schema:', schemaData);
    }
  }
}

checkProfileSchema().then(() => {
  console.log('\n✅ Profile schema check complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
