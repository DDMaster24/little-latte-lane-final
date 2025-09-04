/**
 * Responsive Menu Content - Adaptive Layout
 *
 * Desktop: Three Panel Layout (Categories | Menu Items | Cart)
 * Mobile: Tabbed Interface (Categories / Menu / Cart)
 * 
 * Automatically switches based on screen size
 */

'use client';

import { useState, useEffect } from 'react';
import MenuContentDesktop from './MenuContentDesktop';
import MenuContentMobile from './MenuContentMobile';

export default function MenuContent() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Show loading state on server-side and during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-darkBg text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neonCyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-400">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Render appropriate layout based on screen size
  return isMobile ? <MenuContentMobile /> : <MenuContentDesktop />;
}
