import { types } from 'react-bricks/rsc'
import HeroBrick from './HeroBrick'
import WelcomingSection, { FeatureItem, BadgeItem } from './WelcomingSection'
import CategoriesSection, { CategoryCard } from './CategoriesSection'

// Little Latte Lane Custom Bricks Theme
const bricks: types.Theme[] = [
  {
    themeName: 'Little Latte Lane',
    categories: [
      {
        categoryName: 'Homepage Sections',
        bricks: [
          WelcomingSection,     // Enhanced main section with advanced controls
          CategoriesSection,    // Professional categories with card management
          HeroBrick,           // Keep for comparison
          // EventsSpecialsSection, // Coming next
          // BookingsSection,      // Coming next
        ],
      },
      {
        categoryName: 'Content Components',
        bricks: [
          FeatureItem,         // Nested inside WelcomingSection
          BadgeItem,           // Nested inside WelcomingSection
          CategoryCard,        // Nested inside CategoriesSection
        ],
      },
    ],
  },
]

export default bricks