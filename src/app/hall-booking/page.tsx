'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase-client';
import { authQueries } from '@/lib/queries/auth';
import { Button } from '@/components/ui/button';
import NextImage from 'next/image';
import {
  HallBookingFormData,
  HALL_BOOKING_STEPS,
  VALIDATION_RULES,
} from '@/types/hall-booking';

// Import step components (to be created)
import Step1Verification from './steps/Step1Verification';
import Step2ApplicantDetails from './steps/Step2ApplicantDetails';
import Step3EventDetails from './steps/Step3EventDetails';
import Step4BankDetails from './steps/Step4BankDetails';
import Step5AdditionalInfo from './steps/Step5AdditionalInfo';
import Step6TermsConditions from './steps/Step6TermsConditions';
import Step7Review from './steps/Step7Review';
import Step8Payment from './steps/Step8Payment';

export default function HallBookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Initialize form data
  const [formData, setFormData] = useState<HallBookingFormData>({
    // Applicant Information
    applicantName: '',
    applicantSurname: '',
    applicantAddress: '',
    applicantPhone: '',
    applicantEmail: '',
    isRobertsResident: true,
    robertsEstateAddress: '',

    // Event Details
    eventDate: '',
    eventStartTime: '10:00',
    eventEndTime: '22:00',
    eventType: '',
    eventDescription: '',
    totalGuests: 1,
    numberOfVehicles: 0,
    tablesRequired: 0,
    chairsRequired: 0,

    // Bank Details
    bankAccountHolder: '',
    bankName: '',
    bankBranchCode: '',
    bankAccountNumber: '',
    bankProofDocumentUrl: '',

    // Music & Special Requests
    willPlayMusic: false,
    samroSampraProofUrl: '',
    specialRequests: '',

    // Terms & Conditions
    termsAccepted: false,
    termsAcceptedAt: '',
    termsVersion: '2025-01',
    termsPage1Initial: '',
    termsPage2Initial: '',
    termsPage3Initial: '',
    termsPage4Initial: '',

    // Payment
    totalAmount: VALIDATION_RULES.totalAmount,
    rentalFee: VALIDATION_RULES.rentalFee,
    depositAmount: VALIDATION_RULES.depositAmount,
  });

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    setIsLoading(true);
    const currentUser = await authQueries.getCurrentUser();

    if (!currentUser) {
      toast.error('Please log in to book Roberts Hall');
      router.push('/auth/login?redirect=/hall-booking');
      return;
    }

    setUser(currentUser);

    // Pre-fill applicant details from user profile
    if (currentUser.email) {
      setFormData((prev) => ({
        ...prev,
        applicantEmail: currentUser.email || '',
        applicantName: currentUser.full_name?.split(' ')[0] || '',
        applicantSurname: currentUser.full_name?.split(' ').slice(1).join(' ') || '',
        applicantPhone: currentUser.phone || '',
      }));
    }

    // Check for existing draft booking
    await loadDraftBooking(currentUser.id);

    setIsLoading(false);
  };

  const loadDraftBooking = async (userId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('hall_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        // Load draft data into form
        setDraftId(data.id);
        toast.info('Draft booking loaded. You can continue where you left off.');

        // Map database fields to form data
        setFormData({
          applicantName: data.applicant_name || '',
          applicantSurname: data.applicant_surname || '',
          applicantAddress: data.applicant_address || '',
          applicantPhone: data.applicant_phone || '',
          applicantEmail: data.applicant_email || '',
          isRobertsResident: data.is_roberts_resident ?? true,
          robertsEstateAddress: data.roberts_estate_address || '',
          eventDate: data.event_date || '',
          eventStartTime: data.event_start_time || '10:00',
          eventEndTime: data.event_end_time || '22:00',
          eventType: data.event_type || '',
          eventDescription: data.event_description || '',
          totalGuests: data.total_guests || 1,
          numberOfVehicles: data.number_of_vehicles || 0,
          tablesRequired: data.tables_required || 0,
          chairsRequired: data.chairs_required || 0,
          bankAccountHolder: data.bank_account_holder || '',
          bankName: data.bank_name || '',
          bankBranchCode: data.bank_branch_code || '',
          bankAccountNumber: data.bank_account_number || '',
          bankProofDocumentUrl: data.bank_proof_document_url || '',
          willPlayMusic: data.will_play_music ?? false,
          samroSampraProofUrl: data.samro_sampra_proof_url || '',
          specialRequests: data.special_requests || '',
          termsAccepted: data.terms_accepted ?? false,
          termsAcceptedAt: data.terms_accepted_at || '',
          termsVersion: data.terms_version || '2025-01',
          termsPage1Initial: data.terms_page_1_initial || '',
          termsPage2Initial: data.terms_page_2_initial || '',
          termsPage3Initial: data.terms_page_3_initial || '',
          termsPage4Initial: data.terms_page_4_initial || '',
          totalAmount: data.total_amount || VALIDATION_RULES.totalAmount,
          rentalFee: data.rental_fee || VALIDATION_RULES.rentalFee,
          depositAmount: data.deposit_amount || VALIDATION_RULES.depositAmount,
        });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();

      const bookingData = {
        user_id: user.id,
        status: 'draft',
        applicant_name: formData.applicantName,
        applicant_surname: formData.applicantSurname,
        applicant_address: formData.applicantAddress,
        applicant_phone: formData.applicantPhone,
        applicant_email: formData.applicantEmail,
        is_roberts_resident: formData.isRobertsResident,
        roberts_estate_address: formData.robertsEstateAddress,
        event_date: formData.eventDate || null,
        event_start_time: formData.eventStartTime || null,
        event_end_time: formData.eventEndTime || null,
        event_type: formData.eventType || null,
        event_description: formData.eventDescription || null,
        total_guests: formData.totalGuests,
        number_of_vehicles: formData.numberOfVehicles,
        tables_required: formData.tablesRequired,
        chairs_required: formData.chairsRequired,
        bank_account_holder: formData.bankAccountHolder || null,
        bank_name: formData.bankName || null,
        bank_branch_code: formData.bankBranchCode || null,
        bank_account_number: formData.bankAccountNumber || null,
        bank_proof_document_url: formData.bankProofDocumentUrl || null,
        will_play_music: formData.willPlayMusic,
        samro_sampra_proof_url: formData.samroSampraProofUrl || null,
        special_requests: formData.specialRequests || null,
        terms_accepted: formData.termsAccepted,
        terms_accepted_at: formData.termsAcceptedAt || null,
        terms_version: formData.termsVersion,
        terms_page_1_initial: formData.termsPage1Initial || null,
        terms_page_2_initial: formData.termsPage2Initial || null,
        terms_page_3_initial: formData.termsPage3Initial || null,
        terms_page_4_initial: formData.termsPage4Initial || null,
        total_amount: formData.totalAmount,
        rental_fee: formData.rentalFee,
        deposit_amount: formData.depositAmount,
      };

      if (draftId) {
        // Update existing draft
        const { error } = await supabase
          .from('hall_bookings')
          .update(bookingData)
          .eq('id', draftId);

        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('hall_bookings')
          .insert(bookingData)
          .select()
          .single();

        if (error) throw error;
        if (data) setDraftId(data.id);
      }

      toast.success('Draft saved successfully');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    // Auto-save on next
    saveDraft();
    setCurrentStep((prev) => Math.min(prev + 1, HALL_BOOKING_STEPS.length));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepNumber: number) => {
    // Only allow clicking on previous steps or current step
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const updateFormData = (updates: Partial<HallBookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Render current step component
  const renderStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onPrevious: handlePrevious,
      user,
    };

    switch (currentStep) {
      case 1:
        return <Step1Verification {...stepProps} />;
      case 2:
        return <Step2ApplicantDetails {...stepProps} />;
      case 3:
        return <Step3EventDetails {...stepProps} />;
      case 4:
        return <Step4BankDetails {...stepProps} />;
      case 5:
        return <Step5AdditionalInfo {...stepProps} />;
      case 6:
        return <Step6TermsConditions {...stepProps} />;
      case 7:
        return <Step7Review {...stepProps} />;
      case 8:
        return <Step8Payment {...stepProps} draftId={draftId} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-neonCyan border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Roberts Hall Booking...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0">
        <NextImage
          src="/images/food-drinks-neon-wp.png"
          alt="Roberts Hall Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
              🏛️ Roberts Hall Booking
            </h1>
            <p className="text-gray-300 text-lg">
              Complete the booking form and pay online to secure your date
            </p>
          </div>

          {/* Progress Steps */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 mb-6 border border-neonCyan/30">
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {HALL_BOOKING_STEPS.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <button
                    onClick={() => handleStepClick(step.number)}
                    disabled={step.number > currentStep}
                    className={`flex flex-col items-center min-w-[80px] transition-all ${
                      step.number <= currentStep
                        ? 'cursor-pointer hover:scale-105'
                        : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                        step.number === currentStep
                          ? 'bg-gradient-to-r from-neonCyan to-neonPink text-black scale-110'
                          : step.number < currentStep
                          ? 'bg-neonCyan text-black'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {step.number < currentStep ? '✓' : step.number}
                    </div>
                    <span
                      className={`text-xs text-center ${
                        step.number === currentStep
                          ? 'text-neonCyan font-semibold'
                          : step.number < currentStep
                          ? 'text-gray-300'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                  {index < HALL_BOOKING_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-8 mx-2 ${
                        step.number < currentStep ? 'bg-neonCyan' : 'bg-gray-700'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 sm:p-8 border border-neonCyan/30">
            {renderStep()}
          </div>

          {/* Save Draft Button */}
          <div className="mt-4 text-center">
            <Button
              onClick={saveDraft}
              disabled={isSaving}
              variant="outline"
              className="border-neonCyan/50 text-neonCyan hover:bg-neonCyan/10"
            >
              {isSaving ? 'Saving...' : '💾 Save Draft'}
            </Button>
            <p className="text-gray-400 text-sm mt-2">
              Your progress is automatically saved as you go
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
