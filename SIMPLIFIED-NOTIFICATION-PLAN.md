# 🔔 SIMPLIFIED NOTIFICATION SYSTEM - CORE REQUIREMENTS

## 🎯 **CORE 4 NOTIFICATION TYPES REQUIRED**

### **1. 📧 EMAIL VERIFICATION (Signup)**
- **Trigger**: New user account creation
- **Purpose**: Verify email address with branded template
- **From**: `admin@littlelattelane.co.za`
- **Template**: Custom branded (NOT default Supabase)
- **Status**: ✅ **READY** - Already implemented in `emailTemplates.ts`

### **2. 🔐 PASSWORD RESET**
- **Trigger**: User forgets password/username
- **Purpose**: Secure password reset with branded template  
- **From**: `admin@littlelattelane.co.za`
- **Template**: Custom branded (NOT default Supabase)
- **Status**: ✅ **READY** - Already implemented in `emailTemplates.ts`

### **3. 🍕 INTERNAL ORDER NOTIFICATIONS (Website)**
- **Trigger**: Order status updates from kitchen
- **Purpose**: Show progress on "My Account" page - Active Orders section
- **Updates**: Order received → Being made → Ready → Completed
- **Display**: In-app notifications on customer account page
- **Status**: 🔄 **NEEDS SIMPLIFICATION** - Remove email, keep in-app only

### **4. 📱 PWA PUSH NOTIFICATIONS**
- **Trigger**: Order status updates (if app installed)
- **Purpose**: Native push notifications for installed PWA users
- **Display**: System notifications on mobile/desktop
- **Status**: 🚧 **NEEDS IMPLEMENTATION** - Service worker ready, need push logic

---

## 🧹 **CLEANUP REQUIRED - REMOVE REDUNDANT FUNCTIONS**

### **❌ REMOVE: Complex Email Status Updates**
Current system sends emails for every order status change - this is too much:
- ❌ Order confirmed email
- ❌ Order preparing email  
- ❌ Order ready email
- ❌ Order completed email
- ❌ Order cancelled email

### **✅ KEEP: Simple In-App Notifications**
- ✅ Order status tracking on account page
- ✅ Real-time status updates (confirmed → preparing → ready → completed)
- ✅ Clean, simple progress indicator

### **❌ REMOVE: Redundant Files**
- `src/lib/orderStatusNotifications.ts` - Too complex, replace with simple version
- Multiple email templates for order status - Keep only signup/password reset

---

## 🎯 **IMPLEMENTATION PLAN**

### **Phase 1: Email Configuration (Supabase Auth)**
1. **Configure Supabase Auth Templates**
   - Replace default signup email with branded template
   - Replace default password reset with branded template
   - Set `admin@littlelattelane.co.za` as sender for all auth emails

### **Phase 2: Simplified Order Tracking**
1. **Create Simple Order Status Component**
   - Real-time order status on account page
   - Simple progress bar: Received → Making → Ready → Completed
   - No email notifications, just in-app updates

### **Phase 3: PWA Push Notifications**
1. **Implement Push Notification Service**
   - Service worker registration for push notifications
   - User permission request
   - Push notification on order status updates
   - Only for users with installed PWA

### **Phase 4: Admin Integration**
1. **Kitchen Status Updates**
   - Admin/staff can update order status
   - Updates immediately reflected on customer account page
   - Simple status dropdown in admin panel

---

## 📧 **EMAIL ADDRESSES CONFIGURATION**

### **Authentication Emails** (Supabase Configuration)
- **From**: `admin@littlelattelane.co.za`
- **Signup Verification**: Custom branded template
- **Password Reset**: Custom branded template

### **Kitchen Operations** (Internal Communication)
- **From**: `orders@littlelattelane.co.za`
- **Purpose**: Staff notifications only (not customer emails)

### **Owner Communications** (Management)
- **From**: `peet@littlelattelane.co.za`
- **Purpose**: Important business notifications

---

## 🔧 **TECHNICAL APPROACH**

### **Supabase Auth Email Templates**
```sql
-- Configure custom email templates in Supabase Dashboard
-- Settings > Authentication > Email Templates
-- Replace default templates with branded HTML from emailTemplates.ts
```

### **Simplified Order Status System**
```typescript
// Simple order status tracking - no emails
export type OrderStatus = 'received' | 'making' | 'ready' | 'completed';

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  // Update database
  // Send PWA push notification if user has app installed
  // NO EMAIL SENDING
}
```

### **PWA Push Notifications**
```typescript
// Service worker push notification handling
self.addEventListener('push', function(event) {
  const data = event.data.json();
  const title = 'Little Latte Lane';
  const options = {
    body: `Your order #${data.orderId} is ${data.status}`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
```

---

## ✅ **IMMEDIATE ACTIONS NEEDED**

1. **Configure Supabase Auth Email Templates**
   - Upload branded signup/password reset templates
   - Set `admin@littlelattelane.co.za` as sender

2. **Remove Complex Email System**
   - Delete `orderStatusNotifications.ts`
   - Remove email sending from order status updates
   - Keep only simple status tracking

3. **Implement PWA Push Notifications**
   - Add push notification permission request
   - Implement service worker push handling
   - Connect to order status updates

4. **Test Complete Flow**
   - Test signup email verification
   - Test password reset email
   - Test order status updates on account page
   - Test PWA push notifications

**Goal: Simple, reliable notification system focused on core user needs without email spam.**
