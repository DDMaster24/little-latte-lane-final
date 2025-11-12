-- Create restaurant_closures table for managing multiple closure periods
-- This replaces the theme_settings approach with a proper dedicated table

CREATE TABLE IF NOT EXISTS public.restaurant_closures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Closure details
  closure_type TEXT NOT NULL CHECK (closure_type IN ('manual', 'scheduled')),
  reason TEXT, -- e.g., "Christmas Holiday", "Maintenance", "Staff Training"
  
  -- For scheduled closures
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  
  -- For manual closure (instant on/off)
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_scheduled_closure CHECK (
    (closure_type = 'scheduled' AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time) OR
    closure_type = 'manual'
  )
);

-- Create index for efficient queries
CREATE INDEX idx_restaurant_closures_active ON public.restaurant_closures (is_active) WHERE is_active = true;
CREATE INDEX idx_restaurant_closures_scheduled ON public.restaurant_closures (start_time, end_time) WHERE closure_type = 'scheduled';
CREATE INDEX idx_restaurant_closures_type ON public.restaurant_closures (closure_type);

-- Enable RLS
ALTER TABLE public.restaurant_closures ENABLE ROW LEVEL SECURITY;

-- Public can view active closures (for menu page, cart, etc.)
CREATE POLICY "Anyone can view active closures"
  ON public.restaurant_closures
  FOR SELECT
  TO public
  USING (is_active = true);

-- Only admins can manage closures
CREATE POLICY "Admins can manage all closures"
  ON public.restaurant_closures
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_restaurant_closures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_restaurant_closures_updated_at
  BEFORE UPDATE ON public.restaurant_closures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_restaurant_closures_updated_at();

-- Grant permissions
GRANT SELECT ON public.restaurant_closures TO anon;
GRANT SELECT ON public.restaurant_closures TO authenticated;
GRANT ALL ON public.restaurant_closures TO service_role;

-- Add helpful comment
COMMENT ON TABLE public.restaurant_closures IS 'Manages both manual and scheduled restaurant closures. Supports multiple scheduled closures for holidays and special events.';
COMMENT ON COLUMN public.restaurant_closures.closure_type IS 'Type of closure: manual (instant toggle) or scheduled (date range)';
COMMENT ON COLUMN public.restaurant_closures.is_active IS 'For manual: current status. For scheduled: whether this closure period should be enforced';
