const { getSupabaseAdmin } = require('./src/lib/supabase-server.js');

async function checkCurrentCategories() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('menu_categories')
    .select('id, name, parent_id, description')
    .order('name');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Current categories:');
  data.forEach(cat => {
    console.log(`- ${cat.name} (parent: ${cat.parent_id || 'none'})`);
  });
  
  const topLevel = data.filter(cat => !cat.parent_id);
  const subCategories = data.filter(cat => cat.parent_id);
  
  console.log(`\nTop-level items: ${topLevel.length}`);
  console.log(`Sub-categories: ${subCategories.length}`);
}

checkCurrentCategories().catch(console.error);
