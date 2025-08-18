const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://awytuszmunxvthuizyur.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM'
);

async function debugUserSession() {
  console.log('🔍 Checking all profiles in database...\n');
  
  // Get all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📋 All Profiles in Database:');
  profiles.forEach((profile, index) => {
    console.log(`\n${index + 1}. Profile:`);
    console.log(`   - ID: ${profile.id}`);
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Full Name: ${profile.full_name}`);
    console.log(`   - Phone: ${profile.phone}`);
    console.log(`   - Address: ${profile.address}`);
    console.log(`   - Created: ${profile.created_at}`);
  });
  
  // Also check auth.users table to see all users
  console.log('\n🔍 Checking auth users...');
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (!usersError && users) {
    console.log('\n👥 All Auth Users:');
    users.users.forEach((user, index) => {
      console.log(`\n${index + 1}. User:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Created: ${user.created_at}`);
    });
  }
}

debugUserSession().then(() => {
  console.log('\n✅ Debug complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
