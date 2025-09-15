import React from 'react'

export default function ErrorNoHeader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Header Missing
        </h2>
        <p className="text-gray-600 mb-4">
          The site header could not be loaded. Please ensure the header page exists in React Bricks.
        </p>
        <p className="text-sm text-gray-500">
          Create a page with slug &apos;header&apos; in the React Bricks admin panel.
        </p>
      </div>
    </div>
  )
}