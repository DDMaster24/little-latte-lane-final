'use client';

import { useEffect, useState } from 'react';
import { PageViewer, fetchPage } from 'react-bricks/frontend';
import { types } from 'react-bricks';

interface EditableHomepageProps {
  enableEditing?: boolean;
}

export default function EditableHomepage({ enableEditing: _enableEditing = false }: EditableHomepageProps) {
  const [page, setPage] = useState<types.Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug API key
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        console.log('=== REACT BRICKS DEBUG ===');
        console.log('API Key available:', !!apiKey);
        console.log('API Key length:', apiKey?.length || 0);
        console.log('API Key starts with:', apiKey?.substring(0, 8) + '...');

        if (!apiKey) {
          setError('React Bricks API key is missing');
          return;
        }

        // Fetch the homepage from React Bricks - try multiple possible slugs
        const slugsToTry = ['homepage', 'home-page', ''];
        let pageData = null;

        for (const slug of slugsToTry) {
          try {
            console.log(`Trying to fetch React Bricks page with slug: "${slug}"`);
            pageData = await fetchPage(slug, apiKey);
            if (pageData) {
              console.log(`✅ Successfully fetched page with slug: "${slug}"`);
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
    <main className="min-h-screen animate-fade-in relative">
      {/* Render the React Bricks page content */}
      <PageViewer page={page} />
    </main>
  );
}