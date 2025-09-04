'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase-client';
import { 
  TrendingUp, DollarSign, ShoppingBag, 
  Users, Calendar, Clock, AlertTriangle, CheckCircle,
  RefreshCw, Star, Target, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeOrders: number;
  pendingBookings: number;
  totalCustomers: number;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
    status?: string;
  }>;
  topSellingItems: Array<{
    name: string;
    sales: number;
  }>;
  weeklyTrend: {
    revenue: number;
    orders: number;
    growth: number;
  };
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    activeOrders: 0,
    pendingBookings: 0,
    totalCustomers: 0,
    recentActivity: [],
    topSellingItems: [],
    weeklyTrend: { revenue: 0, orders: 0, growth: 0 }
  });
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseClient();

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);

      // Today's date range
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Week range for trends
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            menu_items (name)
          )
        `)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      if (ordersError) throw ordersError;

      // Fetch all active orders
      const { data: activeOrdersData, error: activeOrdersError } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'preparing', 'ready']);

      if (activeOrdersError) throw activeOrdersError;

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending');

      if (bookingsError) throw bookingsError;

      // Fetch total customers
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      if (customersError) throw customersError;

      // Fetch weekly data for trends
      const { data: weeklyOrdersData, error: weeklyOrdersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', weekAgo.toISOString())
        .eq('status', 'completed');

      if (weeklyOrdersError) throw weeklyOrdersError;

      // Calculate today's stats
      const todayRevenue = ordersData
        ?.filter(order => order.status === 'completed')
        ?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const todayOrders = ordersData?.length || 0;
      const activeOrders = activeOrdersData?.length || 0;
      const pendingBookings = bookingsData?.length || 0;
      const totalCustomers = customersData?.length || 0;

      // Calculate top selling items
      const itemCounts: Record<string, number> = {};
      ordersData?.forEach(order => {
        order.order_items?.forEach(item => {
          const itemName = item.menu_items?.name || 'Unknown Item';
          itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
        });
      });

      const topSellingItems = Object.entries(itemCounts)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // Calculate weekly trends
      const weeklyRevenue = weeklyOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const weeklyOrders = weeklyOrdersData?.length || 0;
      const growth = todayRevenue > 0 ? ((todayRevenue - (weeklyRevenue / 7)) / (weeklyRevenue / 7)) * 100 : 0;

      // Generate recent activity
      const recentActivity = [
        ...ordersData?.slice(-5).map(order => ({
          type: 'order',
          message: `New order #${order.order_number || order.id.slice(0, 8)} - R${(order.total_amount || 0).toFixed(2)}`,
          timestamp: order.created_at || new Date().toISOString(),
          status: order.status || undefined
        })) || [],
        ...bookingsData?.slice(-3).map(booking => ({
          type: 'booking',
          message: `New booking: ${booking.name} - ${booking.party_size} guests`,
          timestamp: booking.created_at || new Date().toISOString(),
          status: booking.status || undefined
        })) || []
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      setStats({
        todayRevenue,
        todayOrders,
        activeOrders,
        pendingBookings,
        totalCustomers,
        recentActivity,
        topSellingItems,
        weeklyTrend: { revenue: weeklyRevenue, orders: weeklyOrders, growth }
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const formatCurrency = (amount: number) => `R${amount.toFixed(2)}`;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-neonCyan" />
        <span className="ml-2 text-gray-300">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Business Overview</h2>
          <p className="text-gray-400">Real-time insights into your restaurant performance</p>
        </div>
        <Button onClick={fetchDashboardStats} className="neon-button">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Today&apos;s Revenue</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.todayRevenue)}</p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.weeklyTrend.growth.toFixed(1)}% vs avg
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-neonCyan" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Today&apos;s Orders</p>
                <p className="text-3xl font-bold text-white">{stats.todayOrders}</p>
                <p className="text-xs text-blue-400 flex items-center mt-1">
                  <Target className="w-3 h-3 mr-1" />
                  Orders placed
                </p>
              </div>
              <ShoppingBag className="h-12 w-12 text-neonPink" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Orders</p>
                <p className="text-3xl font-bold text-white">{stats.activeOrders}</p>
                <p className="text-xs text-orange-400 flex items-center mt-1">
                  <Activity className="w-3 h-3 mr-1" />
                  In progress
                </p>
              </div>
              <Clock className="h-12 w-12 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Bookings</p>
                <p className="text-3xl font-bold text-white">{stats.pendingBookings}</p>
                <p className="text-xs text-yellow-400 flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Need attention
                </p>
              </div>
              <Calendar className="h-12 w-12 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Customers</p>
                <p className="text-3xl font-bold text-white">{stats.totalCustomers}</p>
                <p className="text-xs text-purple-400 flex items-center mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  Registered users
                </p>
              </div>
              <Users className="h-12 w-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-neonCyan" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'order' ? 'bg-neonCyan' : 'bg-yellow-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400">
                          {formatTime(activity.timestamp)}
                        </p>
                        {activity.status && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-neonPink" />
              Top Selling Items (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingItems.length > 0 ? (
                stats.topSellingItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-neonCyan to-neonPink rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.sales} sold today</p>
                      </div>
                    </div>
                    <div className="text-neonCyan font-bold">{item.sales}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No sales data for today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <ShoppingBag className="w-8 h-8 text-neonCyan mx-auto mb-2" />
              <p className="text-white font-medium mb-1">Orders</p>
              <p className="text-xs text-gray-400 mb-3">Manage customer orders</p>
              <div className="text-2xl font-bold text-neonCyan">{stats.activeOrders}</div>
              <p className="text-xs text-gray-400">Active now</p>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-white font-medium mb-1">Bookings</p>
              <p className="text-xs text-gray-400 mb-3">Table reservations</p>
              <div className="text-2xl font-bold text-yellow-400">{stats.pendingBookings}</div>
              <p className="text-xs text-gray-400">Pending</p>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-white font-medium mb-1">Revenue</p>
              <p className="text-xs text-gray-400 mb-3">Today&apos;s earnings</p>
              <div className="text-lg font-bold text-green-400">{formatCurrency(stats.todayRevenue)}</div>
              <p className="text-xs text-gray-400">Total today</p>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-medium mb-1">Customers</p>
              <p className="text-xs text-gray-400 mb-3">Total registered</p>
              <div className="text-2xl font-bold text-purple-400">{stats.totalCustomers}</div>
              <p className="text-xs text-gray-400">Users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
