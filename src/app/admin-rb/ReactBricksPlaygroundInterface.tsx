'use client'

import { useEffect, useState } from 'react'
import { Playground } from 'react-bricks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, Zap } from 'lucide-react'
import Link from 'next/link'

export default function ReactBricksPlaygroundInterface() {
  const [isClient, setIsClient] = useState(false)
  const [showPlayground, setShowPlayground] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading while hydrating
  if (!isClient) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonCyan mx-auto"></div>
          <p className="text-neonText mt-4">Loading React Bricks Playground...</p>
        </div>
      </div>
    )
  }

  // If user wants to access React Bricks playground, show the component
  if (showPlayground) {
    return (
      <div className="min-h-screen bg-darkBg">
        {/* Back button */}
        <div className="p-4 border-b border-neonCyan">
          <Button 
            onClick={() => setShowPlayground(false)}
            variant="outline" 
            className="neon-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Playground Dashboard
          </Button>
        </div>
        
        {/* React Bricks Playground */}
        <div className="p-4">
          <Playground />
        </div>
      </div>
    )
  }

  // Otherwise, show our custom playground interface
  return (
    <div className="min-h-screen bg-darkBg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin-rb" className="neon-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-neonCyan mb-2">React Bricks Playground</h1>
          <p className="text-neonText">Test and preview your content bricks in a sandbox environment</p>
        </div>

        {/* Playground Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Native Playground */}
          <Card className="bg-darkBg border-neonCyan hover:border-neonPink transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonCyan">
                <Play className="w-5 h-5" />
                React Bricks Playground
              </CardTitle>
              <CardDescription className="text-neonText">
                Access the built-in React Bricks playground with all your bricks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowPlayground(true)}
                className="w-full neon-button"
              >
                Open Native Playground
              </Button>
            </CardContent>
          </Card>

          {/* Custom Brick Preview */}
          <Card className="bg-darkBg border-neonCyan hover:border-neonPink transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonCyan">
                <Zap className="w-5 h-5" />
                Little Latte Lane Bricks
              </CardTitle>
              <CardDescription className="text-neonText">
                Preview your custom homepage bricks with live data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('/preview', '_blank')}
                className="w-full neon-button"
              >
                Preview Homepage Bricks
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Available Bricks */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-neonCyan mb-4">Available Bricks for Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-darkBg border border-neonCyan rounded-lg p-4">
              <h3 className="text-neonCyan font-medium mb-2">LLL Welcoming Section</h3>
              <p className="text-sm text-neonText mb-3">Hero section with carousel, personalized greeting, and badges</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-neonCyan/20 text-neonCyan px-2 py-1 rounded">Text</span>
                <span className="text-xs bg-neonCyan/20 text-neonCyan px-2 py-1 rounded">RichText</span>
                <span className="text-xs bg-neonCyan/20 text-neonCyan px-2 py-1 rounded">Auth Integration</span>
              </div>
            </div>

            <div className="bg-darkBg border border-neonCyan rounded-lg p-4">
              <h3 className="text-neonCyan font-medium mb-2">LLL Categories Section</h3>
              <p className="text-sm text-neonText mb-3">Product categories grid with navigation links</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-neonPink/20 text-neonPink px-2 py-1 rounded">Text</span>
                <span className="text-xs bg-neonPink/20 text-neonPink px-2 py-1 rounded">Image</span>
                <span className="text-xs bg-neonPink/20 text-neonPink px-2 py-1 rounded">Navigation</span>
              </div>
            </div>

            <div className="bg-darkBg border border-neonCyan rounded-lg p-4">
              <h3 className="text-neonCyan font-medium mb-2">LLL Events & Specials</h3>
              <p className="text-sm text-neonText mb-3">Database-driven specials and events display</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-neonGreen/20 text-neonGreen px-2 py-1 rounded">Database</span>
                <span className="text-xs bg-neonGreen/20 text-neonGreen px-2 py-1 rounded">Dynamic Content</span>
                <span className="text-xs bg-neonGreen/20 text-neonGreen px-2 py-1 rounded">RichText</span>
              </div>
            </div>

            <div className="bg-darkBg border border-neonCyan rounded-lg p-4">
              <h3 className="text-neonCyan font-medium mb-2">LLL Bookings Section</h3>
              <p className="text-sm text-neonText mb-3">Interactive booking form and contact section</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-neonYellow/20 text-neonYellow px-2 py-1 rounded">Forms</span>
                <span className="text-xs bg-neonYellow/20 text-neonYellow px-2 py-1 rounded">Interactive</span>
                <span className="text-xs bg-neonYellow/20 text-neonYellow px-2 py-1 rounded">Text</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-darkBg border border-neonCyan rounded-lg p-6">
          <h2 className="text-xl font-semibold text-neonCyan mb-4">How to Use the Playground</h2>
          <div className="space-y-3 text-neonText">
            <p>• <strong className="text-neonCyan">Native Playground:</strong> Access the full React Bricks playground with drag-and-drop functionality</p>
            <p>• <strong className="text-neonCyan">Preview Mode:</strong> See how your bricks look with actual Little Latte Lane styling and data</p>
            <p>• <strong className="text-neonCyan">Testing:</strong> Use the playground to test brick properties, styling, and responsive design</p>
            <p>• <strong className="text-neonCyan">Development:</strong> Perfect for debugging and iterating on brick designs</p>
          </div>
        </div>
      </div>
    </div>
  )
}