import { types } from 'react-bricks/rsc'

import MenuHeroBrick from './MenuHeroBrick'
import MenuCategoryBrick from './MenuCategoryBrick'
import MenuItemBrick from './MenuItemBrick'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const menu: types.Brick<any>[] = [
  MenuHeroBrick,
  MenuCategoryBrick,
  MenuItemBrick,
]

export default menu
