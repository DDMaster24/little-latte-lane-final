# Little Latte Lane - AI Development Instructions

## 🚨 ABSOLUTE RULES - ZERO TOLERANCE - IMMEDIATE TERMINATION IF VIOLATED

### **❌ PERMANENTLY BANNED - NEVER DO THESE:**

1. **NO DOCUMENTATION FILES** - **EVER**
   - ❌ NEVER create `.md` files (README.md, PROJECT-CONTRACT.md, and TECHNICAL-INFO.md are the ONLY exceptions)
   - ❌ NEVER create guides, analysis reports, checklists, build guides, deployment guides, or "helpful" documentation
   - ❌ Files like `BUILD-GUIDE.md`, `NOTIFICATION-SYSTEM-ANALYSIS.md`, `SECURITY-INCIDENT-RESPONSE.md`, `DEPLOYMENT-STEPS.md` are **PERMANENTLY BANNED**
   - ✅ **ALL step-by-step guides go in CHAT ONLY**
   - ✅ **ALL analysis goes in CHAT ONLY**
   - ✅ User explicitly requested: "stop creating documentation files, you're flooding the project"
   - ✅ **GOLDEN RULE: If user needs guidance, provide step-by-step instructions IN CHAT, not in a new .md file**
   - ✅ **Violation = Security incident (API keys in docs)**

2. **NEVER STOP MID-TASK**
   - ❌ NEVER ask "do you want me to continue?"
   - ❌ NEVER pause and wait for permission to finish
   - ❌ NEVER split work into "phases" that require approval
   - ✅ **COMPLETE ALL WORK FULLY** before responding
   - ✅ If task requires multiple steps → DO ALL STEPS
   - ✅ Example: "Fixing Google Maps" → Remove ALL references, don't stop halfway

3. **NO API KEYS IN ANY FILE**
   - ❌ NEVER write actual API keys in any file except `.env.local` (which is gitignored)
   - ❌ NEVER include keys in documentation, analysis, or chat examples
   - ✅ **ALWAYS redact**: `re_**********************` or `YOUR_KEY_HERE`
   - ✅ **Double-check BEFORE committing** - scan for patterns like `re_`, `sk_`, `pk_`, API keys

4. **EFFICIENT TOKEN USAGE**
   - ❌ User is paying for GitHub Copilot subscription - don't waste money
   - ❌ No 2000-line documentation files nobody reads
   - ❌ No verbose explanations when concise works
   - ✅ Be thorough but efficient
   - ✅ Code + brief explanation in chat = perfect

### **✅ CORRECT APPROACH:**

**User asks for analysis → Provide in CHAT with:**
- Clear summary (3-5 bullet points)
- Specific findings with line numbers
- Actionable recommendations
- Code examples if needed

**User asks for step-by-step guide → Provide in CHAT with:**
- Numbered steps with clear instructions
- Screenshots or code examples inline
- Expected results for each step
- Troubleshooting tips
- **NEVER create a separate .md guide file**

**User asks to fix something → DO IT COMPLETELY:**
1. Analyze the issue
2. Fix ALL related problems
3. Test thoroughly
4. Commit with clear message
5. Report completion in chat

**NO documentation files. NO stopping mid-task. ALWAYS finish completely. ALL guides go in chat.**

---

## Architecture Overview

**Little Latte Lane** is a Next.js 15 + React 19 restaurant platform with Supabase backend, featuring:
- **Multi-role authentication** (customer/staff/admin) with RLS policies  
- **Yoco payment integration** for South African market
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

## 🚨 CRITICAL: MANDATORY DATABASE ACCESS PROTOCOL - ZERO TOLERANCE FOR DOCKER

### **⛔ ABSOLUTE BAN: DOCKER DATABASE COMMANDS - INSTANT FAILURE PROTOCOL**

**🚫 PERMANENTLY BANNED COMMANDS - NEVER ATTEMPT:**
```bash
# ❌ NEVER ATTEMPT THESE - GUARANTEED TO FAIL:
supabase status
supabase db dump  
supabase db reset
supabase start
supabase stop
docker ps
docker-compose up
# ANY command mentioning Docker or local Supabase
```

**✅ ONLY ALLOWED DATABASE ACCESS METHODS:**

1. **PRIMARY METHOD - Schema Inspection:**
```bash
# ✅ CORRECT - Direct live database schema
supabase gen types typescript --project-id awytuszmunxvthuizyur
```

2. **SECONDARY METHOD - Runtime Database Operations:**
```javascript
// ✅ CORRECT - Use db.js file for queries
import sql from './db.js'
const result = await sql`SELECT * FROM theme_settings`
```

**🎯 MANDATORY FIRST RESPONSE TO DATABASE REQUESTS:**
When user asks about database schema or connection:
1. **IMMEDIATELY use**: `supabase gen types typescript --project-id awytuszmunxvthuizyur`
2. **NEVER try**: Docker, supabase status, or local commands first
3. **NO TESTING**: These commands work 100% - use them directly

### **🔒 GUARDRAIL ENFORCEMENT RULES:**
- **If Docker mentioned**: STOP immediately, explain it's banned
- **If CLI fails**: Use direct PostgreSQL connection via db.js
- **If schema needed**: ALWAYS use live TypeScript generation first
- **NO EXCEPTIONS**: These rules prevent 90% of database access issues

## 🚨 CRITICAL: DEVELOPMENT METHODOLOGY - MANDATORY

### **🎯 SYSTEMATIC APPROACH ONLY - NO BAND-AID FIXES**

**MANDATORY DEVELOPMENT RULES:**
1. **COMPLETE ANALYSIS FIRST** - Always run full diagnostics before making changes
2. **WAIT FOR COMPLETION** - Never interrupt build/test processes to try "quick fixes"
3. **ONE SYSTEMATIC FIX** - Address root cause, not symptoms
4. **VERIFY PROPERLY** - Wait for commands to complete before declaring success
5. **NO SCATTERED APPROACHES** - Use the most direct method, not multiple attempts

**FORBIDDEN APPROACHES:**
- ❌ Band-aid fixes while diagnostics are still running
- ❌ Multiple different approaches when one systematic fix is needed
- ❌ Declaring success before processes complete
- ❌ Quick workarounds instead of proper solutions

### **🖥️ WINDOWS POWERSHELL SYNTAX - MANDATORY**

**CRITICAL TERMINAL COMMAND RULES:**
1. **NEVER USE `&&` SYNTAX** - This is bash/Linux syntax that fails in PowerShell
2. **USE SEMICOLON `;` FOR COMMAND CHAINING** - PowerShell standard
3. **USE POWERSHELL CMDLETS** - `Get-Content`, `Remove-Item`, etc.
4. **LEARN ONCE, APPLY ALWAYS** - Don't repeat the same syntax errors

**CORRECT POWERSHELL SYNTAX:**
```powershell
# ✅ CORRECT - Use semicolon
npm run build; npm run lint

# ✅ CORRECT - PowerShell cmdlets
Get-Content file.txt
Remove-Item file.txt -Force

# ❌ WRONG - Never use && in PowerShell
npm run build && npm run lint
```

**THIS RULE MUST BE FOLLOWED ON FIRST ATTEMPT - NO LEARNING EACH TIME**

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

## Yoco Integration Specifics

### Checkout Flow
Yoco uses a modern checkout popup with secure tokenization:
```typescript
// Initialize Yoco checkout with order data
const yoco = new YocoSDK({ publicKey: process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY })
yoco.showPopup({ ... })
```

### Environment Setup
- `NEXT_PUBLIC_YOCO_PUBLIC_KEY` - For client-side checkout
- `YOCO_SECRET_KEY` - For server-side payment processing
- `YOCO_WEBHOOK_SECRET` - For webhook signature verification

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

### Yoco Testing
- Always test in sandbox first with test cards
- Use webhook testing tools for payment verification
- Verify order status updates work correctly

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
- `YOCO_SECRET_KEY` - Required for server-side payment processing
- `YOCO_WEBHOOK_SECRET` - Required for webhook verification

### Performance
- PWA caching configured in `next.config.ts`
- Image optimization with WebP/AVIF support
- CSP headers optimized for Yoco compatibility

## Common Pitfalls

1. **Auth**: Don't query `auth.users` - use `profiles` table
2. **RLS**: Test policies in SQL editor before implementing  
3. **Yoco**: Use sandbox mode for testing first
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
