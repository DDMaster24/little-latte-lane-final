const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkCarouselPanels() {
  try {
    console.log('🔍 Checking carousel panels...');
    
    const { data: panels, error } = await supabase
      .from('carousel_panels')
      .select('*')
      .order('panel_order');
      
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('📊 Current carousel panels:');
    panels.forEach((panel, index) => {
      console.log(`\n${index + 1}. Panel ID: ${panel.panel_id}`);
      console.log(`   Template: ${panel.template_id}`);
      console.log(`   Active: ${panel.is_active}`);
      console.log(`   Order: ${panel.panel_order}`);
      console.log(`   Title: ${panel.config?.title?.text || 'No title'}`);
      console.log(`   Description: ${panel.config?.description?.text || 'No description'}`);
    });
    
    console.log(`\n✅ Total panels: ${panels.length}`);
    console.log(`   Active panels: ${panels.filter(p => p.is_active).length}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkCarouselPanels();
