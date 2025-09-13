'use client'

import { Editor } from 'react-bricks'
import { useEffect, useState } from 'react'

export default function EditorPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading while hydrating
  if (!isClient) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonCyan mx-auto"></div>
          <p className="text-neonText mt-4">Loading Visual Editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-darkBg">
      <Editor />
    </div>
  )
}