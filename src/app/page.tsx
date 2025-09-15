import React from 'react'
import { PageViewer, fetchPage } from 'react-bricks/rsc'

import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import WelcomingSection from '@/components/WelcomingSection';
import CategoriesSection from '@/components/CategoriesSection';
import EventsSpecialsSection from '@/components/EventsSpecialsSection';
import BookingsSection from '@/components/BookingsSection';

import config from '../../react-bricks/config'

export default async function Home() {
  // Try to fetch React Bricks homepage content
  let reactBricksPage = null
  
  try {
    // First try to find a page with slug 'test' (since you created a "Test" page)
    reactBricksPage = await fetchPage({
      slug: 'test',
      language: 'en',
      config,
    })
    
    if (!reactBricksPage) {
      // Fallback to homepage slug
      reactBricksPage = await fetchPage({
        slug: 'homepage',
        language: 'en',
        config,
      })
    }
  } catch (_error) {
    console.log('No React Bricks page found, using static content')
  }

  // If React Bricks page exists, use it; otherwise, use static components
  if (reactBricksPage) {
    return (
      <>
        <PWAInstallPrompt source="auto" />
        <PageViewer page={reactBricksPage} />
      </>
    )
  }

  // Fallback to static content if no React Bricks page
  return (
    <>
      {/* PWA Install Prompt for QR Code Users */}
      <PWAInstallPrompt source="auto" />
      
      {/* Static Homepage Sections - Will be replaced by React Bricks */}
      <WelcomingSection />
      <CategoriesSection />
      <EventsSpecialsSection />
      <BookingsSection />
    </>
  );
}
