// Quick script to create visual editor table directly
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // Fixed: was missing KEY part
);

async function createVisualEditorTable() {
  console.log('🔧 Creating visual editor table...');
  
  const sql = `
-- Visual Editor Changes Table
CREATE TABLE IF NOT EXISTS visual_editor_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  element_selector TEXT NOT NULL,
  element_tag TEXT NOT NULL,
  element_text TEXT,
  property_name TEXT NOT NULL,
  property_value TEXT NOT NULL,
  old_value TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('style', 'content', 'attribute')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_draft BOOLEAN NOT NULL DEFAULT TRUE,
  admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_visual_editor_changes_page_path ON visual_editor_changes(page_path);
CREATE INDEX IF NOT EXISTS idx_visual_editor_changes_admin_user ON visual_editor_changes(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_visual_editor_changes_published ON visual_editor_changes(is_published);

-- RLS Policies
ALTER TABLE visual_editor_changes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage visual editor changes" ON visual_editor_changes;
CREATE POLICY "Admins can manage visual editor changes" ON visual_editor_changes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Published changes are readable" ON visual_editor_changes;
CREATE POLICY "Published changes are readable" ON visual_editor_changes
  FOR SELECT USING (is_published = true);

GRANT ALL ON visual_editor_changes TO authenticated;
GRANT ALL ON visual_editor_changes TO anon;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Error creating table:', error);
    // Try direct SQL execution
    const { error: directError } = await supabase
      .from('visual_editor_changes')
      .select('id')
      .limit(1);
    
    if (directError && directError.code === '42P01') {
      console.log('Table does not exist, creating via raw SQL...');
      // The table doesn't exist, try creating it piece by piece
      try {
        await supabase.sql`
          CREATE TABLE IF NOT EXISTS visual_editor_changes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            page_path TEXT NOT NULL,
            element_selector TEXT NOT NULL,
            element_tag TEXT NOT NULL,
            element_text TEXT,
            property_name TEXT NOT NULL,
            property_value TEXT NOT NULL,
            old_value TEXT,
            change_type TEXT NOT NULL CHECK (change_type IN ('style', 'content', 'attribute')),
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            is_published BOOLEAN NOT NULL DEFAULT FALSE,
            is_draft BOOLEAN NOT NULL DEFAULT TRUE,
            admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `;
        console.log('✅ Table created successfully!');
      } catch (createError) {
        console.error('❌ Failed to create table:', createError);
      }
    } else {
      console.log('✅ Table appears to already exist');
    }
  } else {
    console.log('✅ Table setup completed successfully!');
  }
}

createVisualEditorTable();
