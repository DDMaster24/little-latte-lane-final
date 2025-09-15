'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Eye } from 'lucide-react';

interface EditorNavigationProps {
  className?: string;
}

export function EditorNavigation({ className = '' }: EditorNavigationProps) {
  const router = useRouter();

  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  const handleViewWebsite = () => {
    // Open website in same tab
    router.push('/');
  };

  const handlePreview = () => {
    // Open preview in same tab
    const currentUrl = window.location.href;
    const previewUrl = currentUrl.replace('/admin/editor', '/preview');
    router.push(previewUrl);
  };

  return (
    <div className={`fixed top-6 left-6 z-50 flex gap-2 ${className}`}>
      {/* Back to Admin Dashboard */}
      <button
        onClick={handleBackToAdmin}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg border border-gray-600"
        title="Back to Admin Dashboard"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Admin</span>
      </button>

      {/* View Website */}
      <button
        onClick={handleViewWebsite}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
        title="Return to Website"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Website</span>
      </button>

      {/* Preview Mode */}
      <button
        onClick={handlePreview}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
        title="Preview Changes"
      >
        <Eye className="w-4 h-4" />
        <span className="hidden sm:inline">Preview</span>
      </button>
    </div>
  );
}

export default EditorNavigation;