'use client';

import { Suspense } from 'react';
import BookingsPageEditor from '@/components/Admin/BookingsPageEditor';
import BookingsPage from '@/app/bookings/page';
import { LoadingSpinner } from '@/components/LoadingComponents';

export default function AdminBookingsEditorPage() {
  return (
    <div className="min-h-screen bg-darkBg">
      <Suspense fallback={<LoadingSpinner />}>
        <BookingsPageEditor>
          <BookingsPage />
        </BookingsPageEditor>
      </Suspense>
    </div>
  );
}
