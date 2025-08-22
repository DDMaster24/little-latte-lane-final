'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useAuth } from '@/components/AuthProvider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  EllipsisVerticalIcon, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  DollarSign,
  Eye,
  RefreshCw,
  CheckCircle,
  Package,
} from 'lucide-react';

// Import server action
import { updateOrderStatus, getAdminOrders } from '../actions';

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null;
  order_items?: (Database['public']['Tables']['order_items']['Row'] & {
    menu_items?: Database['public']['Tables']['menu_items']['Row'] | null;
  })[] | null;
  customer_id?: string;
};

interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: Record<string, number>;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  mostPopularItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  revenueByPeriod: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const;

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  preparing: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  ready: 'bg-green-500/20 text-green-300 border-green-500/50',
  completed: 'bg-green-600/20 text-green-400 border-green-600/50',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/50',
};

export default function ManageOrders() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Analytics states
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'day' | 'week' | 'month'>('day');
  const [dayAnalytics, setDayAnalytics] = useState<OrderAnalytics | null>(null);
  const [weekAnalytics, setWeekAnalytics] = useState<OrderAnalytics | null>(null);
  const [monthAnalytics, setMonthAnalytics] = useState<OrderAnalytics | null>(null);

  const supabase = createClientComponentClient<Database>();

  // Redirect if not authenticated or not staff/admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!profile?.is_staff && !profile?.is_admin) {
      router.push('/');
      return;
    }
  }, [user, profile, router]);

  const fetchOrders = useCallback(async () => {
    if (!user || (!profile?.is_staff && !profile?.is_admin)) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Admin Panel: Fetching orders via server action...');
      const result = await getAdminOrders();
      
      if (!result.success) {
        console.error('❌ Admin Panel: Error fetching orders:', result.error);
        setError('Failed to load orders: ' + result.error);
        return;
      }

      console.log(`✅ Admin Panel: Fetched ${result.data.length} orders`);
      const orders = result.data as unknown as Order[];
      setOrders(orders);
      setFilteredOrders(orders);
    } catch (err) {
      console.error('💥 Admin Panel: Unexpected error fetching orders:', err);
      setError('An unexpected error occurred while loading orders');
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Analytics calculation function
  const calculateAnalytics = useCallback(async (period: 'day' | 'week' | 'month') => {
    setAnalyticsLoading(true);
    
    try {
      const now = new Date();
      let startDate: Date;
      
      if (period === 'day') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const { data: periodOrders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (name, price)
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      if (error) {
        console.error('Analytics error:', error);
        return;
      }

      const orders = periodOrders || [];
      
      // Calculate metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Status breakdown
      const statusBreakdown = orders.reduce((acc, order) => {
        const status = order.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const completedOrders = statusBreakdown.completed || 0;
      const pendingOrders = (statusBreakdown.pending || 0) + (statusBreakdown.confirmed || 0) + (statusBreakdown.preparing || 0) + (statusBreakdown.ready || 0);
      const cancelledOrders = statusBreakdown.cancelled || 0;
      
      // Most popular items
      const itemCounts = new Map();
      orders.forEach(order => {
        order.order_items?.forEach(item => {
          const name = item.menu_items?.name || 'Unknown Item';
          const price = item.menu_items?.price || 0;
          const quantity = item.quantity || 0;
          
          if (itemCounts.has(name)) {
            const existing = itemCounts.get(name);
            itemCounts.set(name, {
              quantity: existing.quantity + quantity,
              revenue: existing.revenue + (price * quantity)
            });
          } else {
            itemCounts.set(name, {
              quantity: quantity,
              revenue: price * quantity
            });
          }
        });
      });
      
      const mostPopularItems = Array.from(itemCounts.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity);
      
      // Revenue by period (simplified)
      const revenueByPeriod: Array<{ date: string; revenue: number; orders: number }> = [];
      
      if (period === 'day') {
        // Group by hour for today
        for (let hour = 0; hour < 24; hour++) {
          const hourStart = new Date(startDate);
          hourStart.setHours(hour, 0, 0, 0);
          const hourEnd = new Date(startDate);
          hourEnd.setHours(hour + 1, 0, 0, 0);
          
          const hourOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at || '');
            return orderDate >= hourStart && orderDate < hourEnd;
          });
          
          const revenue = hourOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
          
          revenueByPeriod.push({
            date: `${hour}:00`,
            revenue,
            orders: hourOrders.length
          });
        }
      } else {
        // Group by day for week/month
        const days = period === 'week' ? 7 : 30;
        for (let i = 0; i < days; i++) {
          const dayStart = new Date(startDate);
          dayStart.setDate(dayStart.getDate() + i);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);
          
          const dayOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at || '');
            return orderDate >= dayStart && orderDate <= dayEnd;
          });
          
          const revenue = dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
          
          revenueByPeriod.push({
            date: dayStart.toLocaleDateString(),
            revenue,
            orders: dayOrders.length
          });
        }
      }

      const analytics: OrderAnalytics = {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        statusBreakdown,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        mostPopularItems,
        revenueByPeriod
      };

      if (period === 'day') setDayAnalytics(analytics);
      else if (period === 'week') setWeekAnalytics(analytics);
      else setMonthAnalytics(analytics);

    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [supabase]);

  // Real-time subscription
  useEffect(() => {
    if (!user || (!profile?.is_staff && !profile?.is_admin)) return;

    fetchOrders();
    calculateAnalytics('day');
    calculateAnalytics('week');
    calculateAnalytics('month');

    const ordersSubscription = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['orders']['Row']>) => {
          console.log('Order changed:', payload);
          fetchOrders();
          calculateAnalytics(activeAnalyticsTab);
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, [user, profile, fetchOrders, calculateAnalytics, activeAnalyticsTab, supabase]);

  // Filter orders when filter changes
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filterStatus));
    }
  }, [filterStatus, orders]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: (typeof statusOptions)[number]
  ) => {
    try {
      const response = await updateOrderStatus(id, newStatus);
      if (response.success) {
        fetchOrders();
        calculateAnalytics(activeAnalyticsTab);
      } else {
        console.error('Failed to update order status:', response.error);
        setError('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const currentAnalytics = 
    activeAnalyticsTab === 'day' ? dayAnalytics :
    activeAnalyticsTab === 'week' ? weekAnalytics :
    monthAnalytics;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-500/20 border-red-500/50 text-red-300">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Section */}
      <Tabs value={activeAnalyticsTab} onValueChange={(value) => setActiveAnalyticsTab(value as 'day' | 'week' | 'month')} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Orders Management</h2>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                fetchOrders();
                calculateAnalytics('day');
                calculateAnalytics('week');
                calculateAnalytics('month');
              }}
              disabled={analyticsLoading}
              className="bg-neonCyan/20 border border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-gray-600/30">
          <TabsTrigger value="day" className="data-[state=active]:bg-neonCyan data-[state=active]:text-black">
            Today&apos;s Summary
          </TabsTrigger>
          <TabsTrigger value="week" className="data-[state=active]:bg-neonPink data-[state=active]:text-black">
            Last 7 Days
          </TabsTrigger>
          <TabsTrigger value="month" className="data-[state=active]:bg-purple-500 data-[state=active]:text-black">
            Last 30 Days
          </TabsTrigger>
        </TabsList>

        {/* Analytics Cards */}
        <TabsContent value={activeAnalyticsTab} className="space-y-6">
          {currentAnalytics && (
            <>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-black/70 backdrop-blur-md border border-neonCyan/50 hover:border-neonCyan transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Orders</p>
                        <p className="text-2xl font-bold text-white">{currentAnalytics.totalOrders}</p>
                      </div>
                      <ShoppingBag className="h-8 w-8 text-neonCyan" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/70 backdrop-blur-md border border-green-500/50 hover:border-green-500 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-white">R{currentAnalytics.totalRevenue.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/70 backdrop-blur-md border border-purple-500/50 hover:border-purple-500 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Avg Order Value</p>
                        <p className="text-2xl font-bold text-white">R{currentAnalytics.averageOrderValue.toFixed(2)}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/70 backdrop-blur-md border border-blue-500/50 hover:border-blue-500 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Completion Rate</p>
                        <p className="text-2xl font-bold text-white">
                          {currentAnalytics.totalOrders > 0 
                            ? Math.round((currentAnalytics.completedOrders / currentAnalytics.totalOrders) * 100) 
                            : 0}%
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Breakdown and Popular Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Breakdown */}
                <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Status Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(currentAnalytics.statusBreakdown).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-300'}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                          </div>
                          <span className="text-white font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Most Popular Items */}
                <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Most Popular Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentAnalytics.mostPopularItems.slice(0, 5).map((item, index) => (
                        <div key={item.name} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-neonCyan/20 text-neonCyan px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <span className="text-white text-sm">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{item.quantity} sold</div>
                            <div className="text-xs text-gray-400">R{item.revenue.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Orders Table Section */}
      <Card className="bg-black/70 backdrop-blur-md border border-gray-600/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Details
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-black/70 border-gray-600/50 text-gray-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-gray-600/50">
                  <SelectItem value="all">All Orders</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-600/20">
                <TableHead className="text-gray-300">Order ID</TableHead>
                <TableHead className="text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-300">Total</TableHead>
                <TableHead className="text-gray-300">Order Number</TableHead>
                <TableHead className="text-gray-300">Date & Time</TableHead>
                <TableHead className="text-gray-300">Items</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400 py-12">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingBag className="h-8 w-8 text-gray-500" />
                      <span>No orders found for the selected filter.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-b border-gray-600/10 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="font-mono text-sm">
                      {order.id.toString().slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{order.profiles?.full_name || 'Unknown Customer'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-400 font-medium">
                        R{order.total_amount?.toFixed(2) ?? '0.00'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-neonCyan">#{order.order_number}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-white">
                          {new Date(order.created_at || '').toLocaleDateString()}
                        </div>
                        <div className="text-gray-400">
                          {new Date(order.created_at || '').toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.order_items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-300">
                            {item.quantity}x {item.menu_items?.name || 'Unknown Item'}
                          </div>
                        ))}
                        {order.order_items && order.order_items.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{order.order_items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-300'}>
                        {order.status?.charAt(0).toUpperCase() + (order.status?.slice(1) || '')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => openOrderDetails(order)}
                          size="sm"
                          className="bg-blue-600/20 border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                              <EllipsisVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-black/90 border-gray-600/50">
                            <DropdownMenuItem className="p-0">
                              <Select
                                value={order.status || ''}
                                onValueChange={(value) =>
                                  handleUpdateStatus(
                                    order.id,
                                    value as (typeof statusOptions)[number]
                                  )
                                }
                              >
                                <SelectTrigger className="w-full bg-transparent border-none text-gray-300 focus:ring-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-gray-600/50">
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      Set to {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="bg-black/90 border border-gray-600 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-neonCyan" />
              Order Details - #{selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-400">Name:</span> {selectedOrder.profiles?.full_name || 'N/A'}</div>
                    <div><span className="text-gray-400">Phone:</span> {selectedOrder.profiles?.phone || 'N/A'}</div>
                    <div><span className="text-gray-400">Email:</span> {selectedOrder.profiles?.email || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Order Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-400">Order ID:</span> {selectedOrder.id}</div>
                    <div><span className="text-gray-400">Status:</span> 
                      <Badge className={`ml-2 ${statusColors[selectedOrder.status as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-300'}`}>
                        {selectedOrder.status?.charAt(0).toUpperCase() + (selectedOrder.status?.slice(1) || '')}
                      </Badge>
                    </div>
                    <div><span className="text-gray-400">Date:</span> {new Date(selectedOrder.created_at || '').toLocaleString()}</div>
                    <div><span className="text-gray-400">Payment Status:</span> {selectedOrder.payment_status || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-300 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="bg-neonCyan/20 text-neonCyan px-2 py-1 rounded text-xs font-medium">
                          {item.quantity}x
                        </span>
                        <span className="text-white">{item.menu_items?.name || 'Unknown Item'}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          R{((item.menu_items?.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          R{item.menu_items?.price?.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-300">Total Amount:</span>
                  <span className="text-green-400">R{selectedOrder.total_amount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.special_instructions && (
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Special Instructions</h4>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-200">{selectedOrder.special_instructions}</p>
                  </div>
                </div>
              )}

              {/* Quick Status Update */}
              <div className="flex gap-2 pt-4 border-t border-gray-600">
                <span className="text-gray-300 font-medium">Quick Status Update:</span>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, status);
                        setIsDetailsModalOpen(false);
                      }}
                      className={`${
                        selectedOrder.status === status
                          ? 'bg-neonCyan text-black'
                          : 'bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
