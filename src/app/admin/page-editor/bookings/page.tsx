'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import EnhancedUniversalPageEditor from '@/components/Admin/EnhancedUniversalPageEditor';
import BookingsPage from '@/app/bookings/page';
import StyleLoader from '@/components/StyleLoader';

export default function BookingsEditorPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/callback');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-darkBg">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Load existing styles for bookings page */}
      <StyleLoader pageScope="bookings" />
      
      <EnhancedUniversalPageEditor
        pageScope="bookings"
        pageName="Bookings Page"
      >
        <BookingsPage />
      </EnhancedUniversalPageEditor>
    </>
  );
}
