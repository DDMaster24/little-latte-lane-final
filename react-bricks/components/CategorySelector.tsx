'use client'

import React from 'react'
import { useMenuCategories } from '@/hooks/useMenuCategories'

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const { categories, loading, error } = useMenuCategories()

  if (loading) {
    return (
      <div className="p-2 text-sm text-gray-500">
        Loading categories...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-2 text-sm text-red-500">
        Error loading categories: {error}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Database Category:</label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} {category.description ? `- ${category.description}` : ''}
            </option>
          ))}
        </select>
      </div>
      
      {value && (
        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
          <strong>Selected:</strong> {categories.find(c => c.id === value)?.name || value}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        <p>📋 <strong>Available Categories:</strong></p>
        <ul className="ml-2 mt-1">
          {categories.map((category) => (
            <li key={category.id} className="flex justify-between">
              <span>{category.name}</span>
              <code className="text-xs bg-gray-100 px-1 rounded">{category.id}</code>
            </li>
          ))}
        </ul>
        <p className="mt-2">
          💡 <strong>Tip:</strong> Manage categories in the <a href="/admin/manage-menu-new" target="_blank" className="text-blue-600 underline">Admin Dashboard</a>
        </p>
      </div>
    </div>
  )
}