'use client';

import { Suspense } from 'react';
import MenuPageEditor from '@/components/Admin/MenuPageEditor';
import { EditorModeProvider } from '@/contexts/EditorModeContext';
import AuthRequiredPrompt from '@/components/AuthRequiredPrompt';
import { useAuth } from '@/components/AuthProvider';
import { LoadingSpinner } from '@/components/LoadingComponents';
import MenuPage from '@/app/menu/page';

export default function MenuEditorPage() {
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
        <MenuPageEditor>
          {/* This will render the actual menu page in edit mode */}
          <MenuPage />
        </MenuPageEditor>
      </Suspense>
    </EditorModeProvider>
  );
}
