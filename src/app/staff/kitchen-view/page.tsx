'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getStaffOrders, updateOrderStatus } from '@/app/actions';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  ChefHat,
  Package,
  CheckCircle,
  Timer,
  Filter,
  Volume2,
  VolumeX,
  Bell,
} from 'lucide-react';
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
  
  // Phase 3 Part 3: Enhanced Kitchen Features
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

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
      const result = await updateOrderStatus(id, newStatus);
      
      if (!result.success) {
        toast.error('Failed to update order status');
        console.error('❌ Kitchen View: Error updating order:', result.error);
        return;
      }

      toast.success(`Order moved to ${newStatus}`);
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

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return 'bg-neonCyan/20 border-neonCyan/50 text-neonCyan';
      case 'preparing':
        return 'bg-neonPink/20 border-neonPink/50 text-neonPink';
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
      case 'confirmed':
        return <Clock className="w-4 h-4" />;
      case 'preparing':
        return <ChefHat className="w-4 h-4" />;
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
        label: 'Confirmed', 
        value: 'confirmed', 
        icon: '⏱️',
        bgColor: 'bg-neonCyan/20 border-neonCyan/50',
        textColor: 'text-neonCyan',
        hoverColor: 'hover:bg-neonCyan/30'
      },
      { 
        label: 'Preparing', 
        value: 'preparing', 
        icon: '👨‍🍳',
        bgColor: 'bg-neonPink/20 border-neonPink/50',
        textColor: 'text-neonPink',
        hoverColor: 'hover:bg-neonPink/30'
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
      case 'confirmed':
        return ['preparing'];
      case 'preparing':
        return ['ready'];
      case 'ready':
        return ['completed'];
      case 'completed':
        return []; // No further progression
      default:
        return ['confirmed'];
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
    let filtered = orders;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Filter by urgency
    if (showOnlyUrgent) {
      filtered = filtered.filter(order => isOrderUrgent(order));
    }
    
    // Sort by creation time (oldest first) for proper FIFO queue
    filtered = filtered.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeA - timeB; // Oldest first
    });
    
    return filtered;
  };

  const getActiveOrders = () => {
    // Orders that need kitchen work: confirmed, preparing, ready
    return getFilteredOrders().filter(order => 
      ['confirmed', 'preparing', 'ready'].includes(order.status || '')
    );
  };

  const getCompletedOrders = () => {
    // Orders that are completed and awaiting pickup/delivery
    // Don't show orders that have been picked up or delivered
    return orders
      .filter(order => {
        const status = order.status;
        // Show only orders that are completed but not yet collected
        return status === 'completed';
      })
      .sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
        return timeB - timeA; // Most recently completed first
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-neonCyan mx-auto mb-4" />
          <p className="text-neonText">Loading kitchen view...</p>
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

  return (
    <div className="min-h-screen bg-darkBg text-neonText overflow-x-hidden">
      {/* Full-Screen Header - Enhanced with Kitchen Controls */}
      <div className="bg-gray-900/95 backdrop-blur-md border-b border-neonCyan/30 sticky top-0 z-50">
        <div className="max-w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Only show back button for admins */}
              {profile?.is_admin && (
                <Button
                  onClick={() => router.push('/staff')}
                  variant="ghost"
                  className="text-neonCyan hover:text-neonPink text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Staff Panel</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neonCyan flex items-center gap-2">
                  🍳 Kitchen View
                  {newOrderCount > 0 && (
                    <Badge className="bg-red-500 text-white animate-pulse text-xs">
                      +{newOrderCount} NEW
                    </Badge>
                  )}
                </h1>
                <p className="text-neonText/70 text-xs sm:text-sm">
                  {profile?.is_admin ? 'Full-screen order management' : 'Real-time Order Processing'}
                </p>
              </div>
            </div>
            
            {/* Kitchen Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-4 w-full lg:w-auto">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 lg:w-40 bg-gray-800 border-gray-600 text-gray-200 text-xs sm:text-sm">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="confirmed">⏱️ Confirmed</SelectItem>
                  <SelectItem value="preparing">👨‍🍳 Preparing</SelectItem>
                  <SelectItem value="ready">✅ Ready</SelectItem>
                </SelectContent>
              </Select>

              {/* Urgent Orders Toggle */}
              <Button
                onClick={() => setShowOnlyUrgent(!showOnlyUrgent)}
                variant={showOnlyUrgent ? "default" : "outline"}
                className={`${showOnlyUrgent ? 'bg-red-500 hover:bg-red-600' : 'border-gray-600 text-gray-300'} text-xs px-2 sm:px-3 py-2`}
                title="Show only orders that are urgent (over 20 minutes old or ready for pickup)"
              >
                <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Urgent Only ({showOnlyUrgent ? 'ON' : 'OFF'})</span>
                <span className="sm:hidden">{showOnlyUrgent ? 'ON' : 'OFF'}</span>
              </Button>

              {/* Sound Toggle */}
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="outline"
                className="border-gray-600 text-gray-300 text-xs px-2 sm:px-3 py-2"
              >
                {soundEnabled ? <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>

              {lastUpdate && (
                <div className="text-xs text-gray-400 hidden lg:block">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              
              <Button
                onClick={fetchOrders}
                disabled={loading}
                className="neon-button text-xs px-2 sm:px-3 py-2"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Split Layout: Active Orders (Left) + Completed Orders (Right) */}
      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
        {/* Left Side - Active Orders */}
        <div className="flex-1 xl:w-2/3">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Active Orders - Kitchen Queue</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Orders requiring kitchen preparation (Confirmed → Preparing → Ready)</p>
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
                  className="group relative border rounded-lg p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-black border-gray-700 min-h-[200px] sm:min-h-[300px]"
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
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Completed Orders</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Ready for pickup/delivery - awaiting customer collection</p>
          </div>

          {getCompletedOrders().length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 text-sm">No completed orders</p>
              <p className="text-gray-500 text-xs">Completed orders appear here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
              {getCompletedOrders().map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-3 sm:p-4 hover:border-gray-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                        Order #{order.order_number || order.id.slice(0, 8)}
                      </h4>
                      <p className="text-xs text-gray-400">
                        Completed: {formatOrderTime(order.updated_at || order.created_at)}
                      </p>
                    </div>
                    <Badge className="bg-green-600/20 border-green-600/50 text-green-300 text-xs ml-2 shrink-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs sm:text-sm text-gray-200 font-medium truncate">
                      {order.profiles?.full_name || order.profiles?.email?.split('@')[0] || 'Walk-in Customer'}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">
                        Total: R{order.total_amount?.toFixed(2) || '0.00'}
                      </p>
                      <Badge className={`text-xs px-2 py-1 ${
                        order.delivery_method === 'delivery' 
                          ? 'bg-blue-600/20 border-blue-600/50 text-blue-300'
                          : 'bg-green-600/20 border-green-600/50 text-green-300'
                      }`}>
                        {order.delivery_method === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}
                      </Badge>
                      
                      {/* Display delivery address for delivery orders */}
                      {order.delivery_method === 'delivery' && order.delivery_address && (
                        <div className="mt-2 p-2 bg-blue-600/10 border border-blue-600/30 rounded text-xs">
                          <div className="text-blue-300 font-medium">📍 Delivery Address:</div>
                          <div className="text-gray-200 mt-1">{order.delivery_address}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-300 space-y-1">
                      {order.order_items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="truncate">
                          {item.quantity}x {item.menu_items?.name || 'Unknown Item'}
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <div className="text-gray-500">
                          +{order.order_items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Different buttons based on delivery method */}
                    {order.delivery_method === 'delivery' ? (
                      <Button
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 font-medium transition-all duration-300"
                      >
                        🚚 <span className="hidden sm:inline">Mark as Delivered</span><span className="sm:hidden">Delivered</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 font-medium transition-all duration-300"
                      >
                        📦 <span className="hidden sm:inline">Mark as Picked Up</span><span className="sm:hidden">Picked Up</span>
                      </Button>
                    )}
                    <Button
                      onClick={() => handleViewOrder(order)}
                      variant="outline"
                      className="w-full bg-transparent border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white text-xs py-1.5 font-medium transition-all duration-300"
                    >
                      👁️ <span className="hidden sm:inline">View Details</span><span className="sm:hidden">Details</span>
                    </Button>
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
      />
    </div>
  );
}
