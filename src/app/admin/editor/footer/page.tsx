'use client';

import { Suspense } from 'react';
import FooterEditor from '@/components/Admin/FooterEditor';
import FooterSection from '@/components/FooterSection';
import { LoadingSpinner } from '@/components/LoadingComponents';

export default function AdminFooterEditorPage() {
  return (
    <div className="min-h-screen bg-darkBg">
      <Suspense fallback={<LoadingSpinner />}>
        <FooterEditor>
          <FooterSection />
        </FooterEditor>
      </Suspense>
    </div>
  );
}
