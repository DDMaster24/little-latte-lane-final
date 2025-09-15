'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { PageViewer, fetchPagePreview, cleanPage, getBricks, types } from 'react-bricks/rsc'
import { useState, useEffect } from 'react'

import ErrorNoKeys from '@/components/ErrorNoKeys'
import ErrorNoPage from '@/components/ErrorNoPage'
import config from '../../../react-bricks/config'

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState<types.Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!config.apiKey) {
      setError(true)
      setLoading(false)
      return
    }

    if (!token) {
      setError(true)
      setLoading(false)
      return
    }

    fetchPagePreview({
      token,
      config,
    })
      .then((pageData) => {
        if (pageData) {
          const bricks = getBricks()
          const cleanedPage = cleanPage(pageData, config.pageTypes || [], bricks)
          setPage(cleanedPage)
        } else {
          setError(true)
        }
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading preview...</div>
      </div>
    )
  }

  if (!config.apiKey) {
    return <ErrorNoKeys />
  }

  if (error || !page) {
    return <ErrorNoPage />
  }

  return <PageViewer page={page} />
}