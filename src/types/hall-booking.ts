// Types for Roberts Hall Booking Form

export interface HallBookingFormData {
  // Step 1: Authentication (checked automatically)
  // user_id: string (from auth)

  // Step 2: Applicant Information
  applicantName: string;
  applicantSurname: string;
  applicantAddress: string;
  applicantPhone: string;
  applicantEmail: string;
  isRobertsResident: boolean;
  robertsEstateAddress: string;

  // Step 3: Event Details
  eventDate: string; // YYYY-MM-DD
  eventStartTime: string; // HH:mm
  eventEndTime: string; // HH:mm
  eventType: string;
  eventDescription: string;
  totalGuests: number; // max 50
  numberOfVehicles: number; // max 30
  tablesRequired: number;
  chairsRequired: number;

  // Step 4: Bank Details for Deposit Refund
  bankAccountHolder: string;
  bankName: string;
  bankBranchCode: string;
  bankAccountNumber: string;
  bankProofDocumentUrl: string; // Uploaded file URL

  // Step 5: Music & Special Requests
  willPlayMusic: boolean;
  samroSampraProofUrl: string; // Uploaded file URL (required if willPlayMusic)
  specialRequests: string;

  // Step 6: Terms & Conditions
  termsAccepted: boolean;
  termsAcceptedAt: string;
  termsVersion: string;
  termsPage1Initial: string;
  termsPage2Initial: string;
  termsPage3Initial: string;
  termsPage4Initial: string;

  // Payment (handled in final step)
  totalAmount: number; // 2500.00
  rentalFee: number; // 1500.00
  depositAmount: number; // 1000.00
}

export interface HallBookingStep {
  number: number;
  title: string;
  description: string;
  isComplete: boolean;
  isAccessible: boolean;
}

export const HALL_BOOKING_STEPS: Omit<HallBookingStep, 'isComplete' | 'isAccessible'>[] = [
  {
    number: 1,
    title: 'Verification',
    description: 'Login & Roberts Estate resident verification',
  },
  {
    number: 2,
    title: 'Applicant Details',
    description: 'Your contact information',
  },
  {
    number: 3,
    title: 'Event Details',
    description: 'Date, time, guests, and requirements',
  },
  {
    number: 4,
    title: 'Bank Details',
    description: 'For deposit refund after inspection',
  },
  {
    number: 5,
    title: 'Additional Info',
    description: 'Music licensing & special requests',
  },
  {
    number: 6,
    title: 'Terms & Conditions',
    description: 'Review and accept all terms',
  },
  {
    number: 7,
    title: 'Review',
    description: 'Review your booking details',
  },
  {
    number: 8,
    title: 'Payment',
    description: 'Pay R2,500 (R1,500 rental + R1,000 deposit)',
  },
];

export const EVENT_TYPES = [
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'wedding', label: 'Wedding / Reception' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'conference', label: 'Conference / Seminar' },
  { value: 'community', label: 'Community Event' },
  { value: 'funeral', label: 'Funeral / Memorial Service' },
  { value: 'other', label: 'Other Event' },
];

export const SOUTH_AFRICAN_BANKS = [
  'ABSA Bank',
  'African Bank',
  'Capitec Bank',
  'Discovery Bank',
  'First National Bank (FNB)',
  'Investec',
  'Nedbank',
  'Standard Bank',
  'TymeBank',
  'Other',
];

// Validation rules
export const VALIDATION_RULES = {
  maxGuests: 50,
  maxVehicles: 30,
  minGuests: 1,
  minVehicles: 0,
  eventEndTime: '23:00', // Functions must end by 23:00
  rentalFee: 1500.0,
  depositAmount: 1000.0,
  totalAmount: 2500.0,
};
