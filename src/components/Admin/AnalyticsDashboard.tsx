'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase-client';
import { 
  RefreshCw, TrendingUp, ShoppingBag,
  DollarSign, Clock, Target, Calendar, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  mostPopularItem: {
    name: string;
    quantity: number;
  } | null;
  popularItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    mostPopularItem: null,
    popularItems: [],
    dailyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // week, month, all

  const supabase = getSupabaseClient();

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      if (dateRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate = new Date('2020-01-01'); // All time
      }

      // Fetch orders with proper status filtering (matching AdminOverview logic)
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            menu_items (name)
          )
        `)
        .eq('payment_status', 'paid')
        .in('status', ['confirmed', 'preparing', 'ready', 'completed'])
        .gte('created_at', startDate.toISOString());

      if (ordersError) throw ordersError;

      // Fetch total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Calculate total orders and revenue
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Calculate popular items
      const itemCounts: Record<string, { quantity: number; revenue: number }> = {};
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          const itemName = item.menu_items?.name || 'Unknown Item';
          if (!itemCounts[itemName]) {
            itemCounts[itemName] = { quantity: 0, revenue: 0 };
          }
          itemCounts[itemName].quantity += item.quantity;
          itemCounts[itemName].revenue += (item.price || 0) * item.quantity;
        });
      });

      const popularItems = Object.entries(itemCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      const mostPopularItem = popularItems.length > 0 ? 
        { name: popularItems[0].name, quantity: popularItems[0].quantity } : null;

      // Generate daily stats for the past week
      const dailyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at || '');
          return orderDate >= dayStart && orderDate <= dayEnd;
        }) || [];
        
        const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

        dailyStats.push({
          date: date.toLocaleDateString('en-ZA', { weekday: 'short' }),
          orders: dayOrders.length,
          revenue: dayRevenue
        });
      }

      setAnalytics({
        totalOrders,
        totalRevenue,
        totalUsers: totalUsers || 0,
        mostPopularItem,
        popularItems,
        dailyStats
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [supabase, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount: number) => `R${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-neonCyan" />
        <span className="ml-2 text-gray-300">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">Track your restaurant&apos;s performance and insights</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            {['week', 'month', 'all'].map((range) => (
              <Button
                key={range}
                onClick={() => setDateRange(range)}
                variant={dateRange === range ? 'default' : 'ghost'}
                size="sm"
                className={`px-4 py-2 ${dateRange === range ? 'bg-neonCyan text-black' : 'text-gray-300'}`}
              >
                {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
              </Button>
            ))}
          </div>
          <Button onClick={fetchAnalytics} className="neon-button">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Orders</p>
                <p className="text-3xl font-bold text-white">{analytics.totalOrders}</p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {dateRange === 'week' ? 'This week' : dateRange === 'month' ? 'This month' : 'All time'}
                </p>
              </div>
              <ShoppingBag className="h-12 w-12 text-neonCyan" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  From paid orders
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-neonPink" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Most Popular Item</p>
                <p className="text-xl font-bold text-white">
                  {analytics.mostPopularItem ? analytics.mostPopularItem.name : 'No data'}
                </p>
                <p className="text-xs text-blue-400 flex items-center mt-1">
                  <Target className="w-3 h-3 mr-1" />
                  {analytics.mostPopularItem ? `${analytics.mostPopularItem.quantity} sold` : 'No sales yet'}
                </p>
              </div>
              <BarChart3 className="h-12 w-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-white">{analytics.totalUsers}</p>
                <p className="text-xs text-purple-400 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Registered customers
                </p>
              </div>
              <Target className="h-12 w-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neonCyan" />
              Daily Performance (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.dailyStats.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm text-gray-400">{day.date}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-neonCyan rounded-full"></div>
                        <span className="text-white text-sm">{day.orders} orders</span>
                      </div>
                      <div className="text-xs text-gray-400">{formatCurrency(day.revenue)}</div>
                    </div>
                  </div>
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-neonCyan to-neonPink h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((day.orders / Math.max(...analytics.dailyStats.map(d => d.orders))) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neonPink" />
              Popular Menu Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popularItems.length > 0 ? (
                analytics.popularItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-neonCyan to-neonPink rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.quantity} sold • {formatCurrency(item.revenue)}</p>
                      </div>
                    </div>
                    <div className="text-neonCyan font-bold">{item.quantity}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No sales data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
