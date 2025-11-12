# Little Latte Lane - Technical Information

## Architecture Overview

### Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS with custom neon theme
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **CMS:** React Bricks for content management
- **Payment:** Yoco payment gateway (South African market)
- **Deployment:** Vercel (automatic on push to main)
- **State Management:** Zustand for cart, React Context for auth

---

## Supabase Client Patterns

### Three-Tier Client System

**Client-Side (Browser):**
```typescript
import { getSupabaseClient } from '@/lib/supabase'
const supabase = getSupabaseClient()
```
Use in: Components, hooks, client-side data fetching

**Server-Side (Actions/API):**
```typescript
import { getSupabaseServer } from '@/lib/supabase'
const supabase = await getSupabaseServer()
```
Use in: Server actions, API routes, middleware

**Admin Operations (Service Role):**
```typescript
import { getSupabaseAdmin } from '@/lib/supabase'
const supabase = getSupabaseAdmin()
```
Use in: Admin operations that bypass RLS

---

## Database Schema Details

### User Management

**profiles table:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_staff BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Auto-creation trigger:**
- When user signs up → `handle_new_user()` trigger creates profile
- Prevents race conditions with proper INSERT/UPDATE logic
- Sets default role to 'customer'

### Menu System

**menu_categories:**
```sql
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**menu_items:**
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  customization_options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Order Management

**orders:**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**order_items:**
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  customization JSONB,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Content Management

**theme_settings:**
```sql
CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  category TEXT,
  page_scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Used for:**
- Restaurant closure state
- Site-wide configuration
- Feature flags

---

## Row Level Security (RLS)

### Helper Functions

**is_admin():**
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**is_staff_or_admin():**
```sql
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (is_staff = true OR is_admin = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS Policy Examples

**Profiles (users can read own, admins can read all):**
```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());
```

**Orders (users see own, staff/admin see all):**
```sql
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all orders"
  ON orders FOR SELECT
  USING (public.is_staff_or_admin());
```

---

## Authentication Flow

### Sign Up
1. User submits form → `/api/auth/signup`
2. Supabase creates auth.users entry
3. Trigger `handle_new_user()` creates profile
4. User redirected to home with session

### Login
1. User submits credentials → Supabase auth
2. Session cookie set
3. Middleware validates session on protected routes
4. User redirected based on role

### Logout
1. User clicks logout
2. `supabase.auth.signOut()` clears session
3. Redirect to home page
4. Server-side session cleanup

---

## Payment Integration (Yoco)

### Checkout Flow

**1. Frontend initiates:**
```typescript
const yoco = new YocoSDK({ publicKey: process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY })

yoco.showPopup({
  amountInCents: totalAmount * 100,
  currency: 'ZAR',
  name: 'Little Latte Lane',
  description: `Order #${orderNumber}`,
  metadata: {
    orderId: order.id,
    userId: user.id
  }
})
```

**2. Yoco processes payment**
- User enters card details in secure popup
- Yoco tokenizes card
- Payment processed

**3. Webhook callback:**
```typescript
// /api/webhooks/yoco
const signature = request.headers.get('X-Yoco-Signature')
// Verify signature with YOCO_WEBHOOK_SECRET
// Update order status
// Send confirmation email
```

### Environment Variables

**Client-side:**
```bash
NEXT_PUBLIC_YOCO_PUBLIC_KEY=pk_test_xxxxx
```

**Server-side:**
```bash
YOCO_SECRET_KEY=sk_test_xxxxx
YOCO_WEBHOOK_SECRET=wh_xxxxx
```

---

## React Bricks CMS

### Configuration

**File:** `react-bricks/config.tsx`
```typescript
const config: ReactBricksConfig = {
  appId: process.env.REACT_BRICKS_APP_ID!,
  apiKey: process.env.REACT_BRICKS_API_KEY!,
  bricks: [
    HeroBrick,
    MenuSection,
    FooterSection,
    // ... more bricks
  ],
  pageTypes: [
    {
      name: 'page',
      pluralName: 'pages',
      allowedBlockTypes: ['HeroBrick', 'MenuSection', ...]
    }
  ]
}
```

### Creating Custom Bricks

**1. Create brick component:**
```typescript
// react-bricks/bricks/MyBrick.tsx
import { types } from 'react-bricks/frontend'

interface MyBrickProps {
  title: string
  description: string
}

const MyBrick: types.Brick<MyBrickProps> = ({ title, description }) => {
  return (
    <div>
      <Text propName="title" value={title} />
      <RichText propName="description" value={description} />
    </div>
  )
}

MyBrick.schema = {
  name: 'my-brick',
  label: 'My Brick',
  category: 'content',
  sideEditProps: [
    {
      name: 'title',
      label: 'Title',
      type: types.SideEditPropType.Text
    }
  ]
}

export default MyBrick
```

**2. Register in index:**
```typescript
// react-bricks/bricks/index.ts
export { default as MyBrick } from './MyBrick'
```

**3. Add to allowed blocks in pageTypes.ts**

---

## Cart System (Zustand)

### Store Structure

```typescript
interface CartStore {
  items: CartItem[]
  addItem: (item: MenuItem, customization?: any) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}
```

### Customization Handling

**Rule:** Items with customization NEVER merge
```typescript
// Always add as new item if customized
if (item.customization) {
  return { items: [...state.items, item] }
}

// Merge if no customization and same item
const existingItem = state.items.find(i => i.id === item.id && !i.customization)
if (existingItem) {
  return { items: state.items.map(i => 
    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
  )}
}
```

---

## Real-Time Features (Supabase Subscriptions)

### Kitchen View Order Updates

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('orders')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders'
    }, (payload) => {
      // Refresh orders list
      fetchOrders()
      
      // Play sound for new orders
      if (payload.eventType === 'INSERT') {
        playNotificationSound()
      }
    })
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

### Restaurant Closure Status

```typescript
const { isClosed, closureReason } = useRestaurantClosure()

// Subscribes to theme_settings changes
// Updates UI immediately when closure status changes
```

---

## Error Handling

### ErrorBoundary Component

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### API Error Responses

**Standard format:**
```typescript
return NextResponse.json(
  { 
    error: 'Error message',
    code: 'ERROR_CODE',
    details: { ... }
  },
  { status: 400 }
)
```

---

## Performance Optimizations

### Next.js Image Optimization

```typescript
import Image from 'next/image'

<Image
  src={item.image_url}
  alt={item.name}
  width={400}
  height={300}
  priority={false}
  placeholder="blur"
  blurDataURL="/placeholder.png"
/>
```

### Database Query Optimization

**Use indexes:**
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
```

**Limit results:**
```typescript
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20)
```

---

## Security Best Practices

### Environment Variables

**Never commit:**
- API keys
- Secret keys
- Database credentials
- Webhook secrets

**Always use:**
- `.env.local` for local development (gitignored)
- Vercel environment variables for production
- `NEXT_PUBLIC_` prefix only for client-safe variables

### Input Validation

**Server-side validation:**
```typescript
import { z } from 'zod'

const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.number().min(1).max(100)
  })),
  totalAmount: z.number().min(0),
  specialInstructions: z.string().max(500).optional()
})

const validated = orderSchema.parse(requestData)
```

### CSRF Protection

- Middleware validates requests
- SameSite cookies
- Origin header checking for API routes

---

## Deployment Workflow

### Automatic Deployment (Vercel)

**1. Developer pushes to main:**
```bash
git add .
git commit -m "Feature: Add notification system"
git push origin main
```

**2. Vercel automatically:**
- Detects push
- Runs build process
- Runs type checking
- Deploys to production
- Updates live site

**3. Rollback if needed:**
- Vercel dashboard → Deployments
- Click previous deployment → Promote to Production

### Environment Variable Management

**Local:**
```bash
# .env.local (gitignored)
NEXT_PUBLIC_SUPABASE_URL=xxx
SUPABASE_SERVICE_KEY=xxx
```

**Production:**
- Vercel dashboard → Settings → Environment Variables
- Add variable → Save
- Redeploy to apply

---

## Testing Strategies

### TypeScript Validation

```bash
npm run typecheck
```

### ESLint

```bash
npm run lint
npm run lint:fix
```

### Build Testing

```bash
npm run build
```

### Manual Testing Checklist

- [ ] User signup/login flow
- [ ] Menu browsing and cart
- [ ] Checkout and payment
- [ ] Order confirmation
- [ ] Kitchen view order management
- [ ] Admin dashboard functions
- [ ] Mobile responsiveness
- [ ] Restaurant closure system

---

## Monitoring & Debugging

### Supabase Logs

**Database logs:**
- Supabase Dashboard → Logs → Database
- View slow queries
- Check RLS policy denials

**Auth logs:**
- Supabase Dashboard → Logs → Auth
- Failed login attempts
- Session issues

### Vercel Logs

**Runtime logs:**
- Vercel Dashboard → Project → Logs
- View API route errors
- Check build failures

**Analytics:**
- Vercel Dashboard → Analytics
- Page performance
- User traffic patterns

---

## Common Troubleshooting

### Issue: RLS policy blocking query

**Solution:**
```typescript
// Check if user is authenticated
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Not authenticated')

// Check if profile exists
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

// Test policy in SQL editor
SELECT * FROM profiles WHERE id = 'user-uuid-here';
```

### Issue: Build failing on Vercel

**Solution:**
```bash
# Test build locally first
npm run build

# Check for:
# - TypeScript errors
# - Missing environment variables
# - Import errors
# - Circular dependencies
```

### Issue: Cart not persisting

**Solution:**
```typescript
// Ensure Zustand persist middleware is configured
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({ ... }),
    { name: 'cart-storage' }
  )
)
```

---

**Last Updated:** October 21, 2025
