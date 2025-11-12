'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageViewer, types, ReactBricks } from 'react-bricks/frontend'
import { useState, useEffect } from 'react'

import ErrorNoKeys from '@/components/ErrorNoKeys'
import ErrorNoPage from '@/components/ErrorNoPage'
import config from '../../../react-bricks/config'

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [page, _setPage] = useState<types.Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // React Bricks configuration for this component
  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      router.push(path);
    },
    apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  };

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!process.env.NEXT_PUBLIC_API_KEY) {
      setError(true)
      setLoading(false)
      return
    }

    if (!token) {
      setError(true)
      setLoading(false)
      return
    }

    // For preview mode, we'll fetch the regular page data
    // React Bricks frontend package handles preview differently
    // TODO: Implement proper preview functionality later
    setError(true) // For now, disable preview until properly implemented
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <ReactBricks {...reactBricksConfig}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading preview...</div>
        </div>
      </ReactBricks>
    )
  }

  if (!process.env.NEXT_PUBLIC_API_KEY) {
    return (
      <ReactBricks {...reactBricksConfig}>
        <ErrorNoKeys />
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