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

## 🚨 CRITICAL: ZERO CODE DRIFT PROTOCOL - MANDATORY

### **🛡️ ANTI-REGRESSION RULES (ADDED DUE TO REPEATED ISSUES)**

**BEFORE ANY CODE CHANGES:**
1. **ONE ISSUE = ONE MINIMAL FIX** - Never change multiple systems simultaneously
2. **TEST CRITICAL FUNCTIONS** - Element selection, navigation, responsive design  
3. **SPECIFIC CSS TARGETING** - Use `nav a`, `header a` NOT broad `a` selectors
4. **IMMEDIATE REGRESSION CHECK** - Test locally AND live before commit

**MANDATORY TESTING SEQUENCE:**
- Local test → Live test → Element selection → Navigation hiding → Scrollbars → Deploy
- If ANY regression found → STOP, revert, analyze interaction

**CSS CHANGE RULES:**
- Test element selection immediately after ANY CSS changes
- Never use overly broad selectors (like `a` instead of `nav a`)  
- Always verify `pointer-events` don't block interactive elements
- Test hover states and interactive functionality

## 🚨 CRITICAL: DOCKER-FIRST DATABASE PROTOCOL - MANDATORY

### **🔴 DOCKER-FIRST DATABASE RULE (ADDED DUE TO REPEATED ISSUES)**

**BEFORE ANY DATABASE OPERATIONS:**
1. **ALWAYS START WITH DOCKER CONNECTION** - No exceptions
2. **VERIFY DOCKER DATABASE ACCESS** - Test connection works properly  
3. **USE DIRECT SQL EXECUTION** - Provide SQL scripts for manual execution if needed
4. **NEVER ATTEMPT MIGRATIONS FIRST** - They consistently fail and waste time
5. **NO QUICK FIXES OR WORKAROUNDS** - If Docker doesn't work, fix Docker or ask user to install it

#### **Mandatory Docker Workflow:**
```bash
# Step 1: Start Docker services
npm run docker:up

# Step 2: Verify database connection
npm run docker:logs

# Step 3: Use direct SQL execution or provide SQL scripts
# Step 4: Only attempt other approaches if Docker fails
```

#### **STRICT NO-SHORTCUT RULE:**
- **NEVER attempt alternative methods** if Docker fails
- **NEVER use quick fixes** like direct Supabase CLI calls
- **IMMEDIATELY stop and fix Docker** or ask user to install Docker Desktop
- **NO EXCEPTIONS** - This rule has been violated repeatedly causing wasted time

#### **SQL Script Fallback:**
If Docker approach fails, **IMMEDIATELY** provide SQL scripts for manual execution in Supabase SQL Editor.

**This protocol prevents the recurring pattern of:**
1. Try migration → fails
2. Try different approach → fails  
3. Try another approach → fails
4. User stops and asks to use Docker → works

### **🚨 USER HAS EMPHASIZED: NO QUICK FIXES - FIX DOCKER PROPERLY OR REQUEST INSTALLATION**

## MANDATORY: Live Database Protocol - NO STATIC FILES!

### 🚨 CRITICAL RULE: Always Use Live Database Connection
**NEVER reference SQL files, migration files, or static schema documentation!**

### Database Development Protocol - LIVE ONLY!
**When working with database:**
1. **Connect to live Supabase** using environment variables in `.env.local`
2. **Query actual tables** to see current structure and data using Supabase CLI:
   ```bash
   # Get complete schema
   supabase db dump --schema=public --data-only=false
   
   # Generate fresh TypeScript types
   supabase gen types typescript --project-id awytuszmunxvthuizyur > src/types/supabase.ts
   ```
3. **Never trust static files** - they are always outdated and incorrect
4. **Test database operations** immediately on live connection
5. **Update TypeScript types** after any schema inspection: `npm run db:generate-types`
6. **Delete temporary scripts** after use - keep nothing static!

### What NOT to Do:
- ❌ **NO static SQL files** - delete them if found
- ❌ **NO migration file references** - they're often wrong
- ❌ **NO static schema documentation** - always outdated
- ❌ **NO assumptions about database structure** - always verify live

### Live Database Connection Details:
- **Production Supabase**: `https://awytuszmunxvthuizyur.supabase.co`
- **Environment File**: `.env.local` (contains live credentials)
- **Schema Access**: Via Supabase CLI and direct queries only
- **TypeScript Types**: Auto-generated from live database in `src/types/supabase.ts`

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

### 🔄 AUTOMATIC DEPLOYMENT WORKFLOW
**CRITICAL:** This project uses automatic deployment:
- **Platform:** Vercel (Production)
- **Trigger:** Every push to main branch automatically deploys
- **No manual deployment needed** - just push to GitHub
- **Repository:** DDMaster24/little-latte-lane
- **Branch:** main → production

```bash
# To deploy changes:
git add -A
git commit -m "description"
git push origin main
# → Automatic Vercel deployment triggered
```

**NEVER run manual deployment commands** - the system handles it automatically.

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
2. **Connect to live database** for exact database structure verification
3. **Validate** that ANY requested work aligns with contract scope
4. **Reject scope drift** - if request doesn't match contract, suggest updating contract first
5. **Reference contract sections** in all responses to maintain alignment

### Live Database Reference - NO MORE STATIC FILES!
**ALWAYS use LIVE database connection for database operations:**
- **NEVER reference static SQL files** - they are always outdated and wrong
- **NEVER reference migration files** - they don't reflect current state
- **NEVER reference DATABASE-SCHEMA.md** - it has been deleted for being incorrect
- Use the live Supabase connection to get current state via `supabase db dump`
- TypeScript types in `src/types/supabase.ts` are auto-generated from live DB
- Create database test scripts when needed (then delete them)
- **GOLDEN RULE**: If it's not in the live database, it doesn't exist!

### Critical Files Priority Order
1. **`PROJECT-CONTRACT.md`** - SINGLE source of truth for project status and database contracts
2. **Live Supabase Database** - SINGLE source of truth for actual database structure  
3. **`src/types/supabase.ts`** - Generated types (auto-updated from live database)
4. **`.github/copilot-instructions.md`** - This file (development patterns)

### Database Development Protocol
**When working with database:**
1. **Connect to live Supabase** using environment variables in `.env.local`
2. **Use `supabase db dump --schema=public --data-only=false`** to see current structure
3. **Never trust any static files** - they are always outdated and incorrect
4. **Update PROJECT-CONTRACT.md** with any findings
5. **Regenerate TypeScript types** after any schema changes: `supabase gen types typescript --project-id awytuszmunxvthuizyur > src/types/supabase.ts`
6. **Delete temporary scripts** after use

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
- **NO SQL FILES** - Use live database connection only via Supabase CLI
- **NO STATIC SCHEMAS** - Always query live database for current structure
- `PROJECT-CONTRACT.md` - **CRITICAL**: Current phase tracking and scope definition

## Development Discipline

- **Live Database Only** - Never reference static SQL files or migration files
- **Contract is single source of truth** - if it's not in the contract, it's not approved
- **Always verify schema** using `supabase db dump --schema=public --data-only=false`
- **Regenerate types** after schema inspection: `supabase gen types typescript --project-id awytuszmunxvthuizyur > src/types/supabase.ts`
- **Update contract BEFORE coding** new features
- **Test on live database** immediately after any database changes
- **No assumptions** - always verify current database state
