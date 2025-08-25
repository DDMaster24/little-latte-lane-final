-- Visual Editor Changes Table
-- Stores all visual customizations made through the admin visual editor

CREATE TABLE IF NOT EXISTS visual_editor_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Page and Element Identification
  page_path TEXT NOT NULL,
  element_selector TEXT NOT NULL,
  element_tag TEXT NOT NULL,
  element_text TEXT, -- Preview text for content changes
  
  -- Change Details
  property_name TEXT NOT NULL,
  property_value TEXT NOT NULL,
  old_value TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('style', 'content', 'attribute')),
  
  -- Change Management
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_draft BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Admin Tracking
  admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_visual_editor_changes_page_path ON visual_editor_changes(page_path);
CREATE INDEX IF NOT EXISTS idx_visual_editor_changes_admin_user ON visual_editor_changes(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_visual_editor_changes_published ON visual_editor_changes(is_published);
CREATE INDEX IF NOT EXISTS idx_visual_editor_changes_draft ON visual_editor_changes(is_draft);
CREATE INDEX IF NOT EXISTS idx_visual_editor_changes_applied_at ON visual_editor_changes(applied_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_visual_editor_changes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_visual_editor_changes_updated_at
  BEFORE UPDATE ON visual_editor_changes
  FOR EACH ROW
  EXECUTE FUNCTION update_visual_editor_changes_updated_at();

-- RLS Policies
ALTER TABLE visual_editor_changes ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all visual editor changes
CREATE POLICY "Admins can manage visual editor changes" ON visual_editor_changes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Allow read access to published changes for loading customizations
CREATE POLICY "Published changes are readable" ON visual_editor_changes
  FOR SELECT USING (is_published = true);

-- Grant permissions
GRANT ALL ON visual_editor_changes TO authenticated;
GRANT ALL ON visual_editor_changes TO anon;
