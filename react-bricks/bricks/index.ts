import { types } from 'react-bricks/frontend'
import WelcomingSection from './WelcomingSection'
import CategoriesSection, { CategoryCard } from './CategoriesSection'
import EventsSpecialsSection, { EventSpecialCard } from './EventsSpecialsSection'
import BookingsSection from './BookingsSection'
import MenuHero from './MenuHero'
import MenuDisplay, { MenuCategoryCard, MenuSection } from './MenuDisplay'
import HeaderSection, { NavLink } from './HeaderSection'
import FooterSection, { FooterLink, FooterColumn } from './FooterSection'
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
          WelcomingSection,        // ✅ Enhanced main section with advanced color picker controls
          CategoriesSection,       // ✅ Professional categories with React Bricks integration
          EventsSpecialsSection,   // ✅ Database-driven events with real-time updates
          BookingsSection,         // ✅ Customizable CTA section with glass effects
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
          HeaderSection,          // ✅ Enhanced with editable navigation and multiple layouts
          FooterSection,          // ✅ Comprehensive footer with editable columns and links
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
          // Advanced individual text components (nested use only)
          // AdvancedHeading, AdvancedSubheading, AdvancedDescription,
          CategoryCard,           // Nested inside CategoriesSection
          EventSpecialCard,       // Nested inside EventsSpecialsSection
          MenuCategoryCard,       // Nested inside MenuDisplay
          MenuSection,            // Nested inside MenuDisplay
          NavLink,                // Nested inside HeaderSection
          FooterLink,             // Nested inside FooterSection
          FooterColumn,           // Nested inside FooterSection
        ],
      },
    ],
  },
]

export default bricks
