-- Add missing page_scope column to theme_settings table
-- Execute this SQL in the Supabase SQL Editor

-- Step 1: Add the page_scope column
ALTER TABLE theme_settings 
ADD COLUMN IF NOT EXISTS page_scope VARCHAR(255) DEFAULT 'global';

-- Step 2: Add index for better performance on page_scope queries
CREATE INDEX IF NOT EXISTS idx_theme_settings_page_scope 
ON theme_settings(page_scope);

-- Step 3: Add comment to explain the column
COMMENT ON COLUMN theme_settings.page_scope IS 'Scope of the setting: homepage, menu, header, footer, global, etc.';

-- Step 4: Update existing records to have a default page_scope
UPDATE theme_settings 
SET page_scope = 'global' 
WHERE page_scope IS NULL;

-- Step 5: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'theme_settings' 
ORDER BY ordinal_position;
