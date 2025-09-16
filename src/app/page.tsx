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
  errorDetails?: string
}> {
  if (!config.apiKey) {
    console.error('React Bricks API key is missing from config')
    return {
      page: null,
      errorNoKeys: true,
      errorPage: false,
    }
  }

  try {
    console.log('Fetching homepage from React Bricks...')
    
    // Try to fetch the page that was created with slug "homepage"
    // Based on the working dynamic route pattern
    const page = await fetchPage({
      slug: 'homepage', // This matches your React Bricks page
      language: 'en', // Default language
      config,
      fetchOptions: {
        next: { revalidate: 60 }
      },
    })
    
    console.log('React Bricks fetchPage result:', {
      pageFound: !!page,
      pageId: page?.id,
      pageSlug: page?.slug,
      pageName: page?.name,
    })
    
    return {
      page,
      errorNoKeys: false,
      errorPage: false,
    }
  } catch (error) {
    console.error('React Bricks API Error:', error)
    return {
      page: null,
      errorNoKeys: false,
      errorPage: true,
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export default async function Home() {
  const { page, errorNoKeys, errorPage, errorDetails } = await getData()

  // Clean the received content according to React Bricks RSC docs
  const flatBricks: Record<string, types.Brick> = {}
  for (const theme of bricks) {
    for (const category of theme.categories) {
      for (const brick of category.bricks) {
        flatBricks[brick.name] = brick
      }
    }
  }

  let pageOk = null
  if (page) {
    try {
      // cleanPage as shown in React Bricks RSC documentation
      pageOk = cleanPage(page, config.pageTypes || [], flatBricks)
      console.log('Page cleaned successfully')
    } catch (cleanPageError) {
      console.warn('CleanPage failed, using raw page:', cleanPageError)
      pageOk = page // Fallback to raw page
    }
  }

  return (
    <main className="min-h-screen animate-fade-in">
      <PWAInstallPrompt source="auto" />
      
      <ErrorBoundary>
        {pageOk && !errorPage && !errorNoKeys && (
          <>
            <PageViewer page={pageOk} main />
            <ClickToEdit
              pageId={pageOk.id}
              language={pageOk.language}
              editorPath={config.editorPath || '/admin/editor'}
              clickToEditSide={config.clickToEditSide}
            />
          </>
        )}
        
        {errorNoKeys && (
          <div className="container mx-auto py-16 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h1>
            <p className="text-gray-600 mb-4">React Bricks API key is missing. Please check your environment configuration.</p>
            <div className="bg-gray-800 text-left p-4 rounded-lg text-sm font-mono">
              <p>Expected environment variables:</p>
              <p>- API_KEY</p>
              <p>- NEXT_PUBLIC_APP_ID</p>
              <p>- NEXT_PUBLIC_ENVIRONMENT</p>
            </div>
          </div>
        )}
        
        {errorPage && (
          <div className="container mx-auto py-16 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">React Bricks API Error</h1>
            <p className="text-gray-600 mb-4">The homepage content could not be loaded from React Bricks CMS.</p>
            {errorDetails && (
              <div className="bg-gray-800 text-left p-4 rounded-lg text-sm font-mono text-gray-300">
                <p className="text-red-400 mb-2">Error Details:</p>
                <p>{errorDetails}</p>
              </div>
            )}
          </div>
        )}
        
        {!pageOk && !errorPage && !errorNoKeys && (
          <div className="container mx-auto py-16 text-center">
            <h1 className="text-2xl font-bold text-yellow-500 mb-4">No Homepage Content</h1>
            <p className="text-gray-600 mb-4">No homepage was found in React Bricks CMS.</p>
            <div className="bg-gray-800 text-left p-4 rounded-lg text-sm">
              <p className="text-yellow-200 mb-2">To create homepage content:</p>
              <p className="text-gray-300">1. Go to /admin/editor</p>
              <p className="text-gray-300">2. Create a new page with slug: &quot;&quot; (empty)</p>
              <p className="text-gray-300">3. Set page type to &quot;page&quot;</p>
              <p className="text-gray-300">4. Add your content and publish</p>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </main>
  )
}