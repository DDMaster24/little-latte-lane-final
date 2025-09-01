'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UniversalPageEditor from '@/components/Admin/UniversalPageEditor';
import StyleLoader from '@/components/StyleLoader';
import StaticHeaderForEditor from '@/components/Admin/StaticHeaderForEditor';

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
    <>
      {/* Load existing styles for header */}
      <StyleLoader pageScope="header" />
      
      <UniversalPageEditor
        pageScope="header"
        pageName="Header"
        enabledTools={['select', 'text', 'color', 'image']}
      >
        <div className="bg-darkBg min-h-screen">
          {/* Clean header for editing */}
          <StaticHeaderForEditor />
          
          {/* Additional spacing */}
          <div className="h-screen"></div>
        </div>
      </UniversalPageEditor>
    </>
  );
}