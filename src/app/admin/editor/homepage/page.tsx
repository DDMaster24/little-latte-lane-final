'use client';

import { Suspense } from 'react';
import HomepageEditor from '@/components/Admin/HomepageEditor';
import HomePage from '@/app/page';
import { LoadingSpinner } from '@/components/LoadingComponents';

export default function AdminHomepageEditorPage() {
  return (
    <div className="min-h-screen bg-darkBg">
      <Suspense fallback={<LoadingSpinner />}>
        <HomepageEditor>
          <HomePage />
        </HomepageEditor>
      </Suspense>
    </div>
  );
}
