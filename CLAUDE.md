# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Little Latte Lane is a full-stack restaurant ordering and booking platform for the South African market, built with Next.js 15, React 19, Supabase, and Yoco payment integration. The application supports web and native mobile (iOS/Android via Capacitor).

**Key Features:**
- Multi-role authentication (customer/staff/admin) with Row Level Security
- Online ordering with cart customization
- Table and golf booking system
- Yoco payment processing (South African payment gateway)
- Real-time kitchen view for staff
- Progressive Web App capabilities
- React Bricks CMS for content management
- Admin dashboard with analytics

## Development Commands

### Core Development
```bash
npm run dev                  # Start development server (cloud Supabase)
npm run dev:docker          # Start local Docker containers + dev server
npm run build               # Production build
npm start                   # Start production server
```

### Code Quality
```bash
npm run typecheck           # TypeScript validation
npm run lint                # Run ESLint
npm run lint:fix            # Auto-fix ESLint issues
npm run format              # Format with Prettier
npm run format:check        # Check formatting without changes
npm run analyze             # Check circular dependencies with madge
```

### Testing
```bash
npm run test                # Run Playwright tests
npm run test:ui             # Run tests in UI mode
npm run test:debug          # Run tests in debug mode
```

### Database Operations
```bash
# Generate TypeScript types from live Supabase database
npm run db:generate-types

# Supabase CLI commands (uses cloud project, NOT local Docker)
supabase gen types typescript --project-id=awytuszmunxvthuizyur > src/types/supabase.ts
```

### Docker Development (Local Database)
```bash
npm run docker:up           # Start PostgreSQL and Redis containers
npm run docker:down         # Stop containers
npm run docker:logs         # View container logs
npm run docker:reset        # Reset containers and volumes
npm run docker:test         # Test database connection
```

### Mobile Development
```bash
# Capacitor sync (after web build changes)
npx cap sync

# iOS
npx cap open ios            # Open in Xcode

# Android
npx cap open android        # Open in Android Studio
```

## Critical Architecture Patterns

### Supabase Three-Tier Client System

**ALWAYS use the correct Supabase client based on execution context:**

```typescript
// ❌ WRONG - Never import createClient directly
import { createClient } from '@supabase/supabase-js'

// ✅ CORRECT - Client-side (components, hooks)
import { getSupabaseClient } from '@/lib/supabase-client'
const supabase = getSupabaseClient()

// ✅ CORRECT - Server-side (API routes, server actions)
import { getSupabaseServer } from '@/lib/supabase-server'
const supabase = await getSupabaseServer()

// ✅ CORRECT - Admin operations (bypasses RLS)
import { getSupabaseAdmin } from '@/lib/supabase-server'
const supabase = getSupabaseAdmin()
```

### Query Architecture

Use centralized query classes in `src/lib/queries/`:
- `AuthQueries` - Client-side auth operations
- `ServerAuthQueries` - Server-side auth operations
- Use query files for menu, orders, bookings, admin operations

```typescript
// Client-side authentication
import { authQueries } from '@/lib/queries/auth'
const user = await authQueries.getCurrentUser()

// Server-side authentication
import { ServerAuthQueries } from '@/lib/queries/auth'
const user = await ServerAuthQueries.getCurrentUser()
```

### Database Security - Row Level Security (RLS)

**Critical rules:**
- NEVER query `auth.users` table directly - always use `profiles` table
- User roles are boolean fields: `is_admin`, `is_staff` (NOT enum types)
- Helper function `public.is_staff_or_admin()` exists for RLS policies
- Profiles are auto-created via database trigger on user signup

**Testing RLS policies:**
```sql
-- ✅ GOOD: Uses helper function (prevents infinite recursion)
CREATE POLICY "staff_access" ON orders
FOR ALL USING (public.is_staff_or_admin());

-- ❌ BAD: Causes infinite recursion
CREATE POLICY "staff_access" ON orders
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_staff = true)
);
```

### State Management

**Cart Store (Zustand):**
```typescript
import { useCartStore } from '@/stores/cartStore'

// Customized items NEVER merge - always add as new
if (item.customization) {
  return { items: [...state.items, item] }
}
```

**Critical cart behavior:**
- Regular items with same ID merge quantities
- Customized items (pizzas, variants) always add as new items
- Cart persists to localStorage via zustand/persist

### Yoco Payment Integration

**Client-side checkout:**
```typescript
// Initialize Yoco SDK
const yoco = new YocoSDK({
  publicKey: process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY
})

// Show checkout popup
yoco.showPopup({
  amountInCents: totalInCents,
  currency: 'ZAR',
  // ... other options
})
```

**Webhook handling:**
- Webhook endpoint: `/api/yoco/webhook`
- Verify webhook signatures with `YOCO_WEBHOOK_SECRET`
- Update order status on payment confirmation
- Send email notifications via Resend API

### Component Patterns

**Client/Server boundaries:**
- ALL interactive components use `'use client'` directive
- Server components only for data fetching in layouts
- Server actions in `app/actions.ts` and `app/admin/actions.ts`

**UI Components (shadcn/ui):**
- Base components in `src/components/ui/`
- Custom neon theme: `darkBg`, `neonCyan`, `neonPink` Tailwind colors
- Dark theme by default with `next-themes`

## Mobile App Architecture (Capacitor)

**Configuration:**
- App ID: `co.za.littlelattelane.app`
- Web directory: `www` (contains redirect to live backend)
- Server URL: `https://www.littlelattelane.co.za`
- HTTPS enforced (no cleartext traffic)

**Critical files:**
- `capacitor.config.ts` - Capacitor configuration
- `android/app/src/main/res/xml/network_security_config.xml` - Android security
- `www/index.html` - Minimal redirect to live backend

**Mobile workflow:**
1. Build Next.js web app: `npm run build`
2. Copy to www: `npx cap sync`
3. Open in IDE: `npx cap open ios` or `npx cap open android`
4. Build and archive in Xcode/Android Studio

## Database Development Protocol

**CRITICAL: Always use LIVE database, never static files.**

```bash
# ✅ CORRECT - Get current schema from live database
supabase gen types typescript --project-id=awytuszmunxvthuizyur > src/types/supabase.ts

# ❌ NEVER reference migration files or static schema docs
# They are always outdated and incorrect
```

**After schema changes:**
1. Make changes in Supabase dashboard SQL editor
2. Test RLS policies with different user roles
3. Regenerate TypeScript types: `npm run db:generate-types`
4. Update query classes if needed

## Deployment

**Automatic Deployment (Web):**
- Platform: Vercel
- Trigger: Every push to `main` branch
- No manual deployment needed

```bash
git add .
git commit -m "description"
git push origin main
# → Vercel automatically deploys
```

**Environment Variables (Production):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin operations)
- `NEXT_PUBLIC_YOCO_PUBLIC_KEY` - Yoco public key
- `YOCO_SECRET_KEY` - Yoco secret key (server-side)
- `YOCO_WEBHOOK_SECRET` - Webhook signature verification

## Common Pitfalls

1. **Authentication:**
   - Don't query `auth.users` directly - use `profiles` table
   - Use correct Supabase client (client/server/admin)

2. **RLS Policies:**
   - Test policies in SQL editor before deploying
   - Use helper functions to avoid infinite recursion

3. **Type Safety:**
   - Always regenerate Supabase types after schema changes
   - Run `npm run typecheck` before committing

4. **Cart Behavior:**
   - Customized items must have unique IDs (don't merge)
   - Use proper CartItemCustomization interface

5. **Mobile Development:**
   - PWA is disabled (conflicts with Capacitor)
   - Always sync after web changes: `npx cap sync`
   - Build AAB/IPA in native IDEs (not CLI)

6. **Windows PowerShell Syntax:**
   - Use semicolons `;` to chain commands (not `&&`)
   - Example: `npm run build; npm run lint`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes (webhooks, auth, etc.)
│   ├── auth/              # Authentication pages
│   ├── cart/              # Cart and checkout
│   ├── ordering/          # Menu and ordering
│   └── staff/             # Staff kitchen view
├── components/            # React components
│   └── ui/               # shadcn/ui base components
├── lib/                   # Core utilities
│   ├── queries/          # Database query classes
│   ├── supabase-client.ts # Client-side Supabase
│   ├── supabase-server.ts # Server-side Supabase
│   ├── yoco.ts           # Yoco payment utilities
│   └── env.ts            # Environment validation
├── hooks/                 # Custom React hooks
├── stores/                # Zustand state management
└── types/                 # TypeScript definitions
    └── supabase.ts       # Auto-generated database types
```

## Important Documentation Files

1. **PROJECT-CONTRACT.md** - Current project status, deployment progress, completed features
2. **TECHNICAL-INFO.md** - Detailed database schema, API endpoints, deployment guides
3. **README.md** - User-facing setup instructions
4. **.github/copilot-instructions.md** - AI assistant development rules and patterns

## React Bricks CMS

- Used for homepage content, menu page, and restaurant closure messaging
- React Strict Mode MUST be disabled (`reactStrictMode: false`)
- CSP headers disabled in development for compatibility
- Admin access: `/admin/editor`

## Testing Patterns

- Playwright for E2E testing
- Test authentication flows with different roles
- Test Yoco payment webhooks with sandbox mode
- Verify RLS policies with different user contexts
