import React from 'react'

const ErrorNoKeys: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 text-gray-600 text-center">
      <h1 className="text-3xl sm:text-4xl text-center font-black text-gray-700 dark:text-gray-200 mb-4">
        Warning: missing App credentials
      </h1>
      <h2 className="text-xl sm:text-2xl text-center font-bold text-orange-600 mb-4">
        To start working with React Bricks
      </h2>
      <p className="text-lg sm:text-xl text-center leading-7 text-gray-700 dark:text-gray-300 mb-6">
        Please set your{' '}
        <code className="bg-orange-100 text-orange-800 text-sm p-1 rounded">
          appId
        </code>{' '}
        and{' '}
        <code className="bg-orange-100 text-orange-800 text-sm p-1 rounded">
          apiKey
        </code>{' '}
        in the <code>react-bricks/config.ts</code> file.
      </p>
    </div>
  )
}

export default ErrorNoKeys