'use client'

import React from 'react'
import { ReactBricksApp } from '@/components/ReactBricksApp'
import '@/styles/react-bricks.css'

interface CMSLayoutProps {
  children: React.ReactNode
}

export default function CMSLayout({ children }: CMSLayoutProps) {
  return (
    <ReactBricksApp lang="en">
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </ReactBricksApp>
  )
}