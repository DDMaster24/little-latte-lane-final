# 🔄 YOCO PAYMENT MIGRATION PLAN

## 📋 MIGRATION OVERVIEW
**Objective**: Replace PayFast payment gateway with Yoco payment system
**Priority**: **CRITICAL** - 30% of remaining work for 100% completion
**Timeline**: Next 1-2 development sessions

---

## 🗑️ PHASE 1: COMPLETE PAYFAST REMOVAL

### **Step 1: PayFast Files & Components to Remove**

#### **📁 Files to Delete Completely:**
```bash
# PayFast API Routes (8 files)
src/app/api/payfast/
├── notify/route.ts
├── return/route.ts
├── cancel/route.ts
├── create-payment/route.ts
├── retry-payment/route.ts
└── (entire payfast directory)

src/app/api/payfast-signature-verification/route.ts

# PayFast Service & Component
src/lib/payfast.ts
src/components/PayFastPayment.tsx
```

#### **🔧 Files to Modify (Remove PayFast References):**
```bash
# Middleware - Remove PayFast CORS handling
src/middleware.ts

# Environment validation
src/lib/env.ts

# Any imports/usage in components
src/components/CartSidebar.tsx (update payment component import)
```

#### **📝 Documentation to Update:**
```bash
README.md (remove PayFast environment variables)
PROJECT-CONTRACT.md (update payment system references)
```

### **Step 2: Environment Variables to Remove**
**From `.env.local` and Vercel:**
```bash
# Remove these PayFast variables:
NEXT_PUBLIC_PAYFAST_SANDBOX=false
PAYFAST_MERCHANT_ID=31225525
PAYFAST_MERCHANT_KEY=[LIVE KEY]
PAYFAST_PASSPHRASE=LLL24passforpf
PAYFAST_DEBUG=false
```

### **Step 3: Code References to Remove**
Based on grep search, remove PayFast from:
- **Middleware**: PayFast CORS handling
- **Environment schema**: PayFast variable validation  
- **Component imports**: Any PayFastPayment component usage
- **Type definitions**: PayFast interfaces and types

---

## 🎯 PHASE 2: YOCO RESEARCH & INTEGRATION PLAN

### **Step 1: Yoco API Research (Using developer.yoco.com)**
**Research Requirements**:
- [ ] **Authentication**: Understand Yoco API key authentication
- [ ] **Checkout API**: How to create checkout sessions
- [ ] **Payment Flow**: Customer redirect to Yoco → payment → return
- [ ] **Webhooks**: Payment notification handling
- [ ] **Test vs Live**: Sandbox/production environment setup

#### **Key Yoco Documentation to Review:**
- 🔗 **Main Hub**: https://developer.yoco.com/
- 🔗 **Checkout API**: https://developer.yoco.com/docs/checkout-api/introduction
- 🔗 **Getting Started**: https://developer.yoco.com/docs/getting-started
- 🔗 **Online Payments Guide**: https://developer.yoco.com/guides/online-payments/accepting-a-payment

### **Step 2: Yoco Account Setup**
**Action Items**:
- [ ] Access existing Yoco merchant account (user has login details)
- [ ] Obtain **test API keys** for development
- [ ] Obtain **live API keys** for production
- [ ] Setup **webhook endpoints** in Yoco dashboard
- [ ] Configure **return URLs** (success, cancel, error)

### **Step 3: Yoco Environment Configuration**
**New Environment Variables to Add:**
```bash
# Yoco Configuration
NEXT_PUBLIC_YOCO_ENVIRONMENT=test  # test or live
YOCO_SECRET_KEY=sk_test_[TEST_KEY]  # Secret key for API calls
YOCO_PUBLIC_KEY=pk_test_[TEST_KEY]  # Public key for client-side
YOCO_WEBHOOK_SECRET=[WEBHOOK_SECRET]  # For webhook verification
YOCO_DEBUG=true  # For development logging

# Production values:
# NEXT_PUBLIC_YOCO_ENVIRONMENT=live
# YOCO_SECRET_KEY=sk_live_[LIVE_KEY]
# YOCO_PUBLIC_KEY=pk_live_[LIVE_KEY]
```

---

## 🛠️ PHASE 3: YOCO IMPLEMENTATION

### **Step 1: Create Yoco Service Layer**
**New File**: `src/lib/yoco.ts`
```typescript
// Yoco API integration service
export interface YocoCheckoutSession {
  id: string;
  redirectUrl: string;
  status: string;
}

export interface YocoPaymentData {
  amount: number;  // In cents (ZAR)
  currency: 'ZAR';
  reference: string;  // Order ID
  metadata: {
    orderId: string;
    customerEmail: string;
  };
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
}

export class YocoService {
  static async createCheckoutSession(data: YocoPaymentData): Promise<YocoCheckoutSession>
  static async verifyWebhook(payload: string, signature: string): Promise<boolean>
  static async getPaymentStatus(sessionId: string): Promise<string>
}
```

### **Step 2: Create Yoco Payment Component**
**New File**: `src/components/YocoPayment.tsx`
```typescript
// Replace PayFastPayment.tsx with Yoco integration
interface YocoPaymentProps {
  orderId: string;
  amount: number;
  items: OrderItem[];
  userEmail: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function YocoPayment(props: YocoPaymentProps) {
  // Create checkout session with Yoco
  // Handle redirect to Yoco payment page
  // Manage loading states and errors
}
```

### **Step 3: Create Yoco API Routes**
**New Files**:
```bash
src/app/api/yoco/
├── create-checkout/route.ts     # Create Yoco checkout session
├── webhook/route.ts             # Handle Yoco payment notifications
├── verify-payment/route.ts      # Verify payment status
└── return/route.ts              # Handle success/cancel returns
```

### **Step 4: Update Cart Integration**
**File**: `src/components/CartSidebar.tsx`
```typescript
// Replace PayFastPayment import with YocoPayment
import YocoPayment from './YocoPayment';

// Update checkout button to use Yoco
<YocoPayment
  orderId={newOrder.id}
  amount={cartTotal}
  items={cart.items}
  userEmail={user.email}
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
/>
```

---

## 🧪 PHASE 4: TESTING & VALIDATION

### **Step 1: Development Testing**
**Test Cases**:
- [ ] **Checkout Creation**: Yoco session creates successfully
- [ ] **Payment Redirect**: User redirects to Yoco payment page
- [ ] **Payment Success**: Successful payment updates order status
- [ ] **Payment Failure**: Failed payment handled gracefully
- [ ] **Webhook Handling**: Payment notifications processed correctly
- [ ] **Return Flow**: User returns to success/cancel pages properly

### **Step 2: Integration Testing**
**End-to-End Scenarios**:
- [ ] **Complete Purchase**: Menu → Cart → Checkout → Yoco → Success
- [ ] **Multiple Items**: Various cart combinations
- [ ] **Different Users**: Customer accounts with profiles
- [ ] **Staff Notifications**: Orders appear in kitchen after payment
- [ ] **Email Notifications**: Order confirmations sent

### **Step 3: Production Deployment**
**Final Steps**:
- [ ] **Live API Keys**: Switch to production Yoco credentials
- [ ] **Live Test**: Small real transaction to verify
- [ ] **Webhook Security**: Production webhook validation
- [ ] **Error Monitoring**: Sentry capturing payment errors
- [ ] **Performance**: Payment flow under acceptable time limits

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: PayFast Removal ✅**
- [ ] Delete all PayFast files (8 API routes + component + service)
- [ ] Remove PayFast references from middleware.ts
- [ ] Remove PayFast environment variables from env.ts
- [ ] Update CartSidebar.tsx to remove PayFast imports
- [ ] Remove PayFast variables from .env.local and Vercel
- [ ] Clean up README.md PayFast documentation

### **Phase 2: Yoco Research ✅**
- [ ] Review Yoco developer documentation thoroughly
- [ ] Understand Yoco Checkout API flow
- [ ] Access Yoco merchant account and get API keys
- [ ] Setup webhook endpoints in Yoco dashboard
- [ ] Document Yoco integration requirements

### **Phase 3: Yoco Implementation ✅**
- [ ] Create yoco.ts service layer
- [ ] Create YocoPayment.tsx component
- [ ] Create Yoco API routes (4 routes)
- [ ] Update CartSidebar.tsx to use Yoco
- [ ] Configure Yoco environment variables

### **Phase 4: Testing & Launch ✅**
- [ ] Test complete checkout flow in development
- [ ] Verify webhook handling and order updates
- [ ] Test error scenarios and edge cases
- [ ] Deploy to production with live Yoco keys
- [ ] Verify live payment processing

---

## ⚠️ MIGRATION RISKS & MITIGATION

### **High Risk Items:**
1. **API Flow Differences**: Yoco may use different flow than PayFast
   - **Mitigation**: Study Yoco docs thoroughly before coding
2. **Webhook Security**: Different signature verification
   - **Mitigation**: Test webhook verification extensively
3. **Payment UX**: Customer experience changes
   - **Mitigation**: Maintain similar checkout design

### **Medium Risk Items:**
1. **Environment Setup**: Multiple new variables
   - **Mitigation**: Comprehensive testing in both environments
2. **Error Handling**: Different error responses
   - **Mitigation**: Robust error handling implementation

---

## 🎯 SUCCESS CRITERIA

**Migration Complete When:**
- ✅ All PayFast code removed from codebase
- ✅ Users can complete payments using Yoco
- ✅ Order status updates after Yoco payment
- ✅ Kitchen staff see orders immediately after payment
- ✅ Email confirmations work with Yoco payments
- ✅ Error handling covers Yoco-specific scenarios
- ✅ Performance meets requirements (<10s total checkout time)

---

## 🚀 NEXT IMMEDIATE ACTIONS

1. **Access Yoco Account**: Get test and live API keys
2. **Study Yoco Documentation**: Understand their Checkout API thoroughly
3. **Begin PayFast Removal**: Start with deleting PayFast files
4. **Create Yoco Service**: Build the integration layer
5. **Test Development Flow**: Ensure checkout works before production

**🎯 Ready to begin PayFast removal and Yoco integration!**
**Action Items**:
- [ ] Obtain official Yoko payment gateway documentation
- [ ] Review API endpoints and authentication methods
- [ ] Understand payment flow: initiate → process → webhook → complete
- [ ] Document integration requirements and differences from PayFast
- [ ] Identify required credentials (merchant ID, API keys, etc.)

### **Step 2: Yoko Account Setup**
**Action Items**:
- [ ] Create Yoko merchant account (if not already exists)
- [ ] Obtain test/sandbox credentials for development
- [ ] Setup webhook URLs in Yoko dashboard
- [ ] Configure return URLs (success, cancel, notify)
- [ ] Test basic API connectivity

### **Step 3: Environment Configuration**
**Current PayFast Variables (to replace)**:
```bash
NEXT_PUBLIC_PAYFAST_SANDBOX=false
PAYFAST_MERCHANT_ID=31225525
PAYFAST_MERCHANT_KEY=[LIVE KEY]
PAYFAST_PASSPHRASE=LLL24passforpf
PAYFAST_DEBUG=false
```

**New Yoko Variables (to add)**:
```bash
NEXT_PUBLIC_YOKO_SANDBOX=true  # Start with sandbox
YOKO_MERCHANT_ID=[YOKO_MERCHANT_ID]
YOKO_API_KEY=[YOKO_API_KEY]
YOKO_API_SECRET=[YOKO_API_SECRET]
YOKO_WEBHOOK_SECRET=[YOKO_WEBHOOK_SECRET]
YOKO_DEBUG=true  # For development
```

---

## 🔧 PHASE 2: CODE MIGRATION

### **Step 1: Payment Component Migration**
**Files to Update**:
- `src/components/PayFastPayment.tsx` → `src/components/YokoPayment.tsx`

**Migration Tasks**:
- [ ] Replace PayFast form generation with Yoko API calls
- [ ] Update payment data structure for Yoko requirements
- [ ] Replace signature generation logic with Yoko authentication
- [ ] Update payment submission flow (form POST vs API call)
- [ ] Maintain existing loading states and error handling

### **Step 2: API Route Migration**
**Files to Update**:
- `src/app/api/payfast/create-payment/route.ts` → `src/app/api/yoko/create-payment/route.ts`
- `src/app/api/payfast/notify/route.ts` → `src/app/api/yoko/webhook/route.ts`
- `src/app/api/payfast/return/route.ts` → `src/app/api/yoko/return/route.ts`

**Migration Tasks**:
- [ ] Replace PayFast payment creation with Yoko payment initiation
- [ ] Update webhook verification logic for Yoko signatures
- [ ] Replace return URL handling for Yoko response format
- [ ] Ensure order status updates work with new webhook structure

### **Step 3: Cart Integration Update**
**Files to Update**:
- `src/components/CartSidebar.tsx`

**Migration Tasks**:
- [ ] Update payment button to use YokoPayment component
- [ ] Ensure order data structure matches Yoko requirements
- [ ] Maintain existing checkout flow and user experience
- [ ] Update loading states and success messaging

---

## 🧪 PHASE 3: TESTING & VALIDATION

### **Step 1: Sandbox Testing**
**Test Cases**:
- [ ] **Payment Creation**: Order data correctly sent to Yoko
- [ ] **Payment Processing**: User can complete payment on Yoko
- [ ] **Webhook Handling**: Order status updates after payment
- [ ] **Success Flow**: User redirected correctly after payment
- [ ] **Failure Handling**: Cancelled/failed payments handled gracefully
- [ ] **Amount Validation**: Correct order totals and currency

### **Step 2: Integration Testing**
**Test Scenarios**:
- [ ] **Complete Order Flow**: Menu → Cart → Checkout → Payment → Success
- [ ] **Multiple Items**: Cart with various items and customizations
- [ ] **Different Users**: Customer accounts with different profiles
- [ ] **Staff Notifications**: Orders appear in kitchen view after payment
- [ ] **Email System**: Order confirmation emails sent after payment

### **Step 3: Production Validation**
**Final Checks**:
- [ ] **Live Yoko Account**: Switch to production Yoko credentials
- [ ] **Real Payment Test**: Small test transaction in live environment
- [ ] **Webhook Security**: Production webhook validation working
- [ ] **Error Monitoring**: Sentry capturing any payment errors
- [ ] **Performance**: Payment flow completes within acceptable time

---

## 📂 FILE STRUCTURE CHANGES

### **Files to Create**:
```
src/
├── components/
│   └── YokoPayment.tsx           # New Yoko payment component
├── lib/
│   └── yoko.ts                   # Yoko helper functions and types
└── app/
    └── api/
        └── yoko/
            ├── create-payment/
            │   └── route.ts      # Yoko payment creation
            ├── webhook/
            │   └── route.ts      # Yoko webhook handler
            └── return/
                └── route.ts      # Yoko return handler
```

### **Files to Remove (After Migration)**:
```
src/
├── components/
│   └── PayFastPayment.tsx        # Remove after migration
└── app/
    └── api/
        └── payfast/              # Remove entire directory
```

---

## 🔍 YOKO API RESEARCH QUESTIONS

**Need to Research**:
1. **Authentication Method**: API key, OAuth, or other?
2. **Payment Initiation**: Direct API call or form POST?
3. **Webhook Format**: What data structure does Yoko send?
4. **Signature Verification**: How to verify webhook authenticity?
5. **Currency Support**: ZAR (South African Rand) support?
6. **Error Codes**: What error responses to handle?
7. **Redirect Flow**: How does user return after payment?

---

## ⚠️ MIGRATION RISKS & MITIGATION

### **High Risk Items**:
1. **API Compatibility**: Yoko API may have different requirements than PayFast
   - **Mitigation**: Thorough documentation review before coding
2. **Webhook Security**: Different signature verification method
   - **Mitigation**: Test webhook verification extensively in sandbox
3. **Payment Flow UX**: User experience may differ from PayFast
   - **Mitigation**: Maintain similar checkout flow design

### **Medium Risk Items**:
1. **Environment Variables**: Many variables to update
   - **Mitigation**: Create checklist and test each environment
2. **Error Handling**: Different error scenarios with Yoko
   - **Mitigation**: Implement comprehensive error handling

---

## 📋 MIGRATION CHECKLIST

### **Pre-Migration**:
- [ ] Yoko account setup complete
- [ ] Yoko API documentation reviewed
- [ ] Test credentials obtained
- [ ] Development environment configured

### **During Migration**:
- [ ] YokoPayment component created and tested
- [ ] Yoko API routes implemented
- [ ] CartSidebar updated to use Yoko
- [ ] Sandbox testing complete

### **Post-Migration**:
- [ ] PayFast components removed
- [ ] Production Yoko credentials configured
- [ ] Live payment test successful
- [ ] Order notification system working
- [ ] Email confirmations working

---

## 🎯 SUCCESS CRITERIA

**Migration Complete When**:
- ✅ Users can complete payments using Yoko gateway
- ✅ Order status updates automatically after payment
- ✅ Kitchen staff see new orders immediately
- ✅ Email confirmations sent to customers
- ✅ Admin dashboard shows payment success
- ✅ No PayFast code remains in codebase
- ✅ All environment variables updated
- ✅ Error handling covers Yoko-specific scenarios

**🚀 Ready to Begin Yoko Migration - Awaiting API Documentation**
