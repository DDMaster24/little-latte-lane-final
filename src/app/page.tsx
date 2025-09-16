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
  console.log('React Bricks config debug:', {
    apiKey: config.apiKey ? '***configured***' : 'NOT SET',
    appId: config.appId ? '***configured***' : 'NOT SET', 
    environment: config.environment || 'NOT SET'
  })

  if (!config.apiKey) {
    console.error('React Bricks API key is missing from config')
    return {
      page: null,
      errorNoKeys: true,
      errorPage: false,
    }
  }

  try {
    console.log('Attempting to fetch page from React Bricks...')
    
    // First, let's try to get a list of available pages for debugging
    try {
      console.log('Checking what pages are available in React Bricks...')
      // This is just for debugging - try to fetch with a non-existent slug to see the error
      await fetchPage({
        slug: 'debug-list-pages-12345',
        config,
        fetchOptions: { next: { revalidate: 60 } }
      })
    } catch (debugError) {
      console.log('Debug error (expected):', debugError instanceof Error ? debugError.message : 'Unknown error')
    }
    
    // Try different slug variations that might work
    let page = null
    const slugsToTry = ['', 'homepage', 'home', 'index']
    
    for (const slug of slugsToTry) {
      try {
        console.log(`Trying slug: "${slug}"`)
        page = await fetchPage({
          slug,
          config,
          fetchOptions: {
            // Use revalidate to make it work with static rendering
            next: { revalidate: 60 }
          },
        })
        if (page) {
          console.log(`Success with slug: "${slug}"`)
          break
        }
      } catch (slugError) {
        console.log(`Failed with slug "${slug}":`, slugError instanceof Error ? slugError.message : 'Unknown error')
        continue
      }
    }

    console.log('React Bricks fetchPage result:', {
      pageFound: !!page,
      pageId: page?.id,
      pageSlug: page?.slug,
      pageName: page?.name,
      contentLength: page?.content?.length || 0,
      allSlugsAttempted: slugsToTry
    })
    
    return {
      page,
      errorNoKeys: false,
      errorPage: false,
    }
  } catch (error) {
    console.error('React Bricks API Error Details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : '',
      config: {
        apiUrl: 'https://api.reactbricks.com',
        appId: config.appId ? '***configured***' : 'NOT SET',
        apiKey: config.apiKey ? '***configured***' : 'NOT SET'
      }
    })
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

  // Clean the received content - removes unknown or not allowed bricks
  const flatBricks: Record<string, types.Brick> = {}
  for (const theme of bricks) {
    for (const category of theme.categories) {
      for (const brick of category.bricks) {
        flatBricks[brick.name] = brick
      }
    }
  }
  
  console.log('Debug info:', {
    pageExists: !!page,
    pageTypesCount: config.pageTypes?.length || 0,
    flatBricksCount: Object.keys(flatBricks).length,
    errorNoKeys,
    errorPage
  })

  let pageOk = null
  if (page) {
    try {
      console.log('Page content preview:', {
        id: page.id,
        slug: page.slug,
        name: page.name,
        contentBlocksCount: page.content?.length || 0,
        contentPreview: page.content?.slice(0, 2).map(block => ({ 
          id: block.id, 
          type: block.type 
        })) || []
      })
      
      // Try to cleanPage, but fall back to raw page if it fails
      console.log('Attempting to clean page...')
      try {
        pageOk = cleanPage(page, config.pageTypes || [], flatBricks)
        console.log('Page cleaned successfully')
      } catch (cleanPageError) {
        console.warn('CleanPage failed, using raw page:', cleanPageError)
        // Use raw page if cleanPage fails
        pageOk = page
      }
    } catch (cleanError) {
      console.error('Error during cleanPage:', cleanError)
      // Treat cleanPage error as an API error
      return (
        <main className="min-h-screen animate-fade-in">
          <PWAInstallPrompt source="auto" />
          <ErrorBoundary>
            <div className="container mx-auto py-16 text-center">
              <h1 className="text-2xl font-bold text-red-500 mb-4">Page Processing Error</h1>
              <p className="text-gray-600 mb-4">Error while processing React Bricks page content.</p>
              <div className="bg-gray-800 text-left p-4 rounded-lg text-sm font-mono text-gray-300">
                <p className="text-red-400 mb-2">Clean Page Error:</p>
                <p>{cleanError instanceof Error ? cleanError.message : 'Unknown error'}</p>
              </div>
            </div>
          </ErrorBoundary>
        </main>
      )
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
            <div className="mt-6 bg-blue-800 text-left p-4 rounded-lg text-sm">
              <p className="text-blue-200 mb-2">Debug Steps:</p>
              <p className="text-blue-100">1. Check browser console for detailed logs</p>
              <p className="text-blue-100">2. Verify environment variables in Vercel dashboard</p>
              <p className="text-blue-100">3. Test API connectivity to api.reactbricks.com</p>
            </div>
          </div>
        )}
        
        {!pageOk && !errorPage && !errorNoKeys && (
          <div className="container mx-auto py-16 text-center">
            <h1 className="text-2xl font-bold text-yellow-500 mb-4">No Homepage Content</h1>
            <p className="text-gray-600 mb-4">No homepage was found in React Bricks CMS.</p>
            <div className="bg-gray-800 text-left p-4 rounded-lg text-sm">
              <p className="text-yellow-200 mb-2">Possible Solutions:</p>
              <p className="text-gray-300">1. Create a homepage in React Bricks CMS</p>
              <p className="text-gray-300">2. Check the page slug is &apos;home&apos;</p>
              <p className="text-gray-300">3. Verify page is published</p>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </main>
  )
}