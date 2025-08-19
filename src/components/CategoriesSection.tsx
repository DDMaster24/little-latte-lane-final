/**
 * Clean Categories Section
 */

'use client';

import Link from 'next/link';
import { ClientOnly } from '@/components/ClientOnly';
import { CategorySkeleton } from '@/components/LoadingComponents';

export default function CategoriesSection() {
  // Define the 4 main categories for the homepage
  const mainCategories = [
    {
      id: 'drinks',
      name: 'Drinks',
      description: 'Premium coffee, lattes, cold drinks & smoothies',
      icon: '☕',
      gradient: 'from-amber-900/50 to-orange-900/50',
      borderColor: 'border-amber-500',
    },
    {
      id: 'main-food',
      name: 'Main Food',
      description: 'Fresh pizzas, hearty meals & grilled toasties',
      icon: '🍕',
      gradient: 'from-red-900/50 to-rose-900/50',
      borderColor: 'border-red-500',
    },
    {
      id: 'sides-breakfast',
      name: 'Sides & Breakfast',
      description: 'All-day breakfast, scones & perfect accompaniments',
      icon: '🥐',
      gradient: 'from-yellow-900/50 to-amber-900/50',
      borderColor: 'border-yellow-500',
    },
    {
      id: 'extras',
      name: 'Extras',
      description: 'Specialty items & unique offerings',
      icon: '🧀',
      gradient: 'from-green-900/50 to-emerald-900/50',
      borderColor: 'border-green-500',
    },
  ];

  return (
    <ClientOnly
      fallback={
        <section className="bg-darkBg shadow-neon rounded-lg m-4">
          <div className="py-12 px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-neon-gradient">
              🍽️ View Our Categories
            </h2>
            <CategorySkeleton count={4} />
          </div>
        </section>
      }
    >
      <section className="bg-darkBg shadow-neon rounded-lg m-4">
        <div className="py-12 px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-neon-gradient">
            🍽️ View Our Categories
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 px-3">
          {mainCategories.map((category, index) => (
            <Link
              key={category.id}
              href="/menu"
              className={`group bg-gradient-to-br ${category.gradient} backdrop-blur-sm hover:bg-gray-700/60 p-6 rounded-xl shadow-lg border-2 ${category.borderColor}/50 hover:${category.borderColor} flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                flex: '1 1 calc(25% - 12px)',
                minWidth: '280px',
                maxWidth: '400px'
              }}
            >
              <div className="w-full h-32 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg mb-4 flex items-center justify-center group-hover:from-gray-700/50 group-hover:to-gray-600/50 transition-all duration-300">
                <span className="text-4xl">{category.icon}</span>
              </div>
              <p className="text-neonText font-semibold text-center group-hover:text-white transition-colors duration-300 text-lg">
                {category.name}
              </p>
              <p className="text-gray-400 text-xs text-center mt-2 line-clamp-2">
                {category.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center animate-bounce-in py-8" style={{ animationDelay: '0.5s' }}>
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
