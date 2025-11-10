'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { HallBookingFormData } from '@/types/hall-booking';

interface Step6Props {
  formData: HallBookingFormData;
  updateFormData: (updates: Partial<HallBookingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  user: any;
}

export default function Step6TermsConditions({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}: Step6Props) {
  const handleNext = () => {
    // Validation - check all initials are provided
    if (!formData.termsPage1Initial?.trim()) {
      toast.error('Please initial page 1 of the terms and conditions');
      return;
    }
    if (!formData.termsPage2Initial?.trim()) {
      toast.error('Please initial page 2 of the terms and conditions');
      return;
    }
    if (!formData.termsPage3Initial?.trim()) {
      toast.error('Please initial page 3 of the terms and conditions');
      return;
    }
    if (!formData.termsPage4Initial?.trim()) {
      toast.error('Please initial page 4 of the terms and conditions');
      return;
    }
    if (!formData.termsAccepted) {
      toast.error('You must accept all terms and conditions to continue');
      return;
    }

    // Set acceptance timestamp
    updateFormData({ termsAcceptedAt: new Date().toISOString() });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Terms & Conditions</h2>
        <p className="text-gray-300">
          Please read all terms carefully and initial each page to confirm your understanding.
        </p>
      </div>

      {/* Warning Box */}
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-3">⚠️ Important Notice</h3>
        <p className="text-gray-300 text-sm">
          These terms and conditions are legally binding. By providing your initials and accepting
          these terms, you agree to comply with all rules and regulations governing the use of
          Roberts Hall. Violations may result in forfeiture of your deposit and/or denial of
          future bookings.
        </p>
      </div>

      {/* PAGE 1 - Terms 1-8 */}
      <div className="bg-gray-700/50 rounded-lg p-6 border-2 border-neonCyan/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-neonCyan">Page 1: General Rules</h3>
          <div className="bg-neonCyan/20 px-4 py-2 rounded-lg">
            <span className="text-white font-semibold">Initial Required</span>
          </div>
        </div>

        <div className="space-y-3 text-gray-300 text-sm mb-6">
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">1.</span>
            <p>No subletting of the hall is permitted under any circumstances.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">2.</span>
            <p>
              The hall booking fee is <strong>R2,500.00</strong>, which includes a{' '}
              <strong>R1,000.00 refundable deposit</strong> and <strong>R1,500.00 rental</strong>{' '}
              (non-refundable).
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">3.</span>
            <p>
              The deposit will be refunded within <strong>7 working days</strong> after the
              function, provided no damages occurred and the hall was left clean.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">4.</span>
            <p>
              Maximum <strong>50 guests</strong> permitted per function.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">5.</span>
            <p>
              Maximum <strong>30 vehicles</strong> permitted per function.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">6.</span>
            <p>
              Functions must <strong>END by 23:00 (11:00 PM)</strong> - NO EXCEPTIONS.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">7.</span>
            <p>
              The applicant must be a <strong>current resident of Roberts Estate</strong>.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">8.</span>
            <p>
              All applicants and guests must respect neighboring residents and adhere to estate
              rules.
            </p>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-white">
            Your Initials (Page 1) <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={formData.termsPage1Initial}
            onChange={(e) => updateFormData({ termsPage1Initial: e.target.value })}
            required
            maxLength={10}
            className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan max-w-xs"
            placeholder="Enter your initials"
          />
          <p className="text-sm text-gray-400 mt-1">
            By initialing, you confirm you have read and understood page 1
          </p>
        </div>
      </div>

      {/* PAGE 2 - Terms 9-16 */}
      <div className="bg-gray-700/50 rounded-lg p-6 border-2 border-neonPink/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-neonPink">Page 2: Responsibilities & Damages</h3>
          <div className="bg-neonPink/20 px-4 py-2 rounded-lg">
            <span className="text-white font-semibold">Initial Required</span>
          </div>
        </div>

        <div className="space-y-3 text-gray-300 text-sm mb-6">
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">9.</span>
            <p>
              The applicant is responsible for <strong>all damages</strong> to the hall, furniture,
              equipment, or estate property caused during the function.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">10.</span>
            <p>
              Damage costs will be deducted from the deposit. If damages exceed the deposit amount,
              the applicant is liable for the full cost.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">11.</span>
            <p>
              The hall must be left <strong>clean and tidy</strong>. All rubbish must be removed
              and placed in designated bins.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">12.</span>
            <p>
              An inspection will be conducted after the function. The applicant should be present
              or arrange for a representative.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">13.</span>
            <p>Tables, chairs, and equipment must be returned to their original positions.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">14.</span>
            <p>
              <strong>No decorations</strong> may be affixed to walls, ceilings, or floors using
              nails, screws, tape, or glue. Freestanding decorations only.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">15.</span>
            <p>
              The applicant is responsible for the conduct of all guests and must ensure compliance
              with estate rules.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">16.</span>
            <p>Any violations or disturbances may result in immediate termination of the event.</p>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-white">
            Your Initials (Page 2) <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={formData.termsPage2Initial}
            onChange={(e) => updateFormData({ termsPage2Initial: e.target.value })}
            required
            maxLength={10}
            className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink max-w-xs"
            placeholder="Enter your initials"
          />
          <p className="text-sm text-gray-400 mt-1">
            By initialing, you confirm you have read and understood page 2
          </p>
        </div>
      </div>

      {/* PAGE 3 - Terms 17-24 */}
      <div className="bg-gray-700/50 rounded-lg p-6 border-2 border-neonCyan/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-neonCyan">
            Page 3: Parking, Noise & Estate Rules
          </h3>
          <div className="bg-neonCyan/20 px-4 py-2 rounded-lg">
            <span className="text-white font-semibold">Initial Required</span>
          </div>
        </div>

        <div className="space-y-3 text-gray-300 text-sm mb-6">
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">17.</span>
            <p>
              Speed limit within Roberts Estate is <strong>30 km/h</strong>. All guests must
              comply.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">18.</span>
            <p>
              Parking is only permitted in <strong>designated parking areas</strong>. No parking on
              roads, verges, or residential driveways.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">19.</span>
            <p>
              The applicant must provide security personnel with a list of expected guests and
              vehicles (if required by estate security).
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">20.</span>
            <p>
              <strong>Noise levels must be kept reasonable</strong>. Excessive noise complaints may
              result in immediate termination of the event.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">21.</span>
            <p>
              Music must be kept at a reasonable volume. Functions must end by 23:00 to respect
              neighbors.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">22.</span>
            <p>
              If playing music, proof of <strong>SAMRO and/or SAMPRA registration</strong> must be
              provided before the event.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">23.</span>
            <p>
              No firearms, drugs, or illegal substances are permitted on the premises under any
              circumstances.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonCyan font-bold min-w-[30px]">24.</span>
            <p>
              Alcohol consumption is permitted but guests must be responsible. Drunk and disorderly
              conduct will not be tolerated.
            </p>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-white">
            Your Initials (Page 3) <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={formData.termsPage3Initial}
            onChange={(e) => updateFormData({ termsPage3Initial: e.target.value })}
            required
            maxLength={10}
            className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan max-w-xs"
            placeholder="Enter your initials"
          />
          <p className="text-sm text-gray-400 mt-1">
            By initialing, you confirm you have read and understood page 3
          </p>
        </div>
      </div>

      {/* PAGE 4 - Terms 25-31 + Final Acceptance */}
      <div className="bg-gray-700/50 rounded-lg p-6 border-2 border-neonPink/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-neonPink">
            Page 4: Access, Safety & Final Terms
          </h3>
          <div className="bg-neonPink/20 px-4 py-2 rounded-lg">
            <span className="text-white font-semibold">Initial Required</span>
          </div>
        </div>

        <div className="space-y-3 text-gray-300 text-sm mb-6">
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">25.</span>
            <p>
              Access code to the hall will be provided by the office 24 hours before the event.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">26.</span>
            <p>
              The applicant is responsible for <strong>locking the hall</strong> securely after the
              function.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">27.</span>
            <p>
              Emergency exits must remain accessible at all times. Do not block or obstruct exits.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">28.</span>
            <p>
              Fire safety equipment must not be tampered with or removed from designated locations.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">29.</span>
            <p>
              <strong>NO SMOKING</strong> inside the hall. Smoking is only permitted in designated
              outdoor areas.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">30.</span>
            <p>
              The estate management reserves the right to cancel any booking that violates terms or
              poses a risk to residents or property.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-neonPink font-bold min-w-[30px]">31.</span>
            <p>
              These terms and conditions are subject to change. The version accepted at booking
              time applies to your event.
            </p>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-white">
            Your Initials (Page 4) <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={formData.termsPage4Initial}
            onChange={(e) => updateFormData({ termsPage4Initial: e.target.value })}
            required
            maxLength={10}
            className="bg-gray-700/80 border-gray-600 text-white focus:border-neonPink max-w-xs"
            placeholder="Enter your initials"
          />
          <p className="text-sm text-gray-400 mt-1">
            By initialing, you confirm you have read and understood page 4
          </p>
        </div>
      </div>

      {/* Final Acceptance Checkbox */}
      <div className="bg-gradient-to-br from-neonCyan/10 to-neonPink/10 border-2 border-neonCyan/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">📝 Final Acceptance</h3>

        <label className="flex items-start gap-4 cursor-pointer group mb-4">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
            className="mt-1 w-6 h-6 rounded border-gray-600 text-neonCyan focus:ring-neonCyan focus:ring-offset-0"
          />
          <div>
            <p className="text-white font-semibold text-lg group-hover:text-neonCyan transition-colors">
              I have read, understood, and agree to all 31 terms and conditions
            </p>
            <p className="text-gray-400 text-sm mt-2">
              By checking this box and providing initials above, I legally acknowledge and accept
              all terms governing the use of Roberts Hall. I understand that violations may result
              in deposit forfeiture and/or legal action.
            </p>
          </div>
        </label>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-300 text-sm">
            <strong className="text-white">Terms Version:</strong> {formData.termsVersion}
            <br />
            <strong className="text-white">Acceptance Date:</strong>{' '}
            {formData.termsAcceptedAt
              ? new Date(formData.termsAcceptedAt).toLocaleString()
              : 'Not yet accepted'}
          </p>
        </div>
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
          disabled={
            !formData.termsAccepted ||
            !formData.termsPage1Initial ||
            !formData.termsPage2Initial ||
            !formData.termsPage3Initial ||
            !formData.termsPage4Initial
          }
          className="bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-semibold disabled:opacity-50"
        >
          Continue to Review →
        </Button>
      </div>
    </div>
  );
}
