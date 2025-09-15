'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface EditorNavigationProps {
  className?: string;
}

export function EditorNavigation({ className = '' }: EditorNavigationProps) {
  const router = useRouter();

  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  return (
    <div className={`absolute top-2 left-4 z-50 ${className}`}>
      {/* Back to Admin Dashboard */}
      <button
        onClick={handleBackToAdmin}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg border border-gray-600"
        title="Return to Admin Dashboard"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Admin Dashboard</span>
      </button>
    </div>
  );
}

export default EditorNavigation;