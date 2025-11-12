'use client'

import React, { useEffect } from 'react'
import { Admin, Editor } from 'react-bricks'

export default function EditorPage() {
  useEffect(() => {
    document.title = 'React Bricks Editor - Little Latte Lane'
  }, [])

  return (
    <Admin>
      <Editor />
    </Admin>
  )
}