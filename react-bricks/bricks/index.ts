import { types } from 'react-bricks/frontend'
import WelcomingSection, { WelcomeInfoCard } from './WelcomingSection'
import CategoriesSection, { CategoryCard } from './CategoriesSection'
import EventsSpecialsSection, { EventSpecialCard } from './EventsSpecialsSection'
import BookingsSection from './BookingsSection'
import MenuHero from './MenuHero'
import MenuDrinksSection from './MenuDrinksSection'
import MenuMainFoodSection from './MenuMainFoodSection'
import MenuBreakfastSidesSection from './MenuBreakfastSidesSection'
import MenuExtrasSpecialtiesSection from './MenuExtrasSpecialtiesSection'
// Note: Removed MenuCategoryPanel - using CategoryCard for all sections
import HeaderSection, { NavLink } from './HeaderSection'
import FooterSection, { FooterLink, FooterColumn } from './FooterSection'
import CartSection from './CartSection'
import ClosureBanner from './ClosureBanner'

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
          MenuHero,                      // ✅ Professional menu hero with multiple styles
          MenuDrinksSection,             // ✅ NEW: Drinks & Beverages section with category panels
          MenuMainFoodSection,           // ✅ NEW: Main Food section with category panels  
          MenuBreakfastSidesSection,     // ✅ NEW: Breakfast & Sides section with category panels
          MenuExtrasSpecialtiesSection,  // ✅ NEW: Extras & Specialties section with category panels
        ],
      },
      {
        categoryName: 'Restaurant Management',
        bricks: [
          ClosureBanner,          // ✅ NEW: Displays closure banner when restaurant is closed
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
          WelcomeInfoCard,        // Nested inside WelcomingSection
          CategoryCard,           // Nested inside CategoriesSection (also used in Menu Sections)
          EventSpecialCard,       // Nested inside EventsSpecialsSection
          NavLink,                // Nested inside HeaderSection
          FooterLink,             // Nested inside FooterSection
          FooterColumn,           // Nested inside FooterSection
        ],
      },
    ],
  },
]

export default bricks
