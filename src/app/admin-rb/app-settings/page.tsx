'use client'

import { AppSettings } from 'react-bricks'
import { useEffect, useState } from 'react'

export default function AppSettingsPage() {
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
          <p className="text-neonText mt-4">Loading App Settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-darkBg">
      <AppSettings />
    </div>
  )
}