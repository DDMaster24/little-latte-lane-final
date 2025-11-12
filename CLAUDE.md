# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Little Latte Lane** is a full-stack restaurant platform built with Next.js 15, React 19, and Supabase. The system handles online ordering, table/golf bookings, payments via Yoco (South African market), and includes a CMS powered by React Bricks. Features multi-role authentication (customer/staff/admin) with comprehensive RLS policies.

**Current Status (Nov 2025):** Web app operational. Android AAB rebuild pending after config fixes. iOS icons generated, archive rebuild ready. Notification system is next major feature.

## Essential Commands

### Development
```bash
npm run dev                 # Start development server
npm run dev:docker         # Start with Docker containers + dev
npm run build              # Production build (test before deploy)
npm run typecheck          # TypeScript validation
npm run lint:fix           # Auto-fix ESLint issues
```

### Database Operations
```bash
# CRITICAL: Always use live database, NEVER static SQL files
supabase gen types typescript --project-id awytuszmunxvthuizyur > src/types/supabase.ts
```

### Quality Checks
```bash
npm run typecheck && npm run lint:fix && npm run build
```

### Deployment
**AUTOMATIC:** Push to `main` branch triggers Vercel deployment. No manual steps needed.

## Critical Architecture Patterns

### 1. Supabase Three-Tier Client System

**ALWAYS use the correct client:**

```typescript
// Client-side (components, hooks)
import { getSupabaseClient } from '@/lib/supabase-client'
const supabase = getSupabaseClient()

// Server-side (actions, API routes, middleware)
import { getSupabaseServer } from '@/lib/supabase-server'
const supabase = await getSupabaseServer()

// Admin operations (service role, bypasses RLS)
import { getSupabaseAdmin } from '@/lib/supabase-server'
const supabase = getSupabaseAdmin()
```

**Never:**
- Query `auth.users` directly (use `profiles` table)
- Mix client types (causes auth/permission errors)
- Use admin client for user-facing operations

### 2. Database Query Architecture

Centralized query classes in `src/lib/queries/`:
- `AuthQueries` - Client auth operations
- `ServerAuthQueries` - Server auth operations
- `AdminQueries` - Service role operations
- `ServerAdminQueries` - Server admin operations
- `MenuQueries` - Menu data fetching

**Pattern:**
```typescript
const menuQueries = new MenuQueries()
const categories = await menuQueries.getCategoriesWithItems()
```

### 3. Menu System Structure

**Advanced three-tier system:**

```
menu_categories (e.g., "Breakfast", "Drinks")
  └─> menu_items (e.g., "Cappuccino", base_price: 30)
        ├─> menu_item_variations (e.g., "Small":-5, "Medium":0, "Large":+10)
        │   Uses absolute_price (recommended) OR price_adjustment
        └─> menu_item_addons (via junction table)
              └─> menu_addons (e.g., "Extra Shot")
                    └─> addon_variations (e.g., "Single":+5, "Double":+10)
```

**Key Fields:**
- `menu_item_variations.absolute_price` - Preferred for size pricing (e.g., Small=25, Large=40)
- `menu_item_variations.price_adjustment` - Legacy adjustment system (not recommended)
- `addon_variations.absolute_price` - Absolute addon pricing
- `menu_item_addons.is_required` - Force selection (e.g., pizza size)
- `menu_item_addons.max_quantity` - Limit addon quantity

### 4. RLS Security Model

**Helper Functions (use in policies):**
```sql
public.is_admin()           -- Returns true if current user is admin
public.is_staff_or_admin()  -- Returns true if staff or admin
```

**Pattern (avoid infinite recursion):**
```sql
-- ✅ CORRECT
CREATE POLICY "staff_access" ON orders
FOR ALL USING (public.is_staff_or_admin());

-- ❌ WRONG (causes infinite recursion)
CREATE POLICY "staff_access" ON orders
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_staff = true)
);
```

**Profiles table:** Auto-created via `handle_new_user()` trigger. Uses boolean fields `is_admin`/`is_staff` (NOT enum).

### 5. Yoco Payment Integration

**Checkout Flow:**
```typescript
const yoco = new YocoSDK({
  publicKey: process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY
})

yoco.showPopup({
  amountInCents: totalAmount * 100,
  currency: 'ZAR',
  metadata: { orderId: order.id }
})
```

**Webhook Verification:**
```typescript
const signature = request.headers.get('X-Yoco-Signature')
// Verify with YOCO_WEBHOOK_SECRET
```

**Environment Variables:**
- `NEXT_PUBLIC_YOCO_PUBLIC_KEY` - Client-side
- `YOCO_SECRET_KEY` - Server-side
- `YOCO_WEBHOOK_SECRET` - Webhook verification

### 6. Cart State Management (Zustand)

**Critical Rule:** Items with customization NEVER merge.

```typescript
// Always add customized items as new entries
if (item.customization) {
  return { items: [...state.items, item] }
}

// Merge only non-customized identical items
const existingItem = state.items.find(i =>
  i.id === item.id && !i.customization
)
```

### 7. React Bricks CMS Integration

**Configuration:** `react-bricks/config.tsx`

**Custom Bricks:** Place in `react-bricks/bricks/`
- Register in `react-bricks/bricks/index.ts`
- Add to `allowedBlockTypes` in `react-bricks/pageTypes.ts`

**Editing:** Navigate to `/admin/editor` (admin role required)

## Database Development Protocol

### CRITICAL RULES

1. **NEVER use static SQL files or migration files** - Always outdated
2. **ALWAYS query live Supabase database** for current schema
3. **Generate TypeScript types** after any schema inspection
4. **Test on live database** immediately after changes
5. **Update PROJECT-CONTRACT.md** with findings

### Schema Verification
```bash
# Get current live schema
supabase gen types typescript --project-id awytuszmunxvthuizyur
```

### MCP Database Access
You have **read access** via MCP Supabase tools. Use for:
- Schema inspection
- Data audits
- Query testing
- Validation checks

**Example:**
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public';
```

## Component Architecture

### Client/Server Boundaries
- **All components** are client-side (`'use client'`) except data fetching
- **Server actions** in `src/app/actions.ts` and `src/app/admin/actions.ts`
- Use `ServerAuthQueries` for server-side auth checks

### UI Components (shadcn/ui)
- Base components: `src/components/ui/`
- Custom neon theme with Tailwind CSS
- Dark theme: `darkBg`, `neonCyan`, `neonPink` palette

### Error Handling
- `ErrorBoundary` wrapper for React error catching
- `ClientOnly` wrapper for client-only components (prevents hydration errors)

## Common Pitfalls & Solutions

### 1. Auth Issues
**Problem:** User created but no profile exists
**Solution:** Check `handle_new_user()` trigger is active. Uses INSERT/UPDATE logic to prevent race conditions.

### 2. RLS Policy Blocking Query
**Debug:**
```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user?.id)

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
console.log('Profile:', profile)
```

**Test policy in SQL editor:**
```sql
SELECT * FROM orders WHERE user_id = 'actual-uuid';
```

### 3. Hydration Errors
**Solution:** Wrap client-only components with `ClientOnly`:
```typescript
import ClientOnly from '@/components/ClientOnly'

<ClientOnly>
  <YourComponent />
</ClientOnly>
```

### 4. Build Failures
```bash
# Test locally first
npm run typecheck && npm run lint:fix && npm run build

# Common causes:
# - TypeScript errors
# - Missing environment variables (check Vercel dashboard)
# - Import errors
# - Circular dependencies (check with: npm run analyze)
```

### 5. Menu Item Variations Not Appearing
**Check:**
- `menu_item_variations.is_available = true`
- Join query includes variations
- `absolute_price` is set (preferred) OR `price_adjustment` is set

### 6. Real-time Subscriptions Not Working
**Solution:**
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('orders')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders'
    }, (payload) => {
      console.log('Change:', payload)
      refetchOrders()
    })
    .subscribe()

  return () => subscription.unsubscribe()
}, [])
```

## Project Contract Discipline

### Mandatory Workflow

**EVERY interaction must:**
1. **Read `PROJECT-CONTRACT.md`** to understand current status, phase, and scope
2. **Validate** that requested work aligns with contract
3. **Reference contract sections** in responses
4. **Reject scope drift** - suggest updating contract first if misaligned

### Database Work Protocol
1. Connect to live Supabase via MCP tools
2. Use `supabase gen types` to inspect schema
3. **NEVER trust static files** (always outdated)
4. Update `PROJECT-CONTRACT.md` with findings
5. Regenerate TypeScript types after changes
6. Test on live database immediately

### Contract Updates After Completion
```markdown
## ✅ COMPLETED: [Date] - [Task Name]
### What Was Done:
- [Specific items with file paths]
- [Database changes]
- [Tests performed]

### Files Modified:
- `src/path/file.ts` - [description]

### Validation:
- [x] TypeScript passes
- [x] Build succeeds
- [x] Feature tested

## 🎯 NEXT PHASE: [Phase Name]
```

## Absolute Rules (Zero Tolerance)

### 🔴 NEVER DO THESE:

1. **NO DOCUMENTATION FILES (.md)**
   - ❌ Guides, analysis reports, build instructions
   - ✅ Provide step-by-step guidance IN CHAT only
   - Exception: `README.md`, `PROJECT-CONTRACT.md`, `TECHNICAL-INFO.md`, `CLAUDE.md`

2. **NO STOPPING MID-TASK**
   - ❌ "Do you want me to continue?"
   - ✅ Complete ALL work fully before responding

3. **NO API KEYS IN FILES**
   - ❌ Actual keys anywhere except `.env.local` (gitignored)
   - ✅ Always redact: `re_****` or `YOUR_KEY_HERE`

4. **CHECK CONTRACT FIRST**
   - ❌ Running commands without verifying against `PROJECT-CONTRACT.md`
   - ✅ Read contract, validate action aligns with documented workflow

5. **NO DOCKER DATABASE COMMANDS**
   - ❌ `supabase status`, `supabase start`, `docker ps`
   - ✅ Use live database via MCP tools or `supabase gen types --project-id`

## WSL/Ubuntu Environment Notes

**You are operating in WSL Ubuntu.** Commands use bash syntax:
```bash
# ✅ Correct for WSL
npm run build && npm run test

# ❌ Wrong (PowerShell syntax)
npm run build; npm run test
```

**Git authentication:** GitHub CLI (`gh`) is configured and authenticated.

**MCP Configuration:** `.mcp.json` uses `npx` directly (WSL compatible). File is gitignored for security.

## Key Files & Directories

```
src/
├── app/                       # Next.js App Router pages
│   ├── actions.ts             # Server actions
│   ├── admin/                 # Admin dashboard
│   │   └── actions.ts         # Admin server actions
│   └── api/                   # API routes
├── components/                # React components
│   ├── ui/                    # shadcn/ui base components
│   └── Admin/                 # Admin-specific components
├── lib/
│   ├── queries/               # Centralized database queries
│   ├── supabase-client.ts     # Client Supabase instance
│   ├── supabase-server.ts     # Server Supabase instances
│   ├── yoco.ts                # Yoco payment integration
│   └── env.ts                 # Environment validation
├── hooks/                     # Custom React hooks
├── stores/                    # Zustand state management
└── types/
    └── supabase.ts            # Auto-generated DB types

react-bricks/
├── config.tsx                 # React Bricks configuration
├── bricks/                    # Custom CMS components
└── pageTypes.ts               # Page type definitions

supabase/
└── migrations/                # Database migrations

PROJECT-CONTRACT.md            # CRITICAL: Current phase & scope
TECHNICAL-INFO.md              # Technical details & patterns
.mcp.json                      # MCP server config (gitignored)
```

## Reference Documentation

- **Project Status:** `PROJECT-CONTRACT.md`
- **Technical Details:** `TECHNICAL-INFO.md`
- **GitHub Copilot Rules:** `.github/copilot-instructions.md`
- **This File:** `CLAUDE.md`

**Priority Order:**
1. `PROJECT-CONTRACT.md` - SINGLE source of truth for status & scope
2. Live Supabase Database - SINGLE source of truth for schema
3. `src/types/supabase.ts` - Generated types (auto-updated)
4. `.github/copilot-instructions.md` - Development patterns
5. `CLAUDE.md` - This guidance file

---

**Last Updated:** November 12, 2025
**Contract Version:** 2.0
**Database:** Live Supabase (Project ID: awytuszmunxvthuizyur)
