import { types } from 'react-bricks/rsc'
import HeroBrick from './HeroBrick'
import WelcomingSection, { FeatureItem, BadgeItem } from './WelcomingSection'

// Little Latte Lane Custom Bricks Theme
const bricks: types.Theme[] = [
  {
    themeName: 'Little Latte Lane',
    categories: [
      {
        categoryName: 'Homepage Sections',
        bricks: [
          WelcomingSection, // New main section with nested components
          HeroBrick,        // Keep the simple hero for comparison
          // We'll add more sections here: CategoriesBrick, EventsBrick, etc.
        ],
      },
      {
        categoryName: 'Content Components',
        bricks: [
          FeatureItem,      // Nested inside WelcomingSection
          BadgeItem,        // Nested inside WelcomingSection
        ],
      },
    ],
  },
]

export default bricks