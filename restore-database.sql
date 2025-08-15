-- QUICK DATABASE RESTORATION
-- Copy and paste this entire script into Supabase Dashboard SQL Editor
-- This will restore your complete database with RLS fixes

-- =====================================================
-- 1. CREATE TABLES AND STRUCTURE
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create menu categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES menu_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  is_available boolean DEFAULT true,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  order_number text UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount decimal(10,2) DEFAULT 0,
  payment_status text DEFAULT 'pending',
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id),
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10,2) NOT NULL,
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  party_size integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  special_requests text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  event_type text DEFAULT 'special' CHECK (event_type IN ('special', 'promotion', 'announcement')),
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create staff requests
CREATE TABLE IF NOT EXISTS staff_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  request_type text DEFAULT 'general',
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. FIXED RLS POLICIES (NO INFINITE RECURSION)
-- =====================================================

-- Helper function to get user role from JWT claims (in public schema)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_role')::text,
    'customer'
  );
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.get_user_role() = 'admin';
$$;

-- Helper function to check if user is staff or admin
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.get_user_role() IN ('staff', 'admin');
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Menu categories policies (public read)
CREATE POLICY "Anyone can view active categories" ON menu_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage categories" ON menu_categories
  FOR ALL USING (public.is_staff_or_admin());

-- Menu items policies (public read)
CREATE POLICY "Anyone can view available items" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Staff can manage items" ON menu_items
  FOR ALL USING (public.is_staff_or_admin());

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id AND status IN ('draft', 'pending'));

CREATE POLICY "Staff can view all orders" ON orders
  FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Staff can update orders" ON orders
  FOR UPDATE USING (public.is_staff_or_admin());

-- Order items policies
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
      AND orders.status IN ('draft', 'pending')
    )
  );

CREATE POLICY "Staff can manage all order items" ON order_items
  FOR ALL USING (public.is_staff_or_admin());

-- Other policies...
CREATE POLICY "Users can manage their bookings" ON bookings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all bookings" ON bookings
  FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Anyone can view active events" ON events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage events" ON events
  FOR ALL USING (public.is_staff_or_admin());

CREATE POLICY "Staff can manage requests" ON staff_requests
  FOR ALL USING (public.is_staff_or_admin());

-- =====================================================
-- 4. INSERT MENU DATA (Sample - you can add more)
-- =====================================================

-- Insert menu categories
INSERT INTO menu_categories (id, name, description, display_order) VALUES 
('5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 'Hot Drinks', 'Traditional hot beverages', 1),
('c7560c8a-813d-4190-aab3-0a642207ec0b', 'Lattes', 'Creamy coffee lattes', 2),
('4e59a952-0ab4-4527-a3ed-b8a1782c8db2', 'Iced Lattes', 'Cold coffee lattes', 3),
('faa42144-d7e7-463c-ac65-e444624569d5', 'Frappes', 'Blended iced coffee drinks', 4),
('0bd8ef45-2df1-42f6-8cb3-dee2efa9e76b', 'Pizza', 'Fresh stone-baked pizzas', 9)
ON CONFLICT (id) DO NOTHING;

-- Insert some menu items
INSERT INTO menu_items (name, category_id, price, description) VALUES 
('Espresso Regular', '5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 20.00, 'Rich and strong espresso shot'),
('Americano Regular', '5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 25.00, 'Espresso with hot water'),
('Cappuccino', '5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 37.00, 'Espresso with steamed milk and foam'),
('Vanilla Latte', 'c7560c8a-813d-4190-aab3-0a642207ec0b', 45.00, 'Smooth latte with vanilla syrup'),
('Margherita Pizza', '0bd8ef45-2df1-42f6-8cb3-dee2efa9e76b', 89.00, 'Fresh mozzarella, basil, and tomato sauce')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'Database restoration completed successfully!' as status;
