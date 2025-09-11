import { types } from 'react-bricks'

import layout from './layout'
import features from './features'
import test from './test'

const bricks: types.Brick<any>[] = [...layout, ...features, ...test]

export default bricks
