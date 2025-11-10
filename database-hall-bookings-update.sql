-- Database update for simplified Roberts Hall booking system
-- Run this to update the hall_bookings table with new fields

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Bank details (split into separate fields)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='hall_bookings' AND column_name='bank_name') THEN
        ALTER TABLE public.hall_bookings ADD COLUMN bank_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='hall_bookings' AND column_name='bank_account_number') THEN
        ALTER TABLE public.hall_bookings ADD COLUMN bank_account_number VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='hall_bookings' AND column_name='bank_branch_code') THEN
        ALTER TABLE public.hall_bookings ADD COLUMN bank_branch_code VARCHAR(50);
    END IF;

    -- PDF generation
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='hall_bookings' AND column_name='pdf_form_url') THEN
        ALTER TABLE public.hall_bookings ADD COLUMN pdf_form_url TEXT;
    END IF;

    -- Optional proof of payment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='hall_bookings' AND column_name='proof_of_payment_url') THEN
        ALTER TABLE public.hall_bookings ADD COLUMN proof_of_payment_url TEXT;
    END IF;

    -- Additional details fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='hall_bookings' AND column_name='music_details') THEN
        ALTER TABLE public.hall_bookings ADD COLUMN music_details TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='hall_bookings' AND column_name='catering_details') THEN
        ALTER TABLE public.hall_bookings ADD COLUMN catering_details TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='hall_bookings' AND column_name='special_requirements') THEN
        ALTER TABLE public.hall_bookings ADD COLUMN special_requirements TEXT;
    END IF;
END $$;

-- Drop old columns if they exist (file upload columns we're removing)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='hall_bookings' AND column_name='bank_proof_document_url') THEN
        ALTER TABLE public.hall_bookings DROP COLUMN bank_proof_document_url;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='hall_bookings' AND column_name='samro_sampra_proof_url') THEN
        ALTER TABLE public.hall_bookings DROP COLUMN samro_sampra_proof_url;
    END IF;
END $$;

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'hall_bookings'
  AND column_name IN (
    'bank_name',
    'bank_account_number',
    'bank_branch_code',
    'pdf_form_url',
    'proof_of_payment_url',
    'music_details',
    'catering_details',
    'special_requirements'
  )
ORDER BY column_name;

COMMENT ON COLUMN public.hall_bookings.pdf_form_url IS 'URL to generated PDF of completed booking form (for admin download)';
COMMENT ON COLUMN public.hall_bookings.proof_of_payment_url IS 'Optional: User-uploaded proof of payment (uploaded after booking)';
COMMENT ON COLUMN public.hall_bookings.music_details IS 'Details about music and SAMRO/SAMPRA registration if applicable';
COMMENT ON COLUMN public.hall_bookings.catering_details IS 'Details about catering arrangements';
COMMENT ON COLUMN public.hall_bookings.special_requirements IS 'Any special requirements or additional notes';
