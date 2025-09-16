import React from 'react'
import { PageViewer, fetchPage, cleanPage, types } from 'react-bricks/rsc'
import { ClickToEdit } from 'react-bricks/rsc/client'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import ErrorBoundary from '@/components/ErrorBoundary'
import config from '../../react-bricks/config'
import bricks from '../../react-bricks/bricks'

async function getData(): Promise<{
  page: types.Page | null
  errorNoKeys: boolean
  errorPage: boolean
}> {
  if (!config.apiKey) {
    return {
      page: null,
      errorNoKeys: true,
      errorPage: false,
    }
  }

  try {
    const page = await fetchPage({
      slug: 'home',
      config,
      fetchOptions: { cache: 'no-store' },
    })

    return {
      page,
      errorNoKeys: false,
      errorPage: false,
    }
  } catch (error) {
    console.error('Error fetching homepage:', error)
    return {
      page: null,
      errorNoKeys: false,
      errorPage: true,
    }
  }
}

export default async function Home() {
  const { page, errorNoKeys, errorPage } = await getData()

  // Clean the received content - removes unknown or not allowed bricks
  // Convert theme structure to flat bricks object for cleanPage
  const flatBricks: Record<string, types.Brick> = {}
  for (const theme of bricks) {
    for (const category of theme.categories) {
      for (const brick of category.bricks) {
        flatBricks[brick.name] = brick
      }
    }
  }
  const pageOk = page ? cleanPage(page, config.pageTypes || [], flatBricks) : null

  // If no page found, create default content structure
  if (!pageOk && !errorNoKeys && !errorPage) {
    const defaultContent: types.IContentBlock[] = [
      {
        id: 'welcoming-1',
        type: 'welcoming-section',
        props: {
          title: 'Welcome to Little Latte Lane',
          subtitle: 'Café & Deli - Where Great Food Meets Amazing Experiences',
          ctaTitle: 'Ready to Experience Little Latte Lane?',
          ctaDescription: 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you\'re catching up with friends, having a business meeting, or enjoying a quiet moment, we\'re here to make your experience memorable.',
          showCarousel: true,
          showAuthGreeting: true,
          backgroundColor: 'gradient',
          titleSize: 'large',
          padding: 'md',
          subtitleColor: { color: '#d1d5db' },
          showBadges: true,
          showFeatures: true,
          badges: [
            {
              type: 'badge-item',
              props: {
                text: 'Now Open',
                bgColor: 'cyan'
              }
            },
            {
              type: 'badge-item',
              props: {
                text: 'Dine In • Takeaway • Delivery',
                bgColor: 'pink'
              }
            }
          ],
          features: [
            {
              type: 'feature-item',
              props: {
                icon: '⭐',
                text: 'Exceptional Quality',
                color: 'cyan'
              }
            },
            {
              type: 'feature-item',
              props: {
                icon: '📍',
                text: 'Prime Location',
                color: 'pink'
              }
            },
            {
              type: 'feature-item',
              props: {
                icon: '🚗',
                text: 'Easy Parking',
                color: 'yellow'
              }
            }
          ]
        }
      },
      {
        id: 'events-1',
        type: 'events-specials-section',
        props: {}
      },
      {
        id: 'categories-1',
        type: 'categories-section',
        props: {}
      },
      {
        id: 'bookings-1',
        type: 'bookings-section',
        props: {}
      }
    ]

    const defaultPage: types.Page = {
      id: 'home-default',
      type: 'page',
      name: 'Home',
      slug: 'home',
      meta: {
        title: 'Little Latte Lane - Café & Deli',
        description: 'Experience exceptional food and beverages at Little Latte Lane. Dine in, takeaway, or delivery available.',
        language: 'en'
      },
      content: defaultContent,
      author: { 
        id: 'system', 
        email: 'system@littlelattlane.com',
        firstName: 'System', 
        lastName: 'Default'
      },
      status: 'PUBLISHED' as types.PageStatus,
      editStatus: 'LIVE' as types.EditStatus,
      isLocked: false,
      tags: [],
      createdAt: new Date().toISOString(),
      language: 'en',
      translations: [],
      lastEditedBy: {
        date: new Date().toISOString(),
        user: {
          id: 'system',
          email: 'system@littlelattlane.com',
          firstName: 'System',
          lastName: 'Default',
          company: 'Little Latte Lane'
        }
      }
    }

    return (
      <main className="min-h-screen animate-fade-in">
        {/* PWA Install Prompt for QR Code Users */}
        <PWAInstallPrompt source="auto" />
        
        {/* React Bricks Page Viewer with Default Content */}
        <ErrorBoundary>
          <PageViewer page={defaultPage} main />
        </ErrorBoundary>

        {/* Click to Edit for CMS Integration */}
        <ClickToEdit
          pageId={defaultPage.id}
          language={defaultPage.language}
          editorPath={config.editorPath || '/admin/editor'}
          clickToEditSide={config.clickToEditSide}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen animate-fade-in">
      {/* PWA Install Prompt for QR Code Users */}
      <PWAInstallPrompt source="auto" />
      
      {/* React Bricks Managed Content */}
      <ErrorBoundary>
        {pageOk && !errorPage && !errorNoKeys && (
          <PageViewer page={pageOk} main />
        )}
        {errorNoKeys && (
          <div className="container mx-auto py-16 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h1>
            <p className="text-gray-600">React Bricks API key is missing. Please check your environment configuration.</p>
          </div>
        )}
        {errorPage && (
          <div className="container mx-auto py-16 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Page Not Found</h1>
            <p className="text-gray-600">The homepage content could not be loaded. Please check your CMS configuration.</p>
          </div>
        )}
      </ErrorBoundary>

      {/* Click to Edit - Only show when logged into CMS */}
      {pageOk && config && (
        <ClickToEdit
          pageId={pageOk.id}
          language={pageOk.language}
          editorPath={config.editorPath || '/admin/editor'}
          clickToEditSide={config.clickToEditSide}
        />
      )}
    </main>
  )
}
