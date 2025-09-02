'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import HeaderEditor from '@/components/Admin/HeaderEditor';
import Header from '@/components/Header';
import { EditorModeProvider } from '@/contexts/EditorModeContext';

export default function HeaderEditorPage() {
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
    <EditorModeProvider isEditorMode={true}>
      <HeaderEditor>
        <div className="min-h-screen bg-darkBg">
          <Header />
          {/* Add some sample content below header to see the full layout */}
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl text-white mb-4">Header Editor Preview</h1>
              <p className="text-gray-300">
                This is a preview area to see how the header looks during editing.
                The header above is fully editable - click on any navigation link, logo, or button to edit it.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-neonCyan mb-2">Navigation Links</h3>
                  <p className="text-sm text-gray-400">
                    Click on Home, Menu, Bookings, or Account links to edit their text and colors.
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-neonPink mb-2">Logo</h3>
                  <p className="text-sm text-gray-400">
                    Click on the logo to replace it with a new image (coming soon).
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-yellow-400 mb-2">Auth Buttons</h3>
                  <p className="text-sm text-gray-400">
                    Edit the Login/Logout button text and styling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HeaderEditor>
    </EditorModeProvider>
  );
}