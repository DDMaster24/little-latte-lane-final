# Little Latte Lane - Pre-Launch Testing Checklist

## 📱 Responsive Design Testing

### Mobile Devices (320px - 768px)
- [ ] Home page displays correctly
- [ ] Menu/Ordering page responsive
- [ ] Bookings page (3 options visible)
- [ ] Account page scrolls properly
- [ ] Admin panel accessible on mobile
- [ ] Cart sidebar works on mobile

### Tablets (768px - 1024px)
- [ ] Home page layout optimized
- [ ] Menu grid displays properly
- [ ] Bookings form readable
- [ ] Account page sidebar navigation
- [ ] Admin panel tables responsive

### Desktop (1024px+)
- [ ] All pages utilize full width appropriately
- [ ] Navigation bar looks professional
- [ ] Admin panel dashboard layout
- [ ] No horizontal scrolling issues

---

## 🔔 Notification System Testing

### Setup & Permissions
- [ ] Notification permission prompt shows on first visit
- [ ] User can enable/disable notifications in settings
- [ ] Push notification subscription works
- [ ] Notification preferences save correctly

### Delivery Testing
- [ ] Order confirmation notifications arrive
- [ ] Booking confirmation notifications arrive
- [ ] Admin notifications for new orders
- [ ] Admin notifications for new bookings
- [ ] Notification history shows correctly

---

## 👨‍💼 Admin Panel Testing

### Order Management
- [ ] View all orders (active, completed, cancelled)
- [ ] Update order status (preparing, ready, completed)
- [ ] View order details and items
- [ ] Filter and search orders
- [ ] Real-time updates when new orders arrive

### Hall Booking Management
- [ ] View all hall bookings
- [ ] Approve/reject bookings (pending_approval → confirmed)
- [ ] View uploaded documents (bank proof, signed form)
- [ ] Export booking as PDF
- [ ] Calendar view of booked dates

### Menu Management
- [ ] Add new menu items
- [ ] Edit existing items (name, price, description, image)
- [ ] Delete menu items
- [ ] Toggle item availability
- [ ] Manage categories

### User Management
- [ ] View all registered users
- [ ] Update user roles (customer, admin)
- [ ] View user order history
- [ ] Manage user permissions

---

## 🔗 QR Code & Links Testing

### QR Code
- [ ] Generate QR code for app download
- [ ] Scan QR code on Android device
- [ ] Verify redirect to correct URL (website or Play Store)
- [ ] QR code displays on /install-qr page

### Deep Links (Android App)
- [ ] Payment success deep link returns to app
- [ ] Account page deep link opens app
- [ ] Order tracking deep link works
- [ ] Share links open in app when installed

---

## 💳 Payment Testing

### Menu Items Payment
- [ ] Add items to cart
- [ ] Proceed to checkout
- [ ] Pay with Google Pay ✅
- [ ] Pay with manual card entry ✅
- [ ] Payment success redirects correctly
- [ ] Order status updates to "confirmed"
- [ ] Order appears in user account
- [ ] Admin receives notification

### Hall Bookings Payment
- [ ] Fill out booking form
- [ ] Upload bank proof
- [ ] Sign terms & conditions
- [ ] Pay R20 test amount ✅
- [ ] Payment success → status: "pending_approval"
- [ ] Booking appears in account as "Being Verified"
- [ ] Admin can see booking in admin panel
- [ ] Admin can approve booking → status: "confirmed"

### Webhook Testing
- [ ] Yoco webhook receives payment.succeeded
- [ ] Order status updates automatically
- [ ] Booking status updates to pending_approval
- [ ] Webhook signature verification works
- [ ] Failed payments update status correctly

---

## 🏗️ Code Health & Build Testing

### Build Checks
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All routes compile correctly
- [ ] Vercel deployment succeeds

### Git & Version Control
- [ ] All changes committed
- [ ] Git tests pass (if any)
- [ ] No uncommitted changes
- [ ] Branch up to date with main
- [ ] Deployment preview works

### Logs & Monitoring
- [ ] Check Vercel deployment logs (no errors)
- [ ] Check Supabase logs (no database errors)
- [ ] Check Sentry for runtime errors
- [ ] No CSP violations in browser console

---

## 📧 Email Testing

### Automated Emails
- [ ] Order confirmation emails arrive
- [ ] Booking confirmation emails arrive
- [ ] Email content formatted correctly
- [ ] Email contains all relevant information
- [ ] Resend API working correctly

---

## 🔒 Security Testing

### API Security
- [ ] Rate limiting works on payment endpoints
- [ ] Rate limiting works on order creation
- [ ] Authentication required for protected routes
- [ ] Admin routes blocked for non-admin users

### Database Security
- [ ] RLS policies prevent unauthorized access
- [ ] Users can only see their own orders
- [ ] Users can only see their own bookings
- [ ] Storage bucket permissions correct (hall-bookings)

---

## ⚡ Performance Testing

### Page Load Times
- [ ] Home page loads < 3 seconds
- [ ] Menu page loads < 3 seconds
- [ ] Account page loads < 3 seconds
- [ ] Admin panel loads < 5 seconds

### Optimization
- [ ] Images optimized (WebP/AVIF)
- [ ] No console errors on any page
- [ ] Service worker caching works
- [ ] Lighthouse score > 80

---

## 📱 Android App Testing

### Installation
- [ ] APK installs successfully
- [ ] App icon displays correctly
- [ ] Splash screen shows
- [ ] Deep links configured

### Functionality
- [ ] Menu browsing works
- [ ] Cart functionality works
- [ ] Payment flow opens Chrome Custom Tabs
- [ ] Payment redirect returns to app
- [ ] Notifications work on Android

---

## 🌐 SEO & Meta Tags

### Metadata
- [ ] Page titles descriptive
- [ ] Meta descriptions present
- [ ] Open Graph tags for social sharing
- [ ] Favicon displays correctly
- [ ] Sitemap generated (if applicable)

---

## ✅ Final Checks Before Launch

- [ ] All environment variables set in Vercel production
- [ ] NEXT_PUBLIC_YOCO_TEST_MODE = false (live payments)
- [ ] Live Yoco keys configured
- [ ] Database backups enabled
- [ ] Monitoring/alerts configured
- [ ] Support email configured
- [ ] Terms & conditions up to date
- [ ] Privacy policy up to date

---

## 📝 Known Issues to Document

List any known minor issues that won't block launch:

1.
2.
3.

---

**Last Updated:** November 11, 2025
**Status:** Pre-Launch Testing Phase
