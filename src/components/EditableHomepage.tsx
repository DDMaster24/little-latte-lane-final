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
        
        // Fetch the homepage from React Bricks
        const pageData = await fetchPage('homepage', process.env.NEXT_PUBLIC_API_KEY!);

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
