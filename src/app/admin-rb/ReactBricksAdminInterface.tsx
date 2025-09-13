'use client'

import { useEffect, useState } from 'react'
import { Admin } from 'react-bricks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, Settings, FileText, ImageIcon, Play, Edit3 } from 'lucide-react'

export default function ReactBricksAdminPage() {
  const [isClient, setIsClient] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading while hydrating
  if (!isClient) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonCyan mx-auto"></div>
          <p className="text-neonText mt-4">Loading React Bricks Admin...</p>
        </div>
      </div>
    )
  }

  // If user wants to access React Bricks admin, show the component
  if (showLogin) {
    return (
      <div className="min-h-screen bg-darkBg">
        <Admin />
      </div>
    )
  }

  // Otherwise, show our custom interface
  return (
    <div className="min-h-screen bg-darkBg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neonCyan mb-2">React Bricks Content Management</h1>
          <p className="text-neonText">Manage your Little Latte Lane website content with visual editing tools</p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Page Editor */}
          <Card className="bg-darkBg border-neonCyan hover:border-neonPink transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonCyan">
                <Edit3 className="w-5 h-5" />
                Visual Editor
              </CardTitle>
              <CardDescription className="text-neonText">
                Edit your homepage content with drag-and-drop visual tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('/admin-rb/editor', '_blank')}
                className="w-full neon-button"
              >
                Open Editor
              </Button>
            </CardContent>
          </Card>

          {/* Media Library */}
          <Card className="bg-darkBg border-neonCyan hover:border-neonPink transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonCyan">
                <ImageIcon className="w-5 h-5" />
                Media Library
              </CardTitle>
              <CardDescription className="text-neonText">
                Manage images, videos, and other media assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('/admin-rb/media', '_blank')}
                className="w-full neon-button"
              >
                Browse Media
              </Button>
            </CardContent>
          </Card>

          {/* Playground */}
          <Card className="bg-darkBg border-neonCyan hover:border-neonPink transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonCyan">
                <Play className="w-5 h-5" />
                Playground
              </CardTitle>
              <CardDescription className="text-neonText">
                Test and preview your content bricks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('/admin-rb/playground', '_blank')}
                className="w-full neon-button"
              >
                Open Playground
              </Button>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card className="bg-darkBg border-neonCyan hover:border-neonPink transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonCyan">
                <Settings className="w-5 h-5" />
                App Settings
              </CardTitle>
              <CardDescription className="text-neonText">
                Configure React Bricks application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('/admin-rb/app-settings', '_blank')}
                className="w-full neon-button"
              >
                Open Settings
              </Button>
            </CardContent>
          </Card>

          {/* Full Admin Access */}
          <Card className="bg-darkBg border-neonPink hover:border-neonCyan transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonPink">
                <LogIn className="w-5 h-5" />
                Full Admin Access
              </CardTitle>
              <CardDescription className="text-neonText">
                Access the complete React Bricks admin interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowLogin(true)}
                className="w-full neon-button bg-neonPink"
              >
                Login to React Bricks
              </Button>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card className="bg-darkBg border-neonCyan hover:border-neonPink transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonCyan">
                <FileText className="w-5 h-5" />
                Documentation
              </CardTitle>
              <CardDescription className="text-neonText">
                Learn how to use the content management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('https://docs.reactbricks.com/', '_blank')}
                className="w-full neon-button"
              >
                View Docs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Information */}
        <div className="bg-darkBg border border-neonCyan rounded-lg p-6">
          <h2 className="text-xl font-semibold text-neonCyan mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-neonText">React Bricks Connected</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-neonText">4 Content Bricks Available</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-neonText">Neon Theme Active</p>
            </div>
          </div>
        </div>

        {/* Available Bricks */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-neonCyan mb-4">Available Content Bricks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-darkBg border border-neonCyan rounded-lg p-4">
              <h3 className="text-neonCyan font-medium">Welcoming Section</h3>
              <p className="text-sm text-neonText">Hero section with carousel and personalized greeting</p>
            </div>
            <div className="bg-darkBg border border-neonCyan rounded-lg p-4">
              <h3 className="text-neonCyan font-medium">Categories Section</h3>
              <p className="text-sm text-neonText">Product categories grid with navigation</p>
            </div>
            <div className="bg-darkBg border border-neonCyan rounded-lg p-4">
              <h3 className="text-neonCyan font-medium">Events & Specials</h3>
              <p className="text-sm text-neonText">Database-driven specials and events display</p>
            </div>
            <div className="bg-darkBg border border-neonCyan rounded-lg p-4">
              <h3 className="text-neonCyan font-medium">Bookings Section</h3>
              <p className="text-sm text-neonText">Interactive booking and contact form</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}