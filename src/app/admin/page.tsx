'use client';

import { useEffect, useState } from 'react';
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
  | 'settings';

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
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!profile?.is_admin) {
      router.push('/'); // Redirect to home if not admin
    } else {
      // Fetch dashboard stats when user is confirmed admin
      fetchDashboardStats();
    }
  }, [profile, router]);

  const fetchDashboardStats = async () => {
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

      // Fetch active staff count (only users with role 'staff', not admin)
      const { count: staffCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'staff');

      // Fetch active events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString().split('T')[0]);

      setStats({
        totalOrders: ordersCount || 0,
        bookingsToday: bookingsCount || 0,
        activeStaff: staffCount || 0,
        activeEvents: eventsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
    } finally {
      setLoadingStats(false);
    }
  };

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
    { id: 'bookings', label: 'Bookings', icon: Calendar },
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-darkBg border-2 border-neonCyan shadow-[0_0_10px_#00FFFF] hover:shadow-[0_0_15px_#00FFFF] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ShoppingBag className="h-8 w-8 text-neonCyan" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neonText/70">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-neonCyan">
                        {loadingStats ? '...' : stats.totalOrders}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-darkBg border-2 border-neonPink shadow-[0_0_10px_#FF00FF] hover:shadow-[0_0_15px_#FF00FF] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-neonPink" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neonText/70">
                        Bookings Today
                      </p>
                      <p className="text-2xl font-bold text-neonPink">
                        {loadingStats ? '...' : stats.bookingsToday}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-darkBg border-2 border-neon-green shadow-[0_0_10px_#00FF00] hover:shadow-[0_0_15px_#00FF00] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-neon-green" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neonText/70">
                        Active Staff
                      </p>
                      <p className="text-2xl font-bold text-neon-green">
                        {loadingStats ? '...' : stats.activeStaff}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-darkBg border-2 border-neon-yellow shadow-[0_0_10px_#FFFF00] hover:shadow-[0_0_15px_#FFFF00] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Sparkles className="h-8 w-8 text-neon-yellow" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neonText/70">
                        Active Events
                      </p>
                      <p className="text-2xl font-bold text-neon-yellow">
                        {loadingStats ? '...' : stats.activeEvents}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-darkBg border-2 border-neonCyan shadow-neon">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-neonCyan text-xl font-bold">
                    Quick Actions
                  </CardTitle>
                  <Button
                    onClick={fetchDashboardStats}
                    disabled={loadingStats}
                    className="bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black hover:shadow-[0_0_15px_#00FF00] font-medium"
                    size="sm"
                  >
                    <BarChart3
                      className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`}
                    />
                    Refresh Stats
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveTab('menu')}
                    className="bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black hover:shadow-[0_0_15px_#00FF00] transition-all duration-300 font-medium"
                  >
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Manage Menu
                  </Button>
                  <Button
                    onClick={() => setActiveTab('orders')}
                    className="bg-transparent border-2 border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black hover:shadow-[0_0_15px_#00FFFF] transition-all duration-300 font-medium"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    View Orders
                  </Button>
                  <Button
                    onClick={() => setActiveTab('events')}
                    className="bg-transparent border-2 border-neonPink text-neonPink hover:bg-neonPink hover:text-black hover:shadow-[0_0_15px_#FF00FF] transition-all duration-300 font-medium"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Manage Events
                  </Button>
                  <Button
                    onClick={() => setActiveTab('analytics')}
                    className="bg-transparent border-2 border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black hover:shadow-[0_0_15px_#FFFF00] transition-all duration-300 font-medium"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
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
        return <ManageBookings />;
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
            {/* Virtual Golf Management */}
            <VirtualGolfManagement />

            {/* Other Settings */}
            <Card className="bg-darkBg border-2 border-neonCyan shadow-neon">
              <CardHeader>
                <CardTitle className="text-neonCyan flex items-center gap-2 text-xl font-bold">
                  <Settings className="h-6 w-6" />
                  Other System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-neonText/70">
                    Configure website settings, notifications, and system
                    preferences.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black hover:shadow-[0_0_15px_#00FF00] transition-all duration-300 font-medium">
                      Website Configuration
                    </Button>
                    <Button className="bg-transparent border-2 border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black hover:shadow-[0_0_15px_#00FFFF] transition-all duration-300 font-medium">
                      Notification Settings
                    </Button>
                    <Button className="bg-transparent border-2 border-neonPink text-neonPink hover:bg-neonPink hover:text-black hover:shadow-[0_0_15px_#FF00FF] transition-all duration-300 font-medium">
                      User Management
                    </Button>
                    <Button className="bg-transparent border-2 border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black hover:shadow-[0_0_15px_#FFFF00] transition-all duration-300 font-medium">
                      System Backups
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <div className="text-sm text-neonCyan">
                Last login: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-darkBg border-b border-neonPink/30">
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
                      ? 'border-neonCyan text-neonCyan bg-neonCyan/10 shadow-neon'
                      : 'border-transparent text-neonText hover:text-neonPink hover:bg-neonPink/10 hover:border-neonPink/50'
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
