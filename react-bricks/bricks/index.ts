import { types } from 'react-bricks/rsc'
import HeroBrick from './HeroBrick'

// Little Latte Lane Custom Bricks Theme
const bricks: types.Theme[] = [
  {
    themeName: 'Little Latte Lane',
    categories: [
      {
        categoryName: 'Homepage Sections',
        bricks: [
          HeroBrick,
          // We'll add more sections here: WelcomeBrick, CategoriesBrick, etc.
        ],
      },
    ],
  },
]

export default bricks