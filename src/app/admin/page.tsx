'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Menu, Users, BarChart3, ShoppingBag,
  Shield, Activity, CheckCircle, CreditCard, QrCode, Power, Bell
} from 'lucide-react';

// Tab Components
import OrderManagement from '@/components/Admin/OrderManagement';
import MenuManagementImproved from '@/components/Admin/MenuManagementImproved';
import AnalyticsDashboard from '@/components/Admin/AnalyticsDashboard';
import UserManagement from '@/components/Admin/UserManagement';
import BookingManagement from '@/components/Admin/BookingManagement';
import AdminOverview from '@/components/Admin/AdminOverview';
import RestaurantClosureManagement from '@/components/Admin/RestaurantClosureManagementV2';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import AdminNotificationsTab from '@/components/Admin/AdminNotificationsTab';

const tabs = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'green-500' },
  { id: 'bookings', label: 'Booking Management', icon: Activity, color: 'green-500' },
  { id: 'content', label: 'Content Management', icon: CheckCircle, color: 'neonPink' },
  { id: 'menu', label: 'Menu Management', icon: Menu, color: 'neonCyan' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'blue-500' },
  { id: 'orders', label: 'Order Management', icon: ShoppingBag, color: 'neonPink' },
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'neonCyan' },
  { id: 'qrcode', label: 'QR Code & App', icon: QrCode, color: 'orange-500' },
  { id: 'closure', label: 'Restaurant Status', icon: Power, color: 'red-500' },
  { id: 'users', label: 'User Management', icon: Users, color: 'purple-500' },
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
      case 'closure':
        return <RestaurantClosureManagement />;
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
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all duration-200 font-medium"
                  >
                    Media Library →
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'menu':
        return <MenuManagementImproved />;
      case 'notifications':
        return <AdminNotificationsTab />;
      case 'orders':
        return <OrderManagement />;
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
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">App Download QR Code</h2>
              <p className="text-gray-400 text-sm">Generate smart QR codes that automatically redirect customers to App Store or Google Play</p>
              <p className="text-gray-500 text-xs mt-2">Perfect for printing on menus, table tents, and marketing materials</p>
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
              <div className="bg-gray-800/30 backdrop-blur-sm p-2 rounded-2xl border border-gray-700/30 shadow-2xl">
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center gap-2 px-4 lg:px-6 py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
                          isActive
                            ? 'bg-gradient-to-r from-neonCyan/30 via-neonPink/20 to-neonCyan/30 text-white border-2 border-neonCyan/50 shadow-lg shadow-neonCyan/20 backdrop-blur-sm'
                            : 'text-gray-300 bg-gray-800/40 border-2 border-gray-600/50 hover:text-white hover:bg-gray-700/60 hover:border-gray-500/70 hover:shadow-lg hover:shadow-gray-500/20 backdrop-blur-sm'
                        }`}
                      >
                        {/* Active tab glow effect */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonCyan/10 to-neonPink/10 blur-sm"></div>
                        )}
                        <Icon className={`relative z-10 h-4 w-4 ${isActive ? 'text-neonCyan drop-shadow-sm' : ''}`} />
                        <span className="relative z-10 hidden sm:inline font-medium">{tab.label}</span>
                        <span className="relative z-10 sm:hidden font-medium">{tab.label.split(' ')[0]}</span>
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
          <div className="relative w-full overflow-x-hidden">
            {/* Neon border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neonCyan/10 via-transparent to-neonPink/10 border border-neonCyan/20 pointer-events-none"></div>
            <div className="relative z-10 p-6 rounded-2xl">
              {renderTabContent()}
            </div>
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
