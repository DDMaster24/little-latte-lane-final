'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Menu, Users, BarChart3, ShoppingBag, Calendar, 
  Shield, Activity, CheckCircle, CreditCard, QrCode, Star, Edit
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
  { id: 'craft-editor', label: 'Page Editor', icon: Edit, color: 'neonPink' },
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
      case 'craft-editor':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Custom Page Editor</h2>
              <p className="text-gray-400 text-sm">Edit your website pages with our custom visual editor system</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Test Page - First Priority */}
              <a 
                href="/admin/craft-editor/test-page"
                className="bg-gradient-to-br from-green-800/50 to-green-900/50 backdrop-blur-md rounded-xl p-6 border border-green-700/50 hover:border-green-500/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <Edit className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">🧪 Test Page</h3>
                </div>
                <p className="text-gray-300 text-sm">Simple test page with one editable heading - Perfect for testing our custom editor system</p>
                <div className="mt-3 inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                  Step-by-step testing
                </div>
              </a>

              <a 
                href="/admin/craft-editor/homepage"
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:border-neonCyan/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-neonCyan/20 rounded-lg group-hover:bg-neonCyan/30 transition-colors">
                    <Edit className="h-5 w-5 text-neonCyan" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Homepage</h3>
                </div>
                <p className="text-gray-400 text-sm">Edit the main landing page content, hero section, and featured categories</p>
              </a>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 opacity-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-600/20 rounded-lg">
                    <Edit className="h-5 w-5 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-500">Menu Page</h3>
                </div>
                <p className="text-gray-500 text-sm">Coming soon - Edit menu layout and descriptions</p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 opacity-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-600/20 rounded-lg">
                    <Edit className="h-5 w-5 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-500">About Page</h3>
                </div>
                <p className="text-gray-500 text-sm">Coming soon - Edit about page content and team info</p>
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

            {/* Tab Navigation - UPDATED: Two rows for 10 tabs */}
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
