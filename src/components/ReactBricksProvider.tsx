'use client';

import { ReactBricks } from 'react-bricks'
import config from '../../react-bricks/config'

export default function ReactBricksProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactBricks {...config}>
      {children}
    </ReactBricks>
  )
}
