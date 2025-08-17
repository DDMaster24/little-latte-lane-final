# 🗄️ Little Latte Lane - Database Schema Reference

**Single Source of Truth for Database Structure**  
**Generated from:** LIVE DATABASE AUDIT (August 17, 2025)  
**Last Updated:** August 17, 2025

> ⚠️ **CRITICAL**: This file reflects the ACTUAL live database schema, not TypeScript types. Use this as the definitive reference.

---

## ✅ LIVE DATABASE SCHEMA (VERIFIED AUGUST 17, 2025)

### 🚨 IMPORTANT DISCREPANCIES FOUND
**The live database differs from TypeScript types in several ways:**
- Missing tables: `inventory`, `admin_settings` (exist in types but not in database)
- Column differences in `profiles`, `bookings`, `orders` tables
- **Trigger missing**: No triggers found in Section 6 result

---

### 📋 `profiles` Table (ACTUAL SCHEMA)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  role TEXT,                              -- ⚠️ Different from types
  phone TEXT,                             -- ⚠️ Different from types  
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  email TEXT,                             -- ✅ EXISTS (added by our fix)
  phone_number TEXT,                      -- ✅ EXISTS (added by our fix)
  is_admin BOOLEAN,                       -- ✅ EXISTS (added by our fix)
  is_staff BOOLEAN                        -- ✅ EXISTS (added by our fix)
);
```
**Current Data**: ✅ 1 profile (migration successful!)

### 📅 `bookings` Table (ACTUAL SCHEMA)
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,                     -- ⚠️ Different: not 'customer_name'
  email TEXT NOT NULL,                    -- ⚠️ Different: not 'customer_email'
  phone TEXT,                             -- ⚠️ Different: not 'customer_phone'
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  status TEXT,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### 🍕 `menu_categories` Table (ACTUAL SCHEMA)  
```sql
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
);
```
**Current Data**: ✅ 16 categories active

### 🍽️ `menu_items` Table (ACTUAL SCHEMA)
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES menu_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  is_available BOOLEAN,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```
**Current Data**: ✅ 22 menu items active

### � `orders` Table (ACTUAL SCHEMA)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  order_number TEXT UNIQUE,
  status TEXT,
  total_amount NUMERIC,
  payment_status TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```
**Current Data**: ✅ 0 orders (expected - ready for first order)

### 📦 `order_items` Table (ACTUAL SCHEMA)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### 🎉 `events` Table (ACTUAL SCHEMA)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### 📞 `staff_requests` Table (ACTUAL SCHEMA)
```sql
CREATE TABLE staff_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  request_type TEXT,
  message TEXT NOT NULL,
  status TEXT,
  priority TEXT,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

---

## � CRITICAL ISSUES IDENTIFIED

### ❌ MISSING TRIGGER
**Section 6 returned no results** - This means our trigger fix didn't work properly!
- The `on_auth_user_created` trigger is NOT active
- New users will NOT automatically get profiles
- This is still a production blocker

### ⚠️ SCHEMA MISMATCHES  
**TypeScript types don't match live database:**
- Missing tables: `inventory`, `admin_settings`
- Column name differences in multiple tables
- **Need to regenerate types from live database**

---

## 🔧 IMMEDIATE ACTIONS REQUIRED

### 1. FIX THE TRIGGER (URGENT)
The trigger deployment failed. Need to:
- Re-run the trigger creation
- Verify it actually gets created
- Test with a new user signup

### 2. UPDATE TYPESCRIPT TYPES
```bash
npm run db:generate-types
```

### 3. UPDATE CODE REFERENCES
- Fix any code using wrong column names
- Update queries to match live schema
- Test all database operations

---

## 📊 CURRENT STATUS
- ✅ Database structure exists
- ✅ Menu system working (16 categories, 22 items)  
- ✅ Profile migration successful (1 profile exists)
- ❌ Auto-profile trigger MISSING (critical blocker)
- ⚠️ TypeScript types outdated
