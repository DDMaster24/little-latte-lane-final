'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

/**
 * StaffRedirect Component
 * 
 * Automatically redirects staff users to kitchen view when they log in
 * Ensures staff members only see the kitchen interface for production efficiency
 */
export default function StaffRedirect() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // Only redirect if user is staff (but not admin) and not already in staff area
    if (profile?.is_staff && !profile?.is_admin && !pathname.startsWith('/staff')) {
      console.log('🍳 Redirecting staff user to kitchen view...');
      
      // Redirect staff users directly to kitchen view (not staff dashboard)
      router.push('/staff/kitchen-view');
    }
  }, [profile, loading, pathname, router]);

  // This component doesn't render anything
  return null;
}
