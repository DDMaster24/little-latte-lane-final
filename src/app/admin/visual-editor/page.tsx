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
  ExternalLink,
  Sparkles,
  Zap,
  Shield,
  MousePointer,
  Save
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
    url: '/menu/pizza',
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-red-500/30 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-red-400 text-xl flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">You need admin privileges to access the visual editor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const openVisualEditor = (pageId: string, pageUrl: string) => {
    const editorUrl = `/admin/visual-editor/${pageId}?target=${encodeURIComponent(pageUrl)}`;
    window.location.href = editorUrl;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-orange-500';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-amber-500'; 
      case 'low': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-neonCyan/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-4 left-1/2 w-96 h-96 bg-neonPink/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                onClick={() => window.location.href = '/admin'}
                variant="outline"
                className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:border-neonCyan/50 transition-all duration-300 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Dashboard
              </Button>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-neonPink/10 border border-purple-500/20 rounded-full backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                <span className="text-sm font-medium text-purple-400">DESIGN STUDIO</span>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-400 to-neonPink bg-clip-text text-transparent mb-4">
                Visual Editor
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Professional design tools to customize your website&apos;s appearance and content with pixel-perfect precision
              </p>
            </div>
          </div>

          {/* Features Overview */}
          <Card className="bg-gradient-to-r from-purple-500/10 via-neonCyan/10 to-neonPink/10 border-purple-500/30 mb-12 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-neonPink bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-neonPink/20 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                How Visual Editing Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-r from-neonCyan/20 to-blue-500/20 rounded-lg mt-1">
                      <MousePointer className="h-5 w-5 text-neonCyan" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">✨ Click-to-Edit Interface</h3>
                      <ul className="text-gray-300 text-sm space-y-1 leading-relaxed">
                        <li>• Click any text to edit content instantly</li>
                        <li>• Click color swatches to change themes</li>
                        <li>• Drag and drop to rearrange elements</li>
                        <li>• Upload images by clicking existing ones</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg mt-1">
                      <Save className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">💾 Safe & Secure</h3>
                      <ul className="text-gray-300 text-sm space-y-1 leading-relaxed">
                        <li>• All changes save automatically</li>
                        <li>• Only admins can access this editor</li>
                        <li>• Changes apply to live site immediately</li>
                        <li>• Undo/redo functionality available</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Page Editors */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {EDITABLE_PAGES.map((page) => {
              const IconComponent = page.icon;
              return (
                <Card key={page.id} className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-neonPink/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-6 w-6 text-purple-400" />
                        </div>
                        <CardTitle className="text-white text-xl group-hover:text-purple-400 transition-colors duration-300">
                          {page.title}
                        </CardTitle>
                      </div>
                      <Badge className={`${getPriorityColor(page.priority)} text-white text-xs font-medium px-3 py-1 shadow-lg`}>
                        {page.priority} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">{page.description}</p>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200 mb-3">Editable Elements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {page.editableElements.slice(0, 3).map((element, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-gray-300 px-3 py-1 rounded-full border border-gray-600/30"
                          >
                            {element}
                          </span>
                        ))}
                        {page.editableElements.length > 3 && (
                          <span className="text-xs text-gray-400 flex items-center">
                            +{page.editableElements.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button 
                        onClick={() => openVisualEditor(page.id, page.url)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-neonPink hover:from-purple-700 hover:to-neonPink/80 text-white font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Edit Page
                      </Button>
                      
                      <Button 
                        onClick={() => window.open(page.url, '_blank')}
                        variant="outline"
                        className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
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
          <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/50 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-neonCyan/20 to-neonPink/20 rounded-lg">
                  <Layout className="h-6 w-6 text-neonCyan" />
                </div>
                Global Elements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                Elements that appear across all pages (header, footer, contact info) - customize once, apply everywhere
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {GLOBAL_ELEMENTS.map((element, index) => (
                  <div 
                    key={index}
                    className="text-sm bg-gradient-to-r from-gray-700/30 to-gray-600/30 text-gray-300 px-4 py-3 rounded-lg text-center border border-gray-600/30 hover:border-neonCyan/50 transition-colors duration-300"
                  >
                    {element}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => openVisualEditor('global', '/')}
                  className="bg-gradient-to-r from-neonCyan to-neonPink hover:from-neonCyan/80 hover:to-neonPink/80 text-black font-medium shadow-lg hover:shadow-neonCyan/25 transition-all duration-300"
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Edit Global Elements
                </Button>
                
                <Button 
                  onClick={() => openVisualEditor('theme', '/visual-editor-test')}
                  variant="outline"
                  className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-neonCyan/50 transition-all duration-300"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Theme Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Design Tools */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 backdrop-blur-sm hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                  <Type className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg group-hover:text-blue-400 transition-colors duration-300">Typography</h3>
                <p className="text-sm text-gray-400">Professional fonts, sizes, and spacing controls</p>
              </CardContent>
            </Card>
            
            <Card className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/50 hover:border-neonPink/50 transition-all duration-500 backdrop-blur-sm hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-gradient-to-r from-neonPink/20 to-purple-500/20 rounded-xl mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                  <Palette className="h-8 w-8 text-neonPink" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg group-hover:text-neonPink transition-colors duration-300">Colors & Themes</h3>
                <p className="text-sm text-gray-400">Brand colors, gradients, and visual themes</p>
              </CardContent>
            </Card>
            
            <Card className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/50 hover:border-neonCyan/50 transition-all duration-500 backdrop-blur-sm hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-gradient-to-r from-neonCyan/20 to-blue-500/20 rounded-xl mx-auto mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="h-8 w-8 text-neonCyan" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg group-hover:text-neonCyan transition-colors duration-300">Media & Assets</h3>
                <p className="text-sm text-gray-400">Logos, backgrounds, and image optimization</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
