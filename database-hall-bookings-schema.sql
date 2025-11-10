-- =====================================================
-- ROBERTS HALL BOOKINGS DATABASE SCHEMA
-- =====================================================
-- This creates the complete database structure for the
-- Roberts Hall online booking and payment system
-- =====================================================

-- Create hall_bookings table
CREATE TABLE IF NOT EXISTS public.hall_bookings (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Booking Reference (auto-generated, unique)
    booking_reference VARCHAR(50) UNIQUE NOT NULL,

    -- User Reference (REQUIRED - must be logged in)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Booking Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft',              -- Form started but not submitted
        'pending_payment',    -- Form submitted, awaiting payment
        'payment_processing', -- Payment in progress
        'confirmed',          -- Paid and confirmed
        'completed',          -- Event completed, awaiting inspection
        'deposit_refunded',   -- Deposit refunded after inspection
        'cancelled',          -- Booking cancelled
        'rejected'            -- Application rejected by admin
    )),

    -- ==========================================
    -- APPLICANT INFORMATION (Roberts Resident)
    -- ==========================================
    applicant_name VARCHAR(255) NOT NULL,
    applicant_surname VARCHAR(255) NOT NULL,
    applicant_address TEXT NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,

    -- Roberts Estate Resident Verification
    is_roberts_resident BOOLEAN DEFAULT true, -- Requirement: must be resident
    roberts_estate_address TEXT, -- Their actual estate address

    -- ==========================================
    -- EVENT DETAILS
    -- ==========================================
    event_date DATE NOT NULL,
    event_start_time TIME NOT NULL,
    event_end_time TIME NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- birthday, wedding, corporate, etc.
    event_description TEXT,

    -- Guest & Vehicle Information
    total_guests INTEGER NOT NULL CHECK (total_guests > 0 AND total_guests <= 50),
    number_of_vehicles INTEGER CHECK (number_of_vehicles >= 0 AND number_of_vehicles <= 30),

    -- Equipment Needs
    tables_required INTEGER DEFAULT 0,
    chairs_required INTEGER DEFAULT 0,

    -- ==========================================
    -- BANK DETAILS FOR DEPOSIT REFUND
    -- ==========================================
    bank_account_holder VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_branch_code VARCHAR(20) NOT NULL,
    bank_account_number VARCHAR(50) NOT NULL,
    bank_proof_document_url TEXT, -- Uploaded proof of bank account

    -- ==========================================
    -- MUSIC & LICENSING
    -- ==========================================
    will_play_music BOOLEAN DEFAULT false,
    samro_sampra_proof_url TEXT, -- Uploaded SAMRO/SAMPRA registration proof

    -- ==========================================
    -- PAYMENT INFORMATION
    -- ==========================================
    total_amount DECIMAL(10,2) DEFAULT 2500.00 NOT NULL, -- R2,500 total
    rental_fee DECIMAL(10,2) DEFAULT 1500.00 NOT NULL,   -- R1,500 rental (non-refundable)
    deposit_amount DECIMAL(10,2) DEFAULT 1000.00 NOT NULL, -- R1,000 deposit (refundable)

    -- Payment Status
    payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN (
        'unpaid',
        'processing',
        'paid',
        'failed',
        'refunded'
    )),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_reference VARCHAR(255), -- Yoco payment reference
    yoco_checkout_id VARCHAR(255),

    -- Deposit Refund Tracking
    deposit_refunded BOOLEAN DEFAULT false,
    deposit_refund_date TIMESTAMP WITH TIME ZONE,
    deposit_refund_amount DECIMAL(10,2),
    deposit_refund_reason TEXT, -- Reason if not refunded in full or at all

    -- ==========================================
    -- TERMS & CONDITIONS
    -- ==========================================
    terms_accepted BOOLEAN DEFAULT false NOT NULL,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    terms_version VARCHAR(20) DEFAULT '2025-01', -- Track which version they accepted

    -- Individual initials for each term page (as per PDF)
    terms_page_1_initial VARCHAR(50),
    terms_page_2_initial VARCHAR(50),
    terms_page_3_initial VARCHAR(50),
    terms_page_4_initial VARCHAR(50),

    -- ==========================================
    -- ADMIN NOTES & MANAGEMENT
    -- ==========================================
    admin_notes TEXT, -- Internal notes from staff
    rejection_reason TEXT, -- If status = 'rejected'
    inspection_completed BOOLEAN DEFAULT false,
    inspection_date TIMESTAMP WITH TIME ZONE,
    inspection_notes TEXT,
    damages_found BOOLEAN DEFAULT false,
    damages_description TEXT,
    damages_cost DECIMAL(10,2),

    -- ==========================================
    -- ADDITIONAL INFORMATION
    -- ==========================================
    special_requests TEXT,
    access_code VARCHAR(50), -- Unique access code provided by office
    security_assigned BOOLEAN DEFAULT false,

    -- Violation tracking
    violations_reported TEXT[], -- Array of violation descriptions
    deposit_forfeited BOOLEAN DEFAULT false,
    forfeiture_reason TEXT,

    -- ==========================================
    -- TIMESTAMPS
    -- ==========================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE, -- When form was completed
    confirmed_at TIMESTAMP WITH TIME ZONE, -- When payment confirmed
    completed_at TIMESTAMP WITH TIME ZONE  -- When event is over
);

-- Create indexes for better performance
CREATE INDEX idx_hall_bookings_user_id ON public.hall_bookings(user_id);
CREATE INDEX idx_hall_bookings_status ON public.hall_bookings(status);
CREATE INDEX idx_hall_bookings_event_date ON public.hall_bookings(event_date);
CREATE INDEX idx_hall_bookings_booking_reference ON public.hall_bookings(booking_reference);
CREATE INDEX idx_hall_bookings_payment_status ON public.hall_bookings(payment_status);

-- Create function to auto-generate booking reference
CREATE OR REPLACE FUNCTION generate_hall_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
    year_code VARCHAR(4);
    sequence_num INTEGER;
    new_reference VARCHAR(50);
BEGIN
    -- Get current year
    year_code := TO_CHAR(CURRENT_DATE, 'YYYY');

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(booking_reference FROM 'RH-' || year_code || '-(.*)')
            AS INTEGER
        )
    ), 0) + 1
    INTO sequence_num
    FROM public.hall_bookings
    WHERE booking_reference LIKE 'RH-' || year_code || '-%';

    -- Generate reference: RH-2025-001, RH-2025-002, etc.
    new_reference := 'RH-' || year_code || '-' || LPAD(sequence_num::TEXT, 3, '0');

    NEW.booking_reference := new_reference;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate booking reference
DROP TRIGGER IF EXISTS trigger_generate_hall_booking_reference ON public.hall_bookings;
CREATE TRIGGER trigger_generate_hall_booking_reference
    BEFORE INSERT ON public.hall_bookings
    FOR EACH ROW
    WHEN (NEW.booking_reference IS NULL OR NEW.booking_reference = '')
    EXECUTE FUNCTION generate_hall_booking_reference();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hall_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_hall_bookings_timestamp ON public.hall_bookings;
CREATE TRIGGER trigger_update_hall_bookings_timestamp
    BEFORE UPDATE ON public.hall_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_hall_bookings_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.hall_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own hall bookings"
    ON public.hall_bookings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own bookings
CREATE POLICY "Users can create own hall bookings"
    ON public.hall_bookings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own draft bookings
CREATE POLICY "Users can update own draft hall bookings"
    ON public.hall_bookings
    FOR UPDATE
    USING (auth.uid() = user_id AND status IN ('draft', 'pending_payment'));

-- Policy: Staff and admins can view all bookings
CREATE POLICY "Staff can view all hall bookings"
    ON public.hall_bookings
    FOR SELECT
    USING (public.is_staff_or_admin());

-- Policy: Staff and admins can update all bookings
CREATE POLICY "Staff can update all hall bookings"
    ON public.hall_bookings
    FOR UPDATE
    USING (public.is_staff_or_admin());

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.hall_bookings IS 'Roberts Hall rental bookings with comprehensive form data and payment tracking';
COMMENT ON COLUMN public.hall_bookings.booking_reference IS 'Auto-generated unique reference (e.g., RH-2025-001)';
COMMENT ON COLUMN public.hall_bookings.total_amount IS 'Total R2,500: R1,500 rental + R1,000 deposit';
COMMENT ON COLUMN public.hall_bookings.rental_fee IS 'Non-refundable R1,500 rental fee';
COMMENT ON COLUMN public.hall_bookings.deposit_amount IS 'Refundable R1,000 deposit (refunded within 7 days after inspection)';
COMMENT ON COLUMN public.hall_bookings.total_guests IS 'Maximum 50 guests permitted per function';
COMMENT ON COLUMN public.hall_bookings.number_of_vehicles IS 'Maximum 30 vehicles permitted per function';
COMMENT ON COLUMN public.hall_bookings.terms_version IS 'Version of T&Cs accepted (e.g., 2025-01)';
