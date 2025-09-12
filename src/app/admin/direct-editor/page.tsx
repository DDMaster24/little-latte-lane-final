'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function DirectEditorPage() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const targetPage = searchParams.get('page') || '/';
  const autoLogin = searchParams.get('autoLogin') === 'true';

  useEffect(() => {
    if (!profile?.is_admin) {
      router.push('/admin');
      return;
    }

    // Automatically redirect to React Bricks editor
    const baseEditorUrl = '/admin/editor';
    const editorParams = new URLSearchParams({
      page: targetPage,
      ...(autoLogin && { autoLogin: 'true' })
    });
    
    const editorUrl = `${baseEditorUrl}?${editorParams.toString()}`;
    
    // Immediate redirect to editor
    window.location.href = editorUrl;
  }, [profile, targetPage, autoLogin, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonCyan mx-auto mb-4"></div>
        <p className="text-gray-300">Opening Visual Editor...</p>
      </div>
    </div>
  );
}