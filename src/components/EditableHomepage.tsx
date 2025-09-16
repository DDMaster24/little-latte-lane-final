'use client'

import React, { useEffect, useState } from 'react'
import { PageViewer, ReactBricks, fetchPage, types } from 'react-bricks/frontend'
import { useRouter } from 'next/navigation'

import ErrorNoPage from '@/components/ErrorNoPage'
import config from '../../react-bricks/config'

interface EditableHomepageProps {
  enableEditing?: boolean
}

export default function EditableHomepage({ enableEditing: _enableEditing = false }: EditableHomepageProps) {
  const router = useRouter()
  const [page, setPage] = useState<types.Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // React Bricks configuration for this component
  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      router.push(path);
    },
    apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  };

  useEffect(() => {
    const loadHomePage = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch the homepage - use empty string or 'home' slug
        const pageData = await fetchPage('', process.env.NEXT_PUBLIC_API_KEY!)
        
        setPage(pageData)
      } catch (err) {
        console.error('Error fetching homepage:', err)
        setError('Failed to load homepage')
      } finally {
        setLoading(false)
      }
    }

    loadHomePage()
  }, [])

  if (loading) {
    return (
      <ReactBricks {...reactBricksConfig}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonCyan"></div>
        </div>
      </ReactBricks>
    )
  }

  if (error || !page) {
    return (
      <ReactBricks {...reactBricksConfig}>
        <ErrorNoPage />
      </ReactBricks>
    )
  }

  return (
    <ReactBricks {...reactBricksConfig}>
      <PageViewer page={page} />
    </ReactBricks>
  )
}