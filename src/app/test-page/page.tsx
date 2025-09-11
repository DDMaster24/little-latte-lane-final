'use client';

import { TestPageHeading } from '../../components/TestPageComponents/TestPageHeading';
import { TestPageImage } from '../../components/TestPageComponents/TestPageImage';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <TestPageHeading />
        
        <div className="my-8">
          <TestPageImage />
        </div>
        
        <p className="text-gray-400">This is our test page with editable heading and image components</p>
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
