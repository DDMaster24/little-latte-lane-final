'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateOrderStatus, getAllOrdersForAdmin } from '@/app/actions';
import {
  RefreshCw, Search, Filter, Clock, ChefHat, Package,
  CheckCircle, AlertCircle, Eye, Phone, Mail, MapPin, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { NeonCoffeeCupLoader } from '@/components/LoadingComponents';

interface Order {
  id: string;
  user_id: string | null;
  status: string | null;
  payment_status: string | null;
  total_amount: number | null;
  created_at: string | null;
  updated_at: string | null;
  order_number: string | null;
  delivery_method?: string | null;
  special_instructions: string | null;
  order_items: {
    id: string;
    menu_item_id: string | null;
    quantity: number;
    price: number | null;
    special_instructions: string | null;
    menu_items: { name: string; category_id: string | null } | null;
  }[];
  profiles: { full_name: string | null; email: string | null; phone: string | null } | null;
}

interface OrderStats {
  dailyOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalOrdersForTimeFrame: number;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFrame, setTimeFrame] = useState('daily'); // daily, weekly, monthly, 3months, 6months, 1year, custom
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<OrderStats>({
    dailyOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalOrdersForTimeFrame: 0
  });

  const calculateStats = useCallback((orderData: Order[], currentTimeFrame = timeFrame) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Daily orders (always for today)
    const dailyOrders = orderData.filter(order => {
      const orderDate = new Date(order.created_at || '');
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
    
    // Pending and completed orders (across all time)
    const pendingOrders = orderData.filter(order => 
      ['pending', 'confirmed', 'preparing'].includes(order.status || '')
    ).length;
    
    const completedOrders = orderData.filter(order => 
      order.status === 'completed'
    ).length;

    // Time frame specific orders
    let timeFrameOrders = [];
    const now = new Date();
    
    switch (currentTimeFrame) {
      case 'daily':
        timeFrameOrders = dailyOrders;
        break;
      case 'weekly':
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        timeFrameOrders = orderData.filter(order => 
          new Date(order.created_at || '') >= weekAgo
        );
        break;
      case 'monthly':
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        timeFrameOrders = orderData.filter(order => 
          new Date(order.created_at || '') >= monthAgo
        );
        break;
      case '3months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        timeFrameOrders = orderData.filter(order => 
          new Date(order.created_at || '') >= threeMonthsAgo
        );
        break;
      case '6months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        timeFrameOrders = orderData.filter(order => 
          new Date(order.created_at || '') >= sixMonthsAgo
        );
        break;
      case '1year':
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        timeFrameOrders = orderData.filter(order => 
          new Date(order.created_at || '') >= yearAgo
        );
        break;
      case 'custom':
        // Custom month/year filtering for stats
        if (selectedMonth && selectedYear) {
          const monthNum = parseInt(selectedMonth);
          const yearNum = parseInt(selectedYear);
          timeFrameOrders = orderData.filter(order => {
            const orderDate = new Date(order.created_at || '');
            return orderDate.getMonth() === monthNum && orderDate.getFullYear() === yearNum;
          });
        } else {
          timeFrameOrders = orderData;
        }
        break;
      case 'all':
      default:
        timeFrameOrders = orderData;
        break;
    }

    setStats({
      dailyOrders: dailyOrders.length,
      pendingOrders,
      completedOrders,
      totalOrdersForTimeFrame: timeFrameOrders.length
    });
  }, [timeFrame, selectedMonth, selectedYear]);

  const fetchOrders = useCallback(async () => {
    try {
      const result = await getAllOrdersForAdmin();
      if (result.success) {
        setOrders(result.data);
        calculateStats(result.data);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    if (orders.length > 0) {
      calculateStats(orders);
    }
  }, [timeFrame, orders, calculateStats]);

  useEffect(() => {
    let filtered = orders;

    // Filter by timeframe first
    const now = new Date();
    switch (timeFrame) {
      case 'daily':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.created_at || '');
          return orderDate >= today && orderDate < tomorrow;
        });
        break;
      case 'weekly':
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        filtered = filtered.filter(order => 
          new Date(order.created_at || '') >= weekAgo
        );
        break;
      case 'monthly':
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        filtered = filtered.filter(order => 
          new Date(order.created_at || '') >= monthAgo
        );
        break;
      case '3months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        filtered = filtered.filter(order => 
          new Date(order.created_at || '') >= threeMonthsAgo
        );
        break;
      case '6months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        filtered = filtered.filter(order => 
          new Date(order.created_at || '') >= sixMonthsAgo
        );
        break;
      case '1year':
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        filtered = filtered.filter(order => 
          new Date(order.created_at || '') >= yearAgo
        );
        break;
      case 'custom':
        // Custom month/year filtering
        if (selectedMonth && selectedYear) {
          const monthNum = parseInt(selectedMonth);
          const yearNum = parseInt(selectedYear);
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at || '');
            return orderDate.getMonth() === monthNum && orderDate.getFullYear() === yearNum;
          });
        }
        break;
      case 'all':
      default:
        // No timeframe filtering - show all orders
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort by creation time (newest first)
    filtered = filtered.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, timeFrame, selectedMonth, selectedYear]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        toast.success(`Order updated to ${newStatus}`);
        fetchOrders(); // Refresh data
      } else {
        toast.error('Failed to update order status');
      }
    } catch (_error) {
      toast.error('Error updating order');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'confirmed': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'preparing': return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
      case 'ready': return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'completed': return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
      case 'cancelled': return 'bg-red-500/20 border-red-500/50 text-red-300';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'ready': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString('en-ZA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <NeonCoffeeCupLoader size="lg" text="Loading Little Latte Lane" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Management</h2>
          <p className="text-gray-400">Manage and track all customer orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            {[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: '3months', label: '3 Months' },
              { value: '6months', label: '6 Months' },
              { value: '1year', label: '1 Year' },
              { value: 'all', label: 'All Time' }
            ].map((option) => (
              <Button
                key={option.value}
                onClick={() => {
                  setTimeFrame(option.value);
                  if (option.value !== 'custom') {
                    setSelectedMonth('');
                    setSelectedYear('');
                  }
                }}
                variant={timeFrame === option.value ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 py-1 text-xs ${timeFrame === option.value ? 'bg-neonCyan text-black' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          {/* Custom Month/Year Selector */}
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={(value) => {
              setSelectedMonth(value);
              if (value && selectedYear) {
                setTimeFrame('custom');
              }
            }}>
              <SelectTrigger className="w-32 bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {[
                  { value: '0', label: 'January' },
                  { value: '1', label: 'February' },
                  { value: '2', label: 'March' },
                  { value: '3', label: 'April' },
                  { value: '4', label: 'May' },
                  { value: '5', label: 'June' },
                  { value: '6', label: 'July' },
                  { value: '7', label: 'August' },
                  { value: '8', label: 'September' },
                  { value: '9', label: 'October' },
                  { value: '10', label: 'November' },
                  { value: '11', label: 'December' }
                ].map((month) => (
                  <SelectItem key={month.value} value={month.value} className="text-white hover:bg-gray-700">
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear} onValueChange={(value) => {
              setSelectedYear(value);
              if (value && selectedMonth) {
                setTimeFrame('custom');
              }
            }}>
              <SelectTrigger className="w-24 bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={year.toString()} className="text-white hover:bg-gray-700">
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={fetchOrders} disabled={loading} className="neon-button">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Stats - Now 4 Cards Including Time Frame */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-neonCyan/10 to-neonCyan/5 border-neonCyan/20 hover:border-neonCyan/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Daily Orders</p>
                <p className="text-3xl font-bold text-white">{stats.dailyOrders}</p>
                <p className="text-xs text-neonCyan mt-1">Orders placed today</p>
              </div>
              <Users className="h-12 w-12 text-neonCyan" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-white">{stats.pendingOrders}</p>
                <p className="text-xs text-yellow-400 mt-1">Awaiting processing</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Completed Orders</p>
                <p className="text-3xl font-bold text-white">{stats.completedOrders}</p>
                <p className="text-xs text-green-400 mt-1">Successfully completed</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">
                  {timeFrame === 'daily' ? 'Today' : 
                   timeFrame === 'weekly' ? 'This Week' :
                   timeFrame === 'monthly' ? 'This Month' :
                   timeFrame === '3months' ? 'Last 3 Months' :
                   timeFrame === '6months' ? 'Last 6 Months' :
                   timeFrame === '1year' ? 'Last Year' : 'All Time'}
                </p>
                <p className="text-3xl font-bold text-white">{stats.totalOrdersForTimeFrame}</p>
                <p className="text-xs text-purple-400 mt-1">
                  Total orders in timeframe
                </p>
              </div>
              <Package className="h-12 w-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders by number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchOrders} className="neon-button">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">
                  Order #{order.order_number || order.id.slice(0, 8)}
                </CardTitle>
                <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                  {getStatusIcon(order.status)}
                  {order.status || 'pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{formatTime(order.created_at)}</span>
                <span className="font-medium text-neonCyan">{formatCurrency(order.total_amount || 0)}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-medium">
                    {order.profiles?.full_name || 'Walk-in Customer'}
                  </span>
                </div>
                {order.profiles?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{order.profiles.email}</span>
                  </div>
                )}
                {order.profiles?.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{order.profiles.phone}</span>
                  </div>
                )}
                {order.delivery_method && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <Badge variant="outline" className="text-xs">
                      {order.delivery_method === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-300">Items:</p>
                <div className="max-h-20 overflow-y-auto space-y-1">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-400">
                      {item.quantity}x {item.menu_items?.name || 'Unknown Item'}
                      {item.special_instructions && (
                        <div className="text-xs text-gray-500 ml-4">
                          Note: {item.special_instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {order.special_instructions && (
                <div className="p-2 bg-gray-700/50 rounded text-sm">
                  <p className="text-gray-300 font-medium">Special Instructions:</p>
                  <p className="text-gray-400">{order.special_instructions}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedOrder(order)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <Select
                    onValueChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                    disabled={updating === order.id}
                  >
                    <SelectTrigger className="flex-1 bg-neonCyan/10 border-neonCyan/30 text-neonCyan hover:bg-neonCyan/20">
                      <SelectValue placeholder={updating === order.id ? "Updating..." : "Update Status"} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-gray-400 mb-2">No Orders Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Orders will appear here when customers place them'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details Modal (simplified for now) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white">
                  Order Details #{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}
                </CardTitle>
                <Button
                  onClick={() => setSelectedOrder(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Status</p>
                  <Badge className={`${getStatusColor(selectedOrder.status)} mt-1`}>
                    {selectedOrder.status || 'pending'}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400">Total Amount</p>
                  <p className="text-white font-medium">{formatCurrency(selectedOrder.total_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Created</p>
                  <p className="text-white">{formatTime(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Payment Status</p>
                  <p className="text-white">{selectedOrder.payment_status || 'pending'}</p>
                </div>
              </div>
              
              {/* Full order details would go here */}
              <div className="space-y-2">
                <p className="text-gray-400 font-medium">Items:</p>
                {selectedOrder.order_items.map((item, idx) => (
                  <div key={idx} className="bg-gray-800/50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white">{item.quantity}x {item.menu_items?.name || 'Unknown Item'}</p>
                        {item.special_instructions && (
                          <p className="text-gray-400 text-sm mt-1">Note: {item.special_instructions}</p>
                        )}
                      </div>
                      <p className="text-neonCyan font-medium">{formatCurrency(item.price || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
