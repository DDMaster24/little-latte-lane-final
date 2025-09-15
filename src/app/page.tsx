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
    // Try multiple possible homepage slugs
    const possibleSlugs = ['homepage', 'home', 'index', '']
    
    for (const slug of possibleSlugs) {
      try {
        reactBricksPage = await fetchPage({
          slug: slug,
          language: 'en',
          config,
        })
        if (reactBricksPage) {
          console.log(`Found React Bricks page with slug: "${slug}"`)
          break
        }
      } catch (_error) {
        console.log(`No page found for slug: "${slug}"`)
      }
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
