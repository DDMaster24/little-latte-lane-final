'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BookingsEditorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-darkBg text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-2xl font-bold text-neonCyan">Bookings Page Editor</h1>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Bookings Content Editor</h2>
          <p className="text-gray-400">
            Bookings page editor functionality will be implemented here.
            This will allow editing of booking form content, messaging, and layout.
          </p>
        </div>
      </div>
    </div>
  );
}
