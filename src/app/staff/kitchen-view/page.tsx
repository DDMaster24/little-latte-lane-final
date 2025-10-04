'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getStaffOrders, updateOrderStatus } from '@/app/actions';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sendOrderStatusNotification } from '@/lib/sendOrderStatusNotification';
import {
  RefreshCw,
  Clock,
  ChefHat,
  Package,
  CheckCircle,
  Timer,
  Volume2,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { OrderCardSkeleton } from '@/components/ui/loading-skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import toast from 'react-hot-toast';

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
  delivery_address?: string;
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

export default function KitchenView() {
  const { profile } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Simplified Kitchen State
  const [soundEnabled] = useState(true); // Always enabled as requested
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [showAllOrdersView, setShowAllOrdersView] = useState(false);
  const [timeFrame, setTimeFrame] = useState<'today' | 'week'>('today');

  const fetchOrders = useCallback(async () => {
    try {
      console.log('🍳 Kitchen View: Fetching orders...');
      const result = await getStaffOrders();
      
      if (!result.success) {
        console.error('❌ Kitchen View: Error fetching orders:', result.error);
        toast.error('Failed to fetch orders');
        return;
      }

      console.log(`🍳 Kitchen View: Fetched ${result.data.length} orders at ${new Date().toLocaleTimeString()}`);
      
      // Phase 3 Part 3: New order detection and sound notification
      const currentOrderCount = result.data.length;
      if (previousOrderCount > 0 && currentOrderCount > previousOrderCount && soundEnabled) {
        // New order detected - play sound notification
        setNewOrderCount(currentOrderCount - previousOrderCount);
        try {
          // Create audio context for sound notification
          const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
          const audioContext = new AudioContext();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          
          toast.success(`🔔 ${currentOrderCount - previousOrderCount} new order(s) received!`, {
            duration: 4000,
            style: {
              background: '#10b981',
              color: 'white',
            },
          });
        } catch (error) {
          console.log('Audio notification not available:', error);
        }
        
        // Reset new order count after 5 seconds
        setTimeout(() => setNewOrderCount(0), 5000);
      }
      
      setPreviousOrderCount(currentOrderCount);
      // Map data to convert null to undefined for delivery_address
      const mappedOrders = result.data.map(order => ({
        ...order,
        delivery_address: order.delivery_address || undefined
      }));
      setOrders(mappedOrders);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('💥 Kitchen View: Unexpected error:', error);
      toast.error('Unexpected error occurred');
    }
  }, [previousOrderCount, soundEnabled]);

  useEffect(() => {
    if (!profile?.is_staff && !profile?.is_admin) {
      router.push('/');
      return;
    }

    const initializeData = async () => {
      await fetchOrders();
      setLoading(false);
    };

    initializeData();

    // Auto-refresh every 15 seconds for kitchen operations
    const interval = setInterval(fetchOrders, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [profile, router, fetchOrders]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // Find the order to get customer details
      const order = orders.find(o => o.id === id);
      
      const result = await updateOrderStatus(id, newStatus);
      
      if (!result.success) {
        toast.error('Failed to update order status');
        console.error('❌ Kitchen View: Error updating order:', result.error);
        return;
      }

      toast.success(`Order moved to ${newStatus}`);
      
      // Send push notification when order is ready
      if (newStatus === 'ready' && order?.user_id) {
        console.log('📬 Sending notification for order ready:', order.order_number);
        
        // Send notification asynchronously (don't block UI)
        sendOrderStatusNotification({
          user_id: order.user_id,
          order_id: order.id,
          order_number: order.order_number || order.id.slice(0, 8),
          status: 'ready',
          customer_name: order.profiles?.full_name || undefined,
          total_amount: order.total_amount || undefined,
        })
          .then((notificationResult) => {
            if (notificationResult.success) {
              console.log('✅ Notification sent successfully');
              // Show subtle success indicator
              toast.success('📲 Customer notified!', {
                duration: 3000,
                style: {
                  background: '#10b981',
                  color: 'white',
                },
              });
            } else {
              console.warn('⚠️ Notification failed:', notificationResult.message);
              // Don't show error to kitchen staff - notification failure shouldn't block workflow
            }
          })
          .catch((error) => {
            console.error('💥 Notification error:', error);
            // Silent fail - don't interrupt kitchen workflow
          });
      }
      
      fetchOrders(); // Refresh immediately
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('💥 Kitchen View: Unexpected error updating order:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleViewAllOrders = () => {
    // Toggle the all orders view
    setShowAllOrdersView(!showAllOrdersView);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'draft':
        return 'bg-neonCyan/20 border-neonCyan/50 text-neonCyan';
      case 'ready':
        return 'bg-emerald-400/20 border-emerald-400/50 text-emerald-300';
      case 'completed':
        return 'bg-purple-400/20 border-purple-400/50 text-purple-300';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Timer className="w-4 h-4" />;
    }
  };

  const formatOrderTime = (created_at: string | null) => {
    if (!created_at) return 'Unknown time';
    const orderTime = new Date(created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      return orderTime.toLocaleTimeString('en-ZA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getProgressiveButtons = (currentStatus: string | null) => {
    const buttons = [
      { 
        label: 'New Order', 
        value: 'draft', 
        icon: '📝',
        bgColor: 'bg-neonCyan/20 border-neonCyan/50',
        textColor: 'text-neonCyan',
        hoverColor: 'hover:bg-neonCyan/30'
      },
      { 
        label: 'Ready', 
        value: 'ready', 
        icon: '✅',
        bgColor: 'bg-emerald-400/20 border-emerald-400/50',
        textColor: 'text-emerald-300',
        hoverColor: 'hover:bg-emerald-400/30'
      },
      { 
        label: 'Completed', 
        value: 'completed', 
        icon: '🎉',
        bgColor: 'bg-purple-400/20 border-purple-400/50',
        textColor: 'text-purple-300',
        hoverColor: 'hover:bg-purple-400/30'
      }
    ];

    return buttons.map(button => ({
      ...button,
      isActive: currentStatus === button.value,
      isClickable: getNextClickableStatuses(currentStatus).includes(button.value)
    }));
  };

  const getNextClickableStatuses = (currentStatus: string | null) => {
    switch (currentStatus) {
      case 'draft':
        return ['ready'];
      case 'ready':
        return ['completed'];
      case 'completed':
        return []; // No further progression
      default:
        return ['draft', 'ready']; // Allow setting initial status
    }
  };

  // Phase 3 Part 3: Kitchen workflow utilities
  const isOrderUrgent = (order: Order) => {
    if (!order.created_at) return false;
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    // Orders are urgent if they've been waiting more than 20 minutes or are marked as ready
    return diffMinutes > 20 || order.status === 'ready';
  };

  const getFilteredOrders = () => {
    // Sort by creation time (oldest first) for proper FIFO queue
    return orders.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeA - timeB; // Oldest first
    });
  };

  const getActiveOrders = () => {
    // Orders that need kitchen work: draft orders (exclude ready to prevent duplicates)
    return getFilteredOrders().filter(order => 
      ['draft'].includes(order.status || '')
    );
  };

  const getReadyOrders = () => {
    // Show only orders that are ready for pickup/delivery
    // Remove completed orders from kitchen view as requested
    return orders
      .filter(order => order.status === 'ready')
      .sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
        return timeB - timeA; // Most recently ready first
      });
  };

  // Get all orders for the current day
  const getAllOrdersToday = () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    return orders
      .filter(order => {
        const orderDate = new Date(order.created_at || 0);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA; // Most recent first
      });
  };

  // Get all orders for the previous week
  const getAllOrdersThisWeek = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return orders
      .filter(order => {
        const orderDate = new Date(order.created_at || 0);
        return orderDate >= weekAgo;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA; // Most recent first
      });
  };

  // Get orders based on selected timeframe
  const getOrdersByTimeFrame = () => {
    return timeFrame === 'today' ? getAllOrdersToday() : getAllOrdersThisWeek();
  };

  // Render All Orders View
  const renderAllOrdersView = () => {
    const filteredOrders = getOrdersByTimeFrame();
    
    return (
      <div className="min-h-screen bg-darkBg text-neonText">
        {/* All Orders Header */}
        <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
          <div className="max-w-full px-4 py-3">
            <div className="flex justify-between items-center">
              {/* Back to Kitchen View */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowAllOrdersView(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Kitchen
                </Button>
                <h1 className="text-2xl font-bold text-white">
                  📋 All Orders {timeFrame === 'today' ? 'Today' : 'This Week'}
                </h1>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/50">
                  {filteredOrders.length} orders
                </Badge>
              </div>
              
              {/* Header Controls */}
              <div className="flex items-center gap-3">
                {/* Time Frame Selector */}
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <Button
                    onClick={() => setTimeFrame('today')}
                    variant={timeFrame === 'today' ? 'default' : 'ghost'}
                    size="sm"
                    className={`text-xs px-3 py-1 ${
                      timeFrame === 'today' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    Today
                  </Button>
                  <Button
                    onClick={() => setTimeFrame('week')}
                    variant={timeFrame === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    className={`text-xs px-3 py-1 ${
                      timeFrame === 'week' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    This Week
                  </Button>
                </div>
                
                <div className="text-sm text-gray-400">
                  {timeFrame === 'today' 
                    ? new Date().toLocaleDateString('en-ZA', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : `Past 7 days`
                  }
                </div>
                <Button
                  onClick={fetchOrders}
                  disabled={loading}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 mx-auto mb-6 text-gray-400 opacity-50" />
              <h3 className="text-xl text-gray-400 mb-2">No Orders {timeFrame === 'today' ? 'Today' : 'This Week'}</h3>
              <p className="text-gray-500">Orders will appear here as they come in</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order: Order) => (
                <div
                  key={order.id}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Order #{order.order_number || order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formatOrderTime(order.created_at)} • {order.profiles?.full_name || order.profiles?.email?.split('@')[0] || 'Walk-in'}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} px-3 py-1`}>
                        {order.status || 'pending'}
                      </Badge>
                      <Badge className={`px-3 py-1 ${
                        order.delivery_method === 'delivery' 
                          ? 'bg-blue-600/20 border-blue-600/50 text-blue-300'
                          : 'bg-green-600/20 border-green-600/50 text-green-300'
                      }`}>
                        {order.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        R{order.total_amount?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {order.order_items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 mb-2">
                        Items: {order.order_items?.slice(0, 3).map(item => 
                          `${item.quantity}x ${item.menu_items?.name || 'Item'}`
                        ).join(', ')}
                        {order.order_items && order.order_items.length > 3 && ` +${order.order_items.length - 3} more`}
                      </p>
                      {order.special_instructions && (
                        <p className="text-xs text-yellow-400 italic">
                          Note: {order.special_instructions}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleViewOrder(order)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-darkBg text-neonText overflow-hidden">
        {/* Header Skeleton */}
        <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 fixed top-0 left-0 right-0 z-50">
          <div className="max-w-full px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-32 h-6 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-3">
                <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Skeletons */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 p-4 sm:p-6 pt-20">
          <div className="flex-1 xl:w-2/3">
            <div className="text-center mb-6">
              <div className="w-32 h-8 bg-gray-700 rounded animate-pulse mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <OrderCardSkeleton key={i} />
              ))}
            </div>
          </div>
          
          <div className="xl:w-1/3 xl:border-l xl:border-gray-700 xl:pl-6">
            <div className="text-center mb-4">
              <div className="w-32 h-6 bg-gray-700 rounded animate-pulse mx-auto"></div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                  <div className="w-full h-16 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile?.is_staff && !profile?.is_admin) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <p className="text-neonPink text-xl">Access Denied</p>
          <p className="text-gray-400">Staff privileges required</p>
        </div>
      </div>
    );
  }

  // Show All Orders view if toggled
  if (showAllOrdersView) {
    return (
      <ErrorBoundary>
        {renderAllOrdersView()}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <div className="h-screen bg-darkBg text-neonText overflow-hidden">
      {/* Streamlined Kitchen Header - Fixed to top */}
      <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-full px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Kitchen Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                🍳 Kitchen View
              </h1>
              {newOrderCount > 0 && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  +{newOrderCount} NEW
                </Badge>
              )}
            </div>
            
            {/* Essential Controls */}
            <div className="flex items-center gap-3">
              {/* Last Update Time */}
              {lastUpdate && (
                <div className="text-sm text-gray-400">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              
              {/* All Orders View Button */}
              <Button
                onClick={handleViewAllOrders}
                variant="outline"
                className="bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white hover:border-purple-600 text-sm font-medium transition-all duration-300"
              >
                📋 All Orders
              </Button>
              
              {/* Sound Button (Always On) */}
              <Button
                variant="ghost"
                className="text-gray-300 p-2"
                title="Sound notifications are active"
              >
                <Volume2 className="w-5 h-5 text-green-400" />
              </Button>

              {/* Refresh Button */}
              <Button
                onClick={fetchOrders}
                disabled={loading}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {/* Logout Button */}
              <Button
                onClick={async () => {
                  try {
                    const { getSupabaseClient } = await import('@/lib/supabase-client');
                    const supabase = getSupabaseClient();
                    
                    // Sign out the user
                    await supabase.auth.signOut();
                    
                    // Clear any local storage
                    if (typeof window !== 'undefined') {
                      localStorage.clear();
                      sessionStorage.clear();
                    }
                    
                    // Redirect to home page
                    router.push('/');
                    
                    toast.success('Logged out successfully');
                  } catch (error) {
                    console.error('Logout error:', error);
                    toast.error('Failed to logout');
                  }
                }}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Split Layout: Active Orders (Left) + Completed Orders (Right) */}
      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 p-4 sm:p-6 pt-20">{/* Added pt-20 for fixed header space */}
        {/* Left Side - Active Orders */}
        <div className="flex-1 xl:w-2/3">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Orders</h2>
          </div>
          
          {getActiveOrders().length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-gray-400 opacity-50" />
              <h3 className="text-lg sm:text-xl text-gray-400 mb-2">No Active Orders</h3>
              <p className="text-gray-500 text-sm">Orders will appear here as they come in</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
              {getActiveOrders().map((order, index) => (
                <div
                  key={order.id}
                  className="group relative border rounded-lg p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-black border-gray-700"
                  style={{ 
                    minHeight: `${
                      200 + // Base height
                      (order.order_items?.length > 3 ? (order.order_items.length - 3) * 15 : 0) + // Extra for items
                      (order.special_instructions ? 30 : 0) + // Extra for special instructions
                      ((order.profiles?.full_name || '').length > 20 ? 15 : 0) // Extra for long names
                    }px` 
                  }}
                >
                  {/* Priority Indicator */}
                  {isOrderUrgent(order) && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                      !
                    </div>
                  )}

                  {/* Position Number - Top Left Corner */}
                  <div className={`absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 ${isOrderUrgent(order) ? 'bg-red-600' : 'bg-red-500'} text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg`}>
                    {index + 1}
                  </div>

                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-3 mt-2">
                    <div className="text-white min-w-0 flex-1">
                      <h4 className="font-bold text-sm sm:text-lg leading-tight truncate">
                        Order #{order.order_number || order.id.slice(0, 8)}
                      </h4>
                      <p className="text-xs text-gray-300">
                        {formatOrderTime(order.created_at)}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-xs px-2 py-1 flex items-center gap-1 font-medium ml-2 shrink-0`}>
                      {getStatusIcon(order.status)}
                      <span className="hidden sm:inline">{order.status || 'pending'}</span>
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3 text-white">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {order.profiles?.full_name || order.profiles?.email?.split('@')[0] || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-gray-300">
                      Total: R{order.total_amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 flex-1">
                    <div className="space-y-1 max-h-16 sm:max-h-24 overflow-y-auto">
                      {order.order_items.map((item, idx) => (
                        <div key={idx} className="text-xs sm:text-sm text-white">
                          <span className="font-medium">{item.quantity}x</span>{' '}
                          <span className="text-gray-200 truncate">
                            {item.menu_items?.name || 'Unknown Item'}
                          </span>
                          {item.special_instructions && (
                            <p className="text-xs text-gray-300 italic ml-4 truncate">
                              Note: {item.special_instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {order.special_instructions && (
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-200">
                        <strong>Special:</strong> <span className="truncate">{order.special_instructions}</span>
                      </div>
                    )}
                  </div>

                  {/* Progressive Status Buttons */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      {getProgressiveButtons(order.status).map((button, idx) => (
                        <Button
                          key={idx}
                          onClick={() => button.isClickable ? handleUpdateStatus(order.id, button.value) : undefined}
                          disabled={!button.isClickable && !button.isActive}
                          className={`
                            text-xs py-1.5 font-medium transition-all duration-300 border
                            ${button.isActive 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                              : button.isClickable 
                                ? 'bg-transparent border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                                : 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed'
                            }
                          `}
                        >
                          <span className="text-xs mr-1">{button.icon}</span>
                          <span className="hidden sm:inline">{button.label}</span>
                        </Button>
                      ))}
                    </div>
                    
                    {/* View Order Details Button */}
                    <Button
                      onClick={() => handleViewOrder(order)}
                      variant="outline"
                      className="w-full bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-xs py-1.5 font-medium transition-all duration-300"
                    >
                      👁️ <span className="hidden sm:inline">View Details</span><span className="sm:hidden">Details</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Completed Orders */}
        <div className="xl:w-1/3 xl:border-l xl:border-gray-700 xl:pl-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-white">Ready Orders</h2>
          </div>

          {getReadyOrders().length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 text-sm">No orders ready</p>
              <p className="text-gray-500 text-xs">Ready orders appear here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
              {getReadyOrders().map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-3 hover:border-gray-500 transition-colors"
                >
                  {/* Compact Horizontal Layout */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Order Info - Left Side */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">
                          #{order.order_number || order.id.slice(0, 8)}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">
                          {order.profiles?.full_name || order.profiles?.email?.split('@')[0] || 'Walk-in'}
                        </p>
                      </div>
                      
                      {/* Items Summary */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-300 truncate">
                          {order.order_items.slice(0, 2).map(item => 
                            `${item.quantity}x ${item.menu_items?.name || 'Item'}`
                          ).join(', ')}
                          {order.order_items.length > 2 && ` +${order.order_items.length - 2}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          R{order.total_amount?.toFixed(2) || '0.00'} • {formatOrderTime(order.updated_at || order.created_at)}
                        </p>
                      </div>
                      
                      {/* Delivery Method Badge */}
                      <Badge className={`text-xs shrink-0 px-2 py-1 ${
                        order.delivery_method === 'delivery' 
                          ? 'bg-blue-600/20 border-blue-600/50 text-blue-300'
                          : 'bg-green-600/20 border-green-600/50 text-green-300'
                      }`}>
                        {order.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'}
                      </Badge>
                    </div>
                    
                    {/* Action Buttons - Right Side */}
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={() => handleViewOrder(order)}
                        variant="outline"
                        size="sm"
                        className="bg-transparent border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white text-xs px-3 py-1"
                      >
                        👁️
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 font-medium"
                      >
                        {order.delivery_method === 'delivery' ? '✅ Complete' : '✅ Complete'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        hideTechnicalDetails={true}
      />
    </div>
    </ErrorBoundary>
  );
}
