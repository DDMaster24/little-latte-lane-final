import React from 'react'

export default function ErrorNoKeys() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Configuration Error
        </h2>
        <p className="text-gray-600 mb-4">
          React Bricks API key is missing. Please add your API key to the environment variables.
        </p>
        <div className="bg-gray-100 p-4 rounded text-sm text-left">
          <p>Add to your .env.local file:</p>
          <code className="block mt-2">
            NEXT_PUBLIC_APP_ID=your_app_id<br />
            API_KEY=your_api_key
          </code>
        </div>
      </div>
    </div>
  )
}