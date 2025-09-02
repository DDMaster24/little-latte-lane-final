'use client'

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, Menu, Calendar, User, Navigation, Layout, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

function PageEditorSelector() {
  const router = useRouter();

  const pages = [
    {
      id: 'homepage',
      title: 'Homepage',
      description: 'Edit the main landing page content and sections',
      icon: Home,
      path: '/admin/page-editor/homepage',
      color: 'neonCyan'
    },
    {
      id: 'menu',
      title: 'Menu Page',
      description: 'Edit menu items, categories, and pricing',
      icon: Menu,
      path: '/admin/page-editor/menu',
      color: 'neonPink'
    },
    {
      id: 'bookings',
      title: 'Bookings Page',
      description: 'Edit reservation and booking information',
      icon: Calendar,
      path: '/admin/page-editor/bookings',
      color: 'yellow-500'
    },
    {
      id: 'account',
      title: 'Account Page',
      description: 'Edit user account and profile sections',
      icon: User,
      path: '/admin/page-editor/account',
      color: 'green-500'
    },
    {
      id: 'header',
      title: 'Header Component',
      description: 'Edit navigation, logo, and header elements',
      icon: Navigation,
      path: '/admin/page-editor/header',
      color: 'purple-500'
    },
    {
      id: 'footer',
      title: 'Footer Component',
      description: 'Edit contact info, links, and footer content',
      icon: Layout,
      path: '/admin/page-editor/footer',
      color: 'blue-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Page Editor</h1>
        <p className="text-gray-400">Select a page or component to edit with the enhanced universal editor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => {
          const IconComponent = page.icon;
          return (
            <Card 
              key={page.id}
              className="p-6 bg-darkBg/50 border-gray-700 hover:border-neonCyan/50 transition-all duration-200 cursor-pointer group"
              onClick={() => router.push(page.path)}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-4 bg-${page.color}/10 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className={`h-8 w-8 text-${page.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{page.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{page.description}</p>
                <Button
                  className="bg-neonCyan hover:bg-neonCyan/80 text-darkBg font-semibold w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(page.path);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit {page.title}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-neonCyan mb-2">✨ Enhanced Editor Features</h3>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• <strong>Visual Element Selection</strong> - Orange hover, red selection borders</li>
          <li>• <strong>Smart Tool Restrictions</strong> - Only relevant tools show for each element type</li>
          <li>• <strong>Professional Color Picker</strong> - Color wheel, hex input, presets</li>
          <li>• <strong>Preview & Save Workflow</strong> - Preview changes before making them permanent</li>
          <li>• <strong>Navigation Blocking</strong> - No accidental page changes during editing</li>
        </ul>
      </div>
    </div>
  );
}

export default function AdminPageEditorPage() {
  return (
    <div className="min-h-screen bg-darkBg">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonCyan"></div>
        </div>
      }>
        <PageEditorSelector />
      </Suspense>
    </div>
  );
}
