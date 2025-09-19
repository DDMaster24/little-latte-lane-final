# 🍕 Little Latte Lane - Project Contract

## 📊 CURRENT STATUS - September 19, 2025

### **🎯 WORKSPACE STATE: STABLE FOUNDATION**
- **Current Commit**: 735f938 "COMPLETE: Homepage Design Improvements - Modern Bookings & Spacing"
- **Status**: Clean working directory, ready for systematic development
- **Last Action**: Workspace restored from code drift (Sept 19, 2025)

## 🏗️ SYSTEM ARCHITECTURE

### **Production Systems (Operational)**
1. **React Bricks CMS** - Homepage editing with color picker controls
2. **Admin Dashboard** - Order management, analytics, user management  
3. **Responsive Design** - Mobile-first approach across all devices
4. **Menu System** - React Bricks editable menu with category organization
5. **Authentication** - Multi-role system (customer/staff/admin) with RLS
6. **Payment Integration** - Yoco for South African market
7. **Database** - Supabase PostgreSQL with Row Level Security

### **Technical Stack**
- **Frontend**: Next.js 15 + React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **CMS**: React Bricks with custom components
- **Payment**: Yoco integration
- **Deployment**: Vercel with automatic CI/CD
- **State**: Zustand for cart management

## 🗄️ DATABASE SCHEMA

### **Core Tables**
```sql
-- User Management
profiles (id, email, full_name, phone, address, is_admin, is_staff, role)

-- Menu System  
menu_categories (id, name, description, display_order, is_active)
menu_items (id, category_id, name, description, price, image_url, is_available)

-- Order Management
orders (id, user_id, order_number, status, total_amount, payment_status, special_instructions)
order_items (id, order_id, menu_item_id, quantity, unit_price, customization)

-- Content Management
theme_settings (id, setting_key, setting_value, category, page_scope)
events (id, title, description, date, is_active)

-- Additional Systems
bookings (id, user_id, date, time, party_size, status, special_requests)
staff_requests (id, user_id, type, description, status, priority)
```

### **Security Model**
- **RLS Policies**: Role-based access control on all tables
- **Helper Functions**: `is_admin()`, `is_staff_or_admin()`, `get_user_role()`
- **Auto-Profile Creation**: `handle_new_user()` trigger on auth.users

## 🛠️ DEVELOPMENT GUIDELINES

### **Critical Protocols**
1. **Database Access**: Always use live Supabase connection, never static files
2. **Schema Changes**: Update types with `supabase gen types typescript`
3. **Git Workflow**: Commit frequently, avoid code drift
4. **Windows PowerShell**: Use `;` for command chaining, not `&&`
5. **React Bricks**: Follow established brick patterns for new components

### **Supabase Client Pattern**
```typescript
// Client-side (components, hooks)
import { getSupabaseClient } from '@/lib/supabase'

// Server-side (actions, API routes)  
import { getSupabaseServer } from '@/lib/supabase'

// Admin operations (service role)
import { getSupabaseAdmin } from '@/lib/supabase'
```

### **File Structure**
```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components  
├── lib/queries/           # Centralized database operations
├── stores/                # Zustand state management
└── types/                 # TypeScript definitions

react-bricks/
├── config.tsx             # React Bricks configuration
├── bricks/                # Custom brick components
└── components/            # Shared brick components
```

## 🎯 DEVELOPMENT WORKFLOW

### **Contract-First Development**
1. **Read Contract** - Always start by reviewing current status
2. **Validate Scope** - Ensure work aligns with project phase
3. **Connect Live DB** - Use live Supabase for schema verification
4. **Systematic Changes** - One feature at a time, test thoroughly
5. **Update Contract** - Document progress and any discoveries

### **React Bricks Methodology**
1. **Create Page Component** - Follow `EditableHomepage` pattern
2. **Create Custom Bricks** - Add to `react-bricks/bricks/` directory
3. **Register in Index** - Add to categorization system
4. **Admin Setup** - Use `/admin/editor` for content creation
5. **Route Integration** - Implement editable component pattern

## 📋 MILESTONE HISTORY

### **September 2025**
- **Sept 19**: Workspace restored to stable state (735f938)
- **Sept 16**: React Bricks system analysis completed

### **August 2025**  
- **Aug 30**: Page editor navigation-free editing
- **Aug 27**: Visual editor removal and database analysis
- **Aug 22**: Kitchen view split layout implementation
- **Aug 21**: Staff panel UI/UX enhancement
- **Aug 20**: Loading states and linear flow optimization
- **Aug 19**: Database performance optimization, real-time staff panel
- **Aug 18**: Live deployment and payment flow optimization
- **Aug 17**: Database schema alignment and monitoring implementation

## 🚨 ANTI-REGRESSION RULES

### **Code Drift Prevention**
- **One Issue = One Fix** - Never change multiple systems simultaneously
- **Test Critical Functions** - Element selection, navigation, responsive design
- **Specific CSS Targeting** - Use precise selectors, avoid broad `a` tags
- **Immediate Testing** - Test locally AND live before commit

### **Mandatory Testing Sequence**
1. Local functionality test
2. Live deployment verification  
3. Element selection validation
4. Navigation and mobile testing
5. Database operation verification

## 🔧 ENVIRONMENT SETUP

### **Required Environment Variables**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Yoco Payments
NEXT_PUBLIC_YOCO_PUBLIC_KEY=
YOCO_SECRET_KEY=
YOCO_WEBHOOK_SECRET=

# React Bricks
REACT_BRICKS_API_KEY=
REACT_BRICKS_APP_ID=
```

### **Development Commands**
```bash
# Development
npm run dev                 # Start development server
npm run build              # Production build
npm run typecheck          # TypeScript validation

# Database
supabase gen types typescript --project-id [PROJECT_ID]  # Generate types

# Deployment  
git push origin main       # Auto-deploy to Vercel
```

## 🎯 CURRENT PRIORITIES

### **Next Development Phase**
Based on current stable state at 735f938, the next systematic development should:

1. **Assess Current Functionality** - Review what's working in homepage design
2. **Identify Next Feature** - Choose single improvement from contract scope
3. **Plan Implementation** - Design approach without architectural changes  
4. **Implement & Test** - Build feature with immediate validation
5. **Document Progress** - Update contract with results

### **Available Admin Interfaces**
- **React Bricks CMS**: `/admin/cms` - Content management
- **Visual Editor**: `/admin/editor` - Page editing interface  
- **Media Library**: `/admin/media` - Asset management
- **Admin Dashboard**: `/admin` - Restaurant management

---

*This contract serves as the single source of truth for Little Latte Lane development. Always reference this document before making changes to maintain systematic progress and prevent code drift.*