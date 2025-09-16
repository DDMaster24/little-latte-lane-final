import React from 'react'
import { PageViewer, fetchPage, cleanPage, types } from 'react-bricks/rsc'
import { ClickToEdit } from 'react-bricks/rsc/client'
import config from '../../../react-bricks/config'
import bricks from '../../../react-bricks/bricks'

export default async function TestNewPage() {
  console.log('=== TEST-NEW PAGE - Fresh React Bricks Test ===')
  
  try {
    // Try to fetch a page with slug "test-new" that you can create fresh
    console.log('Looking for test-new page...')
    
    const page = await fetchPage({
      slug: 'test-new',
      language: 'en',
      config,
      fetchOptions: {
        next: { revalidate: 0 } // Force fresh fetch
      },
    })
    
    console.log('=== TEST-NEW FETCH RESULT ===')
    console.log('Page found:', !!page)
    if (page) {
      console.log('Page ID:', page.id)
      console.log('Page slug:', page.slug)
      console.log('Page name:', page.name)
      console.log('Page language:', page.language)
      console.log('Page status:', page.status)
      console.log('Content blocks:', page.content?.length || 0)
      console.log('Raw page content:', JSON.stringify(page.content, null, 2))
      console.log('Page meta:', JSON.stringify(page.meta, null, 2))
      console.log('Full page object keys:', Object.keys(page))
    } else {
      console.log('❌ NO PAGE FOUND - This means slug mismatch or page not published')
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

    let cleanedPage = null
    if (page) {
      try {
        cleanedPage = cleanPage(page, config.pageTypes || [], flatBricks)
        console.log('Test-new page cleaned successfully')
      } catch (cleanError) {
        console.error('cleanPage failed:', cleanError)
        cleanedPage = page // Use raw page as fallback
      }
    }

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 border-b border-neonCyan p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-neonCyan">Fresh React Bricks Test Page</h1>
            <p className="text-gray-300 mt-2">
              Create a new page in React Bricks editor with slug: <code className="bg-gray-700 px-2 py-1 rounded">"test-new"</code>
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {cleanedPage ? (
            // SUCCESS: Show the React Bricks content
            <div>
              <div className="bg-green-900 border border-green-500 p-4 rounded-lg mb-6">
                <h2 className="text-green-400 font-semibold mb-2">✅ SUCCESS!</h2>
                <p className="text-green-200">
                  React Bricks page found and rendered successfully! 
                  Raw content blocks: {page?.content?.length || 0}, Cleaned content blocks: {cleanedPage.content?.length || 0}
                </p>
              </div>

              {/* DEBUG INFO */}
              <div className="bg-blue-900 border border-blue-500 p-4 rounded-lg mb-6">
                <h3 className="text-blue-400 font-semibold mb-2">🔍 Debug Info</h3>
                <div className="text-sm space-y-1">
                  <div>Raw page content length: {page?.content?.length || 0}</div>
                  <div>Cleaned page content length: {cleanedPage.content?.length || 0}</div>
                  <div>First block type (raw): {page?.content?.[0]?.type || 'none'}</div>
                  <div>First block type (cleaned): {cleanedPage.content?.[0]?.type || 'none'}</div>
                  <div>Available bricks: {Object.keys(flatBricks).length}</div>
                  <div>Hero brick available: {flatBricks['hero-brick'] ? 'YES' : 'NO'}</div>
                </div>
              </div>

              {/* RENDER THE ACTUAL REACT BRICKS CONTENT */}
              <div className="bg-white text-black rounded-lg p-1 mb-6">
                <PageViewer page={cleanedPage} main />
              </div>

              {/* Click to edit */}
              <ClickToEdit
                pageId={cleanedPage.id}
                language={cleanedPage.language}
                editorPath={config.editorPath || '/admin/editor'}
                clickToEditSide={config.clickToEditSide}
              />

              {/* Debug info */}
              <details className="bg-gray-800 p-4 rounded-lg">
                <summary className="cursor-pointer text-neonPink font-semibold">
                  🔍 Content Details
                </summary>
                <div className="mt-3 text-sm space-y-2">
                  <div>Page ID: <code className="text-neonCyan">{cleanedPage.id}</code></div>
                  <div>Page Name: <code className="text-neonCyan">{cleanedPage.name}</code></div>
                  <div>Page Slug: <code className="text-neonCyan">{cleanedPage.slug}</code></div>
                  <div>Content Blocks: <code className="text-neonCyan">{cleanedPage.content?.length || 0}</code></div>
                  
                  {cleanedPage.content && cleanedPage.content.length > 0 && (
                    <div className="mt-3">
                      <div className="text-gray-400">Block Types:</div>
                      <ul className="list-disc list-inside ml-4">
                        {cleanedPage.content.map((block, index) => (
                          <li key={block.id} className="text-gray-300">
                            {index + 1}. <code className="text-yellow-400">{block.type}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            </div>
          ) : (
            // NO PAGE FOUND: Show instructions
            <div className="space-y-6">
              <div className="bg-yellow-900 border border-yellow-500 p-6 rounded-lg">
                <h2 className="text-yellow-400 font-semibold mb-3">📝 Create Test Page</h2>
                <p className="text-yellow-200 mb-4">
                  No page found with slug "test-new". To test React Bricks rendering:
                </p>
                
                <ol className="list-decimal list-inside space-y-2 text-yellow-200">
                  <li>Go to <a href="/admin/editor" className="text-neonCyan underline">/admin/editor</a></li>
                  <li>Click "New Page"</li>
                  <li>Set the page slug to: <code className="bg-yellow-800 px-2 py-1 rounded">test-new</code></li>
                  <li>Add some bricks (WelcomingSection, CategoriesSection, etc.)</li>
                  <li>Publish the page</li>
                  <li>Refresh this page to see your content!</li>
                </ol>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-neonPink font-semibold mb-3">Available Bricks to Test:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.keys(flatBricks).map(brickName => (
                    <div key={brickName} className="bg-gray-700 px-3 py-2 rounded">
                      <code className="text-neonCyan">{brickName}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-900 border border-blue-500 p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">💡 Testing Tips:</h3>
                <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm">
                  <li>Start with simple bricks like "WelcomingSection"</li>
                  <li>Make sure to publish (not just save as draft)</li>
                  <li>Use the advanced color picker features we built</li>
                  <li>Test the click-to-edit functionality when logged in</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center space-x-4">
            <a 
              href="/test-page" 
              className="inline-block bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Original Test Page
            </a>
            <a 
              href="/" 
              className="inline-block bg-neonCyan text-darkBg px-4 py-2 rounded font-semibold hover:bg-neonPink transition-colors"
            >
              Back to Homepage
            </a>
            <a 
              href="/admin/editor" 
              className="inline-block bg-neonPink text-white px-4 py-2 rounded font-semibold hover:bg-pink-600 transition-colors"
            >
              React Bricks Editor
            </a>
          </div>
        </div>
      </div>
    )
    
  } catch (error) {
    console.error('=== TEST-NEW PAGE ERROR ===', error)
    return (
      <div className="min-h-screen p-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-red-500">Test New Page - ERROR</h1>
          <div className="bg-red-900 border border-red-500 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Critical Error</h2>
            <pre className="text-sm overflow-auto">
              {error instanceof Error ? error.message : 'Unknown error'}
            </pre>
          </div>
        </div>
      </div>
    )
  }
}