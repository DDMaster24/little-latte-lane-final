'use client';

import { Suspense } from 'react';
import HeaderEditor from '@/components/Admin/HeaderEditor';
import Header from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingComponents';

export default function AdminHeaderEditorPage() {
  return (
    <div className="min-h-screen bg-darkBg">
      <Suspense fallback={<LoadingSpinner />}>
        <HeaderEditor>
          <Header />
        </HeaderEditor>
      </Suspense>
    </div>
  );
}
