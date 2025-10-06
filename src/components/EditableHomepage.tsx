'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { fetchPage, ReactBricks, types } from 'react-bricks/frontend';
import config from '../../react-bricks/config';

// Lazy load PageViewer to reduce initial bundle size
const PageViewer = lazy(() => 
  import('react-bricks/frontend').then(module => ({ default: module.PageViewer }))
);

export default function EditableHomepage() {
  const [page, setPage] = useState<types.Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // React Bricks configuration for this component
  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    },
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!config.apiKey) {
          setError('React Bricks API key is missing');
          return;
        }

        // Fetch the homepage from React Bricks - try multiple possible slugs
        const slugsToTry = ['homepage', 'home-page', ''];
        let pageData = null;

        for (const slug of slugsToTry) {
          try {
            if (process.env.NODE_ENV === 'development') {
              console.log(`[React Bricks] Trying to fetch page with slug: "${slug}"`);
            }
            
            // Correct fetchPage usage for frontend package
            pageData = await fetchPage({
              slug,
              language: '',
              config
            });
            
            if (pageData) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`[React Bricks] ✅ Successfully fetched page with slug: "${slug}"`);
              }
              break;
            }
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[React Bricks] Failed to fetch with slug "${slug}":`, err);
            }
          }
        }

        if (pageData) {
          setPage(pageData);
        } else {
          setError('Homepage not found in React Bricks');
        }
      } catch (err) {
        console.error('Error loading React Bricks page:', err);
        setError('Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen animate-fade-in relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonCyan mx-auto mb-4"></div>
            <p className="text-gray-300">Loading homepage content...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !page) {
    return (
      <main className="min-h-screen animate-fade-in relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-400 mb-4">⚠️ Error Loading Content</div>
            <p className="text-gray-300 mb-4">{error || 'No page content found'}</p>
            <p className="text-sm text-gray-500">
              Make sure you have created and published a homepage in the React Bricks Visual Editor
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <ReactBricks {...reactBricksConfig}>
      <main className="min-h-screen animate-fade-in relative">
        {/* Render the React Bricks page content with lazy loading */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonCyan mx-auto mb-4"></div>
                <p className="text-gray-300">Loading page content...</p>
              </div>
            </div>
          }
        >
          <PageViewer page={page} />
        </Suspense>
      </main>
    </ReactBricks>
  );
}