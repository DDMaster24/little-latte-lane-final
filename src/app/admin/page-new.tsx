'use client';

import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Menu, Users, BarChart3, ShoppingBag, Calendar } from 'lucide-react';

export default function AdminPage() {
  const { profile } = useAuth();

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your restaurant operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700 hover:border-neonCyan/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonCyan">
                <Menu className="h-5 w-5" />
                Menu Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Manage menu items, categories, and pricing. Currently being updated to match the new database structure.
              </p>
              <Button disabled className="w-full bg-gray-700 text-gray-400">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-neonPink/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonPink">
                <ShoppingBag className="h-5 w-5" />
                Order Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                View and manage customer orders, process refunds, and track order status.
              </p>
              <Button 
                onClick={() => window.open('/staff', '_blank')}
                className="w-full bg-neonPink hover:bg-neonPink/80 text-white"
              >
                View Orders (Staff Panel)
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-neonBlue/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neonBlue">
                <Calendar className="h-5 w-5" />
                Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Manage table reservations and virtual golf bookings.
              </p>
              <Button 
                onClick={() => window.open('/bookings', '_blank')}
                className="w-full bg-neonBlue hover:bg-neonBlue/80 text-white"
              >
                View Bookings
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-yellow-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-500">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Manage customer accounts, staff roles, and user permissions.
              </p>
              <Button disabled className="w-full bg-gray-700 text-gray-400">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-green-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                View sales reports, popular items, and business insights.
              </p>
              <Button disabled className="w-full bg-gray-700 text-gray-400">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-500">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Configure system settings, payment methods, and business hours.
              </p>
              <Button disabled className="w-full bg-gray-700 text-gray-400">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 col-span-full">
            <CardHeader>
              <CardTitle className="text-neonCyan">System Status & Development Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-900/20 border border-green-500/30 rounded">
                  <span className="text-gray-300 font-medium">Core Ordering System</span>
                  <span className="text-green-400 font-bold">✅ LIVE & READY</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-900/20 border border-green-500/30 rounded">
                  <span className="text-gray-300 font-medium">Payment Processing (Yoco)</span>
                  <span className="text-green-400 font-bold">✅ LIVE & READY</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-900/20 border border-green-500/30 rounded">
                  <span className="text-gray-300 font-medium">Order Number Generation</span>
                  <span className="text-green-400 font-bold">✅ LIVE & READY</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-900/20 border border-green-500/30 rounded">
                  <span className="text-gray-300 font-medium">Staff Kitchen Interface</span>
                  <span className="text-green-400 font-bold">✅ LIVE & READY</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
                  <span className="text-gray-300 font-medium">Admin Menu Management</span>
                  <span className="text-yellow-400 font-bold">⏳ UPDATING SCHEMA</span>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-neonCyan/10 to-neonPink/10 border border-neonCyan/30 rounded-lg">
                  <h3 className="text-lg font-bold text-neonCyan mb-2">🚀 LAUNCH STATUS: READY!</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-white">
                      <strong>Customer Experience:</strong> 100% Complete - Menu browsing, ordering, payment, tracking
                    </p>
                    <p className="text-white">
                      <strong>Order Processing:</strong> 100% Complete - Auto order numbers (LL1001+), staff management
                    </p>
                    <p className="text-white">
                      <strong>Database:</strong> Live & operational - All order data properly structured
                    </p>
                    <p className="text-neonPink font-medium mt-2">
                      ✨ System is production-ready for customer orders and staff operations!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
