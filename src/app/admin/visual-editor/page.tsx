'use client';

import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Menu, 
  ShoppingCart, 
  User, 
  Eye, 
  Palette, 
  Type, 
  ImageIcon, 
  Layout,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

interface EditablePage {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  editableElements: string[];
  priority: 'high' | 'medium' | 'low';
}

const EDITABLE_PAGES: EditablePage[] = [
  {
    id: 'homepage',
    title: 'Homepage',
    description: 'Main landing page with hero section, welcome message, and featured content',
    url: '/',
    icon: Home,
    editableElements: [
      'Hero background image',
      'Welcome title & description', 
      'Primary & secondary colors',
      'Call-to-action buttons',
      'Featured sections',
      'Logo and branding'
    ],
    priority: 'high'
  },
  {
    id: 'menu',
    title: 'Menu Page', 
    description: 'Restaurant menu with categories, items, and pricing',
    url: '/menu',
    icon: Menu,
    editableElements: [
      'Category names & descriptions',
      'Menu item details',
      'Pricing display',
      'Category layout',
      'Images and styling',
      'Special offers banner'
    ],
    priority: 'high'
  },
  {
    id: 'ordering',
    title: 'Ordering Flow',
    description: 'Cart, checkout, and order confirmation pages',
    url: '/menu/pizza', // Example starting point
    icon: ShoppingCart,
    editableElements: [
      'Cart design & layout',
      'Checkout form styling', 
      'Payment section text',
      'Order confirmation message',
      'Progress indicators',
      'Success page content'
    ],
    priority: 'medium'
  },
  {
    id: 'account',
    title: 'My Account',
    description: 'User profile and account management pages',
    url: '/account',
    icon: User,
    editableElements: [
      'Profile section headers',
      'Account navigation',
      'Order history display',
      'Settings page layout',
      'Help & support content'
    ],
    priority: 'low'
  }
];

const GLOBAL_ELEMENTS = [
  'Header navigation',
  'Footer content (hours, phone, address)',
  'Contact information',
  'Social media links',
  'Copyright text',
  'Global color scheme',
  'Font selections',
  'Logo placement'
];

export default function AdminVisualEditorPage() {
  const { profile } = useAuth();

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">You need admin privileges to access the visual editor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const openVisualEditor = (pageId: string, pageUrl: string) => {
    // Navigate to the visual editor for a specific page in the same tab
    const editorUrl = `/admin/visual-editor/${pageId}?target=${encodeURIComponent(pageUrl)}`;
    window.location.href = editorUrl;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500'; 
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={() => window.location.href = '/admin'}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">Visual Editor</h1>
          <p className="text-gray-400 text-lg">
            Customize the appearance and content of your website pages
          </p>
        </div>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-neonCyan/10 to-neonPink/10 border-neonCyan/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neonCyan">
              <Palette className="h-5 w-5" />
              How Visual Editing Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-2">✨ Click-to-Edit Interface</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Click any text to edit content</li>
                  <li>• Click color swatches to change colors</li>
                  <li>• Drag and drop to rearrange elements</li>
                  <li>• Upload images by clicking on existing images</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">💾 Safe & Secure</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• All changes save automatically</li>
                  <li>• Only admins can access this editor</li>
                  <li>• Changes apply to live site immediately</li>
                  <li>• Undo/redo functionality available</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page Editors */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {EDITABLE_PAGES.map((page) => {
            const IconComponent = page.icon;
            return (
              <Card key={page.id} className="bg-gray-800 border-gray-700 hover:border-neonCyan/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-white">
                      <IconComponent className="h-6 w-6 text-neonCyan" />
                      {page.title}
                    </CardTitle>
                    <Badge className={`${getPriorityColor(page.priority)} text-white text-xs`}>
                      {page.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{page.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-200 mb-2">Editable Elements:</h4>
                    <div className="flex flex-wrap gap-1">
                      {page.editableElements.slice(0, 3).map((element, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                        >
                          {element}
                        </span>
                      ))}
                      {page.editableElements.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{page.editableElements.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => openVisualEditor(page.id, page.url)}
                      className="flex-1 bg-gradient-to-r from-neonCyan to-neonBlue hover:from-neonCyan/80 hover:to-neonBlue/80 text-black font-medium"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Edit Page
                    </Button>
                    
                    <Button 
                      onClick={() => window.open(page.url, '_blank')}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Global Elements */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neonPink">
              <Layout className="h-5 w-5" />
              Global Elements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Elements that appear across all pages (header, footer, contact info)
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
              {GLOBAL_ELEMENTS.map((element, index) => (
                <span 
                  key={index}
                  className="text-sm bg-gray-700 text-gray-300 px-3 py-2 rounded text-center"
                >
                  {element}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => openVisualEditor('global', '/')}
                className="bg-gradient-to-r from-neonPink to-purple-600 hover:from-neonPink/80 hover:to-purple-600/80 text-white"
              >
                <Layout className="h-4 w-4 mr-2" />
                Edit Global Elements
              </Button>
              
              <Button 
                onClick={() => openVisualEditor('theme', '/visual-editor-test')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Palette className="h-4 w-4 mr-2" />
                Theme Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <Type className="h-8 w-8 text-neonBlue mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Typography</h3>
              <p className="text-sm text-gray-400">Fonts, sizes, spacing</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <Palette className="h-8 w-8 text-neonPink mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Colors</h3>
              <p className="text-sm text-gray-400">Brand colors, themes</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <ImageIcon className="h-8 w-8 text-neonCyan mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Images</h3>
              <p className="text-sm text-gray-400">Logos, backgrounds</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
