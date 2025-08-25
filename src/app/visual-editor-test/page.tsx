'use client';

import Link from 'next/link';
import { NavigationTestValidator } from '@/components/VisualEditor/NavigationTestValidator';

export default function VisualEditorTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Visual Editor Test Page</h1>
        
        <div className="space-y-8">
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-neonCyan mb-4">Editable Heading</h2>
            <p className="text-gray-300 leading-relaxed">
              This is a test paragraph that can be edited with the visual editor. 
              Click on any text element when in editor mode to start editing.
            </p>
            <Link href="/menu" className="text-neonPink hover:text-pink-400 underline">
              Test Link to Menu (should be disabled in editor mode)
            </Link>
          </section>

          <section className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-medium text-neonPink mb-3">Navigation Test Section</h3>
            <p className="text-gray-300 mb-4">
              Multiple paragraphs and sections help test the element selection system.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-2 bg-gradient-to-r from-neonCyan to-neonPink text-black rounded-lg font-medium">
                Test Button
              </button>
              <Link 
                href="/admin" 
                className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Test Navigation Link
              </Link>
            </div>
          </section>

          <section className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-medium text-white mb-3">Form Test</h3>
            <form className="space-y-4">
              <input 
                type="text" 
                placeholder="Test form input (submit should be blocked)"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Submit Form (should be blocked)
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Navigation Test Validator */}
      <NavigationTestValidator />
    </div>
  );
}