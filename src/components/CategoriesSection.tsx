/**
 * Clean Categories Section
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useMenu } from '@/hooks/useMenu';
import { ClientOnly } from '@/components/ClientOnly';
import { CategorySkeleton } from '@/components/LoadingComponents';
import toast from 'react-hot-toast';

export default function CategoriesSection() {
  const { categories, loading, error, refetch } = useMenu();

  // Show error toast only once
  useEffect(() => {
    if (error) {
      toast.error('Failed to load categories. Please refresh the page.');
    }
  }, [error]);

  return (
    <ClientOnly
      fallback={
        <section className="bg-darkBg py-8 px-6 shadow-neon rounded-lg m-4">
          <h2 className="text-2xl font-bold text-center mb-8 bg-neon-gradient">
            View Our Categories
          </h2>
          <CategorySkeleton count={4} />
        </section>
      }
    >
      <section className="bg-darkBg py-8 px-6 shadow-neon rounded-lg m-4">
        <h2 className="text-2xl font-bold text-center mb-8 bg-neon-gradient">
          View Our Categories
        </h2>

        {loading ? (
          <CategorySkeleton count={4} />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">Failed to load categories</p>
            <button
              onClick={refetch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/menu/modern?category=${category.id}`}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg shadow-neon flex flex-col items-center transition-all duration-200 hover:scale-105"
              >
                {category.image_url ? (
                  <div className="relative w-full h-24 mb-3 overflow-hidden rounded bg-gray-700">
                    <NextImage
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full h-24 bg-gray-700 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Category</span>
                  </div>
                )}
                <p className="text-white font-medium text-center text-sm">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/menu"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
          >
            View Full Menu
          </Link>
        </div>
      </section>
    </ClientOnly>
  );
}
