'use client'

import React from 'react'
import { ReactBricksApp } from '@/components/ReactBricksApp'
import '@/styles/react-bricks.css'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ReactBricksApp lang="en">
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </ReactBricksApp>
  )
}