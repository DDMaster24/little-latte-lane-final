'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase-client';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function RobertsHallBookingForm() {
  const { user, profile } = useAuth();
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [dateAvailable, setDateAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data - matching PDF exactly
  const [formData, setFormData] = useState({
    // Applicant Details
    applicantName: profile?.full_name?.split(' ')[0] || '',
    applicantSurname: profile?.full_name?.split(' ').slice(1).join(' ') || '',
    applicantEmail: user?.email || '',
    applicantPhone: profile?.phone || '',
    address: '',

    // Event Details
    eventDate: '',
    eventStartTime: '',
    eventEndTime: '23:00',
    eventType: '',
    totalGuests: 1,
    numberOfVehicles: 0,
    tablesRequired: 0,
    chairsRequired: 0,

    // Banking Details
    accountHolder: '',
    bankName: '',
    branchCode: '',
    accountNumber: '',

    // Terms
    termsAccepted: false,
  });

  // Check if user is logged in
  if (!user) {
    return (
      <div className="bg-gradient-to-br from-neonPink/20 to-neonPink/10 backdrop-blur-sm bg-gray-900/60 border-2 border-neonPink/30 rounded-2xl p-8 text-center">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-4">
          Login Required
        </h3>
        <p className="text-gray-300 mb-6">
          You must be logged in to book Roberts Hall.
        </p>
        <Button
          onClick={() => window.location.href = '/auth/login'}
          className="bg-gradient-to-r from-neonPink to-purple-500 text-white"
        >
          Login to Continue
        </Button>
      </div>
    );
  }

  // Auto-check availability when date changes
  useEffect(() => {
    if (formData.eventDate) {
      checkAvailability(formData.eventDate);
    }
  }, [formData.eventDate]);

  const checkAvailability = async (date: string) => {
    if (!date) return;

    setIsCheckingAvailability(true);
    setDateAvailable(null);

    try {
      const supabase = getSupabaseClient();

      // Check if date is already booked
      const { data: existingBookings, error } = await supabase
        .from('hall_bookings')
        .select('id, event_date, status')
        .eq('event_date', date)
        .in('status', ['confirmed', 'pending_payment', 'payment_processing']);

      if (error) throw error;

      if (existingBookings && existingBookings.length > 0) {
        setDateAvailable(false);
        toast.error('Sorry, this date is already booked. Please select another date.');
      } else {
        setDateAvailable(true);
        toast.success('✓ Date is available!');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
    }

    setIsCheckingAvailability(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date availability
    if (dateAvailable !== true) {
      toast.error('Please select an available date');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('You must accept the terms and conditions');
      return;
    }

    if (formData.totalGuests > 50) {
      toast.error('Maximum 50 guests allowed');
      return;
    }

    if (formData.numberOfVehicles > 30) {
      toast.error('Maximum 30 vehicles allowed');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to complete booking');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();

      // Create booking in database with pending_payment status
      const bookingReference = `HB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const { data: booking, error: bookingError } = await supabase
        .from('hall_bookings')
        .insert({
          user_id: user.id,
          event_date: formData.eventDate,
          applicant_name: formData.applicantName,
          applicant_surname: formData.applicantSurname,
          applicant_email: formData.applicantEmail,
          applicant_phone: formData.applicantPhone,
          applicant_address: formData.address,
          roberts_estate_address: formData.address,
          event_start_time: formData.eventStartTime,
          event_end_time: formData.eventEndTime,
          event_type: formData.eventType,
          total_guests: formData.totalGuests,
          number_of_vehicles: formData.numberOfVehicles,
          tables_required: formData.tablesRequired,
          chairs_required: formData.chairsRequired,
          bank_account_holder: formData.accountHolder,
          bank_name: formData.bankName,
          bank_branch_code: formData.branchCode,
          bank_account_number: formData.accountNumber,
          status: 'pending_payment',
          total_amount: 2500,
          rental_fee: 1500,
          deposit_amount: 1000,
          booking_reference: bookingReference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (bookingError || !booking) {
        console.error('Error creating booking:', bookingError);
        toast.error('Failed to create booking. Please try again.');
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Booking created:', booking.id);
      toast.success('Booking created! Redirecting to payment...');

      // Create Yoco checkout session
      const checkoutResponse = await fetch('/api/yoco/hall-booking-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          userId: user.id,
          amount: 2500,
          userDetails: {
            email: formData.applicantEmail,
            firstName: formData.applicantName,
            lastName: formData.applicantSurname,
            phone: formData.applicantPhone,
          },
        }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        console.error('Checkout error:', errorData);
        toast.error(errorData.error || 'Failed to create payment session');
        setIsSubmitting(false);
        return;
      }

      const checkoutData = await checkoutResponse.json();

      if (checkoutData.success && checkoutData.redirectUrl) {
        console.log('✅ Redirecting to Yoco payment:', checkoutData.redirectUrl);
        window.location.href = checkoutData.redirectUrl;
      } else {
        toast.error('Failed to initialize payment');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      toast.error('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-neonPink/20 to-neonPink/10 backdrop-blur-sm bg-gray-900/60 border-2 border-neonPink/30 rounded-2xl p-6 sm:p-8 space-y-6">

      {/* SECTION 1: APPLICANT DETAILS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-neonPink border-b border-neonPink/30 pb-2">
          Applicant Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              First Name
            </label>
            <Input
              type="text"
              name="applicantName"
              value={formData.applicantName}
              onChange={handleInputChange}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Surname
            </label>
            <Input
              type="text"
              name="applicantSurname"
              value={formData.applicantSurname}
              onChange={handleInputChange}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Email Address
            </label>
            <Input
              type="email"
              name="applicantEmail"
              value={formData.applicantEmail}
              onChange={handleInputChange}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Phone Number
            </label>
            <Input
              type="tel"
              name="applicantPhone"
              value={formData.applicantPhone}
              onChange={handleInputChange}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-200 text-sm">
            Address
          </label>
          <Input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
          />
          <p className="text-xs text-gray-400 mt-1">
            The applicant must be a current resident of Roberts Estate
          </p>
        </div>
      </div>

      {/* SECTION 2: EVENT DETAILS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-neonPink border-b border-neonPink/30 pb-2">
          Event Details
        </h3>

        {/* Event Date with Availability Check */}
        <div>
          <label className="block font-semibold mb-2 text-gray-200 text-sm">
            Event Date
          </label>
          <div className="relative">
            <Input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
            {isCheckingAvailability && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-neonPink" />
              </div>
            )}
          </div>

          {/* Availability Status */}
          {formData.eventDate && !isCheckingAvailability && dateAvailable === true && (
            <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <p className="text-sm text-green-400 font-semibold">Date available!</p>
            </div>
          )}
          {formData.eventDate && !isCheckingAvailability && dateAvailable === false && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <p className="text-sm text-red-400 font-semibold">Date already booked</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Start Time
            </label>
            <Input
              type="time"
              name="eventStartTime"
              value={formData.eventStartTime}
              onChange={handleInputChange}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              End Time
            </label>
            <Input
              type="time"
              name="eventEndTime"
              value={formData.eventEndTime}
              onChange={handleInputChange}
              required
              max="23:00"
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
            <p className="text-xs text-red-400 mt-1">
              ⚠️ Events MUST end by 23:00
            </p>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-200 text-sm">
            Event Type
          </label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleInputChange}
            required
            className="w-full p-3 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonPink focus:ring-2 focus:ring-neonPink/20"
          >
            <option value="">Select event type...</option>
            <option value="wedding">Wedding / Reception</option>
            <option value="birthday">Birthday Party</option>
            <option value="corporate">Corporate Event</option>
            <option value="conference">Conference / Seminar</option>
            <option value="community">Community Event</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Number of Guests
            </label>
            <Input
              type="number"
              name="totalGuests"
              value={formData.totalGuests}
              onChange={handleInputChange}
              required
              min={1}
              max={50}
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum 50 guests</p>
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Number of Vehicles
            </label>
            <Input
              type="number"
              name="numberOfVehicles"
              value={formData.numberOfVehicles}
              onChange={handleInputChange}
              required
              min={0}
              max={30}
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum 30 vehicles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Number of Tables
            </label>
            <Input
              type="number"
              name="tablesRequired"
              value={formData.tablesRequired}
              onChange={handleInputChange}
              required
              min={0}
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Number of Chairs
            </label>
            <Input
              type="number"
              name="chairsRequired"
              value={formData.chairsRequired}
              onChange={handleInputChange}
              required
              min={0}
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: BANKING DETAILS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-neonPink border-b border-neonPink/30 pb-2">
          Banking Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Account Holder Name
            </label>
            <Input
              type="text"
              name="accountHolder"
              value={formData.accountHolder}
              onChange={handleInputChange}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Bank Name
            </label>
            <Input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Branch Code
            </label>
            <Input
              type="text"
              name="branchCode"
              value={formData.branchCode}
              onChange={handleInputChange}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Account Number
            </label>
            <Input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* PAYMENT SUMMARY */}
      <div className="bg-neonPink/10 border border-neonPink/30 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-3 text-center">Payment Summary</h4>
        <div className="space-y-2 text-gray-200">
          <div className="flex justify-between">
            <span>Hall Rental Fee:</span>
            <span className="font-semibold">R1,500.00</span>
          </div>
          <div className="flex justify-between">
            <span>Refundable Deposit:</span>
            <span className="font-semibold">R1,000.00</span>
          </div>
          <div className="border-t border-neonPink/30 pt-2 mt-2 flex justify-between text-lg font-bold text-neonPink">
            <span>Total Amount:</span>
            <span>R2,500.00</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Payment will be processed via Yoco secure checkout
        </p>
      </div>

      {/* TERMS & CONDITIONS */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleInputChange}
            required
            className="mt-1 w-4 h-4 text-neonPink bg-gray-700 border-gray-600 rounded focus:ring-neonPink focus:ring-2"
          />
          <span className="text-sm text-gray-200">
            I accept the terms and conditions for booking Roberts Hall, including the R1,000 refundable deposit policy and event end time of 23:00. I confirm that I am a current resident of Roberts Estate.
          </span>
        </label>
      </div>

      {/* SUBMIT BUTTON */}
      <Button
        type="submit"
        disabled={isSubmitting || dateAvailable !== true}
        className="w-full text-lg py-6 bg-gradient-to-r from-neonPink to-purple-500 hover:from-neonPink/80 hover:to-purple-500/80 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </span>
        ) : dateAvailable !== true ? (
          'Select Available Date First'
        ) : (
          'Proceed to Payment (R2,500)'
        )}
      </Button>
    </form>
  );
}
