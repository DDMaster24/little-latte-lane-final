const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createMissingTable() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    console.log('🔨 Creating events_section_settings table...');
    
    // Create table with SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.events_section_settings (
            id SERIAL PRIMARY KEY,
            section_title TEXT DEFAULT 'Events & Specials',
            section_subtitle TEXT DEFAULT 'Stay updated with our latest happenings',
            section_background_color TEXT DEFAULT '#0f0f0f',
            section_text_color TEXT DEFAULT '#ffffff',
            title_gradient TEXT DEFAULT 'bg-neon-gradient',
            max_events_display INTEGER DEFAULT 6,
            layout_style TEXT DEFAULT 'grid',
            show_icons BOOLEAN DEFAULT true,
            show_dates BOOLEAN DEFAULT true,
            show_buttons BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Enable RLS
        ALTER TABLE public.events_section_settings ENABLE ROW LEVEL SECURITY;

        -- Create policies
        DROP POLICY IF EXISTS "Allow public read access" ON public.events_section_settings;
        CREATE POLICY "Allow public read access" ON public.events_section_settings
            FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Allow staff/admin write access" ON public.events_section_settings;  
        CREATE POLICY "Allow staff/admin write access" ON public.events_section_settings
            FOR ALL USING (public.is_staff_or_admin());
      `
    });

    if (error) {
      console.error('❌ Error creating table:', error);
      
      // Fallback: Try direct table creation
      console.log('🔄 Trying alternative approach...');
      const { data: createData, error: createError } = await supabase
        .from('events_section_settings')
        .insert({
          section_title: 'Events & Specials',
          section_subtitle: 'Stay updated with our latest happenings',
          section_background_color: '#0f0f0f',
          section_text_color: '#ffffff',
          title_gradient: 'bg-neon-gradient',
          max_events_display: 6,
          layout_style: 'grid',
          show_icons: true,
          show_dates: true,
          show_buttons: true
        })
        .select();

      if (createError) {
        console.error('❌ Table creation failed:', createError);
        return;
      }
      
      console.log('✅ Table created via insert method');
      return;
    }

    console.log('✅ Table created successfully!');

    // Insert default settings
    const { data: insertData, error: insertError } = await supabase
      .from('events_section_settings')
      .insert({
        section_title: 'Events & Specials',
        section_subtitle: 'Stay updated with our latest happenings',
        section_background_color: '#0f0f0f',
        section_text_color: '#ffffff',
        title_gradient: 'bg-neon-gradient',
        max_events_display: 6,
        layout_style: 'grid',
        show_icons: true,
        show_dates: true,
        show_buttons: true
      })
      .select();

    if (insertError) {
      console.log('ℹ️ Default settings insert failed (may already exist):', insertError.message);
    } else {
      console.log('✅ Default settings inserted');
    }

    // Test the API endpoint
    console.log('🧪 Testing API endpoint...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/events`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API endpoint working!');
    } else {
      console.error('❌ API endpoint still failing:', result.error);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

createMissingTable();
