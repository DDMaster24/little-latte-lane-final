-- Fix theme_settings table by adding missing page_scope column
-- Run this in Supabase SQL Editor

-- First, check if the table exists and what columns it has
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'theme_settings' ORDER BY ordinal_position;

-- Add the missing page_scope column if it doesn't exist
DO $$ 
BEGIN
    -- Check if page_scope column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'theme_settings' 
        AND column_name = 'page_scope'
    ) THEN
        -- Add the missing column
        ALTER TABLE theme_settings ADD COLUMN page_scope TEXT;
        
        -- Update existing records with a default page_scope
        UPDATE theme_settings SET page_scope = 'homepage' WHERE page_scope IS NULL;
        
        RAISE NOTICE 'Added page_scope column to theme_settings table';
    ELSE
        RAISE NOTICE 'page_scope column already exists in theme_settings table';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'theme_settings' 
ORDER BY ordinal_position;
