const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function reorganizeMenu() {
  const supabase = getSupabaseAdmin();
  
  console.log('🔄 Starting menu reorganization...\n');
  
  try {
    // Step 1: Get current categories
    const { data: currentCategories, error: fetchError } = await supabase
      .from('menu_categories')
      .select('*')
      .order('name');
    
    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError);
      return;
    }
    
    console.log(`📋 Found ${currentCategories.length} existing categories`);
    currentCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.parent_id ? 'has parent' : 'top-level'})`);
    });
    
    // Step 2: Create main sections
    const sectionsToCreate = [
      {
        name: 'Drinks',
        description: 'Beverages and refreshing drinks',
        display_order: 1
      },
      {
        name: 'Food',
        description: 'Main food items and meals',
        display_order: 2
      },
      {
        name: 'Extras',
        description: 'Additional items and sides',
        display_order: 3
      },
      {
        name: 'Meals',
        description: 'Full meal options',
        display_order: 4
      }
    ];
    
    console.log('\n🏗️  Creating main sections...');
    const createdSections = {};
    
    for (const section of sectionsToCreate) {
      // Check if section already exists
      const existing = currentCategories.find(cat => 
        cat.name.toLowerCase() === section.name.toLowerCase() && !cat.parent_id
      );
      
      if (existing) {
        console.log(`   ✅ Section "${section.name}" already exists`);
        createdSections[section.name] = existing.id;
      } else {
        const { data, error } = await supabase
          .from('menu_categories')
          .insert({
            name: section.name,
            description: section.description,
            display_order: section.display_order,
            is_active: true,
            parent_id: null
          })
          .select()
          .single();
        
        if (error) {
          console.error(`   ❌ Error creating section "${section.name}":`, error);
          continue;
        }
        
        console.log(`   ✅ Created section "${section.name}"`);
        createdSections[section.name] = data.id;
      }
    }
    
    // Step 3: Define category mappings
    const categoryMappings = {
      'Drinks': ['Coke a Cola', 'Coca Cola', 'Coke'],
      'Food': ['Pizza', 'Scones', 'Toasties'],
      'Extras': ['Pizza Add Ons', 'Sides', 'Extras'],
      'Meals': ['All Day Brekkies', 'All Day Meals']
    };
    
    // Step 4: Move categories to appropriate sections
    console.log('\n📝 Organizing categories under sections...');
    
    for (const [sectionName, categoryNames] of Object.entries(categoryMappings)) {
      const sectionId = createdSections[sectionName];
      if (!sectionId) {
        console.log(`   ⚠️  Section "${sectionName}" not found, skipping...`);
        continue;
      }
      
      for (const categoryName of categoryNames) {
        // Find category with similar name (case-insensitive, partial match)
        const category = currentCategories.find(cat => 
          cat.name.toLowerCase().includes(categoryName.toLowerCase()) ||
          categoryName.toLowerCase().includes(cat.name.toLowerCase())
        );
        
        if (!category) {
          console.log(`   ⚠️  Category "${categoryName}" not found, skipping...`);
          continue;
        }
        
        // Skip if already has the correct parent
        if (category.parent_id === sectionId) {
          console.log(`   ✅ "${category.name}" already in "${sectionName}"`);
          continue;
        }
        
        // Update category to belong to section
        const { error } = await supabase
          .from('menu_categories')
          .update({ parent_id: sectionId })
          .eq('id', category.id);
        
        if (error) {
          console.error(`   ❌ Error moving "${category.name}" to "${sectionName}":`, error);
        } else {
          console.log(`   ✅ Moved "${category.name}" to "${sectionName}"`);
        }
      }
    }
    
    // Step 5: Verify final structure
    console.log('\n🔍 Final menu structure:');
    const { data: finalCategories } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { nullsFirst: false });
    
    const sections = finalCategories?.filter(cat => !cat.parent_id) || [];
    const categories = finalCategories?.filter(cat => cat.parent_id) || [];
    
    console.log(`\n📊 Summary:`);
    console.log(`   🏷️  Sections: ${sections.length}`);
    console.log(`   📂 Categories: ${categories.length}`);
    
    sections.forEach(section => {
      const sectionCategories = categories.filter(cat => cat.parent_id === section.id);
      console.log(`\n   📁 ${section.name} (${sectionCategories.length} categories)`);
      sectionCategories.forEach(cat => {
        console.log(`      - ${cat.name}`);
      });
    });
    
    console.log('\n✅ Menu reorganization completed successfully!');
    console.log('\n💡 You can now refresh your admin page to see the new structure.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the reorganization
reorganizeMenu().catch(console.error);
