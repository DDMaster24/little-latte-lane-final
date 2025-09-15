'use client'

import React, { useEffect } from 'react'
import { Admin, Playground } from 'react-bricks'

export default function PlaygroundPage() {
  useEffect(() => {
    document.title = 'React Bricks Playground'
  }, [])

  return (
    <Admin>
      <Playground />
    </Admin>
  )
}