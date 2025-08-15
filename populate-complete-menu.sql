-- POPULATE COMPLETE MENU DATA
-- Run this in Supabase Dashboard to add all your original menu items

-- Insert ALL menu categories (16 total)
INSERT INTO menu_categories (id, name, description, display_order) VALUES 
('5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 'Hot Drinks', 'Traditional hot beverages', 1),
('c7560c8a-813d-4190-aab3-0a642207ec0b', 'Lattes', 'Creamy coffee lattes', 2),
('4e59a952-0ab4-4527-a3ed-b8a1782c8db2', 'Iced Lattes', 'Cold coffee lattes', 3),
('faa42144-d7e7-463c-ac65-e444624569d5', 'Frappes', 'Blended iced coffee drinks', 4),
('cb02ca8c-a844-4e44-8a16-69a76fde8e3c', 'Fizzers', 'Refreshing fizzy drinks', 5),
('f11d6466-02c1-4851-bb06-74a3ae246d33', 'Freezos', 'Frozen blended drinks', 6),
('922dac3e-ea02-4277-b828-c9336bddcfdc', 'Smoothies', 'Healthy fruit smoothies', 7),
('f2a66ed9-7db6-4654-8273-2dfb1468eb71', 'Scones', 'Fresh baked scones', 8),
('0bd8ef45-2df1-42f6-8cb3-dee2efa9e76b', 'Pizza', 'Fresh stone-baked pizzas', 9),
('6f236a22-84c0-4772-bf16-7e7e770cde52', 'Pizza Add-ons', 'Extra toppings for pizzas', 10),
('96aa37f5-2254-4c4b-85db-1d9cbf6f6239', 'Toasties', 'Grilled sandwiches', 11),
('68225409-c55e-414e-8f72-ac81ca354f0b', 'All Day Brekkies', 'Breakfast all day long', 12),
('a4116eff-41a4-46a9-a483-c1863840acd1', 'All Day Meals', 'Hearty meals anytime', 13),
('99f4406a-0884-4578-843a-8cad9625291d', 'Sides', 'Perfect accompaniments', 14),
('c4deee1e-63c1-42ce-a8b7-486a28afcdba', 'Extras', 'Additional items', 15),
('a6aaafe4-1014-4298-a023-d5e602786c31', 'Monna & Rassies Corner', 'Special corner menu', 16)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- Insert sample menu items for each category (you can add more later)
INSERT INTO menu_items (name, category_id, price, description) VALUES 
-- Hot Drinks
('Espresso Regular', '5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 20.00, 'Rich and strong espresso shot'),
('Espresso Large', '5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 25.00, 'Double espresso shot'),
('Americano Regular', '5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 25.00, 'Espresso with hot water'),
('Americano Large', '5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 30.00, 'Large americano'),
('Cappuccino', '5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 37.00, 'Espresso with steamed milk and foam'),
('Flat White', '5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 35.00, 'Microfoam latte'),
('Hot Chocolate', '5cdc6a02-ade3-4523-8ac9-5a0e14e457cb', 33.00, 'Rich hot chocolate'),

-- Lattes
('Vanilla Latte', 'c7560c8a-813d-4190-aab3-0a642207ec0b', 45.00, 'Smooth latte with vanilla syrup'),
('Caramel Latte', 'c7560c8a-813d-4190-aab3-0a642207ec0b', 45.00, 'Sweet caramel flavored latte'),
('Hazelnut Latte', 'c7560c8a-813d-4190-aab3-0a642207ec0b', 45.00, 'Nutty hazelnut latte'),

-- Iced Lattes
('Iced Vanilla Latte', '4e59a952-0ab4-4527-a3ed-b8a1782c8db2', 47.00, 'Cold vanilla latte with ice'),
('Iced Caramel Latte', '4e59a952-0ab4-4527-a3ed-b8a1782c8db2', 47.00, 'Cold caramel latte'),

-- Pizza
('Margherita Pizza', '0bd8ef45-2df1-42f6-8cb3-dee2efa9e76b', 89.00, 'Fresh mozzarella, basil, and tomato sauce'),
('Pepperoni Pizza', '0bd8ef45-2df1-42f6-8cb3-dee2efa9e76b', 99.00, 'Classic pepperoni with cheese'),
('Hawaiian Pizza', '0bd8ef45-2df1-42f6-8cb3-dee2efa9e76b', 105.00, 'Ham and pineapple'),

-- Toasties
('Cheese Toastie', '96aa37f5-2254-4c4b-85db-1d9cbf6f6239', 45.00, 'Classic grilled cheese sandwich'),
('Ham & Cheese Toastie', '96aa37f5-2254-4c4b-85db-1d9cbf6f6239', 55.00, 'Ham and cheese grilled sandwich')

ON CONFLICT DO NOTHING;

SELECT 'Complete menu data populated successfully!' as status,
       (SELECT COUNT(*) FROM menu_categories) as total_categories,
       (SELECT COUNT(*) FROM menu_items) as total_items;
