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
  lowStockItems: Array<{
    name: string;
    currentStock: number;
    minStock: number;
    category: string;
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
    lowStockItems: [],
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

      // Mock low stock items (will be replaced with real data when stock management is implemented)
      const lowStockItems = [
        { name: 'Espresso Beans', currentStock: 3, minStock: 10, category: 'Coffee' },
        { name: 'Milk (1L)', currentStock: 5, minStock: 15, category: 'Dairy' },
        { name: 'Sugar Packets', currentStock: 2, minStock: 20, category: 'Supplies' },
        { name: 'Pastry Flour', currentStock: 1, minStock: 5, category: 'Baking' }
      ];

      setStats({
        todayRevenue,
        todayOrders,
        activeOrders,
        pendingBookings,
        totalCustomers,
        lowStockItems,
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
        {/* Low Stock Items */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockItems.length > 0 ? (
                stats.lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <p className="text-white font-medium">{item.name}</p>
                        <span className="text-xs px-2 py-1 bg-gray-600/50 text-gray-300 rounded">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-gray-400">
                          Current: <span className="text-yellow-400 font-medium">{item.currentStock}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Min: <span className="text-gray-300">{item.minStock}</span>
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${item.currentStock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                      <div className="text-sm font-bold">
                        {item.currentStock === 0 ? 'OUT' : 'LOW'}
                      </div>
                      <div className="text-xs">STOCK</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">All items are well stocked</p>
                  <p className="text-gray-400 text-sm">No low stock alerts</p>
                </div>
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
    </div>
  );
}
