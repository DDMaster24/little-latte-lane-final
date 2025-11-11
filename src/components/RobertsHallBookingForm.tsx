'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase-client';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, CheckCircle, XCircle, Upload, X, FileText, Mail, Check, Edit } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import SimpleAddressInput from '@/components/SimpleAddressInput';
import { FileDown, Send } from 'lucide-react';
import { openPaymentUrl } from '@/lib/capacitor-browser';

export default function RobertsHallBookingForm() {
  const { user, profile } = useAuth();
  const [bookingMethod, setBookingMethod] = useState<'online' | 'contact' | 'download' | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [dateAvailable, setDateAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  const [bankProofFile, setBankProofFile] = useState<File | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const termsContentRef = useRef<HTMLDivElement>(null);
  const [addressValue, setAddressValue] = useState('');
  const [addressValid, setAddressValid] = useState(false);
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Form data - matching PDF exactly (NO AUTO-FILL)
  const [formData, setFormData] = useState({
    // Applicant Details
    applicantName: '',
    applicantSurname: '',
    applicantEmail: '',
    applicantPhone: '',

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
  });

  // Check if user is logged in
  if (!user) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-md border-2 border-neonPink/40 rounded-2xl p-8 text-center shadow-2xl">
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

      const { data: existingBookings, error } = await supabase
        .from('hall_bookings')
        .select('id, event_date, status')
        .eq('event_date', date)
        .in('status', ['confirmed', 'pending_payment', 'payment_processing']);

      if (error) throw error;

      if (existingBookings && existingBookings.length > 0) {
        setDateAvailable(false);
      } else {
        setDateAvailable(true);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
    }

    setIsCheckingAvailability(false);
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      setBankProofFile(file);
      toast.success('Bank proof attached');
    }
  };

  const removeFile = () => {
    setBankProofFile(null);
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAgreeToTerms = () => {
    setTermsAgreed(true);
    setShowTermsModal(false);
    toast.success('Terms and conditions accepted');
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
    setHasScrolledToBottom(true); // Allow immediate agreement - no scroll requirement
  };

  const handleConfirmSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setSignatureConfirmed(true);
      setIsEditingSignature(false);
      toast.success('Signature confirmed!');
    } else {
      toast.error('Please provide a signature first');
    }
  };

  const handleEditSignature = () => {
    setIsEditingSignature(true);
    setSignatureConfirmed(false);
  };

  const isGuestCountValid = () => {
    return formData.totalGuests >= 1 && formData.totalGuests <= 50;
  };

  const isVehicleCountValid = () => {
    return formData.numberOfVehicles >= 0 && formData.numberOfVehicles <= 30;
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const isFieldTouched = (fieldName: string) => {
    return touchedFields.has(fieldName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate address (just check it's not empty)
    if (!addressValue || addressValue.trim().length === 0) {
      toast.error('Please provide your address');
      return;
    }

    // Validate date availability
    if (dateAvailable !== true) {
      toast.error('Please select an available date');
      return;
    }

    // Validate guest count
    if (!isGuestCountValid()) {
      toast.error('Guest count must be between 1 and 50');
      return;
    }

    // Validate vehicle count
    if (!isVehicleCountValid()) {
      toast.error('Vehicle count must be between 0 and 30');
      return;
    }

    if (!termsAgreed) {
      toast.error('You must read and accept the terms and conditions');
      return;
    }

    // Validate signature is confirmed
    if (!signatureConfirmed) {
      toast.error('Please confirm your signature by clicking the "Confirm Signature" button');
      return;
    }

    // Validate bank proof upload
    if (!bankProofFile) {
      toast.error('Please upload proof of your bank account');
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

      // Get signature as data URL
      const signatureDataUrl = signatureRef.current?.toDataURL();

      // Upload bank proof file
      let bankProofUrl = '';
      if (bankProofFile) {
        const fileExt = bankProofFile.name.split('.').pop();
        const fileName = `bank-proof-${user.id}-${Date.now()}.${fileExt}`;

        console.log('📤 Uploading bank proof:', {
          fileName,
          fileSize: bankProofFile.size,
          fileType: bankProofFile.type,
          bucket: 'hall-bookings'
        });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('hall-bookings')
          .upload(fileName, bankProofFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Bank proof upload error:', uploadError);
          console.error('Error details:', {
            message: uploadError.message,
            name: uploadError.name
          });

          // Provide more specific error messages
          if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
            toast.error('Storage bucket not configured. Please contact admin to set up the hall-bookings storage bucket.');
          } else if (uploadError.message?.includes('Invalid') || uploadError.message?.includes('format')) {
            toast.error('Invalid file. Please ensure you selected a valid image file (JPG, PNG, or PDF).');
          } else {
            toast.error(`Failed to upload bank proof: ${uploadError.message || 'Unknown error'}`);
          }
          setIsSubmitting(false);
          return;
        }

        console.log('✅ Bank proof uploaded successfully:', uploadData);

        const { data: urlData } = supabase.storage
          .from('hall-bookings')
          .getPublicUrl(fileName);

        bankProofUrl = urlData.publicUrl;
        console.log('📎 Bank proof URL:', bankProofUrl);
      }

      // Create booking in database
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
          applicant_address: addressValue,
          roberts_estate_address: addressValue,
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
          proof_of_payment_url: bankProofUrl,
          status: 'pending_payment',
          total_amount: 20,
          rental_fee: 12,
          deposit_amount: 8,
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

      // Upload signature
      if (signatureDataUrl) {
        const signatureBlob = await (await fetch(signatureDataUrl)).blob();
        const signatureFileName = `signature-${booking.id}.png`;
        await supabase.storage
          .from('hall-bookings')
          .upload(signatureFileName, signatureBlob);
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
          amount: 20,
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

      console.log('🎫 Checkout response received:', {
        success: checkoutData.success,
        checkoutId: checkoutData.checkoutId,
        redirectUrl: checkoutData.redirectUrl,
        amount: checkoutData.amount,
        currency: checkoutData.currency
      });

      if (checkoutData.success && checkoutData.redirectUrl) {
        console.log('✅ Payment session created successfully');
        console.log('🔗 Redirect URL:', checkoutData.redirectUrl);
        console.log('💳 About to open payment URL...');

        try {
          // Use the same payment URL handler as cart (supports native apps and web)
          console.log('📱 Calling openPaymentUrl()...');
          await openPaymentUrl(checkoutData.redirectUrl);
          console.log('✅ openPaymentUrl() completed');

          // Note: Don't set isSubmitting to false here - let it stay loading
          // until user returns from payment (similar to cart flow)
        } catch (paymentError) {
          console.error('❌ Error opening payment URL:', paymentError);
          console.error('Payment error details:', {
            name: paymentError instanceof Error ? paymentError.name : 'Unknown',
            message: paymentError instanceof Error ? paymentError.message : String(paymentError),
            stack: paymentError instanceof Error ? paymentError.stack : undefined
          });
          toast.error('Failed to open payment page. Please try again.');
          setIsSubmitting(false);
        }
      } else {
        console.error('❌ Invalid checkout response:', checkoutData);
        toast.error('Failed to initialize payment');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('❌ Booking submission error:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
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
    <div className="space-y-6">
      {/* THREE BOOKING METHOD OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* OPTION 1: Fill in Form Online */}
        <button
          type="button"
          onClick={() => setBookingMethod(bookingMethod === 'online' ? null : 'online')}
          className={`relative p-6 rounded-lg border-2 transition-all text-left overflow-hidden ${
            bookingMethod === 'online'
              ? 'border-neonPink bg-gradient-to-br from-neonPink/20 to-purple-500/10 shadow-lg shadow-neonPink/30'
              : 'border-neonPink/60 bg-gray-900/90 hover:border-neonPink hover:shadow-md hover:shadow-neonPink/20'
          }`}
        >
          {bookingMethod === 'online' && (
            <div className="absolute inset-0 bg-gradient-to-br from-neonPink/10 via-transparent to-purple-500/10 pointer-events-none" />
          )}
          <div className="relative z-10">
            <FileText className={`h-8 w-8 mb-3 ${bookingMethod === 'online' ? 'text-neonPink' : 'text-neonPink/80'}`} />
            <h3 className="font-semibold text-white mb-2">Fill in Form Online</h3>
            <p className="text-sm text-gray-300">Complete the booking form directly on this page</p>
          </div>
        </button>

        {/* OPTION 2: Contact Admin */}
        <button
          type="button"
          onClick={() => setBookingMethod(bookingMethod === 'contact' ? null : 'contact')}
          className={`relative p-6 rounded-lg border-2 transition-all text-left overflow-hidden ${
            bookingMethod === 'contact'
              ? 'border-neonCyan bg-gradient-to-br from-neonCyan/20 to-blue-500/10 shadow-lg shadow-neonCyan/30'
              : 'border-neonCyan/60 bg-gray-900/90 hover:border-neonCyan hover:shadow-md hover:shadow-neonCyan/20'
          }`}
        >
          {bookingMethod === 'contact' && (
            <div className="absolute inset-0 bg-gradient-to-br from-neonCyan/10 via-transparent to-blue-500/10 pointer-events-none" />
          )}
          <div className="relative z-10">
            <Mail className={`h-8 w-8 mb-3 ${bookingMethod === 'contact' ? 'text-neonCyan' : 'text-neonCyan/80'}`} />
            <h3 className="font-semibold text-white mb-2">Request PDF Form</h3>
            <p className="text-sm text-gray-300">Contact admin to receive the PDF booking form</p>
          </div>
        </button>

        {/* OPTION 3: Download PDF */}
        <button
          type="button"
          onClick={() => setBookingMethod(bookingMethod === 'download' ? null : 'download')}
          className={`relative p-6 rounded-lg border-2 transition-all text-left overflow-hidden ${
            bookingMethod === 'download'
              ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/10 shadow-lg shadow-purple-500/30'
              : 'border-purple-500/60 bg-gray-900/90 hover:border-purple-500 hover:shadow-md hover:shadow-purple-500/20'
          }`}
        >
          {bookingMethod === 'download' && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
          )}
          <div className="relative z-10">
            <FileDown className={`h-8 w-8 mb-3 ${bookingMethod === 'download' ? 'text-purple-500' : 'text-purple-500/80'}`} />
            <h3 className="font-semibold text-white mb-2">Download & Upload PDF</h3>
            <p className="text-sm text-gray-300">Download PDF, fill it out, and upload back</p>
          </div>
        </button>
      </div>

      {/* OPTION 1 CONTENT: Online Form */}
      {bookingMethod === 'online' && (
        <form onSubmit={handleSubmit} className="bg-gray-900/95 backdrop-blur-md border-2 border-neonPink/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 shadow-2xl">

      {/* SECTION 1: APPLICANT DETAILS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-neonCyan border-b border-neonCyan/30 pb-2">
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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-200 text-sm">
            Address (Roberts Estate)
          </label>
          <SimpleAddressInput
            value={addressValue}
            onChange={(value, isValid) => {
              setAddressValue(value);
              setAddressValid(isValid);
            }}
            onBlur={() => handleFieldBlur('address')}
            touched={isFieldTouched('address')}
            required
          />
        </div>
      </div>

      {/* SECTION 2: EVENT DETAILS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-neonCyan border-b border-neonCyan/30 pb-2">
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
              className={`bg-gray-700/80 text-white focus:border-neonCyan [color-scheme:dark] ${
                dateAvailable === true
                  ? 'border-green-500'
                  : dateAvailable === false
                  ? 'border-red-500'
                  : 'border-gray-600'
              }`}
            />
            {isCheckingAvailability && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-neonCyan" />
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
              min="05:30"
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum start time is 05:30
            </p>
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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
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
          <Input
            type="text"
            name="eventType"
            value={formData.eventType}
            onChange={handleInputChange}
            required
            className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
          />
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
              onBlur={() => handleFieldBlur('totalGuests')}
              required
              min={1}
              max={50}
              className={`bg-gray-700/80 text-white focus:border-neonCyan [color-scheme:dark] ${
                isFieldTouched('totalGuests')
                  ? isGuestCountValid()
                    ? 'border-green-500'
                    : 'border-red-500'
                  : 'border-gray-600'
              }`}
            />
            <p className={`text-xs mt-1 ${
              isFieldTouched('totalGuests')
                ? isGuestCountValid()
                  ? 'text-green-400'
                  : 'text-red-400'
                : 'text-gray-400'
            }`}>
              {isGuestCountValid() || !isFieldTouched('totalGuests') ? 'Maximum 50 guests' : `Must be between 1-50 (currently ${formData.totalGuests})`}
            </p>
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
              onBlur={() => handleFieldBlur('numberOfVehicles')}
              required
              min={0}
              max={30}
              className={`bg-gray-700/80 text-white focus:border-neonCyan [color-scheme:dark] ${
                isFieldTouched('numberOfVehicles')
                  ? isVehicleCountValid()
                    ? 'border-green-500'
                    : 'border-red-500'
                  : 'border-gray-600'
              }`}
            />
            <p className={`text-xs mt-1 ${
              isFieldTouched('numberOfVehicles')
                ? isVehicleCountValid()
                  ? 'text-green-400'
                  : 'text-red-400'
                : 'text-gray-400'
            }`}>
              {isVehicleCountValid() || !isFieldTouched('numberOfVehicles') ? 'Maximum 30 vehicles' : `Must be between 0-30 (currently ${formData.numberOfVehicles})`}
            </p>
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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: BANKING DETAILS */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-neonCyan border-b border-neonCyan/30 pb-2">
            Banking Details
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            Kindly upload proof of your bank account
          </p>
        </div>

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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
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
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Bank Proof Upload */}
        <div>
          <label className="block font-semibold mb-2 text-gray-200 text-sm">
            Upload Bank Proof
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="bank-proof-upload"
            />
            <label
              htmlFor="bank-proof-upload"
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-neonCyan transition-colors bg-gray-700/50"
            >
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-gray-300">
                {bankProofFile ? bankProofFile.name : 'Click to upload bank statement or proof'}
              </span>
            </label>
          </div>
          {bankProofFile && (
            <div className="mt-2 flex items-center justify-between bg-neonCyan/10 border border-neonCyan/30 rounded p-3">
              <span className="text-sm text-neonCyan truncate flex-1">{bankProofFile.name}</span>
              <button
                type="button"
                onClick={removeFile}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Accepted formats: JPG, PNG, PDF (max 5MB)
          </p>
        </div>
      </div>

      {/* PAYMENT SUMMARY */}
      <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-3 text-center">Payment Summary</h4>
        <div className="space-y-2 text-gray-200">
          <div className="flex justify-between">
            <span>Hall Rental Fee:</span>
            <span className="font-semibold">R12.00</span>
          </div>
          <div className="flex justify-between">
            <span>Refundable Deposit:</span>
            <span className="font-semibold">R8.00</span>
          </div>
          <div className="border-t border-neonCyan/30 pt-2 mt-2 flex justify-between text-lg font-bold text-neonCyan">
            <span>Total Amount:</span>
            <span>R20.00</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Payment will be processed via Yoco secure checkout
        </p>
      </div>

      {/* TERMS & SIGNATURE SECTION (GROUPED) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-neonCyan border-b border-neonCyan/30 pb-2">
          Terms & Signature
        </h3>

        {/* Read Terms Button */}
        <div>
          <Button
            type="button"
            onClick={openTermsModal}
            variant="outline"
            className="w-full border-neonCyan/50 text-neonCyan hover:bg-neonCyan/10 hover:border-neonCyan flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Read Terms & Conditions
          </Button>
        </div>

        {/* Terms Acceptance Checkbox */}
        <div className={`bg-gray-800/50 border rounded-lg p-4 transition-all ${termsAgreed ? 'border-green-500/50 bg-green-500/10' : 'border-gray-600'}`}>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              disabled={!termsAgreed}
              className="mt-1 w-4 h-4 text-neonCyan bg-gray-700 border-gray-600 rounded focus:ring-neonCyan focus:ring-2 disabled:opacity-50"
            />
            <span className="text-sm text-gray-200">
              {termsAgreed ? (
                <>
                  <CheckCircle className="inline h-4 w-4 text-green-400 mr-1" />
                  I have read and accept the terms and conditions
                </>
              ) : (
                'Please read the terms and conditions above to continue'
              )}
            </span>
          </label>
        </div>

        {/* Signature Pad - Only show if terms accepted */}
        {termsAgreed && (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-2 text-gray-200 text-sm">
                Your Signature / Initial
              </label>
              <p className="text-xs text-gray-400 mb-2">
                {signatureConfirmed
                  ? '✓ Signature confirmed. Click "Edit Signature" to make changes.'
                  : 'Please sign or initial using your mouse or finger on the line below'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-2 relative">
              {signatureConfirmed && (
                <div className="absolute inset-0 bg-gray-900/10 z-10 rounded flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              )}
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: `w-full h-40 border border-gray-300 rounded ${signatureConfirmed && !isEditingSignature ? 'pointer-events-none' : 'cursor-crosshair'}`,
                }}
              />
              {/* Signature line */}
              <div className="absolute bottom-10 left-8 right-8 border-b-2 border-black opacity-30" />
            </div>

            <div className="flex gap-2">
              {!signatureConfirmed || isEditingSignature ? (
                <>
                  <Button
                    type="button"
                    onClick={clearSignature}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmSignature}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Signature
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handleEditSignature}
                  variant="outline"
                  className="w-full border-neonCyan text-neonCyan hover:bg-neonCyan/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Signature
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <Button
        type="submit"
        disabled={isSubmitting || dateAvailable !== true || !termsAgreed}
        className="w-full text-lg py-6 bg-gradient-to-r from-neonCyan to-cyan-500 hover:from-neonCyan/80 hover:to-cyan-500/80 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </span>
        ) : dateAvailable !== true ? (
          'Select Available Date First'
        ) : !termsAgreed ? (
          'Read & Accept Terms to Continue'
        ) : (
          'Proceed to Payment (R20)'
        )}
      </Button>

      {/* TERMS & CONDITIONS MODAL OVERLAY */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6">
          <div className="bg-gray-900 border-2 border-neonCyan/50 rounded-xl sm:rounded-2xl max-w-4xl w-full h-[95vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-neonCyan/30">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neonCyan">Roberts Hall Terms & Conditions</h2>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                Please scroll through and read all terms carefully
              </p>
            </div>

            {/* Modal Content - Scrollable */}
            <div
              ref={termsContentRef}
              onScroll={handleTermsScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 text-gray-200"
            >
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-neonCyan mb-3 sm:mb-4">
                  TERMS AND CONDITIONS FOR RENTAL OF THE COMMUNITY HALL
                </h3>

                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">1.</span>
                    <p>ROBERTS LITTLE LATTE LANE reserves the right to decline this application without further explanation.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">2.</span>
                    <p>Renting the hall is the sole responsibility of the applicant. No claims may be made against the Homeowners Association or Roberts Little Latte Lane.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">3.</span>
                    <p>A total amount of R2,500 is payable upon signature of this application form: R1,500 rental fee and R1,000 refundable deposit.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">4.</span>
                    <p>The R1,000 deposit will be refunded within 7 working days after the function and final inspection, provided there are no damages, excessive cleaning required, or breaches of the terms and conditions.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">5.</span>
                    <p>The applicant is responsible for the conduct of all guests and will be held liable for any damages caused to ROBERTS LITTLE LATTE LANE property, infrastructure, offices, private homes, or roads.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">6.</span>
                    <p>The applicant's account must be up to date and have no outstanding payments due to ROBERTS LITTLE LATTE LANE.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">7.</span>
                    <p>Guests may not roam freely through Roberts Estate or cause any nuisance to residents. Access is restricted to the entrance hall and veranda area.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">8.</span>
                    <p>All guests must adhere to ROBERTS LITTLE LATTE LANE's House Rules. Any violation will result in the forfeiture of the deposit and possible denial of future rentals.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">9.</span>
                    <p>The speed limit within the Estate is strictly 30 km/h.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">10.</span>
                    <p>Guests must enter using a unique access code provided by the office. No access will be granted without a code.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">11.</span>
                    <p>Security personnel may be placed at the hall for the duration of the event.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">12.</span>
                    <p>ROBERTS LITTLE LATTE LANE reserves the right to inspect or visit the hall at any time during the function. Should any irregularities occur, the function may be terminated immediately, and all guests will be deemed trespassers. The deposit will be forfeited.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">13.</span>
                    <p>Should guests misbehave or cause a nuisance, the applicant will be required to address it immediately. If not rectified, the guest's access will be revoked, and the function may be terminated. The deposit will be forfeited.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">14.</span>
                    <p>For functions for minors (under 18 years), alcohol is strictly prohibited. If alcohol is found, the function will be terminated immediately, and the deposit forfeited.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">15.</span>
                    <p>Cash bars are not permitted.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">16.</span>
                    <p>The hall must be left clean and in its original condition. Any additional cleaning required will result in the forfeiture of the deposit.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">17.</span>
                    <p>There is no generator or alternative power supply available. Private generators may not be connected to the building's electrical system.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">18.</span>
                    <p>Access to the kiosk must remain unobstructed. Kiosk tables and equipment are not to be used or removed.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">19.</span>
                    <p>Jumping castles and water slides are not permitted.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">20.</span>
                    <p>Towels, soap, or other restroom items are the property of ROBERTS LITTLE LATTE LANE and may not be removed.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">21.</span>
                    <p>No damage to plants or throwing of objects into the dam or swimming pool is permitted.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">22.</span>
                    <p>Decorations may not be attached to walls, doors, or ceilings with glue, Prestik, Sellotape, or any adhesive materials.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">23.</span>
                    <p>If music is played, it must be SAMRO and SAMPRA registered. Proof of registration must accompany this application.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">24.</span>
                    <p>All music and noise must be turned down by 22:00 (Fridays & Saturdays), and 20:00 on Sundays.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">25.</span>
                    <p>If noise or nuisance complaints are received, security will investigate. If found valid, the function may be terminated immediately, and the deposit forfeited.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">26.</span>
                    <p>All functions must end by 23:00 (latest).</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">27.</span>
                    <p>Any event continuing after 23:00 will incur an additional day's rental of R1,500, recoverable via a special levy.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">28.</span>
                    <p>A maximum of 50 guests is permitted per function.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">29.</span>
                    <p>A maximum of 30 vehicles is permitted per function.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">30.</span>
                    <p>The applicant must be present at all times during the function.</p>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-semibold min-w-[1.5rem]">31.</span>
                    <p>By signing this document, the applicant confirms that they have read, understood, and agree to all the above terms and conditions, and acknowledge receipt of Annexure A: ROBERTS LITTLE LATTE LANE House Rules.</p>
                  </div>
                </div>

                <div className="border-t border-neonCyan/30 pt-4 mt-6">
                  <p className="text-sm text-gray-300">
                    By accepting these terms and providing your signature, you confirm that you have read, understood, and agree to abide by all the conditions outlined above.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-neonCyan/30">
              <Button
                type="button"
                onClick={handleAgreeToTerms}
                className="w-full bg-gradient-to-r from-neonCyan to-cyan-500 hover:from-neonCyan/80 hover:to-cyan-500/80 text-black font-semibold text-sm sm:text-base py-5 sm:py-6"
              >
                I Agree to Terms & Conditions
              </Button>
            </div>
          </div>
        </div>
      )}
        </form>
      )}

      {/* OPTION 2 CONTENT: Contact Admin */}
      {bookingMethod === 'contact' && (
        <div className="bg-gray-900/95 backdrop-blur-md border-2 border-neonCyan/40 rounded-xl p-6 sm:p-8 shadow-2xl text-center">
          <Mail className="h-16 w-16 text-neonCyan mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Contact Admin for PDF Form</h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Click the button below to send an email to our admin team. They will respond with the official Roberts Hall booking PDF form.
          </p>
          <Button
            type="button"
            onClick={() => window.location.href = 'mailto:admin@littlelattelane.co.za?subject=Roberts%20Hall%20PDF%20Booking%20Form%20Request&body=Hello,%0D%0A%0D%0AI%20would%20like%20to%20request%20the%20Roberts%20Hall%20booking%20PDF%20form.%0D%0A%0D%0AThank%20you!'}
            className="bg-gradient-to-r from-neonCyan to-cyan-500 hover:from-neonCyan/80 hover:to-cyan-500/80 text-black font-semibold px-8 py-3"
          >
            <Mail className="h-5 w-5 mr-2" />
            Send Email to Admin
          </Button>
        </div>
      )}

      {/* OPTION 3 CONTENT: Download & Upload PDF */}
      {bookingMethod === 'download' && (
        <div className="bg-gray-900/95 backdrop-blur-md border-2 border-purple-500/40 rounded-xl p-6 sm:p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Download, Fill & Upload PDF Form</h3>

          {/* Step 1: Download */}
          <div className="space-y-6">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">Download the PDF Form</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Download the official Roberts Hall booking form to your device
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      // Create a link to download the PDF
                      const link = document.createElement('a');
                      link.href = '/roberts-hall-booking-form.pdf';
                      link.download = 'Roberts_Hall_Booking_Form.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success('Downloading PDF form...');
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF Form
                  </Button>
                  <p className="text-xs text-yellow-400 mt-2">
                    Note: PDF form needs to be added to public folder (/roberts-hall-booking-form.pdf)
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Fill it out */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">Fill Out the Form</h4>
                  <p className="text-sm text-gray-300">
                    Open the PDF and complete all required fields with your event details and personal information
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Upload */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2">Upload Completed Form</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Upload your filled PDF form here
                  </p>

                  {uploadedPdfFile ? (
                    <div className="flex items-center gap-2 bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white text-sm flex-1">{uploadedPdfFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setUploadedPdfFile(null)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-300">Click to upload PDF</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.type === 'application/pdf') {
                              setUploadedPdfFile(file);
                              toast.success('PDF uploaded successfully');
                            } else {
                              toast.error('Please upload a PDF file');
                            }
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Step 4: Send Email */}
            {uploadedPdfFile && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2">Send to Admin</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Send your completed form to the admin team for review
                    </p>
                    <Button
                      type="button"
                      disabled={isSendingEmail || !uploadedPdfFile}
                      onClick={async () => {
                        if (!uploadedPdfFile || !user?.email) return;

                        setIsSendingEmail(true);
                        try {
                          // Create FormData to send PDF with user details
                          const formDataToSend = new FormData();
                          formDataToSend.append('pdf', uploadedPdfFile);
                          formDataToSend.append('email', user.email);
                          formDataToSend.append('name', profile?.full_name || 'Unknown User');

                          const response = await fetch('/api/hall-booking/send-pdf-form', {
                            method: 'POST',
                            body: formDataToSend,
                          });

                          const result = await response.json();

                          if (response.ok) {
                            toast.success('Form sent successfully! Admin will review and contact you.');
                            setUploadedPdfFile(null);
                            setBookingMethod(null);
                          } else {
                            throw new Error(result.error || 'Failed to send form');
                          }
                        } catch (error) {
                          console.error('Error sending PDF form:', error);
                          toast.error(error instanceof Error ? error.message : 'Failed to send form');
                        } finally {
                          setIsSendingEmail(false);
                        }
                      }}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Form to Admin
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
