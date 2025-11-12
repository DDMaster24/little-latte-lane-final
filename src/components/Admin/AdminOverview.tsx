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
  topSellingItemsToday: Array<{
    name: string;
    sales: number;
  }>;
  topSellingItemsWeek: Array<{
    name: string;
    sales: number;
  }>;
  topSellingItemsMonth: Array<{
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
    topSellingItemsToday: [],
    topSellingItemsWeek: [],
    topSellingItemsMonth: [],
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
      
      // Month range for monthly top items  
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      // Fetch all orders for today - more inclusive approach
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

      console.log('Overview Debug - Today orders fetched:', ordersData?.length || 0);

      if (ordersError) throw ordersError;

      // Fetch all weekly/monthly orders - more inclusive
      const { data: weeklyOrdersData, error: weeklyOrdersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            menu_items (name)
          )
        `)
        .gte('created_at', weekAgo.toISOString());

      if (weeklyOrdersError) throw weeklyOrdersError;

      // Fetch monthly orders for top selling items
      const { data: monthlyOrdersData, error: monthlyOrdersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            menu_items (name)
          )
        `)
        .gte('created_at', monthAgo.toISOString());

      console.log('Overview Debug - Weekly orders:', weeklyOrdersData?.length || 0);
      console.log('Overview Debug - Monthly orders:', monthlyOrdersData?.length || 0);

      if (monthlyOrdersError) throw monthlyOrdersError;

      // Fetch all active orders - more inclusive status filtering
      const { data: activeOrdersData, error: activeOrdersError } = await supabase
        .from('orders')
        .select('*')
        .not('status', 'in', '(completed,cancelled)')
        .gte('created_at', weekAgo.toISOString()); // Only show recent active orders

      console.log('Overview Debug - Active orders:', activeOrdersData?.length || 0);

      if (activeOrdersError) throw activeOrdersError;

      // Fetch bookings - Note: Contact forms are sent via email, not stored in database
      // So pending bookings will always be 0 unless we create a database table for contact form submissions
      const bookingsData: unknown[] = []; // No bookings table exists - contact forms go directly to email
      const bookingsError = null;

      if (bookingsError) throw bookingsError;

      // Fetch total customers
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      if (customersError) throw customersError;

      // Calculate today's stats - more inclusive revenue calculation
      const todayRevenue = ordersData
        ?.filter(order => 
          (order.payment_status === 'paid' || order.status === 'completed') && 
          order.total_amount && order.total_amount > 0
        )
        ?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const todayOrders = ordersData?.length || 0;
      const activeOrders = activeOrdersData?.length || 0;
      const pendingBookings = bookingsData?.length || 0;
      const totalCustomers = customersData?.length || 0;

      // Calculate top selling items for different periods
      const calculateTopItems = (orders: typeof ordersData) => {
        const itemCounts: Record<string, number> = {};
        orders?.forEach(order => {
          order.order_items?.forEach(item => {
            const itemName = item.menu_items?.name || 'Unknown Item';
            itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
          });
        });

        return Object.entries(itemCounts)
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);
      };

      const topSellingItemsToday = calculateTopItems(ordersData);
      const topSellingItemsWeek = calculateTopItems(weeklyOrdersData);
      const topSellingItemsMonth = calculateTopItems(monthlyOrdersData);

      // Calculate weekly trends
      const weeklyRevenue = weeklyOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const weeklyOrders = weeklyOrdersData?.length || 0;
      const growth = todayRevenue > 0 ? ((todayRevenue - (weeklyRevenue / 7)) / (weeklyRevenue / 7)) * 100 : 0;

      setStats({
        todayRevenue,
        todayOrders,
        activeOrders,
        pendingBookings,
        totalCustomers,
        topSellingItemsToday,
        topSellingItemsWeek,
        topSellingItemsMonth,
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
                <p className="text-xs text-gray-400 flex items-center mt-1">
                  {stats.pendingBookings > 0 ? (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1 text-yellow-400" />
                      <span className="text-yellow-400">Need attention</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
                      <span className="text-green-400">All clear</span>
                    </>
                  )}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Items (Today) */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-neonPink" />
              Top Selling Items (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingItemsToday.length > 0 ? (
                stats.topSellingItemsToday.map((item, index) => (
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

        {/* Top Selling Items (This Week) */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-green-400" />
              Top Selling Items (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingItemsWeek.length > 0 ? (
                stats.topSellingItemsWeek.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.sales} sold this week</p>
                      </div>
                    </div>
                    <div className="text-green-400 font-bold">{item.sales}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No sales data this week</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Items (This Month) */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              Top Selling Items (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingItemsMonth.length > 0 ? (
                stats.topSellingItemsMonth.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.sales} sold this month</p>
                      </div>
                    </div>
                    <div className="text-purple-400 font-bold">{item.sales}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No sales data this month</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
