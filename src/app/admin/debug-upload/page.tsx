'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { uploadImage } from '@/app/admin/actions';
import { useToast } from '@/hooks/use-toast';

interface UploadResult {
  success: boolean;
  data?: { url: string; path: string };
  message?: string;
  error?: string;
}

export default function ImageUploadDebugPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('🔍 DEBUG: Starting upload process...');
    console.log('File:', file.name, file.type, file.size);
    console.log('Current URL before upload:', window.location.href);

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'debug-test');

      console.log('🔍 DEBUG: Calling uploadImage server action...');
      console.log('Current URL during upload:', window.location.href);
      
      const uploadResult = await uploadImage(formData);
      
      console.log('🔍 DEBUG: Upload result:', uploadResult);
      console.log('Current URL after upload:', window.location.href);
      setResult(uploadResult);

      if (uploadResult.success) {
        toast({
          title: "✅ Upload Success",
          description: `File uploaded: ${uploadResult.data?.url}`,
        });
      } else {
        toast({
          title: "❌ Upload Failed", 
          description: uploadResult.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('🔍 DEBUG: Upload error:', error);
      console.log('Current URL after error:', window.location.href);
      setResult({ success: false, error: String(error) });
      
      toast({
        title: "❌ Upload Error",
        description: "Check console for details",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      console.log('🔍 DEBUG: Upload process complete');
      console.log('Final URL:', window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">🔍 Image Upload Debug Tool</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Upload Test</h2>
          
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="mb-4"
            onClick={(e) => e.stopPropagation()} // Prevent event bubbling
          />
          
          {uploading && (
            <div className="text-neonCyan">
              🔄 Uploading... (Check console for debug info)
            </div>
          )}
        </div>

        {result && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Result</h2>
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Debug Instructions</h2>
          <ol className="text-gray-300 space-y-2">
            <li>1. Open browser DevTools (F12)</li>
            <li>2. Go to Network tab</li>
            <li>3. Upload an image using the input above</li>
            <li>4. Watch for any unexpected redirects in Network tab</li>
            <li>5. Check Console tab for debug messages</li>
            <li>6. Note if redirect happens during upload or after</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
