import React from 'react'
import { PageViewer, fetchPage, cleanPage, types } from 'react-bricks/rsc'
import { ClickToEdit } from 'react-bricks/rsc/client'
import config from '../../../react-bricks/config'
import bricks from '../../../react-bricks/bricks'

export default async function TestPage() {
  console.log('=== TEST PAGE - React Bricks Config Debug ===')
  console.log('API Key:', config.apiKey ? '✅ SET' : '❌ MISSING')
  console.log('App ID:', config.appId ? '✅ SET' : '❌ MISSING')
  console.log('Environment:', config.environment || '❌ MISSING')
  
  try {
    // Try to fetch ANY page to test the connection
    console.log('Testing React Bricks connection...')
    
    const page = await fetchPage({
      slug: 'homepage',
      language: 'en',
      config,
      fetchOptions: {
        next: { revalidate: 0 } // Force fresh fetch for testing
      },
    })
    
    console.log('=== FETCH RESULT ===')
    console.log('Page found:', !!page)
    if (page) {
      console.log('Page ID:', page.id)
      console.log('Page slug:', page.slug)
      console.log('Page name:', page.name)
      console.log('Page language:', page.language)
      console.log('Content blocks count:', page.content?.length || 0)
      console.log('First block type:', page.content?.[0]?.type || 'none')
    }

    // Prepare bricks for cleaning
    const flatBricks: Record<string, types.Brick> = {}
    for (const theme of bricks) {
      for (const category of theme.categories) {
        for (const brick of category.bricks) {
          flatBricks[brick.name] = brick
        }
      }
    }
    
    console.log('Available bricks:', Object.keys(flatBricks))

    let cleanedPage = null
    if (page) {
      try {
        cleanedPage = cleanPage(page, config.pageTypes || [], flatBricks)
        console.log('Page cleaned successfully')
      } catch (cleanError) {
        console.error('cleanPage failed:', cleanError)
        cleanedPage = page // Use raw page as fallback
      }
    }

    return (
      <div className="min-h-screen p-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-neonCyan">React Bricks Test Page</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-neonPink">Configuration Status</h2>
              <div className="space-y-2 text-sm font-mono">
                <div>API Key: {config.apiKey ? '✅ SET' : '❌ MISSING'}</div>
                <div>App ID: {config.appId ? '✅ SET' : '❌ MISSING'}</div>
                <div>Environment: {config.environment ? '✅ ' + config.environment : '❌ MISSING'}</div>
                <div>Page Types: {config.pageTypes?.length || 0}</div>
                <div>Available Bricks: {Object.keys(flatBricks).length}</div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-neonPink">Page Fetch Result</h2>
              <div className="space-y-2 text-sm font-mono">
                <div>Page Found: {page ? '✅ YES' : '❌ NO'}</div>
                {page && (
                  <>
                    <div>Page ID: {page.id}</div>
                    <div>Page Slug: "{page.slug}"</div>
                    <div>Page Name: "{page.name}"</div>
                    <div>Language: {page.language}</div>
                    <div>Content Blocks: {page.content?.length || 0}</div>
                    <div>Cleaned: {cleanedPage ? '✅ YES' : '❌ NO'}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Try to render the React Bricks content */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-neonPink">React Bricks Content Test</h2>
            
            {cleanedPage ? (
              <div className="border border-neonCyan p-4 rounded">
                <div className="text-sm text-gray-400 mb-4">
                  ✅ React Bricks content loaded successfully! Rendering {cleanedPage.content?.length || 0} blocks:
                </div>
                
                {/* ACTUAL REACT BRICKS CONTENT RENDERING */}
                <div className="bg-white text-black p-4 rounded mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Live React Bricks Content:</h3>
                  <PageViewer page={cleanedPage} main />
                </div>
                
                {/* Show ClickToEdit for editing capabilities */}
                <ClickToEdit
                  pageId={cleanedPage.id}
                  language={cleanedPage.language}
                  editorPath={config.editorPath || '/admin/editor'}
                  clickToEditSide={config.clickToEditSide}
                />
                
                {/* Debug info about the content */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-neonCyan">
                    🔍 Content Debug Info (click to expand)
                  </summary>
                  <div className="mt-2 text-xs bg-gray-900 p-3 rounded">
                    <p className="text-yellow-400 mb-2">Content Blocks ({cleanedPage.content?.length || 0}):</p>
                    {cleanedPage.content?.map((block, index) => (
                      <div key={block.id} className="mb-2 border-l border-gray-600 pl-2">
                        <div className="text-green-400">Block {index + 1}:</div>
                        <div className="text-gray-300">Type: {block.type}</div>
                        <div className="text-gray-300">ID: {block.id}</div>
                        <div className="text-gray-400">Props: {Object.keys(block.props || {}).length} properties</div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ) : page ? (
              <div className="border border-yellow-500 p-4 rounded">
                <div className="text-sm text-yellow-400 mb-4">
                  ⚠️ Page fetched but cleaning failed - showing raw data:
                </div>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(page, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="border border-red-500 p-4 rounded">
                <div className="text-sm text-red-400">
                  ❌ No page could be fetched from React Bricks
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="inline-block bg-neonCyan text-darkBg px-6 py-2 rounded font-semibold hover:bg-neonPink transition-colors"
            >
              Back to Homepage
            </a>
          </div>
        </div>
      </div>
    )
    
  } catch (error) {
    console.error('=== TEST PAGE ERROR ===', error)
    return (
      <div className="min-h-screen p-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-red-500">React Bricks Test - ERROR</h1>
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
      </div>
    )
  }
}