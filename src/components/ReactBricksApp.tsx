'use client'

import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { ReactBricks } from 'react-bricks'

import NextLink from '../../react-bricks/NextLink'
import config from '../../react-bricks/config'

interface ReactBricksAppProps {
  children: React.ReactNode
  lang?: string
}

export function ReactBricksApp({ children, lang: _lang = 'en' }: ReactBricksAppProps) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Color Mode Management (like in working version)
  const [colorMode, setColorMode] = useState('light')

  useEffect(() => {
    setIsClient(true)
    // Only access localStorage after client mount
    const savedColorMode = localStorage.getItem('color-mode')
    if (savedColorMode) {
      setColorMode(savedColorMode)
    }
  }, [])

  const toggleColorMode = () => {
    const newColorMode = colorMode === 'light' ? 'dark' : 'light'
    setColorMode(newColorMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('color-mode', newColorMode)
    }
  }

  // Prevent rendering until client-side
  if (!isClient) {
    return <>{children}</>
  }

  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      // Enhanced navigation - use Next.js router for better UX
      try {
        router.push(path);
      } catch (error) {
        console.warn('Navigation error:', error)
        // Fallback to window.location if router fails
        if (typeof window !== 'undefined') {
          window.location.href = path
        }
      }
    },
    renderLocalLink: NextLink,
    isDarkColorMode: colorMode === 'dark',
    toggleColorMode,
    contentClassName: `antialiased font-sans ${colorMode} ${
      colorMode === 'dark' ? 'dark bg-gray-900' : 'light bg-white'
    }`,
    // Enhanced editor experience with error handling
    enablePreview: true,
    enableAutoSave: true,
  }

  return <ReactBricks {...reactBricksConfig}>{children}</ReactBricks>
}