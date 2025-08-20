'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getSupabaseClient } from '@/lib/supabase-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  ChefHat,
  Calendar,
  ShoppingBag,
  Users,
  Clock,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface Order {
  id: string;
  user_id: string | null;
  status: string | null;
  total_amount: number | null;
  special_instructions: string | null;
  created_at: string | null;
  order_number: string | null;
  payment_status: string | null;
  updated_at: string | null;
  order_items: {
    id: string;
    menu_item_id: string | null;
    quantity: number;
    price: number | null;
    special_instructions: string | null;
    menu_items: { name: string; category_id: string | null } | null;
  }[];
  profiles: { full_name: string | null; email: string | null } | null;
}

interface Booking {
  id: string;
  user_id: string | null;
  booking_date: string;
  booking_time: string;
  party_size: number;
  status: string | null;
  special_requests: string | null;
  created_at: string | null;
  updated_at: string | null;
  name: string;
  email: string;
  phone: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
}

interface StockRequest {
  item_name: string;
  description: string;
  priority: string;
}

type TabType = 'overview' | 'stock-requests';

export default function StaffPanel() {
  const { profile } = useAuth();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    activeOrders: 0,
    todayBookings: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  const stockRequestForm = useForm<StockRequest>();

  useEffect(() => {
    // Check if user has staff access
    if (!profile) {
      setLoading(false);
      return;
    }

    if (!profile.is_staff && !profile.is_admin) {
      router.push('/');
      return;
    }

    fetchData();
    setLoading(false);
  }, [profile, router]);

  const tabs = [
    { id: 'overview', label: 'Restaurant Overview', icon: LayoutDashboard },
    { id: 'stock-requests', label: 'Stock Requests', icon: Package },
  ] as const;

  const fetchOrders = async () => {
    try {
      console.log('🔄 Staff Panel: Fetching orders...');
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            id,
            menu_item_id,
            quantity,
            price,
            special_instructions,
            menu_items (
              name,
              category_id
            )
          ),
          profiles (
            full_name,
            email
          )
        `
        )
        .in('status', ['confirmed', 'preparing', 'ready'])
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Staff Panel: Error fetching orders:', error);
        toast.error('Failed to fetch orders');
        return;
      }

      console.log(`✅ Staff Panel: Fetched ${data?.length || 0} orders at ${new Date().toLocaleTimeString()}`);
      setOrders(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Unexpected error fetching orders:', error);
      toast.error('Unexpected error occurred');
    }
  };

  const fetchBookings = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          *,
          profiles (
            full_name,
            email
          )
        `
        )
        .eq('booking_date', today)
        .order('booking_time', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to fetch bookings');
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error('Unexpected error fetching bookings:', error);
      toast.error('Unexpected error occurred');
    }
  };

  const fetchStats = async () => {
    try {
      // Active orders count
      const { count: activeOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'preparing', 'ready'])
        .eq('payment_status', 'paid');

      // Today's bookings count
      const today = new Date().toISOString().split('T')[0];
      const { count: todayBookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('booking_date', today);

      // Calculate today's revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid')
        .gte('created_at', today);

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        activeOrders: activeOrdersCount || 0,
        todayBookings: todayBookingsCount || 0,
        pendingOrders: 0, // We'll add this later if needed
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchOrders(), fetchBookings(), fetchStats()]);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'R0.00';
    return `R${amount.toFixed(2)}`;
  };

  const handleStockRequest = async (data: StockRequest) => {
    try {
      // For now, we'll just show a toast. Later we can implement actual database storage
      toast.success(`Stock request submitted: ${data.item_name}`);
      stockRequestForm.reset();
    } catch (error) {
      console.error('Error submitting stock request:', error);
      toast.error('Failed to submit stock request');
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-darkBg border-2 border-neonCyan shadow-[0_0_10px_#00FFFF] hover:shadow-[0_0_15px_#00FFFF] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-neonCyan" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neonText/70">Active Orders</p>
                <p className="text-2xl font-bold text-neonCyan">{stats.activeOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-darkBg border-2 border-neonPink shadow-[0_0_10px_#FF00FF] hover:shadow-[0_0_15px_#FF00FF] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-neonPink" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neonText/70">Today&apos;s Bookings</p>
                <p className="text-2xl font-bold text-neonPink">{stats.todayBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-darkBg border-2 border-neon-green shadow-[0_0_10px_#00FF00] hover:shadow-[0_0_15px_#00FF00] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-neon-green" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neonText/70">Total Orders</p>
                <p className="text-2xl font-bold text-neon-green">{orders.length + bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-darkBg border-2 border-neon-yellow shadow-[0_0_10px_#FFFF00] hover:shadow-[0_0_15px_#FFFF00] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-neon-yellow" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neonText/70">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold text-neon-yellow">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-darkBg border-2 border-neonCyan shadow-neon">
        <CardHeader>
          <CardTitle className="text-neonCyan text-xl font-bold">Quick Actions</CardTitle>
          <CardDescription>Frequently used actions for staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={fetchData}
              className="bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black hover:shadow-[0_0_15px_#00FF00] transition-all duration-300 font-medium"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            
            <Button
              onClick={() => router.push('/staff/kitchen-view')}
              className="bg-transparent border-2 border-neonPink text-neonPink hover:bg-neonPink hover:text-black hover:shadow-[0_0_15px_#FF00FF] transition-all duration-300 font-medium"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              Kitchen View
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              onClick={() => setActiveTab('stock-requests')}
              className="bg-transparent border-2 border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black hover:shadow-[0_0_15px_#FFFF00] transition-all duration-300 font-medium"
            >
              <Package className="h-4 w-4 mr-2" />
              Request Stock
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="text-neonCyan">Recent Orders</CardTitle>
            <CardDescription>Latest paid orders requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No active orders</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="border border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-white">
                          Order #{order.order_number || order.id.slice(0, 8)}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {order.profiles?.full_name || 'Guest'} • {formatDateTime(order.created_at)}
                        </p>
                        <p className="text-lg font-bold text-neonCyan mt-1">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          order.status === 'confirmed'
                            ? 'default'
                            : order.status === 'preparing'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="text-neonPink">Today&apos;s Bookings</CardTitle>
            <CardDescription>Reservations for today</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No bookings today</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-white">{booking.name}</h4>
                        <p className="text-sm text-gray-400">
                          {booking.booking_time} • Party of {booking.party_size}
                        </p>
                        {booking.special_requests && (
                          <p className="text-xs text-neonPink mt-1">
                            Special: {booking.special_requests}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={booking.status === 'confirmed' ? 'default' : 'outline'}
                        className="capitalize"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStockRequestsTab = () => (
    <div className="space-y-6">
      <Card className="bg-darkBg border-2 border-neonCyan shadow-neon">
        <CardHeader>
          <CardTitle className="text-neonCyan text-xl font-bold">Request Stock from Admin</CardTitle>
          <CardDescription>Submit requests for inventory items that are running low</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={stockRequestForm.handleSubmit(handleStockRequest)}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-neonText mb-2">
                Item Name
              </label>
              <Input
                {...stockRequestForm.register('item_name', { required: true })}
                placeholder="e.g., Tomatoes, Coffee Beans, Pizza Dough"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neonText mb-2">
                Description / Details
              </label>
              <Input
                {...stockRequestForm.register('description', { required: true })}
                placeholder="Describe quantity needed, specific brand, etc."
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neonText mb-2">
                Priority Level
              </label>
              <Select
                onValueChange={(value) => stockRequestForm.setValue('priority', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Can wait a few days</SelectItem>
                  <SelectItem value="medium">Medium - Needed within 1-2 days</SelectItem>
                  <SelectItem value="high">High - Needed today</SelectItem>
                  <SelectItem value="urgent">Urgent - Critical shortage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-neonCyan text-black hover:bg-neonCyan/80 hover:shadow-[0_0_15px_#00FFFF] transition-all duration-300 font-medium"
            >
              <Package className="h-4 w-4 mr-2" />
              Submit Stock Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Requests (placeholder for future implementation) */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-neonText">Recent Stock Requests</CardTitle>
          <CardDescription>Your submitted requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent stock requests</p>
            <p className="text-sm">Submitted requests will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'stock-requests':
        return renderStockRequestsTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-neonCyan mx-auto mb-4" />
          <p className="text-neonText">Loading staff panel...</p>
        </div>
      </div>
    );
  }

  if (!profile?.is_staff && !profile?.is_admin) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-600 p-8 text-center">
          <CardHeader>
            <CardTitle className="text-neonPink">Access Denied</CardTitle>
            <CardDescription>You need staff privileges to access this panel.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-neonText">
      {/* Header */}
      <div className="bg-gray-900 border-b border-neonCyan/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neonCyan">Staff Panel</h1>
              <p className="text-neonText/70 mt-1">
                Restaurant management dashboard for staff
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdate && (
                <div className="text-sm text-gray-400">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <Button
                onClick={() => router.push('/staff/kitchen-view')}
                className="bg-neonPink text-black hover:bg-neonPink/80 hover:shadow-[0_0_15px_#FF00FF] transition-all duration-300 font-medium"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Kitchen View
              </Button>
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
