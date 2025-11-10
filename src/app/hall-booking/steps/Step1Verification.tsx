'use client';

import { Button } from '@/components/ui/button';
import { HallBookingFormData } from '@/types/hall-booking';

interface Step1Props {
  formData: HallBookingFormData;
  updateFormData: (updates: Partial<HallBookingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  user: any;
}

export default function Step1Verification({ formData, updateFormData, onNext, user }: Step1Props) {
  const handleContinue = () => {
    if (!formData.isRobertsResident) {
      alert('Sorry, only Roberts Estate residents can book the hall.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome, {user?.full_name || 'Guest'}!</h2>
        <p className="text-gray-300">
          Before we begin, please confirm you meet the requirements to book Roberts Hall.
        </p>
      </div>

      {/* User Info Display */}
      <div className="bg-gray-700/50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan mb-4">✅ Account Verified</h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="text-2xl">👤</div>
            <div>
              <p className="text-sm text-gray-400">Account Name</p>
              <p className="text-white font-medium">{user?.full_name || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">📧</div>
            <div>
              <p className="text-sm text-gray-400">Email Address</p>
              <p className="text-white font-medium">{user?.email || 'Not provided'}</p>
            </div>
          </div>

          {user?.phone && (
            <div className="flex items-start gap-3">
              <div className="text-2xl">📞</div>
              <div>
                <p className="text-sm text-gray-400">Phone Number</p>
                <p className="text-white font-medium">{user.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Roberts Estate Resident Verification */}
      <div className="bg-gray-700/50 rounded-lg p-6 space-y-4 border-2 border-neonPink/30">
        <h3 className="text-lg font-semibold text-neonPink mb-4">
          🏘️ Roberts Estate Resident Requirement
        </h3>

        <div className="bg-neonPink/10 border border-neonPink/30 rounded-lg p-4 mb-4">
          <p className="text-white font-semibold mb-2">⚠️ Important Requirement</p>
          <p className="text-gray-300 text-sm">
            Only current residents of Roberts Estate are eligible to book the Roberts Hall.
            You will need to provide your estate address in the next step.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.isRobertsResident}
            onChange={(e) => updateFormData({ isRobertsResident: e.target.checked })}
            className="mt-1 w-5 h-5 rounded border-gray-600 text-neonPink focus:ring-neonPink focus:ring-offset-0"
          />
          <div>
            <p className="text-white font-medium group-hover:text-neonPink transition-colors">
              I confirm that I am a current resident of Roberts Estate
            </p>
            <p className="text-gray-400 text-sm mt-1">
              You must be a resident to proceed with the booking
            </p>
          </div>
        </label>
      </div>

      {/* Booking Information */}
      <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neonCyan mb-4">📋 What You'll Need</h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-neonCyan mt-1">•</span>
            <span>Event details (date, time, guest count, vehicle count)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neonCyan mt-1">•</span>
            <span>Bank account details for deposit refund</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neonCyan mt-1">•</span>
            <span>Proof of bank account (upload required)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neonCyan mt-1">•</span>
            <span>SAMRO/SAMPRA proof if playing music (upload if applicable)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neonCyan mt-1">•</span>
            <span>R2,500 payment (R1,500 rental + R1,000 refundable deposit)</span>
          </li>
        </ul>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">💰 Cost Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-600">
            <span className="text-gray-300">Hall Rental Fee (non-refundable)</span>
            <span className="text-white font-semibold">R 1,500.00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-600">
            <span className="text-gray-300">Security Deposit (refundable)</span>
            <span className="text-white font-semibold">R 1,000.00</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-neonCyan/10 rounded-lg px-4 mt-2">
            <span className="text-white font-bold text-lg">Total Amount Due</span>
            <span className="text-neonCyan font-bold text-xl">R 2,500.00</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          💡 The R1,000 deposit will be refunded within 7 working days after your event,
          provided there are no damages or violations.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          ← Back to Bookings
        </Button>

        <Button
          onClick={handleContinue}
          disabled={!formData.isRobertsResident}
          className="bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Application →
        </Button>
      </div>

      {!formData.isRobertsResident && (
        <p className="text-center text-red-400 text-sm">
          ⚠️ You must be a Roberts Estate resident to continue
        </p>
      )}
    </div>
  );
}
