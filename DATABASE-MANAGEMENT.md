# Database Management Guide - Little Latte Lane

This guide provides everything you need to easily manage, update, and maintain your database using VS Code tools.

## 🎯 Quick Start

### Method 1: Using Supabase Extension (Recommended for Production)
1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Type**: `Supabase: Connect to Project`
3. **Select**: Your project (awytuszmunxvthuizyur)
4. **View Tables**: Supabase panel in sidebar → Tables tab

### Method 2: Using SQLTools (Recommended for Complex Queries)
1. **Open SQLTools**: Click database icon in left sidebar
2. **Connect**: Choose "Supabase Production DB" or "Local Docker PostgreSQL"
3. **Browse**: Expand connection to see tables and columns
4. **Query**: Right-click connection → "New SQL File"

## 🗄️ Database Connections

### Production Database (Supabase)
- **Host**: db.awytuszmunxvthuizyur.supabase.co
- **Database**: postgres
- **Username**: postgres
- **Password**: From SUPABASE_DB_PASSWORD environment variable
- **SSL**: Required

### Local Development Database (Docker)
- **Host**: localhost:5432
- **Database**: little_latte_lane_db
- **Username**: postgres
- **Password**: postgres
- **SSL**: Not required

## 📊 Database Schema Overview

### Core Tables
1. **profiles** - User accounts and authentication
2. **menu_categories** - Food categories (Breakfast, Pizza, etc.)
3. **menu_items** - Individual menu items with pricing
4. **orders** - Customer orders and status tracking
5. **order_items** - Individual items within orders
6. **bookings** - Table reservations and events
7. **events** - Special events and promotions
8. **staff_requests** - Internal staff communication

## 🔧 Common Database Tasks

### Add New Menu Item
```sql
INSERT INTO menu_items (name, description, price, category_id, available, image_url)
VALUES ('New Dish', 'Description here', 12.99, 1, true, '/images/new-dish.jpg');
```

### Update Menu Prices
```sql
UPDATE menu_items 
SET price = price * 1.1 
WHERE category_id = (SELECT id FROM menu_categories WHERE name = 'Pizza');
```

### View Recent Orders
```sql
SELECT 
  o.id,
  p.full_name as customer_name,
  o.total_amount,
  o.status,
  o.created_at
FROM orders o
JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 20;
```

### Check Staff Activity
```sql
SELECT 
  sr.id,
  p.full_name as staff_name,
  sr.message,
  sr.status,
  sr.created_at
FROM staff_requests sr
JOIN profiles p ON sr.user_id = p.id
WHERE sr.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY sr.created_at DESC;
```

## 🔐 Security & Permissions

### Row Level Security (RLS) Policies
Our database uses RLS policies to control access:
- **Public**: Can view menu items and categories
- **Users**: Can manage their own orders and bookings
- **Staff**: Can view all orders and manage inventory
- **Admin**: Full access to all data

### User Roles
Check user role:
```sql
SELECT full_name, role FROM profiles WHERE email = 'user@example.com';
```

Update user role:
```sql
UPDATE profiles SET role = 'staff' WHERE email = 'newstaff@example.com';
```

## 📈 Analytics Queries

### Daily Sales Summary
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue
FROM orders 
WHERE status = 'completed'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Popular Menu Items
```sql
SELECT 
  mi.name,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.price * oi.quantity) as total_revenue
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
  AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY mi.id, mi.name
ORDER BY times_ordered DESC
LIMIT 10;
```

### Booking Statistics
```sql
SELECT 
  DATE(booking_date) as date,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings
FROM bookings
WHERE booking_date >= CURRENT_DATE
  AND booking_date <= CURRENT_DATE + INTERVAL '30 days'
GROUP BY DATE(booking_date)
ORDER BY date;
```

## 🚨 Troubleshooting

### Connection Issues
1. **Check Environment Variables**: Ensure SUPABASE_DB_PASSWORD is set
2. **Test Connection**: Use SQLTools connection test feature
3. **Check Supabase Status**: Visit status.supabase.io
4. **Verify SSL Settings**: Ensure SSL is enabled for production

### Query Errors
1. **Check Table Names**: Use exact case-sensitive names
2. **Verify Column Names**: Refer to schema documentation
3. **Test Permissions**: Ensure your user has required access
4. **Check RLS Policies**: Some queries may be filtered by RLS

### Performance Issues
1. **Add Indexes**: For frequently queried columns
2. **Limit Results**: Use LIMIT clause for large datasets
3. **Use Pagination**: For frontend applications
4. **Monitor Usage**: Check Supabase dashboard for metrics

## 🔄 Backup & Maintenance

### Regular Backups
- **Automatic**: Supabase provides daily backups
- **Manual**: Export via Supabase dashboard
- **Local**: Use pg_dump for additional backups

### Data Cleanup
```sql
-- Clean up old draft orders (run weekly)
DELETE FROM orders 
WHERE status = 'draft' 
  AND created_at < NOW() - INTERVAL '24 hours';

-- Archive old events (run monthly)
UPDATE events 
SET archived = true 
WHERE end_date < CURRENT_DATE - INTERVAL '3 months'
  AND archived = false;
```

## 🛠️ Advanced Features

### Custom Functions
Our database includes helper functions:
- `auth.is_admin()` - Check if current user is admin
- `auth.is_staff()` - Check if current user is staff
- `auth.get_user_role()` - Get current user's role

### Triggers
- **Order Total Calculation**: Automatically calculates order totals
- **Inventory Updates**: Updates stock levels when orders are placed
- **Audit Logging**: Tracks changes to sensitive data

## 📞 Support

### For Technical Issues:
1. Check this guide first
2. Review error messages in VS Code
3. Test with simpler queries
4. Check Supabase logs in dashboard

### For Database Changes:
1. Test queries on local Docker database first
2. Use transactions for multiple changes
3. Backup before major modifications
4. Document all changes in PROJECT-CONTRACT.md

---

**Remember**: Always test database changes in your local Docker environment before applying to production!
