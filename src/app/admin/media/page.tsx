'use client'

import React, { useEffect } from 'react'
import { Admin, MediaLibrary } from 'react-bricks'

export default function MediaPage() {
  useEffect(() => {
    document.title = 'React Bricks Media Library'
  }, [])

  return (
    <Admin>
      <MediaLibrary />
    </Admin>
  )
}