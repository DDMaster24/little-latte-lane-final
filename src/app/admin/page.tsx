'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Menu, Users, BarChart3, ShoppingBag, Calendar, 
  Shield, Activity, CheckCircle, CreditCard, QrCode, Palette, Home, Edit, Navigation
} from 'lucide-react';

// Tab Components
import OrderManagement from '@/components/Admin/OrderManagement';
import MenuManagementThreeTier from '@/components/Admin/MenuManagementThreeTier';
import AnalyticsDashboard from '@/components/Admin/AnalyticsDashboard';
import UserManagement from '@/components/Admin/UserManagement';
import BookingManagement from '@/components/Admin/BookingManagement';
import AdminOverview from '@/components/Admin/AdminOverview';
import QRCodeGenerator from '@/components/QRCodeGenerator';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'neonCyan' },
  { id: 'menu', label: 'Menu Management', icon: Menu, color: 'neonCyan' },
  { id: 'orders', label: 'Order Management', icon: ShoppingBag, color: 'neonPink' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'blue-500' },
  { id: 'users', label: 'User Management', icon: Users, color: 'yellow-500' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'green-500' },
  { id: 'pageeditor', label: 'Page Editor', icon: Palette, color: 'purple-500' },
  { id: 'qrcode', label: 'QR Code & App', icon: QrCode, color: 'purple-500' },
];

export default function AdminPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

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
            <p className="text-gray-300">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'menu':
        return <MenuManagementThreeTier />;
      case 'orders':
        return <OrderManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'pageeditor':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Universal Page Editor</h2>
              <p className="text-gray-400">Edit any page on your website with our advanced visual editor</p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {/* Homepage Card */}
              <Card className="bg-darkBg/50 border-gray-700 hover:border-neonCyan/50 transition-all duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className="p-2 sm:p-3 bg-neonCyan/10 rounded-lg flex-shrink-0">
                        <Home className="h-5 w-5 sm:h-6 sm:w-6 text-neonCyan" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">Homepage</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">Edit the main landing page content</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push('/admin/editor/homepage')}
                      className="bg-neonCyan hover:bg-neonCyan/80 text-darkBg font-semibold w-full text-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Homepage
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Header Editor Card */}
              <Card className="bg-darkBg/50 border-gray-700 hover:border-neonPink/50 transition-all duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className="p-2 sm:p-3 bg-neonPink/10 rounded-lg flex-shrink-0">
                        <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-neonPink" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">Header</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">Edit navigation, logo, and header elements</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push('/admin/editor/header')}
                      className="bg-neonPink hover:bg-neonPink/80 text-darkBg font-semibold w-full text-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Header
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Menu Page Card */}
              <Card className="bg-darkBg/50 border-gray-700 hover:border-orange-500/50 transition-all duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className="p-2 sm:p-3 bg-orange-500/10 rounded-lg flex-shrink-0">
                        <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">Menu Page</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">Edit menu categories, descriptions & layout</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push('/admin/editor/menu')}
                      className="bg-orange-500 hover:bg-orange-500/80 text-white font-semibold w-full text-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Menu
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bookings Page Card */}
              <Card className="bg-darkBg/50 border-gray-700 hover:border-blue-500/50 transition-all duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg flex-shrink-0">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">Bookings Page</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">Edit booking forms and information</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push('/admin/editor/bookings')}
                      className="bg-blue-500 hover:bg-blue-500/80 text-white font-semibold w-full text-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Carousel Editor Card */}
              <Card className="bg-darkBg/50 border-gray-700 hover:border-neonPink/50 transition-all duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className="p-2 sm:p-3 bg-neonPink/10 rounded-lg flex-shrink-0">
                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-neonPink" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">Carousel Editor</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">Manage homepage carousel panels</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push('/admin/carousel-editor')}
                      className="bg-neonPink hover:bg-neonPink/80 text-darkBg font-semibold w-full text-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Carousel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Footer Editor Card */}
              <Card className="bg-darkBg/50 border-gray-700 hover:border-teal-500/50 transition-all duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className="p-2 sm:p-3 bg-teal-500/10 rounded-lg flex-shrink-0">
                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-teal-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">Footer Editor</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">Edit contact info, social links & footer content</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push('/admin/editor/footer')}
                      className="bg-teal-500 hover:bg-teal-500/80 text-white font-semibold w-full text-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Footer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Highlights */}
            <div className="mt-6 sm:mt-8 bg-gradient-to-r from-neonCyan/5 to-neonPink/5 rounded-xl p-4 sm:p-6 border border-gray-700/50">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">✨ Universal Editor Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neonCyan rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-300">Text & Content Editing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neonPink rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-300">Advanced Color Tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-300">Text Gradients</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-300">Enhanced Image Upload</span>
                </div>
              </div>
            </div>

            {/* Enhanced Image Demo */}
            <div className="mt-6 sm:mt-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 sm:p-6 border border-orange-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">🖼️ Enhanced Image Upload Demo</h3>
                  <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-0">
                    Test the new drag & drop image system with live preview and transform controls
                  </p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                      <span className="text-xs text-gray-400">Drag & Drop</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                      <span className="text-xs text-gray-400">Live Preview</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                      <span className="text-xs text-gray-400">Transform Controls</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/admin/image-demo')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm w-full sm:w-auto"
                >
                  Try Demo
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">NEW</span>
                </Button>
              </div>
            </div>

            {/* Debug Save Functionality */}
            <div className="mt-6 sm:mt-8 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-xl p-4 sm:p-6 border border-red-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">🔧 Debug Save Functionality</h3>
                  <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-0">
                    Test database connection and troubleshoot &ldquo;Save Changes&rdquo; button issues
                  </p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                      <span className="text-xs text-gray-400">Database Test</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></span>
                      <span className="text-xs text-gray-400">Save Test</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                      <span className="text-xs text-gray-400">Debug Logs</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/admin/debug-save')}
                  className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white font-semibold text-sm w-full sm:w-auto"
                >
                  Debug Save
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">DEBUG</span>
                </Button>
              </div>
            </div>
          </div>
        );
      case 'qrcode':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">QR Code & App Installation</h2>
              <p className="text-gray-400 text-sm">Generate QR codes for customers to easily access and install your app</p>
            </div>
            <div className="flex justify-center">
              <QRCodeGenerator 
                url="https://littlelattelane.co.za" 
                size={300}
                className="w-full max-w-md"
              />
            </div>
          </div>
        );
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-neonCyan/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-neonPink/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-4 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 w-full">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-neonCyan to-neonPink bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-400 text-sm mt-1 truncate">
                  Welcome back, {profile?.full_name || 'Admin'} • Manage your restaurant operations
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium hidden sm:inline">SYSTEM ONLINE</span>
                  <span className="text-green-400 text-xs font-medium sm:hidden">ONLINE</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation - FIXED: Better responsive handling */}
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50 min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-neonCyan/20 to-neonPink/20 text-white border border-neonCyan/30 shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-neonCyan' : ''}`} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="w-full overflow-x-hidden">
            {renderTabContent()}
          </div>
        </div>

        {/* System Status Footer */}
        <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border-t border-gray-700/50 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-300">Core Systems: <span className="text-green-400 font-medium">Operational</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 sm:h-5 w-4 sm:w-5 text-neonCyan flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-300">Database: <span className="text-neonCyan font-medium">Connected</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 sm:h-5 w-4 sm:w-5 text-neonPink flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-300">Yoco: <span className="text-neonPink font-medium">Active</span></span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
