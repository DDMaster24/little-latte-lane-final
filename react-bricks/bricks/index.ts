import { types } from 'react-bricks/rsc'

// Import our custom bricks
import LLLHero from './little-latte-lane/LLLHero'
import LLLWelcomingSection from './little-latte-lane/LLLWelcomingSection'
import LLLCategoriesSection from './little-latte-lane/LLLCategoriesSection'
import LLLEventsSpecialsSection from './little-latte-lane/LLLEventsSpecialsSection'
import LLLBookingsSection from './little-latte-lane/LLLBookingsSection'

// Organize bricks by themes and categories
const bricks: types.Theme[] = [
  {
    themeName: 'Little Latte Lane',
    categories: [
      {
        categoryName: 'Hero Sections',
        bricks: [LLLHero, LLLWelcomingSection],
      },
      {
        categoryName: 'Content Sections',
        bricks: [LLLCategoriesSection, LLLEventsSpecialsSection, LLLBookingsSection],
      },
    ],
  },
]

export default bricks