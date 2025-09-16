'use client'

import { useEffect, useState } from 'react';
import { PageViewer, fetchPage, ReactBricks, types } from 'react-bricks/frontend';
import config from '../../../react-bricks/config';

interface DebugInfo {
  method: string;
  apiKeyAvailable: boolean;
  apiKeyLength: number;
  successSlug?: string;
  pageId?: string;
  pageName?: string;
  contentBlocks?: number;
  attempts: Array<{
    slug: string;
    success: boolean;
    error?: string;
  }>;
}

export default function FrontendTestPage() {
  const [page, setPage] = useState<types.Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    method: 'Frontend Direct',
    apiKeyAvailable: false,
    apiKeyLength: 0,
    attempts: []
  });

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug info setup
        const initialDebug: DebugInfo = {
          method: 'Frontend Direct (react-bricks/frontend)',
          apiKeyAvailable: !!config.apiKey,
          apiKeyLength: config.apiKey?.length || 0,
          attempts: []
        };

        console.log('=== FRONTEND TEST DEBUG ===');
        console.log('Config API Key available:', !!config.apiKey);
        console.log('Config API Key length:', config.apiKey?.length || 0);
        console.log('Config API Key starts with:', config.apiKey?.substring(0, 8) + '...');

        if (!config.apiKey) {
          setError('React Bricks API key is missing');
          setDebugInfo(initialDebug);
          return;
        }

        // Fetch the homepage from React Bricks - try multiple possible slugs
        const slugsToTry = ['homepage', 'home-page', ''];
        let pageData = null;

        for (const slug of slugsToTry) {
          try {
            console.log(`Frontend: Trying to fetch React Bricks page with slug: "${slug}"`);
            
            pageData = await fetchPage({
              slug,
              language: '',
              config
            });
            
            if (pageData) {
              console.log(`✅ Frontend: Successfully fetched page with slug: "${slug}"`);
              console.log('Frontend: Page data:', {
                id: pageData.id,
                slug: pageData.slug,
                name: pageData.name,
                content: pageData.content ? `${pageData.content.length} blocks` : 'no content'
              });
              
              initialDebug.successSlug = slug;
              initialDebug.pageId = pageData.id;
              initialDebug.pageName = pageData.name;
              initialDebug.contentBlocks = pageData.content?.length || 0;
              initialDebug.attempts.push({ slug, success: true });
              break;
            } else {
              initialDebug.attempts.push({ slug, success: false, error: 'No data returned' });
            }
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.log(`❌ Frontend: Failed to fetch with slug "${slug}":`, err);
            initialDebug.attempts.push({ slug, success: false, error: errorMessage });
          }
        }

        setDebugInfo(initialDebug);

        if (pageData) {
          setPage(pageData);
        } else {
          setError('Homepage not found in React Bricks');
        }
      } catch (err: unknown) {
        console.error('Frontend: Error loading React Bricks page:', err);
        setError('Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  // React Bricks configuration for this component
  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-neonCyan mb-6">🔧 Frontend Test - Loading...</h1>
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-blue-500/20 rounded mb-3"></div>
              <div className="h-4 bg-blue-500/20 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-blue-500/20 rounded w-1/2"></div>
            </div>
            <p className="text-sm text-blue-300 mt-4">Testing React Bricks frontend package...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-darkBg text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-neonCyan mb-6">🔧 Frontend Test - Error</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Error: {error}</h2>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Debug Information:</p>
              <pre className="bg-black/50 p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Tested slugs:</p>
              <ul className="text-sm text-gray-300">
                {debugInfo.attempts.map((attempt, index) => (
                  <li key={index} className={attempt.success ? "text-green-400" : "text-red-400"}>
                    • &quot;{attempt.slug}&quot; - {attempt.success ? '✅ Success' : `❌ ${attempt.error}`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReactBricks {...reactBricksConfig}>
      <div className="min-h-screen bg-darkBg">
        {/* Debug Panel */}
        <div className="bg-green-900/20 border-b border-green-500 p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-green-400 mb-2">✅ Frontend Test - SUCCESS</h1>
            <p className="text-sm text-gray-300 mb-3">React Bricks frontend package working!</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-black/20 p-3 rounded">
                <p className="text-neonCyan font-semibold">Method</p>
                <p className="text-gray-300">{debugInfo.method}</p>
              </div>
              <div className="bg-black/20 p-3 rounded">
                <p className="text-neonCyan font-semibold">Page Found</p>
                <p className="text-gray-300">{debugInfo.pageName || 'Unknown'}</p>
              </div>
              <div className="bg-black/20 p-3 rounded">
                <p className="text-neonCyan font-semibold">Content Blocks</p>
                <p className="text-gray-300">{debugInfo.contentBlocks}</p>
              </div>
            </div>
            <details className="cursor-pointer mt-3">
              <summary className="text-sm text-neonCyan hover:text-neonPink">🔍 Full Debug Info</summary>
              <pre className="mt-2 bg-black/50 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        </div>

        {/* React Bricks Content */}
        {page && <PageViewer page={page} />}
      </div>
    </ReactBricks>
  );
}