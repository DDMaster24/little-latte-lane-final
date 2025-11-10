'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase-client';
import { HallBookingFormData, SOUTH_AFRICAN_BANKS } from '@/types/hall-booking';

interface Step4Props {
  formData: HallBookingFormData;
  updateFormData: (updates: Partial<HallBookingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  user: any;
}

export default function Step4BankDetails({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  user,
}: Step4Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const supabase = getSupabaseClient();

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-bank-proof-${Date.now()}.${fileExt}`;
      const filePath = `hall-bookings/bank-proofs/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(filePath);

      updateFormData({ bankProofDocumentUrl: publicUrl });
      toast.success('Bank proof document uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleNext = () => {
    // Validation
    if (!formData.bankAccountHolder?.trim()) {
      toast.error('Please enter the account holder name');
      return;
    }
    if (!formData.bankName) {
      toast.error('Please select your bank');
      return;
    }
    if (!formData.bankBranchCode?.trim()) {
      toast.error('Please enter the branch code');
      return;
    }
    if (!formData.bankAccountNumber?.trim()) {
      toast.error('Please enter the account number');
      return;
    }
    if (!formData.bankProofDocumentUrl) {
      toast.error('Please upload proof of your bank account');
      return;
    }

    // Validate branch code format (typically 6 digits)
    if (!/^\d{6}$/.test(formData.bankBranchCode.replace(/\s/g, ''))) {
      toast.error('Branch code should be 6 digits');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Bank Details for Deposit Refund</h2>
        <p className="text-gray-300">
          We need your bank details to refund the R1,000 deposit after your event.
        </p>
      </div>

      {/* Deposit Refund Information */}
      <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neonCyan mb-4">
          💰 About the Refundable Deposit
        </h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>
            The R1,000 security deposit will be refunded to your bank account within{' '}
            <strong className="text-white">7 working days</strong> after your event, provided:
          </p>
          <ul className="space-y-1 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-neonCyan mt-1">✓</span>
              <span>No damages to the hall or equipment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neonCyan mt-1">✓</span>
              <span>Hall cleaned properly after use</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neonCyan mt-1">✓</span>
              <span>All rules and regulations followed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neonCyan mt-1">✓</span>
              <span>Inspection completed successfully</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bank Account Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">🏦 Bank Account Information</h3>

        <div>
          <label className="block font-semibold mb-2 text-gray-200">
            Account Holder Name <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={formData.bankAccountHolder}
            onChange={(e) => updateFormData({ bankAccountHolder: e.target.value })}
            required
            className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
            placeholder="Full name as it appears on bank account"
          />
          <p className="text-sm text-gray-400 mt-1">
            Must match the name on your bank account exactly
          </p>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-200">
            Bank Name <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.bankName}
            onChange={(e) => updateFormData({ bankName: e.target.value })}
            required
            className="w-full p-3 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonCyan focus:ring-2 focus:ring-neonCyan/20"
          >
            <option value="">-- Select Your Bank --</option>
            {SOUTH_AFRICAN_BANKS.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200">
              Branch Code <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={formData.bankBranchCode}
              onChange={(e) => updateFormData({ bankBranchCode: e.target.value })}
              required
              maxLength={6}
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
              placeholder="6-digit branch code"
            />
            <p className="text-sm text-gray-400 mt-1">Usually 6 digits (e.g., 632005)</p>
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200">
              Account Number <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={formData.bankAccountNumber}
              onChange={(e) => updateFormData({ bankAccountNumber: e.target.value })}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
              placeholder="Your account number"
            />
            <p className="text-sm text-gray-400 mt-1">Enter your full account number</p>
          </div>
        </div>
      </div>

      {/* Proof of Bank Account Upload */}
      <div className="bg-neonPink/10 border-2 border-neonPink/30 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-neonPink mb-2">
          📄 Proof of Bank Account (Required)
        </h3>

        <div className="bg-neonPink/5 border border-neonPink/20 rounded-lg p-4">
          <p className="text-white font-semibold mb-2">⚠️ Document Required</p>
          <p className="text-gray-300 text-sm mb-3">
            Please upload one of the following documents showing your bank account details:
          </p>
          <ul className="space-y-1 text-gray-300 text-sm ml-4">
            <li className="flex items-start gap-2">
              <span className="text-neonPink">•</span>
              <span>Bank statement (last 3 months)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neonPink">•</span>
              <span>Bank letter confirming account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neonPink">•</span>
              <span>Screenshot from banking app showing account details</span>
            </li>
          </ul>
        </div>

        {!formData.bankProofDocumentUrl ? (
          <div>
            <label className="block">
              <div className="border-2 border-dashed border-neonPink/50 rounded-lg p-8 text-center cursor-pointer hover:border-neonPink hover:bg-neonPink/5 transition-all">
                <div className="text-4xl mb-4">📎</div>
                <p className="text-white font-semibold mb-2">
                  {isUploading ? 'Uploading...' : 'Click to Upload Bank Proof'}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  JPG, PNG, or PDF (max 5MB)
                </p>
                {isUploading && (
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-neonPink h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <p className="text-white font-semibold">Document Uploaded Successfully</p>
                  <p className="text-gray-400 text-sm">Your bank proof has been saved</p>
                </div>
              </div>
              <Button
                onClick={() => updateFormData({ bankProofDocumentUrl: '' })}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <p className="text-gray-300 text-sm">
          🔒 <strong className="text-white">Privacy & Security:</strong> All bank details are
          encrypted and stored securely. They will only be used for deposit refund purposes and
          will not be shared with third parties.
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
          disabled={isUploading}
          className="bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-semibold disabled:opacity-50"
        >
          Continue to Additional Info →
        </Button>
      </div>
    </div>
  );
}
