'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase-client';
import { useAuth } from '@/components/AuthProvider';
import { Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface HallBookingFormData {
  // Applicant Details
  applicantName: string;
  applicantSurname: string;
  applicantAddress: string; // Maps to applicant_address
  robertsEstateAddress: string; // Maps to roberts_estate_address
  applicantPhone: string; // Maps to applicant_phone
  applicantEmail: string;

  // Event Details
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  eventType: string;
  totalGuests: number;
  numberOfVehicles: number;

  // Bank Details for Deposit Refund
  bankName: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankBranchCode: string;

  // Additional Information
  willPlayMusic: boolean;
  musicDetails: string;
  cateringDetails: string;
  specialRequirements: string;

  // Terms Acceptance
  termsAccepted: boolean;
}

export default function RobertsHallBookingForm() {
  const { user, profile } = useAuth();
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isDateAvailable, setIsDateAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<HallBookingFormData>({
    applicantName: profile?.full_name?.split(' ')[0] || '',
    applicantSurname: profile?.full_name?.split(' ').slice(1).join(' ') || '',
    applicantAddress: '',
    robertsEstateAddress: '',
    applicantPhone: profile?.phone || '',
    applicantEmail: profile?.email || '',
    eventDate: '',
    eventStartTime: '',
    eventEndTime: '23:00',
    eventType: '',
    totalGuests: 1,
    numberOfVehicles: 0,
    bankName: '',
    bankAccountHolder: '',
    bankAccountNumber: '',
    bankBranchCode: '',
    willPlayMusic: false,
    musicDetails: '',
    cateringDetails: '',
    specialRequirements: '',
    termsAccepted: false,
  });

  // Update form with user profile data when it loads
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        applicantName: profile.full_name?.split(' ')[0] || '',
        applicantSurname: profile.full_name?.split(' ').slice(1).join(' ') || '',
        applicantPhone: profile.phone || '',
        applicantEmail: profile.email || '',
      }));
    }
  }, [profile]);

  // Check if user is logged in
  if (!user) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-lg p-8 rounded-xl text-center">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-4">
          Login Required
        </h3>
        <p className="text-gray-300 mb-6">
          You must be logged in to your account to book Roberts Hall.
        </p>
        <Button
          onClick={() => window.location.href = '/auth/login'}
          className="bg-gradient-to-r from-neonPink to-purple-500 hover:from-neonPink/80 hover:to-purple-500/80 text-white"
        >
          Login to Continue
        </Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const checkAvailability = async () => {
    if (!formData.eventDate) {
      toast.error('Please select a date first');
      return;
    }

    setIsCheckingAvailability(true);
    setIsDateAvailable(null);

    try {
      const supabase = getSupabaseClient();

      // Check if date is already booked (confirmed bookings only)
      const { data: existingBookings, error } = await supabase
        .from('hall_bookings')
        .select('id, status, event_date')
        .eq('event_date', formData.eventDate)
        .in('status', ['confirmed', 'pending_payment', 'payment_processing']);

      if (error) throw error;

      if (existingBookings && existingBookings.length > 0) {
        setIsDateAvailable(false);
        toast.error('Sorry, this date is already booked. Please select another date.');
      } else {
        setIsDateAvailable(true);
        setShowForm(true);
        toast.success('Date is available! Please fill in the booking form below.');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability. Please try again.');
    }

    setIsCheckingAvailability(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.termsAccepted) {
      toast.error('You must accept the terms and conditions to proceed');
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

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();

      // Create booking record
      const bookingData = {
        user_id: user.id,
        status: 'pending_payment',
        payment_status: 'pending',

        // Applicant Information
        applicant_name: formData.applicantName,
        applicant_surname: formData.applicantSurname,
        applicant_address: formData.applicantAddress,
        roberts_estate_address: formData.robertsEstateAddress,
        applicant_phone: formData.applicantPhone,
        applicant_email: formData.applicantEmail,
        is_roberts_resident: true, // Required for booking

        // Event Details
        event_date: formData.eventDate,
        event_start_time: formData.eventStartTime,
        event_end_time: formData.eventEndTime,
        event_type: formData.eventType,
        total_guests: formData.totalGuests,
        number_of_vehicles: formData.numberOfVehicles,

        // Bank Details
        bank_name: formData.bankName,
        bank_account_holder: formData.bankAccountHolder,
        bank_account_number: formData.bankAccountNumber,
        bank_branch_code: formData.bankBranchCode,

        // Additional Information
        will_play_music: formData.willPlayMusic,
        music_details: formData.musicDetails,
        catering_details: formData.cateringDetails,
        special_requirements: formData.specialRequirements,

        // Payment
        total_amount: 2500.00,
        rental_fee: 1500.00,
        deposit_amount: 1000.00,

        // Terms
        terms_accepted: formData.termsAccepted,
      };

      const { data: booking, error: bookingError } = await supabase
        .from('hall_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      toast.success('Booking form submitted! Redirecting to payment...');

      // Create Yoco checkout
      const checkoutResponse = await fetch('/api/yoco/hall-booking-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: 2500.00,
          customerEmail: formData.applicantEmail,
          customerName: `${formData.applicantName} ${formData.applicantSurname}`,
        }),
      });

      if (!checkoutResponse.ok) {
        throw new Error('Failed to create payment checkout');
      }

      const { redirectUrl } = await checkoutResponse.json();

      // Redirect to Yoco payment
      window.location.href = redirectUrl;

    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to process booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Picker & Availability Check */}
      <div className="bg-gray-800/80 backdrop-blur-lg p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-neonPink" />
          Check Availability
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Select Event Date *
            </label>
            <Input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={checkAvailability}
              disabled={isCheckingAvailability || !formData.eventDate}
              className="w-full bg-gradient-to-r from-neonPink to-purple-500 hover:from-neonPink/80 hover:to-purple-500/80 text-white font-semibold"
            >
              {isCheckingAvailability ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Availability'
              )}
            </Button>
          </div>
        </div>

        {/* Availability Status */}
        {isDateAvailable === true && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 font-semibold">
              ✅ This date is available! Fill in the form below to continue.
            </p>
          </div>
        )}

        {isDateAvailable === false && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 font-semibold">
              ❌ This date is already booked. Please select a different date.
            </p>
          </div>
        )}
      </div>

      {/* Booking Form - Only shows when date is available */}
      {showForm && isDateAvailable && (
        <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-lg p-6 rounded-xl space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Roberts Hall Booking Application
            </h3>
            <p className="text-gray-400 text-sm">
              Please fill in all required fields marked with *
            </p>
          </div>

          {/* Applicant Details Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-neonPink border-b border-neonPink/30 pb-2">
              1. Applicant Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  First Name *
                </label>
                <Input
                  type="text"
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Surname *
                </label>
                <Input
                  type="text"
                  name="applicantSurname"
                  value={formData.applicantSurname}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-200 text-sm">
                Full Address *
              </label>
              <Input
                type="text"
                name="applicantAddress"
                value={formData.applicantAddress}
                onChange={handleInputChange}
                required
                placeholder="Your full residential address"
                className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-200 text-sm">
                Roberts Estate Address *
              </label>
              <Input
                type="text"
                name="robertsEstateAddress"
                value={formData.robertsEstateAddress}
                onChange={handleInputChange}
                required
                placeholder="e.g., 123 Roberts Drive, Roberts Estate"
                className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
              />
              <p className="text-xs text-gray-400 mt-1">
                Only Roberts Estate residents can book the hall
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-200 text-sm">
                Contact Number *
              </label>
              <Input
                type="tel"
                name="applicantPhone"
                value={formData.applicantPhone}
                onChange={handleInputChange}
                required
                className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-200 text-sm">
                Email Address *
              </label>
              <Input
                type="email"
                name="applicantEmail"
                value={formData.applicantEmail}
                onChange={handleInputChange}
                required
                className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
              />
            </div>
          </div>

          {/* Event Details Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-neonPink border-b border-neonPink/30 pb-2">
              2. Event Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Event Start Time *
                </label>
                <Input
                  type="time"
                  name="eventStartTime"
                  value={formData.eventStartTime}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Event End Time *
                </label>
                <Input
                  type="time"
                  name="eventEndTime"
                  value={formData.eventEndTime}
                  onChange={handleInputChange}
                  required
                  max="23:00"
                  className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
                />
                <p className="text-xs text-red-400 mt-1">
                  ⚠️ Functions MUST end by 23:00 - NO EXCEPTIONS
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-200 text-sm">
                Event Type *
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
                  Total Number of Guests *
                </label>
                <Input
                  type="number"
                  name="totalGuests"
                  value={formData.totalGuests}
                  onChange={handleInputChange}
                  required
                  min={1}
                  max={50}
                  className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum 50 guests allowed
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Number of Vehicles *
                </label>
                <Input
                  type="number"
                  name="numberOfVehicles"
                  value={formData.numberOfVehicles}
                  onChange={handleInputChange}
                  required
                  min={0}
                  max={30}
                  className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum 30 vehicles allowed
                </p>
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-neonPink border-b border-neonPink/30 pb-2">
              3. Bank Details (For Deposit Refund)
            </h4>
            <p className="text-sm text-gray-400">
              Your R1,000 deposit will be refunded to this account within 7 days after inspection
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Bank Name *
                </label>
                <Input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., FNB, Standard Bank"
                  className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Account Holder Name *
                </label>
                <Input
                  type="text"
                  name="bankAccountHolder"
                  value={formData.bankAccountHolder}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Account Number *
                </label>
                <Input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Branch Code *
                </label>
                <Input
                  type="text"
                  name="bankBranchCode"
                  value={formData.bankBranchCode}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-neonPink border-b border-neonPink/30 pb-2">
              4. Additional Information
            </h4>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="willPlayMusic"
                  checked={formData.willPlayMusic}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-neonPink bg-gray-700 border-gray-600 rounded focus:ring-neonPink focus:ring-2"
                />
                <span className="text-gray-200 font-semibold">
                  Will you be playing music at the event?
                </span>
              </label>
              {formData.willPlayMusic && (
                <div className="mt-3 ml-8">
                  <label className="block font-semibold mb-2 text-gray-200 text-sm">
                    Music Details (SAMRO/SAMPRA Registration Required)
                  </label>
                  <textarea
                    name="musicDetails"
                    value={formData.musicDetails}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Please provide details about music and SAMRO/SAMPRA registration..."
                    className="w-full p-3 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonPink focus:ring-2 focus:ring-neonPink/20"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-200 text-sm">
                Catering Details
              </label>
              <textarea
                name="cateringDetails"
                value={formData.cateringDetails}
                onChange={handleInputChange}
                rows={2}
                placeholder="Will you be providing your own catering? Any special arrangements?"
                className="w-full p-3 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonPink focus:ring-2 focus:ring-neonPink/20"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-200 text-sm">
                Special Requirements
              </label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any special requirements, equipment needs, or other details we should know about..."
                className="w-full p-3 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonPink focus:ring-2 focus:ring-neonPink/20"
              />
            </div>
          </div>

          {/* Terms and Conditions Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-neonPink border-b border-neonPink/30 pb-2">
              5. Terms & Conditions
            </h4>

            <div className="bg-gray-700/50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="space-y-3 text-sm text-gray-300">
                <p className="font-semibold text-white">Please read and accept the following terms:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>No subletting of the hall is permitted</li>
                  <li>Booking fee is R2,500 (R1,500 rental + R1,000 refundable deposit)</li>
                  <li>Functions MUST end by 23:00 - NO EXCEPTIONS</li>
                  <li>Maximum 50 guests and 30 vehicles allowed</li>
                  <li>Speed limit of 30 km/h must be observed within the estate</li>
                  <li>Hall access code provided 24 hours before event</li>
                  <li>Hall must be left clean and undamaged</li>
                  <li>Deposit refunded within 7 days after inspection if no damages</li>
                  <li>Music requires SAMRO/SAMPRA registration proof</li>
                  <li>No illegal activities or violations of estate rules</li>
                  <li>Management reserves the right to cancel booking if terms are violated</li>
                </ul>
              </div>
            </div>

            <div className="bg-neonPink/10 border border-neonPink/30 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  required
                  className="w-5 h-5 mt-1 text-neonPink bg-gray-700 border-gray-600 rounded focus:ring-neonPink focus:ring-2"
                />
                <span className="text-white font-semibold">
                  I have read, understood, and agree to abide by all the terms and conditions *
                </span>
              </label>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-neonPink/10 to-purple-500/10 border border-neonPink/30 rounded-lg p-6">
            <h4 className="text-xl font-bold text-white mb-4 text-center">
              Payment Summary
            </h4>
            <div className="space-y-2 text-gray-200">
              <div className="flex justify-between">
                <span>Hall Rental Fee:</span>
                <span className="font-semibold">R 1,500.00</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit (Refundable):</span>
                <span className="font-semibold">R 1,000.00</span>
              </div>
              <div className="border-t border-neonPink/30 mt-2 pt-2 flex justify-between text-xl">
                <span className="font-bold text-neonPink">Total Due Now:</span>
                <span className="font-bold text-neonPink">R 2,500.00</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4 text-center">
              You will be redirected to secure Yoco payment gateway
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.termsAccepted}
              className="w-full text-lg py-4 bg-gradient-to-r from-neonPink to-purple-500 hover:from-neonPink/80 hover:to-purple-500/80 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                '💳 Submit & Proceed to Payment (R2,500)'
              )}
            </Button>
            <p className="text-xs text-gray-400 text-center mt-2">
              By submitting, you agree to all terms and will be charged R2,500
            </p>
          </div>
        </form>
      )}

      {/* Help Section */}
      <div className="bg-gray-800/60 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-400">
          Need help? Contact us at <span className="text-neonPink font-semibold">admin@littlelattelane.co.za</span>
        </p>
      </div>
    </div>
  );
}
