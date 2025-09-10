'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Menu, Users, BarChart3, ShoppingBag, Calendar, 
  Shield, Activity, CheckCircle, CreditCard, QrCode, Palette, Edit, Star,
  Type, Box
} from 'lucide-react';

// Tab Components
import OrderManagement from '@/components/Admin/OrderManagement';
import MenuManagementThreeTier from '@/components/Admin/MenuManagementThreeTier';
import AnalyticsDashboard from '@/components/Admin/AnalyticsDashboard';
import UserManagement from '@/components/Admin/UserManagement';
import BookingManagement from '@/components/Admin/BookingManagement';
import AdminOverview from '@/components/Admin/AdminOverview';
import EventsSpecialsManagement from '@/components/Admin/EventsSpecialsManagement';
import BookingsManagementExtended from '@/components/Admin/BookingsManagementExtended';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'neonCyan' },
  { id: 'menu', label: 'Menu Management', icon: Menu, color: 'neonCyan' },
  { id: 'orders', label: 'Order Management', icon: ShoppingBag, color: 'neonPink' },
  { id: 'events', label: 'Events & Specials', icon: Star, color: 'yellow-500' },
  { id: 'bookings-management', label: 'Bookings Management', icon: Calendar, color: 'blue-500' },
  { id: 'bookings', label: 'Virtual Golf', icon: Activity, color: 'green-500' },
  { id: 'users', label: 'User Management', icon: Users, color: 'purple-500' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'green-500' },
  { id: 'pageeditor', label: 'Page Editor', icon: Palette, color: 'purple-500' },
  { id: 'qrcode', label: 'QR Code & App', icon: QrCode, color: 'orange-500' },
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
      case 'events':
        return <EventsSpecialsManagement />;
      case 'bookings-management':
        return <BookingsManagementExtended />;
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
              <h2 className="text-2xl font-bold text-white mb-2">Craft.js Page Builder</h2>
              <p className="text-gray-400">Professional drag & drop page editor with click-to-edit functionality. Edit headings, descriptions, colors, and layout with real-time preview.</p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {/* Homepage Editor - Direct Access */}
              <Card className="bg-darkBg/50 border-gray-700 hover:border-neonCyan/50 transition-all duration-200 ring-2 ring-neonCyan/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-neonCyan/10 rounded-lg flex-shrink-0">
                      <Edit className="h-8 w-8 text-neonCyan" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Homepage Editor
                        <span className="ml-2 text-sm bg-neonCyan/20 text-neonCyan px-2 py-1 rounded-full">DIRECT</span>
                      </h3>
                      <p className="text-gray-300 mb-3 text-sm">
                        Edit homepage content directly. Click headings, text, and sections to modify them instantly. Clean editing environment.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Welcome Section</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Categories</span>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Events</span>
                        <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded">Bookings</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push('/admin/page-builder/homepage')}
                    className="bg-neonCyan hover:bg-neonCyan/80 text-black font-bold w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Homepage Now
                  </Button>
                </CardContent>
              </Card>

              {/* Unified Page Builder */}
              <Card className="bg-darkBg/50 border-gray-700 hover:border-yellow-500/50 transition-all duration-200 ring-2 ring-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg flex-shrink-0">
                      <Palette className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Page Builder
                        <span className="ml-2 text-sm bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">CRAFT.JS</span>
                      </h3>
                      <p className="text-gray-300 mb-3 text-sm">
                        Edit all website content with professional drag & drop interface. Click any element to customize text, colors, and layout.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">All Pages</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Advanced Tools</span>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Templates</span>
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Export/Import</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push('/admin/page-builder')}
                    className="bg-yellow-500 hover:bg-yellow-500/80 text-black font-bold w-full"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Launch Page Builder
                  </Button>
                </CardContent>
              </Card>

              {/* Feature Highlights */}
              <Card className="bg-darkBg/50 border-gray-700 hover:border-neonCyan/50 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-neonCyan/10 rounded-lg flex-shrink-0">
                      <Type className="h-8 w-8 text-neonCyan" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Click-to-Edit</h3>
                      <p className="text-gray-300 mb-3 text-sm">
                        Simply click any heading, description, or text element to start editing. Changes save automatically.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-neonCyan/20 text-neonCyan px-2 py-1 rounded">Text Editing</span>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Auto-Save</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    ✨ No complex forms needed
                  </div>
                </CardContent>
              </Card>

              {/* Color & Background Control */}
              <Card className="bg-darkBg/50 border-gray-700 hover:border-green-500/50 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-green-500/10 rounded-lg flex-shrink-0">
                      <Box className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Color Control</h3>
                      <p className="text-gray-300 mb-3 text-sm">
                        Change heading colors, background colors, and section visibility with intuitive controls.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Colors</span>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Backgrounds</span>
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Toggles</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    🎨 Professional design tools
                  </div>
                </CardContent>
              </Card>
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
              <QRCodeGenerator />
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

            {/* Tab Navigation - FIXED: Two rows instead of horizontal scrolling */}
            <div className="w-full">
              <div className="bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
                {/* First Row - 5 tabs */}
                <div className="flex space-x-1 mb-1">
                  {tabs.slice(0, 5).map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-1 justify-center ${
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
                
                {/* Second Row - 5 tabs */}
                <div className="flex space-x-1">
                  {tabs.slice(5, 10).map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-1 justify-center ${
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
