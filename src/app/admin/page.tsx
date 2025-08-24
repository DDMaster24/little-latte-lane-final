'use client';

import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Menu, Users, BarChart3, ShoppingBag, Calendar, Palette, Eye, ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';

export default function AdminPage() {
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
            <p className="text-gray-300">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-neonCyan/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-neonPink/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-4 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-gradient-to-r from-neonCyan/10 to-neonPink/10 border border-neonCyan/20 rounded-full">
              <Zap className="h-5 w-5 text-neonCyan animate-pulse" />
              <span className="text-sm font-medium text-neonCyan">ADMIN CONTROL PANEL</span>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-neonCyan to-neonPink bg-clip-text text-transparent mb-4">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Manage your restaurant operations with powerful tools and real-time insights
            </p>
          </div>

          {/* Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Menu Management */}
            <Card className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-neonCyan/50 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl hover:shadow-neonCyan/10 hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-neonCyan/20 to-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Menu className="h-6 w-6 text-neonCyan" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-5 w-5 text-neonCyan" />
                  </div>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-neonCyan transition-colors duration-300">
                  Menu Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Manage menu items, categories, and pricing. Currently being updated to match the new database structure.
                </p>
                <Button disabled className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 cursor-not-allowed">
                  <Settings className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* Order Management */}
            <Card className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-neonPink/50 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl hover:shadow-neonPink/10 hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-neonPink/20 to-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="h-6 w-6 text-neonPink" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-5 w-5 text-neonPink" />
                  </div>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-neonPink transition-colors duration-300">
                  Order Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  View and manage customer orders, process refunds, and track order status in real-time.
                </p>
                <Button 
                  onClick={() => window.open('/staff', '_blank')}
                  className="w-full bg-gradient-to-r from-neonPink to-purple-600 hover:from-neonPink/80 hover:to-purple-600/80 text-white font-medium shadow-lg hover:shadow-neonPink/25 transition-all duration-300"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Orders (Staff Panel)
                </Button>
              </CardContent>
            </Card>

            {/* Bookings */}
            <Card className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-blue-400 transition-colors duration-300">
                  Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Manage table reservations and virtual golf bookings with intelligent scheduling.
                </p>
                <Button 
                  onClick={() => window.open('/bookings', '_blank')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View Bookings
                </Button>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-yellow-500 transition-colors duration-300">
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Manage customer accounts, staff roles, and user permissions with advanced controls.
                </p>
                <Button disabled className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 cursor-not-allowed">
                  <Settings className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-green-500/50 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-green-500 transition-colors duration-300">
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  View sales reports, popular items, and business insights with real-time data.
                </p>
                <Button disabled className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 cursor-not-allowed">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* Visual Theme Editor */}
            <Card className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Palette className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-purple-500 transition-colors duration-300">
                  Visual Theme Editor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Customize website appearance with professional design tools - colors, fonts, images, and layout.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.href = '/admin/visual-editor'}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Open Visual Editor
                  </Button>
                  <Button 
                    onClick={() => window.open('/visual-editor-test?editor=true', '_blank')}
                    variant="outline"
                    className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Test Color Editor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-neonCyan/20 to-neonPink/20 rounded-lg">
                  <Shield className="h-6 w-6 text-neonCyan" />
                </div>
                System Status & Development Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-300 font-medium">Core Ordering System</span>
                    </div>
                    <span className="text-green-400 font-bold">✅ LIVE & READY</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-300 font-medium">Payment Processing (PayFast)</span>
                    </div>
                    <span className="text-green-400 font-bold">✅ LIVE & READY</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-300 font-medium">Order Number Generation</span>
                    </div>
                    <span className="text-green-400 font-bold">✅ LIVE & READY</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-300 font-medium">Admin Menu Management</span>
                    </div>
                    <span className="text-yellow-400 font-bold">⏳ UPDATING SCHEMA</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-neonCyan/10 via-purple-500/10 to-neonPink/10 border border-neonCyan/30 rounded-2xl backdrop-blur-sm">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  🚀 LAUNCH STATUS: READY!
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div className="space-y-2">
                    <p className="text-white font-semibold">
                      <strong className="text-neonCyan">Customer Experience:</strong>
                    </p>
                    <p className="text-gray-300">100% Complete - Menu browsing, ordering, payment, tracking</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-semibold">
                      <strong className="text-neonPink">Order Processing:</strong>
                    </p>
                    <p className="text-gray-300">100% Complete - Auto order numbers (LL1001+), staff management</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-semibold">
                      <strong className="text-purple-400">Database:</strong>
                    </p>
                    <p className="text-gray-300">Live & operational - All order data properly structured</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gradient-to-r from-neonPink/20 to-purple-500/20 rounded-xl border border-neonPink/30">
                  <p className="text-neonPink font-bold text-center">
                    ✨ System is production-ready for customer orders and staff operations!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
