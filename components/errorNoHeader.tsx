import React from 'react'

const ErrorNoHeader: React.FC = () => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm text-red-700">Unable to find the header.</p>
        </div>
      </div>
    </div>
  )
}

export default ErrorNoHeader