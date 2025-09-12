'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Edit, Palette, Type } from 'lucide-react';

export default function DirectEditorPage() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [editorUrl, setEditorUrl] = useState('');

  const targetPage = searchParams.get('page') || '/';
  const autoLogin = searchParams.get('autoLogin') === 'true';

  useEffect(() => {
    if (!profile?.is_admin) {
      router.push('/admin');
      return;
    }

    // Construct React Bricks editor URL
    const baseEditorUrl = '/admin/editor';
    const editorParams = new URLSearchParams({
      page: targetPage,
      ...(autoLogin && { autoLogin: 'true' })
    });
    
    setEditorUrl(`${baseEditorUrl}?${editorParams.toString()}`);
    setIsLoading(false);
  }, [profile, targetPage, autoLogin, router]);

  const handleOpenEditor = () => {
    window.open(editorUrl, '_blank');
  };

  const handleSameTabEditor = () => {
    window.location.href = editorUrl;
  };

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-red-500/30 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-red-400 text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonCyan mx-auto mb-4"></div>
          <p className="text-gray-300">Preparing editor...</p>
        </div>
      </div>
    );
  }

  const getPageDisplayName = (page: string) => {
    switch (page) {
      case '/': return 'Homepage';
      case '/menu': return 'Menu Page';
      case '/bookings': return 'Bookings Page';
      case '/account': return 'Account Page';
      default: return `Page: ${page}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={() => router.back()}
            variant="outline"
            className="border-neonCyan/30 text-neonCyan hover:bg-neonCyan/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-white">Visual Content Editor</h1>
            <p className="text-gray-400">Editing: {getPageDisplayName(targetPage)}</p>
          </div>
        </div>

        {/* Editor Access Card */}
        <Card className="bg-gray-900/50 border-neonCyan/30 backdrop-blur-xl shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <Edit className="h-5 w-5 text-neonCyan" />
              React Bricks Visual Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Editor Description */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-2">What you can edit:</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-neonCyan" />
                  Text content (headings, descriptions, badges)
                </li>
                <li className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-neonPink" />
                  Colors (heading colors, badge colors, text colors)
                </li>
                <li className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-green-400" />
                  Inline editing with live preview
                </li>
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
              <h3 className="text-blue-400 font-semibold mb-2">How to use:</h3>
              <ol className="text-gray-300 space-y-1 text-sm list-decimal list-inside">
                <li>Click &quot;Open Editor&quot; below to access React Bricks</li>
                <li>If prompted, log in with your admin credentials</li>
                <li>Click on any text element to edit it directly</li>
                <li>Use the sidebar controls to change colors and styling</li>
                <li>Changes save automatically</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSameTabEditor}
                className="flex-1 bg-gradient-to-r from-neonCyan to-neonPink text-black font-semibold hover:opacity-90 transition-opacity"
              >
                <Edit className="h-4 w-4 mr-2" />
                Open Editor (Same Tab)
              </Button>
              
              <Button
                onClick={handleOpenEditor}
                variant="outline"
                className="flex-1 border-neonCyan/30 text-neonCyan hover:bg-neonCyan/10"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Editor (New Tab)
              </Button>
            </div>

            {/* Editor URL Info */}
            <div className="text-xs text-gray-500 bg-gray-800/30 rounded p-2 font-mono break-all">
              Editor URL: {editorUrl}
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-gray-900/30 border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-gray-300 text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-white font-medium mb-2">Text Editing:</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• Click any text to edit inline</li>
                  <li>• Use sidebar for color changes</li>
                  <li>• Changes save automatically</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Color Options:</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• Neon Gradient (default styling)</li>
                  <li>• Neon Cyan & Pink themes</li>
                  <li>• Standard color options</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}