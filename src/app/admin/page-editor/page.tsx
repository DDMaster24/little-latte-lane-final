'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Layout, FileText, Menu, Home, MousePointer, FileImage } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PageEditorPage() {
  const router = useRouter();

  const editors = [
    {
      title: 'Header Editor',
      description: 'Edit header navigation, logo, and layout',
      icon: <MousePointer className="w-6 h-6" />,
      path: '/admin/page-editor/header',
      color: 'neonCyan'
    },
    {
      title: 'Homepage Editor', 
      description: 'Edit homepage content, hero section, and layout',
      icon: <Home className="w-6 h-6" />,
      path: '/admin/page-editor/homepage',
      color: 'neonPink'
    },
    {
      title: 'Menu Editor',
      description: 'Edit menu page layout and content presentation',
      icon: <Menu className="w-6 h-6" />,
      path: '/admin/page-editor/menu',
      color: 'yellow-500'
    },
    {
      title: 'Bookings Editor',
      description: 'Edit booking form and reservation content',
      icon: <FileText className="w-6 h-6" />,
      path: '/admin/page-editor/bookings',
      color: 'green-500'
    },
    {
      title: 'Footer Editor',
      description: 'Edit footer content, links, and contact info',
      icon: <Layout className="w-6 h-6" />,
      path: '/admin/page-editor/footer',
      color: 'purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-darkBg text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-neonCyan">Page Editor</h1>
              <p className="text-gray-400">Edit website pages and content</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {editors.map((editor) => (
            <div
              key={editor.title}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-neonCyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-neonCyan/10"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg bg-${editor.color}/20 border border-${editor.color}/30`}>
                  {editor.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{editor.title}</h3>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">
                {editor.description}
              </p>
              
              <Button
                onClick={() => router.push(editor.path)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
              >
                <FileImage className="w-4 h-4 mr-2" />
                Open Editor
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <FileImage className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400">Page Editor System</h3>
          </div>
          <p className="text-gray-300 text-sm">
            The page editor system allows you to visually edit website content without coding. 
            Select elements on the page to modify text, colors, and images in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
