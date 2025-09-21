// Database script to create restaurant closures table and functions
// Run this with: node create-restaurant-closures-db.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjA0MjM4OCwiZXhwIjoyMDQxNjE4Mzg4fQ.qhJFraMJzqWNVSBEkY8qjF2gBHGBNWnhqQYM8lzrDjU' // Service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createRestaurantClosuresTable() {
  console.log('Creating restaurant_closures table and functions...')

  // Create the table
  const createTableQuery = `
    -- Restaurant Closures Management Table
    CREATE TABLE IF NOT EXISTS restaurant_closures (
      id SERIAL PRIMARY KEY,
      
      -- Manual closure toggle (highest priority)
      is_manually_closed BOOLEAN DEFAULT FALSE,
      
      -- Scheduled closure settings
      scheduled_closure_start TIMESTAMP WITH TIME ZONE,
      scheduled_closure_end TIMESTAMP WITH TIME ZONE,
      
      -- Metadata
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableQuery })
  if (createError) {
    console.error('Error creating table:', createError)
    return
  }

  // Insert default row
  const insertDefaultQuery = `
    INSERT INTO restaurant_closures (id, is_manually_closed) 
    VALUES (1, FALSE) 
    ON CONFLICT (id) DO NOTHING;
  `

  const { error: insertError } = await supabase.rpc('exec_sql', { sql: insertDefaultQuery })
  if (insertError) {
    console.error('Error inserting default row:', insertError)
    return
  }

  // Enable RLS
  const rlsQuery = `
    ALTER TABLE restaurant_closures ENABLE ROW LEVEL SECURITY;
  `

  const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsQuery })
  if (rlsError) {
    console.error('Error enabling RLS:', rlsError)
    return
  }

  // Create RLS policy
  const policyQuery = `
    DROP POLICY IF EXISTS "Admin only access" ON restaurant_closures;
    CREATE POLICY "Admin only access" ON restaurant_closures 
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
      )
    );
  `

  const { error: policyError } = await supabase.rpc('exec_sql', { sql: policyQuery })
  if (policyError) {
    console.error('Error creating policy:', policyError)
    return
  }

  console.log('✅ Restaurant closures table created successfully!')
}

async function createFunctions() {
  console.log('Creating database functions...')

  // Function to check if restaurant is closed
  const isClosedFunctionQuery = `
    CREATE OR REPLACE FUNCTION is_restaurant_closed()
    RETURNS BOOLEAN AS $$
    DECLARE
      closure_record restaurant_closures%ROWTYPE;
      current_time TIMESTAMP WITH TIME ZONE := NOW();
    BEGIN
      -- Get the single settings record
      SELECT * INTO closure_record 
      FROM restaurant_closures 
      WHERE id = 1;
      
      -- Check manual closure first (highest priority)
      IF closure_record.is_manually_closed = TRUE THEN
        RETURN TRUE;
      END IF;
      
      -- Check scheduled closure
      IF closure_record.scheduled_closure_start IS NOT NULL 
         AND closure_record.scheduled_closure_end IS NOT NULL THEN
        
        IF current_time >= closure_record.scheduled_closure_start 
           AND current_time <= closure_record.scheduled_closure_end THEN
          RETURN TRUE;
        END IF;
      END IF;
      
      -- Restaurant is open
      RETURN FALSE;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    GRANT EXECUTE ON FUNCTION is_restaurant_closed() TO authenticated;
  `

  const { error: functionError1 } = await supabase.rpc('exec_sql', { sql: isClosedFunctionQuery })
  if (functionError1) {
    console.error('Error creating is_restaurant_closed function:', functionError1)
    return
  }

  // Function to set manual closure
  const setManualClosureQuery = `
    CREATE OR REPLACE FUNCTION set_manual_closure(is_closed BOOLEAN)
    RETURNS VOID AS $$
    BEGIN
      -- Check if user is admin
      IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
      ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
      END IF;
      
      -- Update manual closure status
      UPDATE restaurant_closures 
      SET 
        is_manually_closed = is_closed,
        updated_at = NOW()
      WHERE id = 1;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    GRANT EXECUTE ON FUNCTION set_manual_closure(BOOLEAN) TO authenticated;
  `

  const { error: functionError2 } = await supabase.rpc('exec_sql', { sql: setManualClosureQuery })
  if (functionError2) {
    console.error('Error creating set_manual_closure function:', functionError2)
    return
  }

  // Function to schedule closure
  const scheduleClosureQuery = `
    CREATE OR REPLACE FUNCTION schedule_closure(
      start_time TIMESTAMP WITH TIME ZONE,
      end_time TIMESTAMP WITH TIME ZONE
    )
    RETURNS VOID AS $$
    BEGIN
      -- Check if user is admin
      IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
      ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
      END IF;
      
      -- Validate dates
      IF start_time >= end_time THEN
        RAISE EXCEPTION 'Start time must be before end time.';
      END IF;
      
      -- Update scheduled closure
      UPDATE restaurant_closures 
      SET 
        scheduled_closure_start = start_time,
        scheduled_closure_end = end_time,
        updated_at = NOW()
      WHERE id = 1;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    GRANT EXECUTE ON FUNCTION schedule_closure(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;
  `

  const { error: functionError3 } = await supabase.rpc('exec_sql', { sql: scheduleClosureQuery })
  if (functionError3) {
    console.error('Error creating schedule_closure function:', functionError3)
    return
  }

  // Function to clear scheduled closure
  const clearScheduleQuery = `
    CREATE OR REPLACE FUNCTION clear_scheduled_closure()
    RETURNS VOID AS $$
    BEGIN
      -- Check if user is admin
      IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
      ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
      END IF;
      
      -- Clear scheduled closure
      UPDATE restaurant_closures 
      SET 
        scheduled_closure_start = NULL,
        scheduled_closure_end = NULL,
        updated_at = NOW()
      WHERE id = 1;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    GRANT EXECUTE ON FUNCTION clear_scheduled_closure() TO authenticated;
  `

  const { error: functionError4 } = await supabase.rpc('exec_sql', { sql: clearScheduleQuery })
  if (functionError4) {
    console.error('Error creating clear_scheduled_closure function:', functionError4)
    return
  }

  console.log('✅ Database functions created successfully!')
}

async function main() {
  try {
    await createRestaurantClosuresTable()
    await createFunctions()
    console.log('\n🎉 Restaurant closures database setup complete!')
    
    // Test the functions
    console.log('\nTesting functions...')
    const { data: isClosedResult, error: testError } = await supabase.rpc('is_restaurant_closed')
    if (testError) {
      console.error('Error testing function:', testError)
    } else {
      console.log('✅ is_restaurant_closed() =', isClosedResult)
    }
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

main()