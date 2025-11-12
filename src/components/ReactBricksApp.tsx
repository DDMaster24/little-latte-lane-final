'use client'

import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { ReactBricksErrorBoundary } from './ReactBricksErrorBoundary'
import { ReactBricksSafeWrapper } from './ReactBricksSafeWrapper'

import NextLink from '../../react-bricks/NextLink'
import config from '../../react-bricks/config'

interface ReactBricksAppProps {
  children: React.ReactNode
  lang?: string
}

export function ReactBricksApp({ children, lang: _lang = 'en' }: ReactBricksAppProps) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isReactBricksReady, setIsReactBricksReady] = useState(false)

  // Color Mode Management (like in working version)
  const [colorMode, setColorMode] = useState('light')

  useEffect(() => {
    setIsClient(true)
    
    // Only access localStorage after client mount and add defensive error handling
    try {
      const savedColorMode = localStorage.getItem('color-mode')
      if (savedColorMode && (savedColorMode === 'light' || savedColorMode === 'dark')) {
        setColorMode(savedColorMode)
      }
    } catch (error) {
      console.warn('Error accessing localStorage for color mode:', error)
      // Fall back to light mode if localStorage access fails
      setColorMode('light')
    }

    // Delayed initialization to ensure React Bricks has stable state
    const timer = setTimeout(() => {
      setIsReactBricksReady(true)
    }, 500) // Wait 500ms for all systems to stabilize

    return () => clearTimeout(timer)
  }, [])

  const toggleColorMode = () => {
    const newColorMode = colorMode === 'light' ? 'dark' : 'light'
    setColorMode(newColorMode)
    
    // Add defensive error handling for localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('color-mode', newColorMode)
      }
    } catch (error) {
      console.warn('Error saving color mode to localStorage:', error)
    }
  }

  // Prevent rendering until client-side AND React Bricks is ready
  if (!isClient || !isReactBricksReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonCyan mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">Loading React Bricks...</p>
        </div>
      </div>
    )
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

  return (
    <ReactBricksErrorBoundary>
      <ReactBricksSafeWrapper config={reactBricksConfig}>
        {children}
      </ReactBricksSafeWrapper>
    </ReactBricksErrorBoundary>
  )
}