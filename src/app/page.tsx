import React from 'react'
import { PageViewer, fetchPage, cleanPage, types } from 'react-bricks/rsc'
import { ClickToEdit } from 'react-bricks/rsc/client'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import ErrorBoundary from '@/components/ErrorBoundary'
import config from '../../react-bricks/config'
import bricks from '../../react-bricks/bricks'

// Import fallback components for when React Bricks is unavailable
import WelcomingSection from '@/components/WelcomingSection'
import CategoriesSection from '@/components/CategoriesSection'
import EventsSpecialsSection from '@/components/EventsSpecialsSection'
import BookingsSection from '@/components/BookingsSection'
import FooterSection from '@/components/FooterSection'

async function getData(): Promise<{
  page: types.Page | null
  useFallback: boolean
}> {
  // If no API key is configured, use fallback content
  if (!config.apiKey || !process.env.API_KEY) {
    console.log('React Bricks API key not configured, using fallback content')
    return {
      page: null,
      useFallback: true,
    }
  }

  try {
    const page = await fetchPage({
      slug: 'home',
      config,
      fetchOptions: { cache: 'no-store' },
    })

    if (page) {
      return {
        page,
        useFallback: false,
      }
    } else {
      // No page found, use fallback
      console.log('No homepage found in React Bricks, using fallback content')
      return {
        page: null,
        useFallback: true,
      }
    }
  } catch (error) {
    console.error('React Bricks error, using fallback content:', error)
    return {
      page: null,
      useFallback: true,
    }
  }
}

export default async function Home() {
  const { page, useFallback } = await getData()

  // If using fallback, show static components
  if (useFallback) {
    return (
      <main className="min-h-screen animate-fade-in">
        <PWAInstallPrompt source="auto" />
        <ErrorBoundary>
          <WelcomingSection />
          <CategoriesSection />
          <EventsSpecialsSection />
          <BookingsSection />
          <FooterSection />
        </ErrorBoundary>
      </main>
    )
  }

  // Clean the received content - removes unknown or not allowed bricks
  const flatBricks: Record<string, types.Brick> = {}
  for (const theme of bricks) {
    for (const category of theme.categories) {
      for (const brick of category.bricks) {
        flatBricks[brick.name] = brick
      }
    }
  }
  
  const pageOk = page ? cleanPage(page, config.pageTypes || [], flatBricks) : null

  if (!pageOk) {
    // Fallback if page cleaning failed
    return (
      <main className="min-h-screen animate-fade-in">
        <PWAInstallPrompt source="auto" />
        <ErrorBoundary>
          <WelcomingSection />
          <CategoriesSection />
          <EventsSpecialsSection />
          <BookingsSection />
          <FooterSection />
        </ErrorBoundary>
      </main>
    )
  }

  return (
    <main className="min-h-screen animate-fade-in">
      <PWAInstallPrompt source="auto" />
      <ErrorBoundary>
        <PageViewer page={pageOk} main />
      </ErrorBoundary>
      {/* Click to Edit - Only show when React Bricks is working */}
      <ClickToEdit
        pageId={pageOk.id}
        language={pageOk.language}
        editorPath={config.editorPath || '/admin/editor'}
        clickToEditSide={config.clickToEditSide}
      />
    </main>
  )
}