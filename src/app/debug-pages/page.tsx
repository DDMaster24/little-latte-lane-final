import React from 'react'
import { fetchPages } from 'react-bricks/rsc'
import config from '../../../react-bricks/config'

export default async function DebugPages() {
  console.log('=== DEBUG ALL PAGES ===')
  
  try {
    // Fetch ALL pages to see what exists
    const allPages = await fetchPages({
      config,
      options: {
        language: 'en'
      }
    })
    
    console.log('All pages found:', allPages?.length || 0)
    if (Array.isArray(allPages)) {
      allPages.forEach((page, index) => {
        console.log(`Page ${index + 1}:`, {
          id: page.id,
          name: page.name,
          slug: page.slug,
          status: page.status,
          language: page.language,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt
        })
      })
    }

    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-neonCyan mb-8">🔍 React Bricks Debug - All Pages</h1>
          
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-neonPink mb-4">API Configuration</h2>
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>API Key: {config.apiKey ? '✅ SET' : '❌ MISSING'}</div>
              <div>App ID: {config.appId ? '✅ SET' : '❌ MISSING'}</div>
              <div>Environment: {config.environment || '❌ MISSING'}</div>
              <div>Total Pages Found: {Array.isArray(allPages) ? allPages.length : 'ERROR'}</div>
            </div>
          </div>

          {Array.isArray(allPages) && allPages.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neonPink">📄 All Pages in React Bricks:</h2>
              {allPages.map((page, index) => (
                <div key={page.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Page #{index + 1}</div>
                      <div className="font-semibold text-white">{page.name || 'Unnamed'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Slug</div>
                      <div className="font-mono text-neonCyan">"{page.slug}"</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Status</div>
                      <div className={`font-semibold ${page.status === 'published' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {page.status}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Language</div>
                      <div className="text-white">{page.language}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    <div>ID: {page.id}</div>
                    <div>Created: {new Date(page.createdAt).toLocaleString()}</div>
                    <div>Updated: {new Date(page.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-red-900 border border-red-500 p-6 rounded-lg">
              <h2 className="text-red-400 font-semibold mb-2">❌ No Pages Found</h2>
              <p className="text-red-200">
                This could indicate:
              </p>
              <ul className="list-disc list-inside mt-2 text-red-200 space-y-1">
                <li>API configuration issue</li>
                <li>Pages not published properly</li>
                <li>Language mismatch</li>
                <li>Environment configuration problem</li>
              </ul>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <a 
              href="/admin/editor" 
              className="inline-block bg-neonPink text-white px-6 py-3 rounded font-semibold hover:bg-pink-600 transition-colors mr-4"
            >
              React Bricks Editor
            </a>
            <a 
              href="/test-new" 
              className="inline-block bg-neonCyan text-darkBg px-6 py-3 rounded font-semibold hover:bg-cyan-400 transition-colors"
            >
              Test New Page
            </a>
          </div>
        </div>
      </div>
    )
    
  } catch (error) {
    console.error('=== DEBUG PAGES ERROR ===', error)
    return (
      <div className="min-h-screen p-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-red-500">Debug Pages - ERROR</h1>
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