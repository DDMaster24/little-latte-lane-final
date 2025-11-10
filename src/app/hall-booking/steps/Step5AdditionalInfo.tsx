'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase-client';
import { HallBookingFormData } from '@/types/hall-booking';

interface Step5Props {
  formData: HallBookingFormData;
  updateFormData: (updates: Partial<HallBookingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  user: any;
}

export default function Step5AdditionalInfo({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  user,
}: Step5Props) {
  const [isUploading, setIsUploading] = useState(false);

  const handleSamroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const supabase = getSupabaseClient();

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-samro-proof-${Date.now()}.${fileExt}`;
      const filePath = `hall-bookings/samro-proofs/${fileName}`;

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

      updateFormData({ samroSampraProofUrl: publicUrl });
      toast.success('SAMRO/SAMPRA proof uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    // Validation
    if (formData.willPlayMusic && !formData.samroSampraProofUrl) {
      toast.error('Please upload SAMRO/SAMPRA proof if you will be playing music');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Additional Information</h2>
        <p className="text-gray-300">Music licensing and special requests for your event.</p>
      </div>

      {/* Music Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">🎵 Music & Entertainment</h3>

        <div className="bg-gray-700/50 rounded-lg p-6">
          <label className="flex items-start gap-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.willPlayMusic}
              onChange={(e) => updateFormData({ willPlayMusic: e.target.checked })}
              className="mt-1 w-6 h-6 rounded border-gray-600 text-neonCyan focus:ring-neonCyan focus:ring-offset-0"
            />
            <div className="flex-1">
              <p className="text-white font-semibold text-lg group-hover:text-neonCyan transition-colors">
                Will you be playing music at your event?
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Check this box if you plan to play any music (live, DJ, or recorded) during your
                function.
              </p>
            </div>
          </label>
        </div>

        {formData.willPlayMusic && (
          <div className="bg-neonPink/10 border-2 border-neonPink/30 rounded-lg p-6 space-y-4 animate-fadeIn">
            <h3 className="text-lg font-semibold text-neonPink mb-2">
              📄 SAMRO/SAMPRA Registration Proof (Required)
            </h3>

            <div className="bg-neonPink/5 border border-neonPink/20 rounded-lg p-4">
              <p className="text-white font-semibold mb-2">⚠️ Music Licensing Requirement</p>
              <p className="text-gray-300 text-sm mb-3">
                If you will be playing music at your event, you must provide proof of SAMRO and/or
                SAMPRA registration. This is a legal requirement for playing music in South Africa.
              </p>
              <div className="mt-3 space-y-2 text-gray-300 text-sm">
                <p className="font-semibold text-white">Acceptable documents:</p>
                <ul className="ml-4 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-neonPink">•</span>
                    <span>SAMRO membership certificate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neonPink">•</span>
                    <span>SAMPRA registration confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neonPink">•</span>
                    <span>Event-specific music license</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neonPink">•</span>
                    <span>DJ/Band SAMRO/SAMPRA documentation</span>
                  </li>
                </ul>
              </div>
            </div>

            {!formData.samroSampraProofUrl ? (
              <div>
                <label className="block">
                  <div className="border-2 border-dashed border-neonPink/50 rounded-lg p-8 text-center cursor-pointer hover:border-neonPink hover:bg-neonPink/5 transition-all">
                    <div className="text-4xl mb-4">🎵</div>
                    <p className="text-white font-semibold mb-2">
                      {isUploading ? 'Uploading...' : 'Click to Upload SAMRO/SAMPRA Proof'}
                    </p>
                    <p className="text-gray-400 text-sm mb-4">JPG, PNG, or PDF (max 5MB)</p>
                    {isUploading && (
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div className="bg-neonPink h-2 rounded-full w-1/2 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleSamroFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <p className="text-center text-red-400 text-sm mt-2">
                  * Required if playing music
                </p>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <p className="text-white font-semibold">SAMRO/SAMPRA Proof Uploaded</p>
                      <p className="text-gray-400 text-sm">Music licensing document saved</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => updateFormData({ samroSampraProofUrl: '' })}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-300 text-sm">
                ℹ️ <strong className="text-white">Don't have SAMRO/SAMPRA registration?</strong>
                <br />
                You can register online at{' '}
                <a
                  href="https://www.samro.org.za"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neonCyan hover:underline"
                >
                  www.samro.org.za
                </a>{' '}
                or{' '}
                <a
                  href="https://www.sampra.org.za"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neonCyan hover:underline"
                >
                  www.sampra.org.za
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Special Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">📝 Special Requests</h3>

        <div>
          <label className="block font-semibold mb-2 text-gray-200">
            Any Special Requests or Additional Information?
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => updateFormData({ specialRequests: e.target.value })}
            rows={6}
            className="w-full p-4 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonCyan focus:ring-2 focus:ring-neonCyan/20 resize-vertical"
            placeholder="Tell us about any special requirements, accessibility needs, decorations, setup preferences, or other details we should know about..."
          />
          <p className="text-sm text-gray-400 mt-2">
            Optional: Provide any additional information that might help us serve you better
          </p>
        </div>
      </div>

      {/* Information Note */}
      <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-4">
        <p className="text-gray-300 text-sm">
          💡 <strong className="text-white">Note:</strong> Special requests will be reviewed by
          our office and confirmed separately. We'll do our best to accommodate your needs within
          the hall's capabilities and rules.
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
          disabled={isUploading || (formData.willPlayMusic && !formData.samroSampraProofUrl)}
          className="bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-semibold disabled:opacity-50"
        >
          Continue to Terms & Conditions →
        </Button>
      </div>
    </div>
  );
}
