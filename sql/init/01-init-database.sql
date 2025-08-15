-- Initialize Little Latte Lane database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security
ALTER DATABASE little_latte_lane SET "app.jwt_secret" TO 'your-super-secret-jwt-token-with-at-least-32-characters-change-this';

-- Create initial tables (basic structure for development)
-- Note: This is a minimal setup for local development
-- The full schema should be managed through Supabase migrations

-- Users table (simplified for local dev)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES menu_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    payment_id TEXT,
    phone_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    customizations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    phone_number TEXT,
    special_requests TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample data for development
INSERT INTO menu_categories (name, description, display_order) VALUES
    ('Coffee & Beverages', 'Freshly brewed coffee and refreshing drinks', 1),
    ('Food', 'Delicious meals and snacks', 2),
    ('Pizza', 'Wood-fired pizzas made to order', 3),
    ('Desserts', 'Sweet treats to end your meal', 4);

INSERT INTO menu_items (category_id, name, description, price, display_order) VALUES
    ((SELECT id FROM menu_categories WHERE name = 'Coffee & Beverages'), 'Cappuccino', 'Rich espresso with steamed milk foam', 35.00, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Coffee & Beverages'), 'Americano', 'Bold espresso with hot water', 28.00, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Food'), 'Grilled Chicken Sandwich', 'Tender grilled chicken with fresh vegetables', 85.00, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza'), 'Margherita Pizza', 'Classic tomato, mozzarella, and basil', 120.00, 1);

-- Create admin user (password: admin123)
INSERT INTO profiles (email, full_name, is_admin) VALUES
    ('admin@littlelatte.com', 'Admin User', true);

COMMIT;
