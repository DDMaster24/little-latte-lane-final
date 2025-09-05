const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateCarouselPanels() {
  try {
    console.log('🔧 Updating carousel panels...');
    
    // Disable merchandise and events-news panels
    const { error: disableError } = await supabase
      .from('carousel_panels')
      .update({ is_active: false })
      .in('panel_id', ['merchandise-shop', 'events-news']);
      
    if (disableError) {
      console.error('❌ Error disabling panels:', disableError);
      return;
    }
    
    console.log('✅ Disabled merchandise-shop and events-news panels');
    
    // Update opening hours panel with correct times
    const { error: hoursError } = await supabase
      .from('carousel_panels')
      .update({ 
        config: {
          title: { enabled: true, text: "Opening Hours" },
          description: { enabled: true, text: "We're here when you need us" },
          icon: { enabled: true, name: "Clock" },
          schedule: { 
            enabled: true, 
            items: [
              { day: "Mon - Fri", hours: "06:00 - 18:00" },
              { day: "Saturday", hours: "08:00 - 15:00" }, 
              { day: "Sunday", hours: "08:00 - 13:00" }
            ]
          },
          badge: { enabled: true, text: "Now Open", color: "bg-green-600" },
          bgColor: "from-cyan-900/20 to-blue-900/20",
          borderColor: "border-neonCyan"
        }
      })
      .eq('panel_id', 'opening-hours');
      
    if (hoursError) {
      console.error('❌ Error updating opening hours:', hoursError);
      return;
    }
    
    console.log('✅ Updated opening hours panel');
    
    // Update social media panel title
    const { error: socialError } = await supabase
      .from('carousel_panels')
      .update({ 
        config: {
          title: { enabled: true, text: "Social Media" },
          description: { enabled: true, text: "Follow our journey" },
          icon: { enabled: true, name: "Camera" },
          socialGrid: { 
            enabled: true, 
            items: [
              { enabled: true, text: "📸 Daily Specials" },
              { enabled: true, text: "🎨 Latte Art" },
              { enabled: true, text: "🎉 Events" }, 
              { enabled: true, text: "👥 Community" }
            ]
          },
          handle: { enabled: true, text: "@LittleLatteLane" },
          bgColor: "from-pink-900/20 to-purple-900/20",
          borderColor: "border-neonPink"
        }
      })
      .eq('panel_id', 'social-instagram');
      
    if (socialError) {
      console.error('❌ Error updating social panel:', socialError);
      return;
    }
    
    console.log('✅ Updated social media panel');
    
    // Update menu ordering panel for better visuals
    const { error: menuError } = await supabase
      .from('carousel_panels')
      .update({ 
        config: {
          title: { enabled: true, text: "Menu & Ordering" },
          description: { enabled: true, text: "Delicious food, premium coffee" },
          image: { 
            enabled: true, 
            src: "/images/food-drinks-neon-wp.png",
            alt: "Delicious food and drinks"
          },
          featureList: { 
            enabled: true, 
            items: [
              { enabled: true, text: "☕ Premium Coffee" },
              { enabled: true, text: "🍝 Fresh Meals" },
              { enabled: true, text: "⚡ Daily Specials" },
              { enabled: true, text: "🚀 Quick Orders" }
            ]
          },
          bgColor: "from-purple-900/20 to-pink-900/20",
          borderColor: "border-neonPink"
        }
      })
      .eq('panel_id', 'menu-ordering');
      
    if (menuError) {
      console.error('❌ Error updating menu panel:', menuError);
      return;
    }
    
    console.log('✅ Updated menu ordering panel');
    
    // Check final state
    const { data: finalPanels, error: checkError } = await supabase
      .from('carousel_panels')
      .select('panel_id, is_active, config')
      .order('panel_order');
      
    if (checkError) {
      console.error('❌ Error checking final state:', checkError);
      return;
    }
    
    console.log('\n📊 Final carousel state:');
    finalPanels.forEach((panel) => {
      console.log(`   ${panel.panel_id}: ${panel.is_active ? '✅ Active' : '❌ Inactive'} - ${panel.config?.title?.text || 'No title'}`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateCarouselPanels();
