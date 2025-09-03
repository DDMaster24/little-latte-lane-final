'use client';

import { Suspense } from 'react';
import BookingsPageEditor from '@/components/Admin/BookingsPageEditor';
import { EditorModeProvider } from '@/contexts/EditorModeContext';
import AuthRequiredPrompt from '@/components/AuthRequiredPrompt';
import { useAuth } from '@/components/AuthProvider';
import { LoadingSpinner } from '@/components/LoadingComponents';
import BookingsPage from '@/app/bookings/page';

export default function BookingsEditorPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthRequiredPrompt />;
  }

  return (
    <EditorModeProvider isEditorMode={true}>
      <Suspense fallback={<LoadingSpinner />}>
        <BookingsPageEditor>
          {/* This will render the actual bookings page in edit mode */}
          <BookingsPage />
        </BookingsPageEditor>
      </Suspense>
    </EditorModeProvider>
  );
}
