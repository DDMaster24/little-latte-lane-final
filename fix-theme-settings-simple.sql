-- SIMPLE VERSION: Run these commands one at a time in Supabase SQL Editor

-- Step 1: Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'theme_settings'
) as table_exists;

-- Step 2: Drop existing table if it has issues
DROP TABLE IF EXISTS theme_settings;

-- Step 3: Create new table
CREATE TABLE theme_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    category VARCHAR(100) DEFAULT 'page_editor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(setting_key, category)
);

-- Step 4: Enable security
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

-- Step 5: Add policy
CREATE POLICY "theme_settings_policy" ON theme_settings
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 6: Add default data
INSERT INTO theme_settings (setting_key, setting_value, category) VALUES
('header-logo_image', '/images/new-logo.png', 'page_editor'),
('header-background_color', '#0f0f0f', 'page_editor'),
('header-text_color', '#ffffff', 'page_editor'),
('menu-background_color', '#0f0f0f', 'page_editor'),
('footer-background_color', '#0f0f0f', 'page_editor');
