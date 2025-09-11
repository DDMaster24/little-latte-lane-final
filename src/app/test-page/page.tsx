'use client';

import { TestPageHeading } from '../../components/TestPageComponents/TestPageHeading';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <TestPageHeading />
        <p className="text-gray-400">This is our simple test page with one editable heading</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh to see changes
        </button>
      </div>
    </div>
  );
}
