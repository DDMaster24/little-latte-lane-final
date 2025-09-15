'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { ReactBricks } from 'react-bricks'

import NextLink from '../../react-bricks/NextLink'
import config from '../../react-bricks/config'

interface ReactBricksAppProps {
  children: React.ReactNode
  lang?: string
}

export function ReactBricksApp({ children, lang: _lang = 'en' }: ReactBricksAppProps) {
  const router = useRouter()

  // Color Mode Management (like in working version)
  const savedColorMode =
    typeof window === 'undefined' ? '' : localStorage.getItem('color-mode')

  const [colorMode, setColorMode] = useState(savedColorMode || 'light')

  const toggleColorMode = () => {
    const newColorMode = colorMode === 'light' ? 'dark' : 'light'
    setColorMode(newColorMode)
    localStorage.setItem('color-mode', newColorMode)
  }

  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      // Enhanced navigation - use Next.js router for better UX
      router.push(path);
    },
    renderLocalLink: NextLink,
    isDarkColorMode: colorMode === 'dark',
    toggleColorMode,
    contentClassName: `antialiased font-sans ${colorMode} ${
      colorMode === 'dark' ? 'dark bg-gray-900' : 'light bg-white'
    }`,
    // Enhanced editor experience
    enablePreview: true,
    enableAutoSave: true,
  }

  return <ReactBricks {...reactBricksConfig}>{children}</ReactBricks>
}