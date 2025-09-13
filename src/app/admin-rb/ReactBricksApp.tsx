'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ReactBricks } from 'react-bricks'

// Import our custom React Bricks styling
import './react-bricks-custom.css'

import NextLink from '@/react-bricks/NextLink'
import config from '@/react-bricks/config'

export default function ReactBricksApp({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  // Color Mode Management - default to dark to match our neon theme
  const savedColorMode =
    typeof window === 'undefined' ? '' : localStorage.getItem('rb-color-mode')

  const [colorMode, setColorMode] = useState(savedColorMode || 'dark')

  const toggleColorMode = () => {
    const newColorMode = colorMode === 'light' ? 'dark' : 'light'
    setColorMode(newColorMode)
    localStorage.setItem('rb-color-mode', newColorMode)
  }

  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      router.push(path)
    },
    renderLocalLink: NextLink,
    isDarkColorMode: colorMode === 'dark',
    toggleColorMode,
    // Enhanced styling for better editor experience
    contentClassName: `antialiased font-sans min-h-screen ${
      colorMode === 'dark' ? 'dark bg-darkBg text-neonText' : 'light bg-white text-gray-900'
    }`,
    // Additional React Bricks configuration for better UX
    clickToEdit: true,
    enableAutoSave: true,
    enablePreview: true,
    previewPath: '/preview',
    loginPath: '/admin-rb',
    editorPath: '/admin-rb/editor',
    appRootPath: '/admin-rb',
  }

  return <ReactBricks {...reactBricksConfig}>{children}</ReactBricks>
}