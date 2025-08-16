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
import { toast } from 'sonner';

export default function CategoriesSection() {
  const { categories, loading, error, refetch } = useMenu();

  // Show error toast only once
  useEffect(() => {
    if (error) {
      toast.error('Failed to load categories. Please refresh the page.', {
        duration: 4000,
        position: 'top-right',
      });
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {categories.slice(0, 4).map((category, index) => (
              <Link
                key={category.id}
                href={`/menu/modern?category=${category.id}`}
                className="group bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/60 p-6 rounded-xl shadow-lg border border-gray-700/50 hover:border-neonCyan/50 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {category.image_url ? (
                  <div className="relative w-full h-32 mb-4 overflow-hidden rounded-lg bg-gray-700 group-hover:scale-105 transition-transform duration-300">
                    <NextImage
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-all duration-300" />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg mb-4 flex items-center justify-center group-hover:from-gray-600 group-hover:to-gray-500 transition-all duration-300">
                    <span className="text-gray-300 text-sm font-medium">🍽️ {category.name}</span>
                  </div>
                )}
                <p className="text-neonText font-semibold text-center group-hover:text-neonCyan transition-colors duration-300">
                  {category.name}
                </p>
                {category.description && (
                  <p className="text-gray-400 text-xs text-center mt-2 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="text-center animate-bounce-in" style={{ animationDelay: '0.5s' }}>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-neonCyan to-neonBlue hover:from-neonBlue hover:to-neonPink text-darkBg px-8 py-4 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon"
          >
            🍽️ View Full Menu
          </Link>
        </div>
      </section>
    </ClientOnly>
  );
}
