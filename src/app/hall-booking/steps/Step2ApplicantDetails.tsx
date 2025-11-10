'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HallBookingFormData } from '@/types/hall-booking';

interface Step2Props {
  formData: HallBookingFormData;
  updateFormData: (updates: Partial<HallBookingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  user: any;
}

export default function Step2ApplicantDetails({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}: Step2Props) {
  const handleNext = () => {
    // Validation
    if (!formData.applicantName?.trim()) {
      alert('Please enter your first name');
      return;
    }
    if (!formData.applicantSurname?.trim()) {
      alert('Please enter your surname');
      return;
    }
    if (!formData.applicantEmail?.trim()) {
      alert('Please enter your email address');
      return;
    }
    if (!formData.applicantPhone?.trim()) {
      alert('Please enter your phone number');
      return;
    }
    if (!formData.applicantAddress?.trim()) {
      alert('Please enter your contact address');
      return;
    }
    if (!formData.robertsEstateAddress?.trim()) {
      alert('Please enter your Roberts Estate address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.applicantEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Applicant Information</h2>
        <p className="text-gray-300">Please provide your contact details as the booking applicant.</p>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200">
              First Name <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={formData.applicantName}
              onChange={(e) => updateFormData({ applicantName: e.target.value })}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200">
              Surname <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={formData.applicantSurname}
              onChange={(e) => updateFormData({ applicantSurname: e.target.value })}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
              placeholder="Enter your surname"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200">
              Email Address <span className="text-red-400">*</span>
            </label>
            <Input
              type="email"
              value={formData.applicantEmail}
              onChange={(e) => updateFormData({ applicantEmail: e.target.value })}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
              placeholder="your@email.com"
            />
            <p className="text-sm text-gray-400 mt-1">
              We'll send booking confirmation to this email
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <Input
              type="tel"
              value={formData.applicantPhone}
              onChange={(e) => updateFormData({ applicantPhone: e.target.value })}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
              placeholder="0XX XXX XXXX"
            />
            <p className="text-sm text-gray-400 mt-1">
              For urgent booking matters
            </p>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-200">
            Contact Address <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={formData.applicantAddress}
            onChange={(e) => updateFormData({ applicantAddress: e.target.value })}
            required
            className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
            placeholder="Your full postal/residential address"
          />
          <p className="text-sm text-gray-400 mt-1">
            Full street address, suburb, city, postal code
          </p>
        </div>
      </div>

      {/* Roberts Estate Address */}
      <div className="bg-neonPink/10 border-2 border-neonPink/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neonPink mb-4">
          🏘️ Roberts Estate Residential Address
        </h3>

        <div className="bg-neonPink/5 border border-neonPink/20 rounded-lg p-4 mb-4">
          <p className="text-white font-semibold mb-2">⚠️ Resident Verification Required</p>
          <p className="text-gray-300 text-sm">
            Please provide your actual residential address within Roberts Estate. This will be
            verified by our office before confirming your booking.
          </p>
        </div>

        <label className="block font-semibold mb-2 text-gray-200">
          Your Roberts Estate Address <span className="text-red-400">*</span>
        </label>
        <Input
          type="text"
          value={formData.robertsEstateAddress}
          onChange={(e) => updateFormData({ robertsEstateAddress: e.target.value })}
          required
          className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
          placeholder="e.g., 123 Main Street, Roberts Estate"
        />
        <p className="text-sm text-gray-400 mt-2">
          Include street number, street name, and any unit/complex details
        </p>
      </div>

      {/* Information Notice */}
      <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-4">
        <p className="text-gray-300 text-sm">
          💡 <strong className="text-white">Note:</strong> All information provided will be kept
          confidential and used only for booking verification and communication purposes.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          ← Previous
        </Button>

        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-semibold"
        >
          Continue to Event Details →
        </Button>
      </div>
    </div>
  );
}
