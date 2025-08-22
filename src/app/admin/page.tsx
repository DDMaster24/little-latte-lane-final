'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase-client';
import ManageMenu from './manage-menu';
import ManageOrders from './manage-orders';
import ManageBookings from './manage-bookings';
import StaffPanel from './staff-panel';
import Analytics from './analytics';
import ManageRequests from './manage-requests';
import ManageEvents from './manage-events';
import VirtualGolfManagement from '@/components/VirtualGolfManagement';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  Users,
  BarChart3,
  MessageSquare,
  Sparkles,
  Settings,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

type TabType =
  | 'overview'
  | 'menu'
  | 'orders'
  | 'bookings'
  | 'staff'
  | 'analytics'
  | 'requests'
  | 'events'
  | 'settings'
  | 'help';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState({
    totalOrders: 0,
    bookingsToday: 0,
    activeStaff: 0,
    activeEvents: 0,
    staffMembers: [] as Array<{ full_name: string | null; is_staff: boolean | null; is_admin: boolean | null }>,
    virtualGolfEnabled: false,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoadingStats(true);

      // Fetch total orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Fetch bookings for today
      const today = new Date().toISOString().split('T')[0];
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // Fetch staff members with details
      const { data: staffData } = await supabase
        .from('profiles')
        .select('full_name, is_staff, is_admin')
        .or('is_staff.eq.true,is_admin.eq.true');

      // Fetch active events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString().split('T')[0]);

      // Virtual Golf status (currently defaults to false as per component)
      const virtualGolfEnabled = false; // TODO: Implement proper settings storage

      setStats({
        totalOrders: ordersCount || 0,
        bookingsToday: bookingsCount || 0,
        activeStaff: staffData?.length || 0,
        activeEvents: eventsCount || 0,
        staffMembers: staffData || [],
        virtualGolfEnabled,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
      setStats({
        totalOrders: 0,
        bookingsToday: 0,
        activeStaff: 0,
        activeEvents: 0,
        staffMembers: [],
        virtualGolfEnabled: false,
      });
    } finally {
      setLoadingStats(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!profile?.is_admin) {
      router.push('/'); // Redirect to home if not admin
    } else {
      // Fetch dashboard stats when user is confirmed admin
      fetchDashboardStats();
    }
  }, [profile, router, fetchDashboardStats]);

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4">
            Access Denied
          </h1>
          <p className="text-neonText/70">Redirecting...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'bookings', label: 'Virtual Golf', icon: Calendar },
    { id: 'events', label: 'Events & Specials', icon: Sparkles },
    { id: 'staff', label: 'Staff Panel', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'requests', label: 'Requests', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 hover:border-neonCyan/50 shadow-lg hover:shadow-neonCyan/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ShoppingBag className="h-8 w-8 text-neonCyan" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {loadingStats ? '...' : stats.totalOrders}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 hover:border-neonPink/50 shadow-lg hover:shadow-neonPink/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-neonPink" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">
                        Bookings Today
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {loadingStats ? '...' : stats.bookingsToday}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 hover:border-blue-400/50 shadow-lg hover:shadow-blue-400/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">
                        Staff Members
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {loadingStats ? '...' : stats.activeStaff}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 hover:border-purple-400/50 shadow-lg hover:shadow-purple-400/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Sparkles className="h-8 w-8 text-purple-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">
                        Active Events
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {loadingStats ? '...' : stats.activeEvents}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Information Panels Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Staff Information Panel */}
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                    <Users className="h-5 w-5 text-blue-400" />
                    Staff Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loadingStats ? (
                      <p className="text-gray-400">Loading staff information...</p>
                    ) : stats.staffMembers.length > 0 ? (
                      stats.staffMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-md">
                          <span className="text-white font-medium">
                            {member.full_name || 'Unknown User'}
                          </span>
                          <div className="flex items-center gap-2">
                            {member.is_admin ? (
                              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                Admin
                              </span>
                            ) : member.is_staff ? (
                              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                Staff
                              </span>
                            ) : null}
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>No staff members found</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Virtual Golf Status Panel */}
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                    <Calendar className="h-5 w-5 text-neonPink" />
                    Virtual Golf Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {stats.virtualGolfEnabled ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span className="text-green-400 font-medium">Virtual Golf is Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-400" />
                          <span className="text-red-400 font-medium">Virtual Golf is Currently Off</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {stats.virtualGolfEnabled 
                        ? "Customers can book virtual golf sessions." 
                        : "You can turn on Virtual Golf in the Virtual Golf tab."}
                    </p>
                    <Button 
                      onClick={() => setActiveTab('bookings')}
                      className="w-full bg-neonPink/20 border border-neonPink text-neonPink hover:bg-neonPink hover:text-black transition-all duration-300"
                    >
                      Manage Virtual Golf
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Events & Specials Status Panel */}
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Events & Specials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {stats.activeEvents > 0 ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span className="text-green-400 font-medium">
                            {stats.activeEvents} Active Event{stats.activeEvents !== 1 ? 's' : ''}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-yellow-400" />
                          <span className="text-yellow-400 font-medium">No Current Events or Specials</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {stats.activeEvents > 0 
                        ? "You have active promotions running." 
                        : "Consider creating events or specials to attract customers."}
                    </p>
                    <Button 
                      onClick={() => setActiveTab('events')}
                      className="w-full bg-purple-400/20 border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-all duration-300"
                    >
                      Manage Events & Specials
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white text-xl font-bold">
                    Quick Actions
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setActiveTab('help')}
                      className="bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-all duration-300 font-medium"
                      size="sm"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Admin Guide
                    </Button>
                    <Button
                      onClick={fetchDashboardStats}
                      disabled={loadingStats}
                      className="bg-transparent border border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black transition-all duration-300 font-medium"
                      size="sm"
                    >
                      <BarChart3
                        className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`}
                      />
                      Refresh Data
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveTab('menu')}
                    className="bg-transparent border border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black transition-all duration-300 font-medium"
                  >
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Manage Menu
                  </Button>
                  <Button
                    onClick={() => setActiveTab('orders')}
                    className="bg-transparent border border-neonPink text-neonPink hover:bg-neonPink hover:text-black transition-all duration-300 font-medium"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    View Orders
                  </Button>
                  <Button
                    onClick={() => setActiveTab('bookings')}
                    className="bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-all duration-300 font-medium"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Virtual Golf
                  </Button>
                  <Button
                    onClick={() => setActiveTab('analytics')}
                    className="bg-transparent border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-all duration-300 font-medium"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'menu':
        return <ManageMenu />;
      case 'orders':
        return <ManageOrders />;
      case 'bookings':
        return (
          <div className="space-y-6">
            {/* Virtual Golf Management */}
            <VirtualGolfManagement />
            
            {/* Regular Bookings */}
            <ManageBookings />
          </div>
        );
      case 'staff':
        return <StaffPanel />;
      case 'analytics':
        return <Analytics />;
      case 'requests':
        return <ManageRequests />;
      case 'events':
        return <ManageEvents />;
      case 'settings':
        return (
          <div className="space-y-6">
            {/* System Settings */}
            <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
                  <Settings className="h-6 w-6" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-gray-400">
                    Configure website settings, notifications, and system
                    preferences.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-all duration-300 font-medium">
                      Website Configuration
                    </Button>
                    <Button className="bg-transparent border border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black transition-all duration-300 font-medium">
                      Notification Settings
                    </Button>
                    <Button className="bg-transparent border border-neonPink text-neonPink hover:bg-neonPink hover:text-black transition-all duration-300 font-medium">
                      User Management
                    </Button>
                    <Button className="bg-transparent border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-all duration-300 font-medium">
                      System Backups
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-6">
            {/* Admin Guide Header */}
            <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-2xl font-bold">
                  <HelpCircle className="h-6 w-6 text-blue-400" />
                  Admin Dashboard Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-lg">
                  Welcome to Little Latte Lane&apos;s comprehensive admin guide. This documentation will help you understand and efficiently use all features of the admin dashboard.
                </p>
              </CardContent>
            </Card>

            {/* Guide Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overview Section */}
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                    <LayoutDashboard className="h-5 w-5 text-blue-400" />
                    Overview Tab
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    The Overview tab provides real-time insights into your restaurant&apos;s performance:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                    <li><strong>Total Orders:</strong> Complete count of all orders placed</li>
                    <li><strong>Bookings Today:</strong> Virtual golf bookings for current date</li>
                    <li><strong>Staff Members:</strong> Active staff and admin accounts</li>
                    <li><strong>Active Events:</strong> Currently running promotions and specials</li>
                    <li><strong>Staff Status:</strong> Shows which staff members are registered with their roles</li>
                    <li><strong>Virtual Golf Status:</strong> Current state of virtual golf bookings (on/off)</li>
                    <li><strong>Events & Specials Status:</strong> Overview of active promotions</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Menu Management */}
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                    <UtensilsCrossed className="h-5 w-5 text-neonCyan" />
                    Menu Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Manage your restaurant&apos;s menu categories and items:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                    <li><strong>Categories:</strong> Create and organize menu sections (Pizza, Beverages, etc.)</li>
                    <li><strong>Menu Items:</strong> Add, edit, or remove specific dishes and drinks</li>
                    <li><strong>Pricing:</strong> Set and update item prices</li>
                    <li><strong>Descriptions:</strong> Write appetizing descriptions for each item</li>
                    <li><strong>Availability:</strong> Mark items as available or temporarily out of stock</li>
                    <li><strong>Images:</strong> Upload photos to showcase your menu items</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Orders Management */}
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                    <ShoppingBag className="h-5 w-5 text-neonPink" />
                    Orders Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Monitor and manage customer orders:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                    <li><strong>Order Status:</strong> Track orders through preparation, ready, and completed stages</li>
                    <li><strong>Order Details:</strong> View customer information, items ordered, and special requests</li>
                    <li><strong>Payment Status:</strong> See payment confirmation and method</li>
                    <li><strong>Order History:</strong> Review past orders and customer patterns</li>
                    <li><strong>Kitchen Integration:</strong> Update order status for kitchen workflow</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Virtual Golf Management */}
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Virtual Golf Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Control virtual golf bookings and settings:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                    <li><strong>Enable/Disable:</strong> Turn virtual golf bookings on or off</li>
                    <li><strong>Booking Management:</strong> View and manage customer golf reservations</li>
                    <li><strong>Time Slots:</strong> Configure available booking times</li>
                    <li><strong>Coming Soon Message:</strong> Set custom message when golf is disabled</li>
                    <li><strong>Capacity Control:</strong> Manage maximum bookings per time slot</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Events & Specials */}
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Events & Specials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Create and manage promotional events:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                    <li><strong>Event Creation:</strong> Design special offers and promotions</li>
                    <li><strong>Date Ranges:</strong> Set start and end dates for events</li>
                    <li><strong>Descriptions:</strong> Write compelling event descriptions</li>
                    <li><strong>Visibility:</strong> Control which events are active and visible to customers</li>
                    <li><strong>Types:</strong> Create different event types (discounts, special menus, etc.)</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Analytics */}
              <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                    Analytics & Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Monitor business performance and trends:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                    <li><strong>Sales Reports:</strong> Track daily, weekly, and monthly revenue</li>
                    <li><strong>Popular Items:</strong> Identify best-selling menu items</li>
                    <li><strong>Customer Analytics:</strong> Understand customer behavior patterns</li>
                    <li><strong>Booking Trends:</strong> Analyze virtual golf booking patterns</li>
                    <li><strong>Performance Metrics:</strong> Monitor key business indicators</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Quick Tips */}
            <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                  Quick Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Daily Operations:</h4>
                    <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                      <li>Check the Overview tab each morning for daily insights</li>
                      <li>Monitor order status regularly to ensure timely preparation</li>
                      <li>Update menu item availability based on ingredients</li>
                      <li>Review virtual golf bookings for the day</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Best Practices:</h4>
                    <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                      <li>Keep menu descriptions detailed and appealing</li>
                      <li>Regularly create events and specials to attract customers</li>
                      <li>Use analytics to understand customer preferences</li>
                      <li>Ensure staff members have appropriate access levels</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back to Overview Button */}
            <div className="flex justify-center">
              <Button 
                onClick={() => setActiveTab('overview')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium transition-all duration-300"
              >
                Back to Overview Dashboard
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-darkBg">
      {/* Header */}
      <div className="bg-darkBg border-b border-neonCyan shadow-neon sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-neonText mt-1">
                Welcome back, {profile?.full_name || 'Administrator'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-all duration-300"
                onClick={() => setActiveTab('help')}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Admin Guide
              </Button>
              <div className="text-sm text-neonCyan">
                Last login: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-darkBg border-b border-gray-600/30">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-6 py-4 rounded-none border-b-3 transition-all duration-300 whitespace-nowrap font-semibold ${
                    activeTab === tab.id
                      ? 'border-neonCyan text-neonCyan bg-neonCyan/10'
                      : 'border-transparent text-gray-300 hover:text-white hover:bg-white/5 hover:border-gray-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{renderTabContent()}</main>
    </div>
  );
}
