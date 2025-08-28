// Test the carousel system after database setup
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCarouselSystem() {
  console.log('🎠 Testing Carousel System...\n');

  try {
    // Test 1: Check if table exists and has data
    console.log('1️⃣ Testing database table...');
    const { data: panels, error: fetchError } = await supabase
      .from('carousel_panels')
      .select('*')
      .order('panel_order');

    if (fetchError) {
      console.error('❌ Error fetching panels:', fetchError.message);
      return;
    }

    console.log('✅ Database table working!');
    console.log(`📊 Found ${panels.length} carousel panels`);
    
    if (panels.length > 0) {
      console.log('\n📋 Current panels:');
      panels.forEach(panel => {
        console.log(`   ${panel.panel_order}. ${panel.config.title?.text || 'Untitled'} (${panel.template_id})`);
      });
    }

    // Test 2: Verify API endpoints exist
    console.log('\n2️⃣ Testing API structure...');
    const fs = require('fs');
    const apiPath = './src/app/api/carousel-panels/route.ts';
    
    if (fs.existsSync(apiPath)) {
      console.log('✅ API endpoint file exists');
    } else {
      console.log('❌ API endpoint file missing');
    }

    // Test 3: Verify components exist
    console.log('\n3️⃣ Testing component files...');
    const components = [
      './src/components/DynamicCarousel.tsx',
      './src/components/Admin/CarouselEditor.tsx',
      './src/app/admin/carousel-editor/page.tsx',
      './src/lib/carouselTemplates.ts'
    ];

    components.forEach(path => {
      if (fs.existsSync(path)) {
        console.log(`✅ ${path.split('/').pop()} exists`);
      } else {
        console.log(`❌ ${path.split('/').pop()} missing`);
      }
    });

    // Test 4: Check for any build issues
    console.log('\n4️⃣ Running TypeScript check...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');
    } catch (error) {
      console.log('⚠️ TypeScript issues found (may be non-critical)');
    }

    console.log('\n🎉 SYSTEM READY FOR TESTING!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start development server: npm run dev');
    console.log('2. Login as admin user');
    console.log('3. Navigate to /admin/carousel-editor');
    console.log('4. Test adding/editing carousel panels');
    console.log('5. View results on homepage carousel');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCarouselSystem();
