'use client'

import Link from 'next/link'
import { ArrowLeft, Lightbulb, Play, Zap } from 'lucide-react'

export default function BricksTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Admin
            </Link>
            <div className="h-6 w-px bg-gray-600"></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
              🧱 React Bricks Test Lab
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-neonCyan/10 border border-neonCyan/30 rounded-full px-4 py-2 mb-6">
            <Zap className="h-4 w-4 text-neonCyan" />
            <span className="text-neonCyan text-sm font-medium">React Bricks Testing Environment</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Visual Editor Test Lab
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            This page helps you understand how React Bricks works. Use the editor to modify components in real-time!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/admin/editor"
              className="inline-flex items-center gap-2 bg-neonCyan text-black px-6 py-3 rounded-lg font-semibold hover:bg-neonCyan/80 transition-all"
            >
              <Play className="h-4 w-4" />
              Open Visual Editor
            </Link>
            
            <Link
              href="/admin/preview"
              className="inline-flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >
              <Lightbulb className="h-4 w-4" />
              Preview Mode
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            How to Test React Bricks
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neonCyan">Step 1: Open Editor</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Click &quot;Open Visual Editor&quot; above</li>
                <li>• You&apos;ll see the React Bricks admin interface</li>
                <li>• Create a new page or edit existing content</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neonPink">Step 2: Add Test Bricks</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Click the + button to add bricks</li>
                <li>• Find &quot;Test&quot; category with 3 test bricks</li>
                <li>• Try Simple Text, Color Test, and Button bricks</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-yellow-400">Step 3: Edit Inline</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Click directly on any text to edit it</li>
                <li>• See changes happen immediately</li>
                <li>• No need to save - it&apos;s automatic!</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Step 4: Use Sidebar</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Select a brick to see sidebar options</li>
                <li>• Change colors, styles, and properties</li>
                <li>• See real-time visual updates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Available Test Bricks */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🧱 Simple Text Brick
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Basic text editing with title and content. Perfect for understanding inline editing.
            </p>
            <div className="text-xs text-neonCyan">
              Features: Inline text editing, hover effects
            </div>
          </div>
          
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🎨 Color Test Brick
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Tests color and background changes through sidebar controls.
            </p>
            <div className="text-xs text-neonPink">
              Features: Color picker, background options, real-time updates
            </div>
          </div>
          
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🔘 Button Test Brick
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Interactive button with multiple style options and animations.
            </p>
            <div className="text-xs text-yellow-400">
              Features: Button styles, hover effects, interactive elements
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-neonCyan/10 to-neonPink/10 border border-gray-600 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🚀 Ready to Start Testing?</h2>
          <p className="text-gray-300 mb-6">
            Click the &quot;Open Visual Editor&quot; button above to start experimenting with React Bricks. 
            You can add, edit, and rearrange components just like in professional page builders!
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/editor"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-neonCyan to-neonPink text-black px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-all"
            >
              <Play className="h-4 w-4" />
              Start Testing Now
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-all"
            >
              View Live Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
