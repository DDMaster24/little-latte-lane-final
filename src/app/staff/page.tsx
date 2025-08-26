'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import OrderDetailsModal from '@/components/OrderDetailsModal';
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
  getStaffOrders, 
  getStaffOrderHistory,
  getStaffBookings, 
  getStaffStats
} from '../actions';
import { useMenu } from '@/hooks/useMenu';
import {
  LayoutDashboard,
  Package,
  ChefHat,
  ShoppingBag,
  Users,
  Clock,
  RefreshCw,
} from 'lucide-react';

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
  request_type: 'menu_item' | 'general_item';
  category_id?: string;
  menu_item_id?: string;
  menu_item_name?: string;
  general_item_name?: string;
  description: string;
  priority: string;
  quantity_needed?: string;
}

type TabType = 'overview' | 'stock-requests';

export default function StaffPanel() {
  const { profile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [_bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [stats, setStats] = useState({
    activeOrders: 0,
    confirmedOrders: 0,
    inProgressOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
  });

  const stockRequestForm = useForm<StockRequest>();
  const { categories, menuItems } = useMenu();

  // Define data fetching functions using server actions
  const fetchOrders = useCallback(async () => {
    try {
      console.log('🔄 Staff Panel: Fetching orders via server action...');
      const result = await getStaffOrders();
      
      if (!result.success) {
        console.error('❌ Staff Panel: Error fetching orders:', result.error);
        toast.error('Failed to fetch orders');
        return;
      }

      console.log(`✅ Staff Panel: Fetched ${result.data.length} orders at ${new Date().toLocaleTimeString()}`);
      setOrders(result.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('💥 Staff Panel: Unexpected error fetching orders:', error);
      toast.error('Unexpected error occurred');
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      console.log('🔄 Staff Panel: Fetching bookings via server action...');
      const result = await getStaffBookings();
      
      if (!result.success) {
        console.error('❌ Staff Panel: Error fetching bookings:', result.error);
        toast.error('Failed to fetch bookings');
        return;
      }

      console.log(`✅ Staff Panel: Fetched ${result.data.length} bookings`);
      setBookings(result.data);
    } catch (error) {
      console.error('💥 Staff Panel: Unexpected error fetching bookings:', error);
      toast.error('Unexpected error occurred');
    }
  }, []);

  const fetchOrderHistory = useCallback(async () => {
    try {
      console.log('🔄 Staff Panel: Fetching order history via server action...');
      const result = await getStaffOrderHistory();
      
      if (!result.success) {
        console.error('❌ Staff Panel: Error fetching order history:', result.error);
        toast.error('Failed to fetch order history');
        return;
      }

      console.log(`✅ Staff Panel: Fetched ${result.data.length} completed orders`);
      setOrderHistory(result.data);
    } catch (error) {
      console.error('💥 Staff Panel: Unexpected error fetching order history:', error);
      toast.error('Unexpected error occurred');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      console.log('🔄 Staff Panel: Fetching stats via server action...');
      const result = await getStaffStats();
      
      if (!result.success) {
        console.error('❌ Staff Panel: Error fetching stats:', result.error);
        return;
      }

      console.log('✅ Staff Panel: Fetched stats:', result.data);
      setStats(result.data);
    } catch (error) {
      console.error('💥 Staff Panel: Unexpected error fetching stats:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    await Promise.all([fetchOrders(), fetchOrderHistory(), fetchBookings(), fetchStats()]);
  }, [fetchOrders, fetchOrderHistory, fetchBookings, fetchStats]);

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

    // 🍳 KITCHEN-ONLY STAFF ACCESS: Redirect staff-only users to kitchen view
    // Only admins can access the full staff dashboard
    if (profile.is_staff && !profile.is_admin) {
      console.log('🍳 Staff user detected - redirecting to kitchen view...');
      router.push('/staff/kitchen-view');
      return;
    }

    // Initial data fetch (only for admins)
    const initializeData = async () => {
      await fetchData();
      setLoading(false);
    };

    initializeData();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [profile, router, fetchData]);

  const handleStockRequest = async (data: StockRequest) => {
    try {
      // For now, we'll just show a toast. Later we can implement actual database storage
      const itemName = data.request_type === 'menu_item' 
        ? data.menu_item_name || 'Unknown menu item'
        : data.general_item_name || 'Unknown item';
      toast.success(`Stock request submitted: ${itemName}`);
      stockRequestForm.reset();
    } catch (error) {
      console.error('Error submitting stock request:', error);
      toast.error('Failed to submit stock request');
    }
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Restaurant Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: RefreshCw,
      action: fetchData,
    },
    {
      id: 'stock-requests',
      label: 'Stock Requests',
      icon: Package,
    },
  ];

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Enhanced Status Cards Section with Restaurant Overview Header */}
      <div 
        className="bg-black/40 backdrop-blur-md border border-neonCyan/30 p-8 rounded-xl shadow-lg"
        style={{ 
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 255, 255, 0.05)'
        }}
      >
        {/* Restaurant Overview Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neonCyan mb-2">Restaurant Overview</h2>
          <p className="text-neonText/70">Live order status tracking and management</p>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Orders */}
        <div
          className="group relative bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonCyan/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon"
          style={{ 
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 255, 255, 0.05)'
          }}
        >
          <div className="w-full h-16 bg-gradient-to-br from-neonCyan/10 to-neonCyan/20 backdrop-blur-sm rounded-lg mb-4 flex items-center justify-center group-hover:from-neonCyan/20 group-hover:to-neonCyan/30 transition-all duration-300 border border-neonCyan/20">
            <ShoppingBag className="w-8 h-8 text-neonCyan" />
          </div>
          <h3 className="text-neonCyan font-semibold text-center text-lg mb-2">Active Orders</h3>
          <p className="text-3xl font-bold text-neonCyan text-center mb-2">{stats.activeOrders}</p>
          <p className="text-gray-300 text-sm text-center">All current orders</p>
        </div>

        {/* Confirmed Orders */}
        <div
          className="group relative bg-black/20 backdrop-blur-md border border-yellow-400/30 hover:border-yellow-400/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon"
          style={{ 
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(255, 193, 7, 0.1), inset 0 0 20px rgba(255, 193, 7, 0.05)'
          }}
        >
          <div className="w-full h-16 bg-gradient-to-br from-yellow-400/10 to-yellow-400/20 backdrop-blur-sm rounded-lg mb-4 flex items-center justify-center group-hover:from-yellow-400/20 group-hover:to-yellow-400/30 transition-all duration-300 border border-yellow-400/20">
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-yellow-400 font-semibold text-center text-lg mb-2">Confirmed</h3>
          <p className="text-3xl font-bold text-yellow-400 text-center mb-2">{stats.confirmedOrders}</p>
          <p className="text-gray-300 text-sm text-center">Awaiting kitchen action</p>
        </div>

        {/* In Progress Orders */}
        <div
          className="group relative bg-black/20 backdrop-blur-md border border-orange-400/30 hover:border-orange-400/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon"
          style={{ 
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(255, 152, 0, 0.1), inset 0 0 20px rgba(255, 152, 0, 0.05)'
          }}
        >
          <div className="w-full h-16 bg-gradient-to-br from-orange-400/10 to-orange-400/20 backdrop-blur-sm rounded-lg mb-4 flex items-center justify-center group-hover:from-orange-400/20 group-hover:to-orange-400/30 transition-all duration-300 border border-orange-400/20">
            <ChefHat className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-orange-400 font-semibold text-center text-lg mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-orange-400 text-center mb-2">{stats.inProgressOrders}</p>
          <p className="text-gray-300 text-sm text-center">Being prepared</p>
        </div>

        {/* Ready Orders */}
        <div
          className="group relative bg-black/20 backdrop-blur-md border border-green-400/30 hover:border-green-400/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon"
          style={{ 
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(76, 175, 80, 0.1), inset 0 0 20px rgba(76, 175, 80, 0.05)'
          }}
        >
          <div className="w-full h-16 bg-gradient-to-br from-green-400/10 to-green-400/20 backdrop-blur-sm rounded-lg mb-4 flex items-center justify-center group-hover:from-green-400/20 group-hover:to-green-400/30 transition-all duration-300 border border-green-400/20">
            <Package className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-green-400 font-semibold text-center text-lg mb-2">Ready</h3>
          <p className="text-3xl font-bold text-green-400 text-center mb-2">{stats.readyOrders}</p>
          <p className="text-gray-300 text-sm text-center">Awaiting pickup</p>
        </div>

        {/* Completed Orders */}
        <div
          className="group relative bg-black/20 backdrop-blur-md border border-neonPink/30 hover:border-neonPink/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon"
          style={{ 
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)'
          }}
        >
          <div className="w-full h-16 bg-gradient-to-br from-neonPink/10 to-neonPink/20 backdrop-blur-sm rounded-lg mb-4 flex items-center justify-center group-hover:from-neonPink/20 group-hover:to-neonPink/30 transition-all duration-300 border border-neonPink/20">
            <Users className="w-8 h-8 text-neonPink" />
          </div>
          <h3 className="text-neonPink font-semibold text-center text-lg mb-2">Completed</h3>
          <p className="text-3xl font-bold text-neonPink text-center mb-2">{stats.completedOrders}</p>
          <p className="text-gray-300 text-sm text-center">Today&apos;s finished</p>
        </div>
        </div>
      </div>

      {/* Split Orders Panel - Current Orders (Left) and Order History (Right) */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Orders (Left) */}
        <div
          className="bg-black/20 backdrop-blur-md border border-neonCyan/30 p-6 rounded-xl shadow-lg"
          style={{ 
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 255, 255, 0.05)'
          }}
        >
          <h3 className="text-xl font-semibold text-neonCyan mb-4">Current Orders</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
              <p className="text-gray-400">No active orders</p>
              <p className="text-sm text-gray-500 mt-2">Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="bg-darkBg/40 backdrop-blur-sm border border-neonPink/20 rounded-lg p-4 hover:border-neonPink/40 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-neonText">
                        {order.order_number || `Order #${order.id.slice(0, 8)}...`}
                      </h4>
                      <p className="text-sm text-gray-400">{order.profiles?.email || 'Unknown Customer'}</p>
                      <p className="text-sm text-gray-400">
                        {order.order_items?.length || 0} items • R{order.total_amount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${
                          order.status === 'confirmed' ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' :
                          order.status === 'preparing' ? 'bg-orange-400/20 text-orange-400 border-orange-400/30' :
                          order.status === 'ready' ? 'bg-green-400/20 text-green-400 border-green-400/30' :
                          'bg-neonCyan/20 text-neonCyan border-neonCyan/30'
                        }`}
                      >
                        {order.status || 'Unknown'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewOrder(order)}
                        className="text-neonCyan hover:text-neonPink hover:bg-neonCyan/10 border border-neonCyan/30 hover:border-neonPink/30"
                      >
                        View Order
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length > 5 && (
                <div className="text-center pt-4">
                  <Button
                    onClick={() => router.push('/staff/kitchen-view')}
                    variant="ghost"
                    className="text-neonCyan hover:text-neonPink"
                  >
                    View all {orders.length} orders in Kitchen View →
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order History (Right) */}
        <div
          className="bg-black/20 backdrop-blur-md border border-neonPink/30 p-6 rounded-xl shadow-lg"
          style={{ 
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)'
          }}
        >
          <h3 className="text-xl font-semibold text-neonPink mb-4">Order History</h3>
          {orderHistory.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
              <p className="text-gray-400">No completed orders today</p>
              <p className="text-sm text-gray-500 mt-2">Completed orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderHistory.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="bg-darkBg/40 backdrop-blur-sm border border-green-400/20 rounded-lg p-4 hover:border-green-400/40 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-neonText">
                        {order.order_number || `Order #${order.id.slice(0, 8)}...`}
                      </h4>
                      <p className="text-sm text-gray-400">{order.profiles?.email || 'Unknown Customer'}</p>
                      <p className="text-sm text-gray-400">
                        {order.order_items?.length || 0} items • R{order.total_amount?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Completed: {new Date(order.updated_at || order.created_at || '').toLocaleTimeString('en-ZA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                        {order.status || 'Completed'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewOrder(order)}
                        className="text-neonPink hover:text-neonCyan hover:bg-neonPink/10 border border-neonPink/30 hover:border-neonCyan/30"
                      >
                        View Order
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {orderHistory.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-400">
                    Showing 5 of {orderHistory.length} completed orders today
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStockRequestsTab = () => (
    <div className="space-y-6">
      {/* Stock Request Form Container */}
      <div 
        className="bg-black/40 backdrop-blur-md border border-neonCyan/30 p-6 rounded-xl shadow-lg"
        style={{ 
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 255, 255, 0.05)'
        }}
      >
        <Card className="bg-darkBg/60 backdrop-blur-md border-2 border-neonCyan/50 shadow-neon">
          <CardHeader>
            <CardTitle className="text-neonCyan text-xl font-bold">Request Stock from Admin</CardTitle>
            <CardDescription>Submit requests for inventory items that are running low</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={stockRequestForm.handleSubmit(handleStockRequest)}
              className="space-y-4"
            >
              {/* Request Type Selection */}
              <div>
                <label className="block text-sm font-medium text-neonText mb-2">
                  Request Type
                </label>
                <Select
                  onValueChange={(value: 'menu_item' | 'general_item') => {
                    stockRequestForm.setValue('request_type', value);
                    // Reset related fields when type changes
                    stockRequestForm.setValue('category_id', '');
                    stockRequestForm.setValue('menu_item_id', '');
                    stockRequestForm.setValue('menu_item_name', '');
                    stockRequestForm.setValue('general_item_name', '');
                  }}
                >
                  <SelectTrigger className="bg-darkBg/80 backdrop-blur-sm border-neonPink/50 text-neonPink focus:border-neonCyan focus:ring-neonCyan/20">
                    <SelectValue placeholder="Choose request type" />
                  </SelectTrigger>
                  <SelectContent className="bg-darkBg/95 backdrop-blur-lg border-neonPink/50">
                    <SelectItem value="menu_item">📋 Menu Item (from our menu)</SelectItem>
                    <SelectItem value="general_item">📦 General Item (supplies/ingredients)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selection - Only for menu items */}
              {stockRequestForm.watch('request_type') === 'menu_item' && (
                <div>
                  <label className="block text-sm font-medium text-neonText mb-2">
                    Menu Category
                  </label>
                  <Select
                    onValueChange={(value) => {
                      stockRequestForm.setValue('category_id', value);
                      // Reset menu item when category changes
                      stockRequestForm.setValue('menu_item_id', '');
                      stockRequestForm.setValue('menu_item_name', '');
                    }}
                  >
                    <SelectTrigger className="bg-darkBg/80 backdrop-blur-sm border-neonPink/50 text-neonPink focus:border-neonCyan focus:ring-neonCyan/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkBg/95 backdrop-blur-lg border-neonPink/50">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Menu Item Selection - Only when category is selected */}
              {stockRequestForm.watch('request_type') === 'menu_item' && 
               stockRequestForm.watch('category_id') && (
                <div>
                  <label className="block text-sm font-medium text-neonText mb-2">
                    Menu Item
                  </label>
                  <Select
                    onValueChange={(value) => {
                      const selectedItem = menuItems.find(item => item.id === value);
                      stockRequestForm.setValue('menu_item_id', value);
                      stockRequestForm.setValue('menu_item_name', selectedItem?.name || '');
                    }}
                  >
                    <SelectTrigger className="bg-darkBg/80 backdrop-blur-sm border-neonPink/50 text-neonPink focus:border-neonCyan focus:ring-neonCyan/20">
                      <SelectValue placeholder="Select menu item" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkBg/95 backdrop-blur-lg border-neonPink/50">
                      {menuItems
                        .filter(item => item.category_id === stockRequestForm.watch('category_id'))
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - R{item.price}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* General Item Name - Only for general items */}
              {stockRequestForm.watch('request_type') === 'general_item' && (
                <div>
                  <label className="block text-sm font-medium text-neonText mb-2">
                    Item Name
                  </label>
                  <Input
                    {...stockRequestForm.register('general_item_name', { required: true })}
                    placeholder="e.g., Tomatoes, Coffee Beans, Paper Towels"
                    className="bg-darkBg/80 backdrop-blur-sm border-neonPink/50 text-neonPink placeholder:text-neonPink/50 focus:border-neonCyan focus:ring-neonCyan/20"
                  />
                </div>
              )}

              {/* Quantity Needed */}
              <div>
                <label className="block text-sm font-medium text-neonText mb-2">
                  Quantity Needed
                </label>
                <Input
                  {...stockRequestForm.register('quantity_needed')}
                  placeholder="e.g., 10 kg, 2 cases, 1 box"
                  className="bg-darkBg/80 backdrop-blur-sm border-neonPink/50 text-neonPink placeholder:text-neonPink/50 focus:border-neonCyan focus:ring-neonCyan/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neonText mb-2">
                  Description / Additional Details
                </label>
                <Input
                  {...stockRequestForm.register('description', { required: true })}
                  placeholder="Specific brand, supplier preference, usage notes"
                  className="bg-darkBg/80 backdrop-blur-sm border-neonPink/50 text-neonPink placeholder:text-neonPink/50 focus:border-neonCyan focus:ring-neonCyan/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neonText mb-2">
                  Priority Level
                </label>
                <Select
                  onValueChange={(value) => stockRequestForm.setValue('priority', value)}
                >
                  <SelectTrigger className="bg-darkBg/80 backdrop-blur-sm border-neonPink/50 text-neonPink focus:border-neonCyan focus:ring-neonCyan/20">
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent className="bg-darkBg/95 backdrop-blur-lg border-neonPink/50">
                    <SelectItem value="low">Low - Can wait a few days</SelectItem>
                    <SelectItem value="medium">Medium - Needed within 1-2 days</SelectItem>
                    <SelectItem value="high">High - Needed today</SelectItem>
                    <SelectItem value="urgent">Urgent - Critical shortage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-neonCyan text-black hover:bg-neonCyan/80 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all duration-300 font-medium"
              >
                <Package className="h-4 w-4 mr-2" />
                Submit Stock Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Previous Requests Container */}
      <div 
        className="bg-black/40 backdrop-blur-md border border-neonCyan/30 p-6 rounded-xl shadow-lg"
        style={{ 
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 255, 255, 0.05)'
        }}
      >
        <Card className="bg-darkBg/60 backdrop-blur-md border-2 border-purple-400/50">
          <CardHeader>
            <CardTitle className="text-purple-400">Recent Stock Requests</CardTitle>
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
      <div className="bg-gray-900">
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
                className="bg-darkBg/80 backdrop-blur-sm border border-neonCyan/50 text-neonCyan hover:bg-neonCyan/10 hover:border-neonCyan px-6 py-3 rounded-lg transition-all duration-300"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Kitchen View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Centered with consistent styling */}
      <div className="bg-darkBg">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex justify-center items-center space-x-4 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isRefreshButton = tab.id === 'refresh';
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => {
                    if (isRefreshButton) {
                      tab.action?.();
                    } else {
                      setActiveTab(tab.id as TabType);
                    }
                  }}
                  disabled={isRefreshButton && loading}
                  className={`flex items-center space-x-2 px-8 py-4 rounded-xl transition-all duration-300 whitespace-nowrap font-semibold border border-transparent ${
                    isActive && !isRefreshButton
                      ? 'bg-neonCyan/10 text-neonCyan border-neonCyan/30 shadow-[0_0_10px_rgba(0,255,255,0.3)]'
                      : isRefreshButton
                      ? 'bg-neonPink/10 text-neonPink border-neonPink/30 hover:bg-neonPink/20 hover:shadow-[0_0_15px_rgba(255,20,147,0.5)]'
                      : 'text-neonText hover:text-neonPink hover:bg-neonPink/10 hover:border-neonPink/30'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isRefreshButton && loading ? 'animate-spin' : ''}`} />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{renderTabContent()}</main>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
      />
    </div>
  );
}
