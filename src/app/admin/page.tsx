'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Menu, Users, BarChart3, ShoppingBag, Calendar, 
  Shield, Activity, CheckCircle, CreditCard, QrCode, Star, Edit3
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
  { id: 'page-editor', label: 'Page Editor', icon: Edit3, color: 'neonPink' },
  { id: 'menu', label: 'Menu Management', icon: Menu, color: 'neonCyan' },
  { id: 'orders', label: 'Order Management', icon: ShoppingBag, color: 'neonPink' },
  { id: 'events', label: 'Events & Specials', icon: Star, color: 'yellow-500' },
  { id: 'bookings-management', label: 'Bookings Management', icon: Calendar, color: 'blue-500' },
  { id: 'bookings', label: 'Virtual Golf', icon: Activity, color: 'green-500' },
  { id: 'users', label: 'User Management', icon: Users, color: 'purple-500' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'green-500' },
  { id: 'qrcode', label: 'QR Code & App', icon: QrCode, color: 'orange-500' },
];

export default function AdminPage() {
  const { profile } = useAuth();
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
      case 'page-editor':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Page Editor</h2>
              <p className="text-gray-400 text-sm mb-6">Visual content management with drag-and-drop editing</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Main Dashboard */}
              <Card className="bg-gray-900/50 border-neonCyan/30 backdrop-blur-xl hover:border-neonCyan/50 transition-all duration-300 group cursor-pointer"
                    onClick={() => window.open('/admin-rb', '_blank')}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-neonCyan text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Editor Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">Access the main content management dashboard</p>
                  <button className="w-full bg-gradient-to-r from-neonCyan/20 to-neonCyan/30 border border-neonCyan/50 text-neonCyan px-4 py-2 rounded-lg text-sm font-medium hover:from-neonCyan/30 hover:to-neonCyan/40 transition-all duration-300">
                    Open Dashboard
                  </button>
                </CardContent>
              </Card>

              {/* Visual Editor */}
              <Card className="bg-gray-900/50 border-neonPink/30 backdrop-blur-xl hover:border-neonPink/50 transition-all duration-300 group cursor-pointer"
                    onClick={() => window.open('/admin-rb/editor', '_blank')}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-neonPink text-lg flex items-center gap-2">
                    <Edit3 className="h-5 w-5" />
                    Visual Editor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">Edit pages with drag-and-drop visual interface</p>
                  <button className="w-full bg-gradient-to-r from-neonPink/20 to-neonPink/30 border border-neonPink/50 text-neonPink px-4 py-2 rounded-lg text-sm font-medium hover:from-neonPink/30 hover:to-neonPink/40 transition-all duration-300">
                    Open Editor
                  </button>
                </CardContent>
              </Card>

              {/* Media Library */}
              <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
                    onClick={() => window.open('/admin-rb/media', '_blank')}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-purple-400 text-lg flex items-center gap-2">
                    <Menu className="h-5 w-5" />
                    Media Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">Manage images, videos, and other media assets</p>
                  <button className="w-full bg-gradient-to-r from-purple-500/20 to-purple-500/30 border border-purple-500/50 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-500/30 hover:to-purple-500/40 transition-all duration-300">
                    Open Library
                  </button>
                </CardContent>
              </Card>

              {/* Playground */}
              <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-xl hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer"
                    onClick={() => window.open('/admin-rb/playground', '_blank')}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-yellow-400 text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Playground
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">Test and experiment with content blocks</p>
                  <button className="w-full bg-gradient-to-r from-yellow-500/20 to-yellow-500/30 border border-yellow-500/50 text-yellow-400 px-4 py-2 rounded-lg text-sm font-medium hover:from-yellow-500/30 hover:to-yellow-500/40 transition-all duration-300">
                    Open Playground
                  </button>
                </CardContent>
              </Card>

              {/* App Settings */}
              <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 group cursor-pointer"
                    onClick={() => window.open('/admin-rb/app-settings', '_blank')}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    App Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">Configure React Bricks application settings</p>
                  <button className="w-full bg-gradient-to-r from-blue-500/20 to-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-500/30 hover:to-blue-500/40 transition-all duration-300">
                    Open Settings
                  </button>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card className="bg-gray-900/50 border-green-500/30 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-green-400 text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Available Bricks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Welcoming Section</span>
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Categories Section</span>
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Events & Specials</span>
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bookings Section</span>
                      <span className="text-green-400">✓</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-900/30 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Quick Start Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-neonCyan font-medium mb-2">Creating Pages:</h4>
                  <ol className="text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Open Editor Dashboard</li>
                    <li>Click &quot;New Page&quot;</li>
                    <li>Select &quot;Homepage&quot; page type</li>
                    <li>Add your content bricks</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-neonPink font-medium mb-2">Visual Editing:</h4>
                  <ol className="text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Click on any text to edit</li>
                    <li>Use sidebar for styling options</li>
                    <li>Drag to reorder sections</li>
                    <li>Preview and publish changes</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );
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

            {/* Tab Navigation - Single row for 9 tabs */}
            <div className="w-full">
              <div className="bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
                <div className="flex space-x-1">
                  {tabs.map((tab) => {
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
