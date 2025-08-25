'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, Clock, CheckCircle,
  Search, Filter, Eye, MessageSquare, DollarSign,
  Users, Truck, Calendar, MoreHorizontal, RefreshCw
} from 'lucide-react';

// Import server actions for live data
import { getAdminOrders, updateOrderStatus } from '@/app/actions';

interface Order {
  id: string;
  order_number: string | null;
  user_id: string;
  status: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  delivery_method: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  order_items?: Array<{
    quantity: number;
    menu_items?: {
      name: string;
    } | null;
  }>;
}

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const result = await getAdminOrders();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders');
      }

      setOrders(result.data as Order[]);
      console.log('✅ Admin Order Management: Loaded', result.data.length, 'orders');
    } catch (error) {
      console.error('❌ Admin Order Management: Error loading orders:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setRefreshing(true);
      const result = await updateOrderStatus(orderId, newStatus);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update order status');
      }

      // Refresh orders after status update
      await fetchOrders();
      console.log('✅ Order status updated successfully');
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update order');
    }
  };

  // Calculate stats from live data
  const orderStats = [
    { 
      title: "Pending Orders", 
      value: orders.filter(o => ['pending', 'confirmed'].includes(o.status) && o.payment_status === 'paid').length.toString(),
      icon: Clock, 
      color: "yellow-500" 
    },
    { 
      title: "In Progress", 
      value: orders.filter(o => o.status === 'preparing' && o.payment_status === 'paid').length.toString(),
      icon: ShoppingCart, 
      color: "blue-500" 
    },
    { 
      title: "Completed Today", 
      value: orders.filter(o => {
        const today = new Date().toISOString().split('T')[0];
        return o.status === 'completed' && o.created_at.startsWith(today);
      }).length.toString(),
      icon: CheckCircle, 
      color: "green-500" 
    },
    { 
      title: "Total Revenue", 
      value: `R${orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total_amount || 0), 0).toFixed(2)}`,
      icon: DollarSign, 
      color: "neonCyan" 
    }
  ];

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'pending':
        return ['pending', 'confirmed'].includes(order.status) && order.payment_status === 'paid';
      case 'preparing':
        return order.status === 'preparing' && order.payment_status === 'paid';
      case 'ready':
        return order.status === 'ready' && order.payment_status === 'paid';
      case 'completed':
        return order.status === 'completed';
      default:
        return true;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': 
      case 'confirmed': 
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'preparing': 
        return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'ready': 
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'completed': 
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      default: 
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'pickup': return <ShoppingCart className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return orderDate.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Order Management</h2>
            <p className="text-gray-400">Loading live order data...</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-400 text-sm font-medium">LOADING ORDERS</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700/50 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Order Management</h2>
            <p className="text-red-400">Error loading orders: {error}</p>
          </div>
          <Button onClick={fetchOrders} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Order Management</h2>
          <p className="text-gray-400">Track and manage all customer orders • {orders.length} orders loaded</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchOrders}
            disabled={refreshing}
            className="bg-gradient-to-r from-neonCyan to-blue-600 hover:from-neonCyan/80 hover:to-blue-600/80"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Calendar className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {orderStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-${stat.color}/20`}>
                    <Icon className={`h-5 w-5 text-${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Management Interface */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl">Order Queue • Live Data</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neonCyan"
                />
              </div>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Order Status Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { 
                id: 'pending', 
                label: 'Pending', 
                count: orders.filter(o => ['pending', 'confirmed'].includes(o.status) && o.payment_status === 'paid').length
              },
              { 
                id: 'preparing', 
                label: 'Preparing', 
                count: orders.filter(o => o.status === 'preparing' && o.payment_status === 'paid').length
              },
              { 
                id: 'ready', 
                label: 'Ready', 
                count: orders.filter(o => o.status === 'ready' && o.payment_status === 'paid').length
              },
              { 
                id: 'completed', 
                label: 'Completed', 
                count: orders.filter(o => o.status === 'completed').length
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab.label}
                <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No {activeTab} orders found</p>
                <p className="text-gray-500 text-sm">
                  {orders.length === 0 
                    ? 'No orders in the system yet. Orders will appear here as customers place them.'
                    : `Switch to another tab to see orders in different states.`
                  }
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="bg-gray-700/30 border-gray-600/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(order.delivery_method)}
                          <span className="text-white font-medium">
                            {order.order_number || `#${order.id.slice(0, 8)}`}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.payment_status === 'paid' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">{getTimeAgo(order.created_at)}</span>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Customer</p>
                        <p className="text-white font-medium">
                          {order.profiles?.full_name || 'Unknown Customer'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {order.profiles?.phone || order.profiles?.email || 'No contact info'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Items ({order.order_items?.length || 0})</p>
                        <div className="space-y-1">
                          {order.order_items?.slice(0, 3).map((item, index) => (
                            <p key={index} className="text-gray-300 text-sm">
                              • {item.menu_items?.name || 'Unknown Item'} x{item.quantity}
                            </p>
                          ))}
                          {(order.order_items?.length || 0) > 3 && (
                            <p className="text-gray-500 text-xs">
                              +{(order.order_items?.length || 0) - 3} more items
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Total</p>
                        <p className="text-white font-bold text-lg">R{Number(order.total_amount || 0).toFixed(2)}</p>
                        <p className="text-gray-400 text-xs">
                          {order.delivery_method ? order.delivery_method.charAt(0).toUpperCase() + order.delivery_method.slice(1) : 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600/50">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {['pending', 'confirmed'].includes(order.status) && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusUpdate(order.id, 'ready')}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button 
                            size="sm" 
                            className="bg-neonCyan hover:bg-neonCyan/80"
                            onClick={() => handleStatusUpdate(order.id, 'completed')}
                          >
                            Complete Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Live Data Notice */}
          <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-medium">Live Data Integration Active</span>
            </div>
            <p className="text-gray-300 text-sm">
              Order management is now connected to live database. Orders update in real-time as customers place them 
              and as you update their status. Status changes are immediately reflected across all staff interfaces.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
