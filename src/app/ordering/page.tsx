/**
 * Modern Menu Page - Clean Implementation
 */

'use client';

import { Suspense } from 'react';
import MenuContent from './MenuContent';
import { LoadingSpinner } from '@/components/LoadingComponents';

export default function ModernMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-darkBg text-white flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-purple-400">Loading menu...</p>
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
