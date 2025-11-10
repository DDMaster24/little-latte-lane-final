'use client';

import { Button } from '@/components/ui/button';
import { HallBookingFormData, EVENT_TYPES, VALIDATION_RULES } from '@/types/hall-booking';

interface Step7Props {
  formData: HallBookingFormData;
  updateFormData: (updates: Partial<HallBookingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  user: any;
}

export default function Step7Review({ formData, onNext, onPrevious }: Step7Props) {
  const eventType = EVENT_TYPES.find((t) => t.value === formData.eventType)?.label || formData.eventType;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not provided';
    return timeString;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Review Your Booking</h2>
        <p className="text-gray-300">
          Please review all information carefully before proceeding to payment.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neonCyan mb-3">⚠️ Review Carefully</h3>
        <p className="text-gray-300 text-sm">
          Once payment is processed, your booking will be submitted for approval. Please ensure all
          information is correct. You can go back to any previous step to make changes.
        </p>
      </div>

      {/* Applicant Information */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-neonCyan mb-4">👤 Applicant Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-white font-semibold">
              {formData.applicantName} {formData.applicantSurname}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Email</p>
            <p className="text-white font-semibold">{formData.applicantEmail}</p>
          </div>
          <div>
            <p className="text-gray-400">Phone</p>
            <p className="text-white font-semibold">{formData.applicantPhone}</p>
          </div>
          <div>
            <p className="text-gray-400">Roberts Estate Resident</p>
            <p className="text-white font-semibold">
              {formData.isRobertsResident ? '✅ Yes' : '❌ No'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-400">Contact Address</p>
            <p className="text-white font-semibold">{formData.applicantAddress}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-400">Roberts Estate Address</p>
            <p className="text-white font-semibold">{formData.robertsEstateAddress}</p>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-neonPink mb-4">🎉 Event Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Event Date</p>
            <p className="text-white font-semibold">{formatDate(formData.eventDate)}</p>
          </div>
          <div>
            <p className="text-gray-400">Event Time</p>
            <p className="text-white font-semibold">
              {formatTime(formData.eventStartTime)} - {formatTime(formData.eventEndTime)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Event Type</p>
            <p className="text-white font-semibold">{eventType}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Guests</p>
            <p className="text-white font-semibold">
              {formData.totalGuests} (max {VALIDATION_RULES.maxGuests})
            </p>
          </div>
          <div>
            <p className="text-gray-400">Vehicles</p>
            <p className="text-white font-semibold">
              {formData.numberOfVehicles} (max {VALIDATION_RULES.maxVehicles})
            </p>
          </div>
          <div>
            <p className="text-gray-400">Equipment</p>
            <p className="text-white font-semibold">
              {formData.tablesRequired} tables, {formData.chairsRequired} chairs
            </p>
          </div>
          {formData.eventDescription && (
            <div className="sm:col-span-2">
              <p className="text-gray-400">Event Description</p>
              <p className="text-white font-semibold">{formData.eventDescription}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-neonCyan mb-4">🏦 Bank Details (Deposit Refund)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Account Holder</p>
            <p className="text-white font-semibold">{formData.bankAccountHolder}</p>
          </div>
          <div>
            <p className="text-gray-400">Bank Name</p>
            <p className="text-white font-semibold">{formData.bankName}</p>
          </div>
          <div>
            <p className="text-gray-400">Branch Code</p>
            <p className="text-white font-semibold">{formData.bankBranchCode}</p>
          </div>
          <div>
            <p className="text-gray-400">Account Number</p>
            <p className="text-white font-semibold">{formData.bankAccountNumber}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-400">Bank Proof Uploaded</p>
            <p className="text-white font-semibold">
              {formData.bankProofDocumentUrl ? '✅ Yes' : '❌ No'}
            </p>
          </div>
        </div>
      </div>

      {/* Music & Special Requests */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-neonPink mb-4">🎵 Music & Special Requests</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-400">Will Play Music</p>
            <p className="text-white font-semibold">
              {formData.willPlayMusic ? '✅ Yes' : '❌ No'}
            </p>
          </div>
          {formData.willPlayMusic && (
            <div>
              <p className="text-gray-400">SAMRO/SAMPRA Proof Uploaded</p>
              <p className="text-white font-semibold">
                {formData.samroSampraProofUrl ? '✅ Yes' : '❌ No'}
              </p>
            </div>
          )}
          {formData.specialRequests && (
            <div>
              <p className="text-gray-400">Special Requests</p>
              <p className="text-white font-semibold">{formData.specialRequests}</p>
            </div>
          )}
        </div>
      </div>

      {/* Terms Acceptance */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-neonCyan mb-4">📝 Terms & Conditions</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Page 1 Initialed</p>
            <p className="text-white font-semibold">
              {formData.termsPage1Initial ? '✅ ' + formData.termsPage1Initial : '❌ Not initialed'}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Page 2 Initialed</p>
            <p className="text-white font-semibold">
              {formData.termsPage2Initial ? '✅ ' + formData.termsPage2Initial : '❌ Not initialed'}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Page 3 Initialed</p>
            <p className="text-white font-semibold">
              {formData.termsPage3Initial ? '✅ ' + formData.termsPage3Initial : '❌ Not initialed'}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Page 4 Initialed</p>
            <p className="text-white font-semibold">
              {formData.termsPage4Initial ? '✅ ' + formData.termsPage4Initial : '❌ Not initialed'}
            </p>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-600">
            <p className="text-gray-400">All Terms Accepted</p>
            <p className="text-white font-semibold">
              {formData.termsAccepted ? '✅ Accepted' : '❌ Not accepted'}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Terms Version</p>
            <p className="text-white font-semibold">{formData.termsVersion}</p>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-gradient-to-br from-neonCyan/10 to-neonPink/10 border-2 border-neonCyan/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">💰 Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-600">
            <span className="text-gray-300">Hall Rental Fee (non-refundable)</span>
            <span className="text-white font-semibold">
              R {formData.rentalFee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-600">
            <span className="text-gray-300">Security Deposit (refundable)</span>
            <span className="text-white font-semibold">
              R {formData.depositAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 bg-neonCyan/10 rounded-lg px-4 mt-2">
            <span className="text-white font-bold text-lg">Total Amount Due</span>
            <span className="text-neonCyan font-bold text-2xl">
              R {formData.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          💡 The R{formData.depositAmount.toFixed(2)} deposit will be refunded within 7 working
          days after your event, provided there are no damages or violations.
        </p>
      </div>

      {/* Final Notice Before Payment */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">⚡ Ready to Pay?</h3>
        <p className="text-gray-300 text-sm mb-3">
          By proceeding to payment, you confirm that:
        </p>
        <ul className="space-y-2 text-gray-300 text-sm ml-4">
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">✓</span>
            <span>All information provided is accurate and complete</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">✓</span>
            <span>You have read and accepted all terms and conditions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">✓</span>
            <span>You understand the payment is non-refundable except the deposit</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">✓</span>
            <span>Your booking is subject to office approval after payment</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          ← Go Back & Edit
        </Button>

        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-bold text-lg px-8 py-4"
        >
          Proceed to Payment (R {formData.totalAmount.toFixed(2)}) →
        </Button>
      </div>
    </div>
  );
}
