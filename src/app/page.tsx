import React from 'react'
import { PageViewer, fetchPage, cleanPage, types } from 'react-bricks/rsc'
import { ClickToEdit } from 'react-bricks/rsc/client'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import ErrorBoundary from '@/components/ErrorBoundary'
import config from '../../react-bricks/config'
import bricks from '../../react-bricks/bricks'

export default async function Home() {
  console.log('=== HOMEPAGE - React Bricks Debug ===')
  console.log('API Key:', config.apiKey ? '✅ SET' : '❌ MISSING')
  console.log('App ID:', config.appId ? '✅ SET' : '❌ MISSING')
  console.log('Environment:', config.environment || '❌ MISSING')
  
  try {
    // Use the exact same pattern that works in the test page
    console.log('Fetching homepage from React Bricks...')
    
    const page = await fetchPage({
      slug: 'homepage',
      language: 'en',
      config,
      fetchOptions: {
        next: { revalidate: 0 } // Force fresh fetch like test page
      },
    })
    
    console.log('=== HOMEPAGE FETCH RESULT ===')
    console.log('Page found:', !!page)
    if (page) {
      console.log('Page ID:', page.id)
      console.log('Page slug:', page.slug)
      console.log('Page name:', page.name)
      console.log('Page language:', page.language)
      console.log('Content blocks count:', page.content?.length || 0)
      console.log('First block type:', page.content?.[0]?.type || 'none')
    }

    // Prepare bricks for cleaning - exact same pattern as test page
    const flatBricks: Record<string, types.Brick> = {}
    for (const theme of bricks) {
      for (const category of theme.categories) {
        for (const brick of category.bricks) {
          flatBricks[brick.name] = brick
        }
      }
    }

    let cleanedPage = null
    if (page) {
      try {
        cleanedPage = cleanPage(page, config.pageTypes || [], flatBricks)
        console.log('Homepage cleaned successfully')
      } catch (cleanError) {
        console.error('cleanPage failed:', cleanError)
        cleanedPage = page // Use raw page as fallback
      }
    }

    return (
      <main className="min-h-screen animate-fade-in">
        <PWAInstallPrompt source="auto" />
        
        <ErrorBoundary>
          {cleanedPage ? (
            <>
              <PageViewer page={cleanedPage} main />
              <ClickToEdit
                pageId={cleanedPage.id}
                language={cleanedPage.language}
                editorPath={config.editorPath || '/admin/editor'}
                clickToEditSide={config.clickToEditSide}
              />
            </>
          ) : page ? (
            <div className="container mx-auto py-16 text-center">
              <h1 className="text-2xl font-bold text-yellow-500 mb-4">Page Cleaning Failed</h1>
              <p className="text-gray-600 mb-4">Page fetched but cleaning failed - using raw data:</p>
              <pre className="text-xs overflow-auto bg-gray-800 p-4 rounded">
                {JSON.stringify(page, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="container mx-auto py-16 text-center">
              <h1 className="text-2xl font-bold text-red-500 mb-4">No Homepage Content</h1>
              <p className="text-gray-600 mb-4">No homepage was found in React Bricks CMS.</p>
              <div className="bg-gray-800 text-left p-4 rounded-lg text-sm">
                <p className="text-yellow-200 mb-2">Debug info:</p>
                <p className="text-gray-300">Configuration appears correct</p>
                <p className="text-gray-300">Test page works at /test-page</p>
                <p className="text-gray-300">Check browser console for API errors</p>
              </div>
            </div>
          )}
        </ErrorBoundary>
      </main>
    )
    
  } catch (error) {
    console.error('=== HOMEPAGE ERROR ===', error)
    return (
      <main className="min-h-screen animate-fade-in">
        <PWAInstallPrompt source="auto" />
        <ErrorBoundary>
          <div className="container mx-auto py-16 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">React Bricks Error</h1>
            <div className="bg-red-900 border border-red-500 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Critical Error</h2>
              <pre className="text-sm overflow-auto">
                {error instanceof Error ? error.message : 'Unknown error'}
              </pre>
              {error instanceof Error && error.stack && (
                <details className="mt-4">
                  <summary className="cursor-pointer">Stack Trace</summary>
                  <pre className="text-xs mt-2 overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </ErrorBoundary>
      </main>
    )
  }
}