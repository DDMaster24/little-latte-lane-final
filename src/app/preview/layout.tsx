'use client'

import React from 'react'
import { ReactBricksApp } from '@/components/ReactBricksApp'

interface PreviewLayoutProps {
  children: React.ReactNode
}

export default function PreviewLayout({ children }: PreviewLayoutProps) {
  return (
    <ReactBricksApp lang="en">
      <div className="min-h-screen">
        {children}
      </div>
    </ReactBricksApp>
  )
}