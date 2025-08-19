/**
 * Clean Menu Page - Single Source of Truth
 *
 * This uses our clean architecture with proper data fetching,
 * hydration handling, and error management.
 */

'use client';

import Link from 'next/link';
import { ClientOnly } from '@/components/ClientOnly';
import {
  CategorySkeleton,
  LoadingSpinner,
} from '@/components/LoadingComponents';
import { useMenu } from '@/hooks/useMenu';
import type { Category } from '@/lib/dataClient';

function MenuContent() {
  const { categories, loading, error, refetch } = useMenu();

  // Define main category groupings based on actual data
  const categoryGroups = {
    drinks: {
      title: 'Drinks',
      description: 'Premium coffee, lattes, cold drinks & smoothies',
      icon: '☕',
      keywords: ['hot drinks', 'lattes', 'iced lattes', 'frappes', 'fizzers', 'freezos', 'smoothies'],
    },
    mainFood: {
      title: 'Main Food',
      description: 'Fresh pizzas, hearty meals & grilled toasties',
      icon: '🍕',
      keywords: ['pizza', 'toasties', 'all day meals'],
    },
    sidesBreakfast: {
      title: 'Sides & Breakfast',
      description: 'All-day breakfast, scones & perfect accompaniments',
      icon: '🥐',
      keywords: ['scones', 'all day brekkies', 'sides'],
    },
    extras: {
      title: 'Extras',
      description: 'Specialty items & unique offerings',
      icon: '🧀',
      keywords: ['extras', 'monna & rassies corner'],
    },
  };

  // Function to categorize menu categories into main groups
  const categorizeByGroup = () => {
    const grouped: {
      drinks: typeof categories;
      mainFood: typeof categories;
      sidesBreakfast: typeof categories;
      extras: typeof categories;
    } = {
      drinks: [],
      mainFood: [],
      sidesBreakfast: [],
      extras: [],
    };

    categories.forEach((category) => {
      const categoryName = category.name.toLowerCase();
      
      if (categoryGroups.drinks.keywords.some(keyword => categoryName.includes(keyword))) {
        grouped.drinks.push(category);
      } else if (categoryGroups.mainFood.keywords.some(keyword => categoryName.includes(keyword))) {
        grouped.mainFood.push(category);
      } else if (categoryGroups.sidesBreakfast.keywords.some(keyword => categoryName.includes(keyword))) {
        grouped.sidesBreakfast.push(category);
      } else if (categoryGroups.extras.keywords.some(keyword => categoryName.includes(keyword))) {
        grouped.extras.push(category);
      } else {
        // Default to extras for uncategorized items
        grouped.extras.push(category);
      }
    });

    return grouped;
  };

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

  const groupedCategories = categorizeByGroup();

  return (
    <main className="bg-darkBg py-8 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
          Menu
        </h1>
        <p className="text-gray-300 mt-2">Organized by category for easy browsing</p>
      </div>

      {/* Organized Categories by Main Groups */}
      <div className="space-y-12">
        {(Object.entries(categoryGroups) as Array<[keyof typeof categoryGroups, typeof categoryGroups[keyof typeof categoryGroups]]>).map(([groupKey, groupInfo]) => {
          const categoryList = groupedCategories[groupKey];
          
          if (categoryList.length === 0) return null;

          return (
            <div key={groupKey} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
              {/* Group Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-3xl">{groupInfo.icon}</span>
                  <h2 className="text-3xl font-bold text-white">{groupInfo.title}</h2>
                  <span className="text-3xl">{groupInfo.icon}</span>
                </div>
                <p className="text-gray-400">{groupInfo.description}</p>
              </div>

              {/* Categories Grid - Full Width, Max 4 Per Row, Centered */}
              <div 
                className="flex flex-wrap justify-center gap-4 px-4"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '16px',
                  padding: '0 16px'
                }}
              >
                {categoryList.map((category: Category) => (
                  <Link
                    key={category.id}
                    href={`/menu/modern?category=${category.id}`}
                    className="bg-gray-800/70 hover:bg-gray-700/70 p-4 rounded-lg shadow-lg border border-gray-700/50 hover:border-neonCyan/50 flex flex-col items-center transition-all duration-200 hover:scale-105 cursor-pointer group"
                    style={{
                      flex: '1 1 calc(25% - 12px)',
                      minWidth: '280px',
                      maxWidth: '400px'
                    }}
                    prefetch={true}
                  >
                    <div className="w-full h-24 bg-gray-700/50 rounded mb-3 flex items-center justify-center group-hover:bg-gray-600/50 transition-colors">
                      <span className="text-gray-400 text-xs">🍽️ Menu</span>
                    </div>
                    <p className="text-white font-medium text-center text-sm group-hover:text-neonCyan transition-colors">
                      {category.name}
                    </p>
                    {category.description && (
                      <p className="text-gray-400 text-xs text-center mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Items Button */}
      <div className="flex justify-center mt-12">
        <Link
          href="/menu/modern"
          className="bg-gradient-to-r from-neonCyan to-neonBlue hover:from-neonBlue hover:to-neonPink text-darkBg font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon"
          prefetch={true}
        >
          🍽️ Browse All Menu Items
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
