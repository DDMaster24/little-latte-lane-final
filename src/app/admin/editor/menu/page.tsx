'use client';

import { Suspense } from 'react';
import MenuPageEditor from '@/components/Admin/MenuPageEditor';
import MenuPage from '@/app/menu/page';
import { LoadingSpinner } from '@/components/LoadingComponents';

export default function AdminMenuEditorPage() {
  return (
    <div className="min-h-screen bg-darkBg">
      <Suspense fallback={<LoadingSpinner />}>
        <MenuPageEditor>
          <MenuPage />
        </MenuPageEditor>
      </Suspense>
    </div>
  );
}
