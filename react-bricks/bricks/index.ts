import { types } from 'react-bricks'

import layout from './layout'
import features from './features'
import test from './test'
import menu from './menu'
import content from './content/index'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bricks: types.Brick<any>[] = [
  ...layout, 
  ...features, 
  ...test, 
  ...menu,
  ...content,
]

export default bricks
