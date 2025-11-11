-- Clean up unpaid/failed hall bookings
-- Run this in Supabase SQL Editor to remove all bookings that never completed payment

-- First, let's see what we're about to delete (SAFE - read only)
SELECT
  id,
  booking_reference,
  status,
  created_at,
  applicant_email
FROM hall_bookings
WHERE status IN ('pending_payment', 'payment_processing', 'cancelled')
ORDER BY created_at DESC;

-- If you're happy with the above list, uncomment and run this to delete them:
-- DELETE FROM hall_bookings
-- WHERE status IN ('pending_payment', 'payment_processing', 'cancelled');

-- Optional: Delete bookings older than 24 hours that never completed payment
-- DELETE FROM hall_bookings
-- WHERE status IN ('pending_payment', 'payment_processing')
-- AND created_at < NOW() - INTERVAL '24 hours';
