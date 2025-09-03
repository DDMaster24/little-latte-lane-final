-- Check theme_settings table structure and fix 406 errors
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'theme_settings'
ORDER BY ordinal_position;

-- Check if table exists at all
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'theme_settings'
) as table_exists;

-- If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS theme_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    category VARCHAR(100) DEFAULT 'page_editor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(setting_key, category)
);

-- Enable RLS
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admins)
CREATE POLICY "theme_settings_policy" ON theme_settings
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default header logo setting if not exists
INSERT INTO theme_settings (setting_key, setting_value, category)
VALUES ('header-logo_image', '/images/new-logo.png', 'page_editor')
ON CONFLICT (setting_key, category) DO NOTHING;
