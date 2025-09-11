'use client'

import Link from 'next/link'
import { ArrowLeft, Edit } from 'lucide-react'

export default function PreviewPage() {
  return (
    <div className="min-h-screen">
      {/* Preview Controls */}
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 hover:text-blue-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Admin
          </Link>
          <span className="text-sm">Preview Mode</span>
        </div>
        
        <Link 
          href="/admin/editor" 
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
        >
          <Edit size={16} />
          Edit Page
        </Link>
      </div>

      {/* Placeholder Content */}
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Page Preview
        </h2>
        <p className="text-gray-600 mb-4">
          Preview functionality will be available once React Bricks is fully configured.
        </p>
        <Link 
          href="/admin/editor"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          <Edit size={16} />
          Go to Editor
        </Link>
      </div>
    </div>
  )
}
