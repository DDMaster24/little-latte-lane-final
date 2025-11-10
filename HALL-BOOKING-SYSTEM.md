# Roberts Hall Booking System - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Setup Instructions](#setup-instructions)
6. [User Flow](#user-flow)
7. [Admin Management](#admin-management)
8. [Payment Processing](#payment-processing)
9. [Email Notifications](#email-notifications)
10. [Testing Guide](#testing-guide)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Roberts Hall Booking System is a comprehensive online booking and payment platform that allows Roberts Estate residents to book the community hall for events. The system includes:

- **Multi-step booking form** with validation
- **Secure file uploads** for bank proofs and music licensing
- **Online payment processing** via Yoco (R2,500 total)
- **Automated email confirmations**
- **Admin dashboard** for managing bookings
- **User account integration** for tracking bookings

---

## ✨ Features

### Customer-Facing Features
- ✅ **8-Step Booking Process**
  - Step 1: Verification & Resident Check
  - Step 2: Applicant Details
  - Step 3: Event Details (date, time, guests, vehicles)
  - Step 4: Bank Details (for deposit refund)
  - Step 5: Music Licensing & Special Requests
  - Step 6: Terms & Conditions (31 terms with page initials)
  - Step 7: Review & Confirmation
  - Step 8: Secure Payment (R2,500)

- ✅ **Smart Features**
  - Auto-save draft bookings
  - Resume incomplete bookings
  - Real-time validation
  - File upload with preview
  - Mobile-responsive design

### Admin Features
- ✅ **Hall Bookings Dashboard**
  - View all bookings with filters
  - Update booking status
  - Track payments and deposits
  - View uploaded documents
  - Add admin notes
  - Process deposit refunds

- ✅ **Email Notifications**
  - Automatic confirmation emails
  - Admin notification copies
  - Beautiful HTML templates

### System Features
- ✅ **Database**
  - Comprehensive hall_bookings table
  - Auto-generated booking references (RH-2025-001)
  - Row Level Security (RLS) policies
  - Real-time subscriptions

- ✅ **Payment Integration**
  - Yoco payment gateway
  - Webhook handling for payment confirmation
  - Automatic status updates
  - Secure transaction processing

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
├─────────────────────────────────────────────────────────────────┤
│  /bookings Page         → Entry point with booking options      │
│  /hall-booking Page     → Multi-step booking form               │
│  /account Page          → User's hall bookings tab              │
│  /admin Page            → Admin hall bookings dashboard          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API Routes                              │
├─────────────────────────────────────────────────────────────────┤
│  /api/yoco/hall-booking-checkout  → Create payment session      │
│  /api/yoco/webhook                 → Handle payment webhooks    │
│  /api/hall-booking/confirmation    → Send confirmation emails   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Backend                              │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database:                                            │
│    - hall_bookings table                                         │
│    - Auto-generation functions                                   │
│    - RLS policies                                                │
│                                                                  │
│  Supabase Storage:                                               │
│    - documents/hall-bookings/bank-proofs/                        │
│    - documents/hall-bookings/samro-proofs/                       │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
├─────────────────────────────────────────────────────────────────┤
│  Yoco Payment Gateway    → Process R2,500 payments              │
│  Resend Email Service    → Send confirmation emails             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Table: `hall_bookings`

```sql
-- Primary booking information
id                      UUID PRIMARY KEY
booking_reference       VARCHAR(50) UNIQUE (auto-generated: RH-2025-001)
user_id                 UUID REFERENCES auth.users(id)
status                  VARCHAR(50) DEFAULT 'draft'

-- Status Options:
-- 'draft', 'pending_payment', 'payment_processing', 'confirmed',
-- 'completed', 'deposit_refunded', 'cancelled', 'rejected'

-- Applicant Information
applicant_name          VARCHAR(255)
applicant_surname       VARCHAR(255)
applicant_address       TEXT
applicant_phone         VARCHAR(50)
applicant_email         VARCHAR(255)
is_roberts_resident     BOOLEAN DEFAULT true
roberts_estate_address  TEXT

-- Event Details
event_date              DATE
event_start_time        TIME
event_end_time          TIME (must be <= 23:00)
event_type              VARCHAR(100)
event_description       TEXT
total_guests            INTEGER (max 50)
number_of_vehicles      INTEGER (max 30)
tables_required         INTEGER DEFAULT 0
chairs_required         INTEGER DEFAULT 0

-- Bank Details (for deposit refund)
bank_account_holder     VARCHAR(255)
bank_name               VARCHAR(255)
bank_branch_code        VARCHAR(20)
bank_account_number     VARCHAR(50)
bank_proof_document_url TEXT

-- Music & Licensing
will_play_music         BOOLEAN DEFAULT false
samro_sampra_proof_url  TEXT

-- Payment Information
total_amount            DECIMAL(10,2) DEFAULT 2500.00
rental_fee              DECIMAL(10,2) DEFAULT 1500.00 (non-refundable)
deposit_amount          DECIMAL(10,2) DEFAULT 1000.00 (refundable)
payment_status          VARCHAR(50) DEFAULT 'unpaid'
payment_date            TIMESTAMP WITH TIME ZONE
payment_reference       VARCHAR(255)
yoco_checkout_id        VARCHAR(255)

-- Deposit Refund Tracking
deposit_refunded        BOOLEAN DEFAULT false
deposit_refund_date     TIMESTAMP WITH TIME ZONE
deposit_refund_amount   DECIMAL(10,2)
deposit_refund_reason   TEXT

-- Terms & Conditions
terms_accepted          BOOLEAN DEFAULT false
terms_accepted_at       TIMESTAMP WITH TIME ZONE
terms_version           VARCHAR(20) DEFAULT '2025-01'
terms_page_1_initial    VARCHAR(50)
terms_page_2_initial    VARCHAR(50)
terms_page_3_initial    VARCHAR(50)
terms_page_4_initial    VARCHAR(50)

-- Admin Management
admin_notes             TEXT
rejection_reason        TEXT
inspection_completed    BOOLEAN DEFAULT false
inspection_date         TIMESTAMP WITH TIME ZONE
inspection_notes        TEXT
damages_found           BOOLEAN DEFAULT false
damages_description     TEXT
damages_cost            DECIMAL(10,2)

-- Additional
special_requests        TEXT
access_code             VARCHAR(50)
security_assigned       BOOLEAN DEFAULT false

-- Timestamps
created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
submitted_at            TIMESTAMP WITH TIME ZONE
confirmed_at            TIMESTAMP WITH TIME ZONE
completed_at            TIMESTAMP WITH TIME ZONE
```

### Indexes
```sql
CREATE INDEX idx_hall_bookings_user_id ON hall_bookings(user_id);
CREATE INDEX idx_hall_bookings_status ON hall_bookings(status);
CREATE INDEX idx_hall_bookings_event_date ON hall_bookings(event_date);
CREATE INDEX idx_hall_bookings_booking_reference ON hall_bookings(booking_reference);
CREATE INDEX idx_hall_bookings_payment_status ON hall_bookings(payment_status);
```

### Auto-Generation Function
```sql
-- Automatically generates booking references: RH-2025-001, RH-2025-002, etc.
CREATE FUNCTION generate_hall_booking_reference()
```

### RLS Policies
```sql
-- Users can view their own bookings
-- Users can create their own bookings
-- Users can update draft/pending bookings
-- Staff/Admin can view/update all bookings
```

---

## 🚀 Setup Instructions

### 1. Database Setup

Run the database setup script:

```bash
node setup-hall-bookings-db.js
```

Or execute the SQL directly in Supabase Dashboard:
```sql
-- Run: database-hall-bookings-schema.sql
```

This creates:
- ✅ `hall_bookings` table
- ✅ Auto-generation function
- ✅ Triggers
- ✅ RLS policies

### 2. Storage Bucket Setup

Create the documents bucket for file uploads:

```bash
node setup-storage-buckets.js
```

Then add RLS policies in Supabase Dashboard > Storage > Policies:

```sql
-- Policy 1: Users can upload documents
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN ('hall-bookings')
);

-- Policy 2: Public can view documents
CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Add UPDATE and DELETE policies as shown in script output
```

### 3. Environment Variables

Ensure the following are set in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgresql_connection_string

# Yoco Payment
NEXT_PUBLIC_YOCO_PUBLIC_KEY=your_yoco_public_key
YOCO_SECRET_KEY=your_yoco_secret_key
YOCO_WEBHOOK_SECRET=your_webhook_secret

# Email
RESEND_API_KEY=your_resend_api_key

# Site
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 4. Type Generation

Regenerate TypeScript types after database changes:

```bash
npm run db:generate-types
```

Or manually:
```bash
supabase gen types typescript --project-id=awytuszmunxvthuizyur > src/types/supabase.ts
```

---

## 👤 User Flow

### Step-by-Step Booking Process

#### 1. Entry Point
- User visits `/bookings` page
- Clicks "Book Roberts Hall Online" button
- Redirects to `/hall-booking`

#### 2. Authentication Check
- System verifies user is logged in
- If not logged in, redirects to `/auth/login?redirect=/hall-booking`

#### 3. Step 1: Verification
- Display user account information
- Confirm Roberts Estate resident status
- Show cost breakdown (R2,500 total)
- List required documents

#### 4. Step 2: Applicant Details
- Pre-fill from user profile
- Collect: name, surname, email, phone, address
- Collect Roberts Estate address (verified by office)

#### 5. Step 3: Event Details
- Select date (must be future date)
- Select start/end time (must end by 23:00)
- Choose event type
- Enter guest count (max 50)
- Enter vehicle count (max 30)
- Specify tables/chairs needed

#### 6. Step 4: Bank Details
- Enter bank account holder name
- Select bank from dropdown
- Enter branch code (6 digits)
- Enter account number
- **Upload bank proof** (JPG/PNG/PDF, max 5MB)

#### 7: Step 5: Additional Info
- Indicate if playing music
- If yes: **Upload SAMRO/SAMPRA proof** (required)
- Enter special requests (optional)

#### 8. Step 6: Terms & Conditions
- Display all 31 terms across 4 pages
- User must initial each page
- Final checkbox to accept all terms

#### 9. Step 7: Review
- Display complete booking summary
- Allow user to go back and edit
- Confirm all information is correct

#### 10. Step 8: Payment
- Display R2,500 payment button
- Redirect to Yoco payment gateway
- Process payment securely

#### 11. Confirmation
- On success: Display confirmation screen
- Send confirmation email to user
- Send notification to admin
- Update booking status to "confirmed"

---

## 🔧 Admin Management

### Accessing Admin Dashboard

1. Login as admin user
2. Navigate to `/admin`
3. Click "Hall Bookings" tab

### Admin Features

#### View Bookings
- **All Bookings**: Complete list with filters
- **Statistics**: Total, Confirmed, Pending, Completed
- **Filters**: By status (all, confirmed, pending, completed, cancelled)

#### Booking Details Modal
Click any booking to view:
- Applicant information
- Event details
- Payment information
- Bank details
- Uploaded documents
- Terms acceptance status

#### Status Management
Available actions:
- **Confirm Booking**: Approve pending booking
- **Mark as Completed**: After event finishes
- **Reject Booking**: Decline with reason
- **Add Admin Notes**: Internal notes

#### Status Workflow
```
draft → pending_payment → payment_processing →
confirmed → completed → deposit_refunded
```

Alternate paths:
- `cancelled` (user/admin cancellation)
- `rejected` (admin rejection)

---

## 💳 Payment Processing

### Yoco Integration

#### Payment Flow
1. User clicks "Pay R2,500 Now"
2. System creates Yoco checkout session
3. Redirects to Yoco hosted page
4. User completes payment
5. Yoco sends webhook to `/api/yoco/webhook`
6. System updates booking status
7. Sends confirmation email

#### Webhook Handling

The webhook at `/api/yoco/webhook` handles:
- ✅ **Order payments** (existing)
- ✅ **Hall booking payments** (new)

Webhook automatically:
1. Verifies signature
2. Extracts metadata (type, orderId, bookingId)
3. Updates appropriate table
4. Sends confirmation email
5. Returns success response

#### Payment Metadata
```javascript
{
  type: 'hall_booking',
  bookingId: 'uuid',
  userId: 'uuid',
  eventDate: '2025-01-15'
}
```

---

## 📧 Email Notifications

### Confirmation Email

Sent to user when payment succeeds:

**Subject**: `✅ Roberts Hall Booking Confirmed - RH-2025-001`

**Content**:
- Booking reference
- Event details
- Payment summary
- Important reminders
- Next steps
- Contact information

### Admin Notification

Copy sent to `admin@littlelattelane.co.za`:
- All booking details
- User contact information
- Payment confirmation
- Action required notice

---

## 🧪 Testing Guide

### 1. Test Database Setup

```bash
# Run setup script
node setup-hall-bookings-direct.js

# Verify output shows:
✅ Table created successfully
✅ 5 RLS policies
✅ 2 functions
✅ 2 triggers
```

### 2. Test Storage Bucket

```bash
# Run storage setup
node setup-storage-buckets.js

# Verify output shows:
✅ "documents" bucket created
✅ Bucket is accessible
```

### 3. Test Booking Form

**Manual Testing Steps**:

1. **Navigate to Bookings Page**
   - Go to `/bookings`
   - Verify "Book Roberts Hall Online" button exists
   - Click button

2. **Test Authentication**
   - If not logged in, should redirect to login
   - After login, return to hall booking page

3. **Test Each Step**
   - Step 1: Verify resident checkbox
   - Step 2: Fill applicant details
   - Step 3: Select event date/time
   - Step 4: Upload bank proof
   - Step 5: Test music licensing upload (conditional)
   - Step 6: Initial all 4 pages, check accept box
   - Step 7: Review all information
   - Step 8: Test payment (use Yoco test mode)

4. **Test Draft Saving**
   - Fill partial form
   - Click "Save Draft"
   - Refresh page
   - Verify draft is loaded

### 4. Test Admin Dashboard

1. Login as admin
2. Navigate to `/admin`
3. Click "Hall Bookings" tab
4. Verify bookings list displays
5. Click a booking to view details
6. Test status update functions
7. Add admin notes

### 5. Test Payment Webhook

**Use Yoco Webhook Testing**:

1. Go to Yoco Dashboard > Webhooks
2. Send test webhook
3. Verify booking status updates
4. Check email was sent

**Test Payload**:
```json
{
  "type": "payment.succeeded",
  "payload": {
    "id": "ch_test123",
    "status": "succeeded",
    "amount": 250000,
    "metadata": {
      "type": "hall_booking",
      "bookingId": "your-booking-id"
    }
  }
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### Issue: Database table not found
**Solution**:
```bash
node setup-hall-bookings-direct.js
```

#### Issue: Storage upload fails
**Solution**:
1. Check bucket exists: `node setup-storage-buckets.js`
2. Verify RLS policies in Supabase Dashboard
3. Check file size (max 5MB)
4. Verify file type (JPG/PNG/PDF only)

#### Issue: Payment webhook not received
**Solution**:
1. Check `YOCO_WEBHOOK_SECRET` in `.env.local`
2. Verify webhook URL in Yoco Dashboard
3. Check webhook signature validation
4. Review logs in Vercel/production

#### Issue: Email not sending
**Solution**:
1. Verify `RESEND_API_KEY` is set
2. Check email domain verification
3. Review API logs in Resend Dashboard

#### Issue: Booking reference not auto-generating
**Solution**:
```sql
-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'generate_hall_booking_reference';

-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_generate_hall_booking_reference';

-- If missing, re-run database setup
```

### Debug Mode

Enable detailed logging:

```javascript
// In hall booking components
console.log('Booking form data:', formData);
console.log('Upload status:', uploadStatus);
console.log('Payment response:', paymentResponse);
```

### Database Queries for Debugging

```sql
-- Check recent bookings
SELECT booking_reference, status, payment_status, created_at
FROM hall_bookings
ORDER BY created_at DESC
LIMIT 10;

-- Check payment status
SELECT booking_reference, payment_status, payment_date, total_amount
FROM hall_bookings
WHERE payment_status != 'paid';

-- Check RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'hall_bookings';

-- Check storage objects
SELECT name, bucket_id, created_at
FROM storage.objects
WHERE bucket_id = 'documents'
ORDER BY created_at DESC;
```

---

## 📝 Important Rules

### Roberts Hall Rules (from PDF)

1. **Maximum Capacity**: 50 guests
2. **Maximum Vehicles**: 30 vehicles
3. **End Time**: Functions MUST end by 23:00 (11:00 PM)
4. **Speed Limit**: 30 km/h within estate
5. **Resident Requirement**: Applicant must be current Roberts Estate resident
6. **Music Licensing**: SAMRO/SAMPRA proof required if playing music
7. **Deposit**: R1,000 refundable (refunded within 7 days after inspection)
8. **Rental Fee**: R1,500 non-refundable
9. **Total Cost**: R2,500

---

## 📞 Support

For issues or questions:

- **Technical Support**: Check this documentation
- **Admin Questions**: Contact office at admin@littlelattelane.co.za
- **System Issues**: Review Troubleshooting section

---

## 🎉 Success Criteria

System is working correctly when:

✅ Users can complete full booking flow
✅ Payments process successfully via Yoco
✅ Confirmation emails are sent
✅ Bookings appear in admin dashboard
✅ Users can view bookings in their account
✅ Files upload to Supabase Storage
✅ Draft bookings are saved and resumed
✅ Status updates work correctly
✅ Booking references auto-generate

---

## 📚 File Reference

### Key Files

**Database**:
- `database-hall-bookings-schema.sql` - Complete schema
- `setup-hall-bookings-direct.js` - Setup script

**Frontend**:
- `src/app/hall-booking/page.tsx` - Main booking page
- `src/app/hall-booking/steps/` - All 8 step components
- `src/types/hall-booking.ts` - TypeScript types

**Backend**:
- `src/app/api/yoco/hall-booking-checkout/route.ts` - Payment API
- `src/app/api/yoco/webhook/route.ts` - Webhook handler
- `src/app/api/hall-booking/confirmation/route.ts` - Email API

**Admin**:
- `src/components/Admin/HallBookingManagement.tsx` - Admin dashboard
- `src/app/admin/page.tsx` - Admin page integration

**User Account**:
- `src/app/account/page.tsx` - User bookings tab

**Storage**:
- `setup-storage-buckets.js` - Storage setup script

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0
**System Status**: ✅ Production Ready
