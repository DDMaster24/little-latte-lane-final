'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import AccountPageEditor from '@/components/Admin/AccountPageEditor';
import AccountPage from '@/app/account/page';
import StyleLoader from '@/components/StyleLoader';
import { EditorModeProvider } from '@/contexts/EditorModeContext';

export default function AccountEditorPage() {
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
      {/* Load existing styles for account page */}
      <StyleLoader pageScope="account" />
      
      <EditorModeProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-darkBg">
            <div className="text-white">Loading editor...</div>
          </div>
        }>
          <AccountPageEditor>
            <AccountPage />
          </AccountPageEditor>
        </Suspense>
      </EditorModeProvider>
    </>
  );
}
