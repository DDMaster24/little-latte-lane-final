'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase-client';
import { useAuth } from '@/components/AuthProvider';
import { Calendar, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function RobertsHallBookingForm() {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [dateAvailable, setDateAvailable] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    applicantName: profile?.full_name?.split(' ')[0] || '',
    applicantSurname: profile?.full_name?.split(' ').slice(1).join(' ') || '',
    applicantEmail: '',
    applicantPhone: profile?.phone || '',
    robertsEstateAddress: '',
    eventStartTime: '',
    eventEndTime: '23:00',
    eventType: '',
    totalGuests: 1,
    numberOfVehicles: 0,
    termsAccepted: false,
  });

  // Check if user is logged in
  if (!user) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-lg p-8 rounded-xl text-center">
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

  const checkAvailability = async () => {
    if (!selectedDate) {
      toast.error('Please select a date first');
      return;
    }

    setIsCheckingAvailability(true);
    setDateAvailable(null);

    try {
      const supabase = getSupabaseClient();

      // Check if date is already booked
      const { data: existingBookings, error } = await supabase
        .from('hall_bookings')
        .select('id, event_date, status')
        .eq('event_date', selectedDate)
        .in('status', ['confirmed', 'pending_payment', 'payment_processing']);

      if (error) throw error;

      if (existingBookings && existingBookings.length > 0) {
        setDateAvailable(false);
        toast.error('Sorry, this date is already booked');
      } else {
        setDateAvailable(true);
        setShowForm(true);
        toast.success('Date is available! Please complete the form below');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
    }

    setIsCheckingAvailability(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      const supabase = getSupabaseClient();

      // Create booking in database with pending_payment status
      const bookingReference = `HB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const { data: booking, error: bookingError } = await supabase
        .from('hall_bookings')
        .insert({
          user_id: user.id,
          event_date: selectedDate,
          applicant_name: formData.applicantName,
          applicant_surname: formData.applicantSurname,
          applicant_email: formData.applicantEmail,
          applicant_phone: formData.applicantPhone,
          applicant_address: formData.robertsEstateAddress, // Maps to applicant_address
          roberts_estate_address: formData.robertsEstateAddress,
          event_start_time: formData.eventStartTime,
          event_end_time: formData.eventEndTime,
          event_type: formData.eventType,
          total_guests: formData.totalGuests,
          number_of_vehicles: formData.numberOfVehicles,
          status: 'pending_payment',
          total_amount: 2500, // R1,500 rental + R1,000 deposit
          rental_fee: 1500,
          deposit_amount: 1000,
          booking_reference: bookingReference,
          // Bank details - will be collected later or not required for online bookings
          bank_account_holder: 'TBD',
          bank_account_number: 'TBD',
          bank_branch_code: 'TBD',
          bank_name: 'TBD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (bookingError || !booking) {
        console.error('Error creating booking:', bookingError);
        toast.error('Failed to create booking. Please try again.');
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
        return;
      }

      const checkoutData = await checkoutResponse.json();

      if (checkoutData.success && checkoutData.redirectUrl) {
        console.log('✅ Redirecting to Yoco payment:', checkoutData.redirectUrl);
        // Redirect to Yoco payment page
        window.location.href = checkoutData.redirectUrl;
      } else {
        toast.error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      toast.error('An error occurred. Please try again.');
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
    <div className="space-y-6">
      {/* Date Availability Checker */}
      <div className="bg-gray-800/80 backdrop-blur-lg p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-neonPink" />
          Step 1: Check Date Availability
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200 text-sm">
              Select Event Date *
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="bg-gray-700/80 border-gray-600 text-white"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={checkAvailability}
              disabled={isCheckingAvailability || !selectedDate}
              className="w-full bg-gradient-to-r from-neonPink to-purple-500 text-white font-semibold"
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
        {dateAvailable === true && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 font-semibold">
              ✅ Date available! Complete the form below.
            </p>
          </div>
        )}

        {dateAvailable === false && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 font-semibold">
              ❌ This date is already booked. Please select another date.
            </p>
          </div>
        )}
      </div>

      {/* Booking Form - Only shows when date is available */}
      {showForm && dateAvailable && (
        <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-lg p-6 rounded-xl space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Step 2: Complete Booking Form
            </h3>
            <p className="text-gray-400 text-sm">
              Fill in all required fields marked with *
            </p>
          </div>

          {/* Applicant Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-neonPink border-b border-neonPink/30 pb-2">
              Your Details
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
                  className="bg-gray-700/80 border-gray-600 text-white"
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
                  className="bg-gray-700/80 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Email *
                </label>
                <Input
                  type="email"
                  name="applicantEmail"
                  value={formData.applicantEmail}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-700/80 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Phone *
                </label>
                <Input
                  type="tel"
                  name="applicantPhone"
                  value={formData.applicantPhone}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-700/80 border-gray-600 text-white"
                />
              </div>
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
                className="bg-gray-700/80 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Only Roberts Estate residents can book the hall
              </p>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-neonPink border-b border-neonPink/30 pb-2">
              Event Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  Start Time *
                </label>
                <Input
                  type="time"
                  name="eventStartTime"
                  value={formData.eventStartTime}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-700/80 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-200 text-sm">
                  End Time *
                </label>
                <Input
                  type="time"
                  name="eventEndTime"
                  value={formData.eventEndTime}
                  onChange={handleInputChange}
                  required
                  max="23:00"
                  className="bg-gray-700/80 border-gray-600 text-white"
                />
                <p className="text-xs text-red-400 mt-1">
                  ⚠️ Events MUST end by 23:00 - NO EXCEPTIONS
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
                className="w-full p-3 rounded-lg bg-gray-700/80 text-white border border-gray-600"
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
                  Number of Guests *
                </label>
                <Input
                  type="number"
                  name="totalGuests"
                  value={formData.totalGuests}
                  onChange={handleInputChange}
                  required
                  min={1}
                  max={50}
                  className="bg-gray-700/80 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum 50 guests</p>
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
                  className="bg-gray-700/80 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum 30 vehicles</p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-neonPink border-b border-neonPink/30 pb-2">
              Terms & Conditions
            </h4>

            <div className="bg-gray-700/50 rounded-lg p-4 max-h-48 overflow-y-auto text-sm text-gray-300">
              <ul className="list-disc list-inside space-y-2">
                <li>Booking fee is R2,500 (R1,500 rental + R1,000 refundable deposit)</li>
                <li>Functions MUST end by 23:00 - NO EXCEPTIONS</li>
                <li>Maximum 50 guests and 30 vehicles allowed</li>
                <li>Speed limit of 30 km/h within the estate</li>
                <li>Hall must be left clean and undamaged</li>
                <li>Deposit refunded within 7 days after inspection</li>
                <li>No illegal activities or violations of estate rules</li>
              </ul>
            </div>

            <div className="bg-neonPink/10 border border-neonPink/30 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  required
                  className="w-5 h-5 mt-1 text-neonPink bg-gray-700 border-gray-600 rounded"
                />
                <span className="text-white font-semibold">
                  I have read, understood, and agree to all terms and conditions *
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
                <span className="font-bold text-neonPink">Total Due:</span>
                <span className="font-bold text-neonPink">R 2,500.00</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!formData.termsAccepted}
            className="w-full text-lg py-4 bg-gradient-to-r from-neonPink to-purple-500 text-white font-bold disabled:opacity-50"
          >
            💳 Submit & Proceed to Payment (R2,500)
          </Button>
        </form>
      )}
    </div>
  );
}
