import { Suspense } from 'react';
import PageEditorInterface from '@/components/Admin/PageEditorInterface';

export default function AdminPageEditorPage() {
  return (
    <div className="min-h-screen bg-darkBg">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonCyan"></div>
        </div>
      }>
        <PageEditorInterface />
      </Suspense>
    </div>
  );
}
