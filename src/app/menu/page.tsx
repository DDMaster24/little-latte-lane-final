'use client';

import { ClientOnly } from '@/components/ClientOnly';
import { CategorySkeleton } from '@/components/LoadingComponents';
import { ReactBricks } from 'react-bricks/frontend';
import config from '../../../react-bricks/config';
import MenuHero from '../../../react-bricks/bricks/MenuHero';
import MenuDrinksSection from '../../../react-bricks/bricks/MenuDrinksSection';
import MenuMainFoodSection from '../../../react-bricks/bricks/MenuMainFoodSection';
import MenuBreakfastSidesSection from '../../../react-bricks/bricks/MenuBreakfastSidesSection';
import MenuExtrasSpecialtiesSection from '../../../react-bricks/bricks/MenuExtrasSpecialtiesSection';
import Link from 'next/link';

function MenuContent() {
  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    },
  };

  return (
    <ReactBricks {...reactBricksConfig}>
      <main className="bg-darkBg overflow-x-hidden min-h-screen">
        
        <MenuHero
          heroTitle="Our Full Menu"
          heroSubtitle="Organized by category for easy browsing"
          leftEmoji="🍽️"
          rightEmoji="🍽️"
          ctaButtonText="Browse All Menu Items"
          ctaButtonLink="/menu/modern"
          showTitle={true}
          showSubtitle={true}
          showDescription={false}
          showEmojis={true}
          showButtons={true}
          showSecondaryButton={false}
          secondaryButtonText=""
          secondaryButtonLink=""
          contentAlignment="center"
          sectionPadding="lg"
          backgroundColor="#0f0f0f"
          titleColor={{ color: '#ffffff' }}
          subtitleColor={{ color: '#d1d5db' }}
          descriptionColor={{ color: '#d1d5db' }}
          heroStyle="decorative"
          buttonStyle="neon"
          textShadow="subtle"
          backgroundOverlay={0.7}
        />
        
        <MenuDrinksSection
          sectionTitle="Drinks & Beverages"
          leftEmoji="☕"
          rightEmoji="☕"
          showTitle={true}
          showEmojis={true}
          sectionBackground={{ color: 'rgba(17, 24, 39, 0.5)' }}
          titleColor={{ color: '#ffffff' }}
          contentAlignment="center"
          sectionPadding="lg"
          borderStyle="both"
          borderColor={{ color: 'rgba(55, 65, 81, 0.5)' }}
          _backgroundOverlay={0.5}
        />
        
        <MenuMainFoodSection
          sectionTitle="Main Food"
          leftEmoji="🍕"
          rightEmoji="🍕"
          showTitle={true}
          showEmojis={true}
          sectionBackground={{ color: 'rgba(17, 24, 39, 0.5)' }}
          titleColor={{ color: '#ffffff' }}
          contentAlignment="center"
          sectionPadding="lg"
          borderStyle="both"
          borderColor={{ color: 'rgba(55, 65, 81, 0.5)' }}
          _backgroundOverlay={0.5}
        />
        
        <MenuBreakfastSidesSection
          sectionTitle="Breakfast & Sides"
          leftEmoji="🥐"
          rightEmoji="🥐"
          showTitle={true}
          showEmojis={true}
          sectionBackground={{ color: 'rgba(17, 24, 39, 0.5)' }}
          titleColor={{ color: '#ffffff' }}
          contentAlignment="center"
          sectionPadding="lg"
          borderStyle="both"
          borderColor={{ color: 'rgba(55, 65, 81, 0.5)' }}
          _backgroundOverlay={0.5}
        />
        
        <MenuExtrasSpecialtiesSection
          sectionTitle="Extras & Specialties"
          leftEmoji="✨"
          rightEmoji="✨"
          showTitle={true}
          showEmojis={true}
          sectionBackground={{ color: 'rgba(17, 24, 39, 0.5)' }}
          titleColor={{ color: '#ffffff' }}
          contentAlignment="center"
          sectionPadding="lg"
          borderStyle="both"
          borderColor={{ color: 'rgba(55, 65, 81, 0.5)' }}
          _backgroundOverlay={0.5}
        />
        
        <div className="flex justify-center mt-8 sm:mt-12 px-4 pb-8">
          <Link
            href="/menu/modern"
            className="neon-button group relative bg-black/20 backdrop-blur-md border border-neonCyan/50 hover:border-neonPink/70 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-neonCyan hover:text-neonPink transition-all duration-300 hover:scale-105 hover:shadow-neon text-sm sm:text-base"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
            }}
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">🍽️</span>
              <span>Browse All Menu Items</span>
              <span className="text-2xl">🍽️</span>
            </span>
          </Link>
        </div>
      </main>
    </ReactBricks>
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
