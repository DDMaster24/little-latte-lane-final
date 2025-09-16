import React from 'react'
import { fetchPage } from 'react-bricks/rsc'
import config from '../../../react-bricks/config'

export default async function RawPageContent() {
  console.log('=== RAW PAGE CONTENT TEST ===')
  
  try {
    // Fetch the exact page that shows in your debug
    const testNewPage = await fetchPage({
      slug: 'test-new',
      language: 'en',
      config,
      fetchOptions: {
        next: { revalidate: 0 }
      },
    })
    
    console.log('=== RAW PAGE DATA ===')
    console.log('Full page object:', JSON.stringify(testNewPage, null, 2))

    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-neonCyan mb-8">🔬 Raw Page Content Analysis</h1>
          
          {testNewPage ? (
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-neonPink mb-4">Page Basic Info</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>ID: <code className="text-neonCyan">{testNewPage.id}</code></div>
                  <div>Name: <code className="text-neonCyan">{testNewPage.name}</code></div>
                  <div>Slug: <code className="text-neonCyan">"{testNewPage.slug}"</code></div>
                  <div>Language: <code className="text-neonCyan">{testNewPage.language}</code></div>
                  <div>Status: <code className="text-neonCyan">{testNewPage.status}</code></div>
                  <div>Type: <code className="text-neonCyan">{testNewPage.type}</code></div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-neonPink mb-4">Content Analysis</h2>
                <div className="space-y-2 text-sm">
                  <div>Content Array Length: <code className="text-neonCyan">{testNewPage.content?.length || 0}</code></div>
                  <div>Content Type: <code className="text-neonCyan">{typeof testNewPage.content}</code></div>
                  <div>Content is Array: <code className="text-neonCyan">{Array.isArray(testNewPage.content) ? 'YES' : 'NO'}</code></div>
                </div>
                
                {testNewPage.content && testNewPage.content.length > 0 ? (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">✅ Content Blocks Found:</h3>
                    <div className="space-y-2">
                      {testNewPage.content.map((block, index) => (
                        <div key={block.id} className="bg-gray-700 p-3 rounded">
                          <div className="text-green-400">Block {index + 1}:</div>
                          <div>Type: <code className="text-yellow-400">{block.type}</code></div>
                          <div>ID: <code className="text-gray-300">{block.id}</code></div>
                          <div>Props: <code className="text-gray-300">{JSON.stringify(block.props, null, 2)}</code></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 bg-red-900 border border-red-500 p-4 rounded">
                    <h3 className="text-red-400 font-semibold">❌ NO CONTENT BLOCKS FOUND</h3>
                    <p className="text-red-200 mt-2">
                      This page exists but has no content blocks. This indicates:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-red-200 space-y-1">
                      <li>Content is not being saved in React Bricks editor</li>
                      <li>There might be a saving/publishing issue</li>
                      <li>Content might be saved to a different page</li>
                      <li>Page type configuration might be preventing content saving</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-neonPink mb-4">Full Raw Data</h2>
                <details>
                  <summary className="cursor-pointer text-neonCyan">Click to show complete page object</summary>
                  <pre className="mt-2 text-xs bg-gray-900 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(testNewPage, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="bg-red-900 border border-red-500 p-6 rounded-lg">
              <h2 className="text-red-400 font-semibold mb-2">❌ Page Not Found</h2>
              <p className="text-red-200">
                Could not fetch page with slug "test-new"
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-700 text-center space-x-4">
            <a 
              href="/admin/editor" 
              className="inline-block bg-neonPink text-white px-6 py-3 rounded font-semibold hover:bg-pink-600 transition-colors"
            >
              React Bricks Editor
            </a>
            <a 
              href="/debug-pages" 
              className="inline-block bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-600 transition-colors"
            >
              Debug All Pages
            </a>
          </div>
        </div>
      </div>
    )
    
  } catch (error) {
    console.error('=== RAW PAGE ERROR ===', error)
    return (
      <div className="min-h-screen p-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-red-500">Raw Page Content - ERROR</h1>
          <div className="bg-red-900 border border-red-500 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Error fetching page content</h2>
            <pre className="text-sm overflow-auto">
              {error instanceof Error ? error.message : 'Unknown error'}
            </pre>
          </div>
        </div>
      </div>
    )
  }
}