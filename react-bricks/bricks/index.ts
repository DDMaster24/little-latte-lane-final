import { types } from 'react-bricks/rsc'
import HeroBrick from './HeroBrick'
import WelcomingSection, { FeatureItem, BadgeItem } from './WelcomingSection'
import CategoriesSection, { CategoryCard } from './CategoriesSection'
import EventsSpecialsSection, { EventSpecialCard } from './EventsSpecialsSection'
import BookingsSection from './BookingsSection'
import DynamicCarousel, { CarouselPanel } from './DynamicCarousel'
import MenuHero from './MenuHero'
import MenuDisplay, { MenuCategoryCard, MenuSection } from './MenuDisplay'
import HeaderSection from './HeaderSection'
import FooterSection from './FooterSection'
import MenuSectionSkeleton from './MenuSection'
import CartSection from './CartSection'

// Little Latte Lane Custom Bricks Theme
const bricks: types.Theme[] = [
  {
    themeName: 'Little Latte Lane',
    categories: [
      {
        categoryName: 'Homepage Sections',
        bricks: [
          WelcomingSection,        // ✅ Enhanced main section with advanced controls
          CategoriesSection,       // ✅ Professional categories with exact styling
          EventsSpecialsSection,   // ✅ Database-driven events with real-time updates
          BookingsSection,         // ✅ Customizable CTA section with glass effects
          DynamicCarousel,         // ✅ 3D animated carousel with editable panels
          HeroBrick,              // Keep for comparison/backup
        ],
      },
      {
        categoryName: 'Menu Components',
        bricks: [
          MenuHero,               // ✅ Professional menu hero with multiple styles
          MenuDisplay,            // ✅ Full menu display with sections and categories
          MenuSectionSkeleton,    // Keep existing menu section skeleton
        ],
      },
      {
        categoryName: 'Layout Components',
        bricks: [
          HeaderSection,          // Header skeleton
          FooterSection,          // Footer skeleton
        ],
      },
      {
        categoryName: 'Page Sections',
        bricks: [
          CartSection,            // Cart system skeleton
        ],
      },
      {
        categoryName: 'Content Components',
        bricks: [
          FeatureItem,            // Nested inside WelcomingSection
          BadgeItem,              // Nested inside WelcomingSection
          CategoryCard,           // Nested inside CategoriesSection
          EventSpecialCard,       // Nested inside EventsSpecialsSection
          CarouselPanel,          // Nested inside DynamicCarousel
          MenuCategoryCard,       // Nested inside MenuDisplay
          MenuSection,            // Nested inside MenuDisplay
        ],
      },
    ],
  },
]

export default bricks