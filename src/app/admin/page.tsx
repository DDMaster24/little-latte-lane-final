'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Menu, Users, BarChart3, ShoppingBag, Calendar, 
  Shield, Activity, CheckCircle, CreditCard, QrCode, Star
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
  { id: 'content', label: 'Content Management', icon: CheckCircle, color: 'neonPink' },
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
      case 'content':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Content Management System</h2>
              <p className="text-gray-400 text-sm mb-6">Edit your website pages, homepage content, and media with React Bricks CMS</p>
            </div>
            
            <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* CMS Login */}
              <Card className="bg-gradient-to-br from-neonPink/10 to-neonPink/5 border-neonPink/20 hover:border-neonPink/40 transition-all duration-300 hover:shadow-lg hover:shadow-neonPink/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-neonPink text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    CMS Login
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">Access the content management system to edit your website pages</p>
                  <a
                    href="/admin/cms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-neonPink/20 border border-neonPink/30 text-neonPink rounded-lg hover:bg-neonPink/30 transition-all duration-200 font-medium"
                  >
                    Login to CMS →
                  </a>
                </CardContent>
              </Card>

              {/* Page Editor */}
              <Card className="bg-gradient-to-br from-neonCyan/10 to-neonCyan/5 border-neonCyan/20 hover:border-neonCyan/40 transition-all duration-300 hover:shadow-lg hover:shadow-neonCyan/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-neonCyan text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Page Editor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">Edit homepage content, text, images and layout visually</p>
                  <a
                    href="/admin/editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-neonCyan/20 border border-neonCyan/30 text-neonCyan rounded-lg hover:bg-neonCyan/30 transition-all duration-200 font-medium"
                  >
                    Open Editor →
                  </a>
                </CardContent>
              </Card>

              {/* Media Library */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-400 text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Media Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">Manage images, videos and other media files for your website</p>
                  <a
                    href="/admin/media"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all duration-200 font-medium"
                  >
                    Media Library →
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Section */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  href="/admin/cms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-neonPink/10 border border-neonPink/20 rounded-lg hover:bg-neonPink/20 transition-all duration-200 text-sm"
                >
                  <Shield className="h-4 w-4 text-neonPink" />
                  <span className="text-gray-300">Login to CMS</span>
                </a>
                <a
                  href="/admin/editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-neonCyan/10 border border-neonCyan/20 rounded-lg hover:bg-neonCyan/20 transition-all duration-200 text-sm"
                >
                  <CheckCircle className="h-4 w-4 text-neonCyan" />
                  <span className="text-gray-300">Edit Homepage</span>
                </a>
                <a
                  href="/admin/media"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-all duration-200 text-sm"
                >
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">Manage Media</span>
                </a>
                <a
                  href="/admin/app-settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-all duration-200 text-sm"
                >
                  <BarChart3 className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-300">CMS Settings</span>
                </a>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Getting Started
              </h4>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Click &quot;Login to CMS&quot; to authenticate with React Bricks</li>
                <li>Once logged in, use &quot;Page Editor&quot; to edit your homepage content</li>
                <li>Use &quot;Media Library&quot; to upload and manage images</li>
                <li>Changes are saved automatically and reflected on your live website</li>
              </ol>
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

            {/* Tab Navigation */}
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
