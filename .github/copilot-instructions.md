# Little Latte Lane - AI Development Instructions

## Architecture Overview

**Little Latte Lane** is a Next.js 15 + React 19 restaurant platform with Supabase backend, featuring:
- **Multi-role authentication** (customer/staff/admin) with RLS policies  
- **PayFast payment integration** for South African market
- **PWA capabilities** with offline support
- **Real-time features** via Supabase subscriptions
- **Comprehensive admin dashboard** with analytics

## Critical Supabase Patterns

### Three-Tier Client Pattern
Always use the correct Supabase client:
```typescript
// Client-side (components, hooks)
import { getSupabaseClient } from '@/lib/supabase'

// Server-side (actions, API routes)  
import { getSupabaseServer } from '@/lib/supabase'

// Admin operations (service role)
import { getSupabaseAdmin } from '@/lib/supabase'
```

### Query Architecture
Use centralized query classes in `src/lib/queries/`:
- `AuthQueries` - Client auth operations
- `ServerAuthQueries` - Server auth operations  
- `AdminQueries` - Service role operations
- `ServerAdminQueries` - Server admin operations

### RLS Security Model
- **Profiles table**: Auto-created via trigger on user signup
- **Role-based access**: Uses `is_admin`/`is_staff` boolean fields (NOT enum)
- **Helper functions**: `public.is_staff_or_admin()` for RLS policies
- **Critical**: Never query auth.users directly - always use profiles table

## PayFast Integration Specifics

### Signature Generation
PayFast requires **exact** field ordering and PHP-compatible URL encoding:
```typescript
// Use ONLY the official field order from PAYFAST_FIELD_ORDER
// PHP urlencode() differences: spaces→'+', uppercase hex, brackets encoded
const signature = payfast.generateSignature(paymentData)
```

### Environment Setup
- `NEXT_PUBLIC_PAYFAST_SANDBOX=true` for testing
- Sandbox vs Live have different validation rules
- Passphrase is optional but recommended for security

## State Management Patterns

### Zustand Store (Cart)
Custom cart logic handles pizza customization:
```typescript
// Customized items NEVER merge - always add as new
if (item.customization) {
  return { items: [...state.items, item] }
}
```

### React Query Alternative
Use Supabase's built-in real-time subscriptions instead of React Query for live data.

## Database Development Workflow

### Schema Changes
1. Update `src/types/supabase.ts` via: `npm run db:generate-types`
2. Test RLS policies in SQL editor first
3. Use helper functions in policies to avoid infinite recursion

### Common Patterns
```sql
-- Good: Uses helper function
CREATE POLICY "staff_access" ON orders 
FOR ALL USING (public.is_staff_or_admin());

-- Bad: Causes infinite recursion  
CREATE POLICY "staff_access" ON orders
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_staff = true)
);
```

## Component Architecture

### Client/Server Boundaries
- **All** components are client-side (`'use client'`) except data fetching
- Server actions in `app/actions.ts` and `admin/actions.ts`
- Use `ServerAuthQueries` for server-side auth checks

### UI Pattern (shadcn/ui)
- Base components in `src/components/ui/`
- Custom neon theme with Tailwind CSS custom colors
- Dark theme with `darkBg`, `neonCyan`, `neonPink` palette

## Development Commands

### Docker Development
```bash
npm run dev:docker    # Start containers + dev server
npm run docker:up     # Containers only
npm run docker:logs   # View container logs
```

### Quality Checks
```bash
npm run typecheck     # TypeScript validation
npm run lint:fix      # Auto-fix ESLint issues  
npm run analyze       # Check circular dependencies
npm run health        # System health check
```

## Testing & Debugging

### Auth Debugging
Use `debug-auth.js` script to troubleshoot RLS/profile issues:
```bash
node debug-auth.js
```

### PayFast Testing
- Always test in sandbox first
- Use debug mode: `PAYFAST_DEBUG=true`
- Verify signature generation with PayFast tools

## Deployment Notes

### Environment Variables
Critical production settings:
- `SUPABASE_SERVICE_KEY` - Required for admin operations
- `PAYFAST_PASSPHRASE` - Enhances payment security
- `NEXT_PUBLIC_PAYFAST_SANDBOX=false` - Enable live payments

### Performance
- PWA caching configured in `next.config.ts`
- Image optimization with WebP/AVIF support
- CSP headers configured for PayFast compatibility

## Common Pitfalls

1. **Auth**: Don't query `auth.users` - use `profiles` table
2. **RLS**: Test policies in SQL editor before implementing  
3. **PayFast**: Field order matters for signature generation
4. **Hydration**: Use `ClientOnly` wrapper for client-only components
5. **Types**: Always regenerate Supabase types after schema changes

## Project Contract Workflow

### MANDATORY: Contract-First Development
**EVERY INTERACTION MUST START WITH:**
1. **Read** `PROJECT-CONTRACT.md` completely to understand:
   - Current system status and critical blockers
   - Active phase objectives and scope
   - Technical constraints and requirements
   - Database schema and API contracts
2. **Reference** `DATABASE-SCHEMA.md` for exact database structure
3. **Validate** that ANY requested work aligns with contract scope
4. **Reject scope drift** - if request doesn't match contract, suggest updating contract first
5. **Reference contract sections** in all responses to maintain alignment

### Database Schema Reference
**ALWAYS check `DATABASE-SCHEMA.md` BEFORE any database operations:**
- Contains LIVE database schema (not TypeScript assumptions)
- Updated August 17, 2025 from actual database audit
- Exact column names, types, and relationships
- Prevents wasted time on incorrect assumptions

### Critical Files Priority Order
1. **`PROJECT-CONTRACT.md`** - Single source of truth for project status
2. **`DATABASE-SCHEMA.md`** - Single source of truth for database structure  
3. **`src/types/supabase.ts`** - Generated types (auto-updated from database)
4. **`.github/copilot-instructions.md`** - This file (development patterns)

### Contract Update Protocol
When completing ANY development work:
```markdown
## ✅ COMPLETED: [Date] - [Phase/Task Name]
### What Was Done:
- [Specific items completed with file paths]
- [Database changes made]
- [Tests/validation performed]
- [Issues resolved]

### Files Modified/Created:
- `src/path/to/file.ts` - [brief description]
- `sql/migration.sql` - [brief description]

### Validation:
- [x] TypeScript compilation passes
- [x] Build succeeds
- [x] Feature tested manually
- [x] Contract updated

## 🎯 NEXT PHASE: [Next Phase Name]
### Objectives:
- [Clear, measurable objectives]
- [Success criteria]
- [Dependencies and blockers]

### Updated Priority:
- [Current critical path items]
```

### AI Response Protocol
**EVERY AI response must:**
1. **Start with contract reference**: "Based on PROJECT-CONTRACT.md, I see..."
2. **Validate scope alignment**: "This request aligns with [contract section]" OR "This request requires contract update because..."
3. **Reference constraints**: Mention relevant technical constraints from contract
4. **End with contract update**: Propose specific contract updates when work is completed

### Development Discipline
- **Contract is single source of truth** - if it's not in the contract, it's not approved
- **No feature creep** - all requests must map to contract phases
- **Validate every change** against contract requirements
- **Update contract BEFORE coding** new features
- **Track progress** with specific completion markers
- **Maintain technical contracts** (schema, APIs, security policies)

## File Organization

- `src/app/` - Next.js 15 App Router pages
- `src/components/` - Reusable UI components
- `src/lib/queries/` - Centralized database operations
- `src/stores/` - Zustand state management
- `sql/` - Database migrations and scripts
- `*.sql` files in root - Database management utilities
- `PROJECT-CONTRACT.md` - **CRITICAL**: Current phase tracking and scope definition
