'use client';

import { useEffect, useState } from 'react';
import { PageViewer, fetchPage, ReactBricks, types } from 'react-bricks/frontend';
import config from '../../react-bricks/config';

interface EditableHomepageProps {
  enableEditing?: boolean;
}

export default function EditableHomepage({ enableEditing: _enableEditing = false }: EditableHomepageProps) {
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

        // Debug API key from config
        console.log('=== REACT BRICKS DEBUG ===');
        console.log('Config API Key available:', !!config.apiKey);
        console.log('Config API Key length:', config.apiKey?.length || 0);
        console.log('Config API Key starts with:', config.apiKey?.substring(0, 8) + '...');

        if (!config.apiKey) {
          setError('React Bricks API key is missing');
          return;
        }

        // Fetch the homepage from React Bricks - try multiple possible slugs
        const slugsToTry = ['homepage', 'home-page', ''];
        let pageData = null;

        for (const slug of slugsToTry) {
          try {
            console.log(`Trying to fetch React Bricks page with slug: "${slug}"`);
            // Correct fetchPage usage for frontend package
            pageData = await fetchPage({
              slug,
              language: '',
              config
            });
            if (pageData) {
              console.log(`✅ Successfully fetched page with slug: "${slug}"`);
              console.log('Page data:', pageData);
              break;
            }
          } catch (err) {
            console.log(`❌ Failed to fetch with slug "${slug}":`, err);
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
        {/* Render the React Bricks page content */}
        <PageViewer page={page} />
      </main>
    </ReactBricks>
  );
}