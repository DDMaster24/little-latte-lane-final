/**
 * Modern Menu Page - Clean Implementation
 */

'use client';

import { Suspense } from 'react';
import MenuContent from './MenuContent';
import { NeonCoffeeCupLoader } from '@/components/LoadingComponents';

export default function ModernMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-darkBg text-white flex items-center justify-center">
          <NeonCoffeeCupLoader size="lg" text="Loading Little Latte Lane" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
