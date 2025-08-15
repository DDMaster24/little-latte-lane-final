/**
 * Clean Menu Page - Single Source of Truth
 *
 * This uses our clean architecture with proper data fetching,
 * hydration handling, and error management.
 */

'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { ClientOnly } from '@/components/ClientOnly';
import {
  CategorySkeleton,
  LoadingSpinner,
} from '@/components/LoadingComponents';
import { useMenu } from '@/hooks/useMenu';

function MenuContent() {
  const { categories, loading, error, refetch } = useMenu();

  if (loading) {
    return (
      <main className="bg-darkBg py-8 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Menu
          </h1>
        </div>
        <CategorySkeleton />
        <div className="flex justify-center mt-12">
          <div className="bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg animate-pulse">
            <div className="w-32 h-4 bg-purple-500 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-darkBg py-8 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Menu
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              Menu temporarily unavailable
            </h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (categories.length === 0) {
    return (
      <main className="bg-darkBg py-8 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Menu
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-300 text-lg">Loading menu categories...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-darkBg py-8 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
          Menu
        </h1>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/menu/modern?category=${category.id}`}
            className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg shadow-neon flex flex-col items-center transition-all duration-200 hover:scale-105 cursor-pointer"
            prefetch={true}
          >
            {category.image_url ? (
              <div className="relative w-full h-32 mb-3 overflow-hidden rounded bg-gray-700">
                <NextImage
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGBkbHR4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-700 rounded mb-3 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Category</span>
              </div>
            )}
            <p className="text-white font-semibold text-center text-lg">
              {category.name}
            </p>
          </Link>
        ))}
      </div>

      {/* View All Items Button */}
      <div className="flex justify-center">
        <Link
          href="/menu/modern"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-purple-500/25"
          prefetch={true}
        >
          View All Items
        </Link>
      </div>
    </main>
  );
}

export default function MenuPage() {
  return (
    <ClientOnly
      fallback={
        <main className="bg-darkBg py-8 px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
              Menu
            </h1>
          </div>
          <CategorySkeleton />
        </main>
      }
    >
      <MenuContent />
    </ClientOnly>
  );
}
