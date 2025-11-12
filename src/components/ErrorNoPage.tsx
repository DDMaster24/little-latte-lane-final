import React from 'react'

export default function ErrorNoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The requested page could not be found or hasn&apos;t been created yet.
        </p>
        <p className="text-sm text-gray-500">
          Please check the URL or create the page in the React Bricks admin panel.
        </p>
      </div>
    </div>
  )
}