import React from 'react'

export default function ErrorNoFooter() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Footer Missing
        </h2>
        <p className="text-gray-600 mb-4">
          The site footer could not be loaded. Please ensure the footer page exists in React Bricks.
        </p>
        <p className="text-sm text-gray-500">
          Create a page with slug &apos;footer&apos; in the React Bricks admin panel.
        </p>
      </div>
    </div>
  )
}