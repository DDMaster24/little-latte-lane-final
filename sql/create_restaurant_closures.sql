-- Restaurant Closures Management Table
-- Simple structure for manual toggle + basic scheduling

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

-- Create a single settings row (singleton pattern)
INSERT INTO restaurant_closures (id, is_manually_closed) 
VALUES (1, FALSE) 
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Admin-only access
ALTER TABLE restaurant_closures ENABLE ROW LEVEL SECURITY;

-- Policy for admin users only
CREATE POLICY "Admin only access" ON restaurant_closures 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Function to get current closure status
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_restaurant_closed() TO authenticated;

-- Function to set manual closure status (admin only)
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

-- Grant execute permission to authenticated users (function checks admin status)
GRANT EXECUTE ON FUNCTION set_manual_closure(BOOLEAN) TO authenticated;

-- Function to schedule closure (admin only)
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

-- Grant execute permission to authenticated users (function checks admin status)
GRANT EXECUTE ON FUNCTION schedule_closure(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;

-- Function to clear scheduled closure (admin only)
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

-- Grant execute permission to authenticated users (function checks admin status)
GRANT EXECUTE ON FUNCTION clear_scheduled_closure() TO authenticated;