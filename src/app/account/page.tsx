'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import AuthRequiredPrompt from '@/components/AuthRequiredPrompt';
import { getSupabaseClient } from '@/lib/supabase-client';
import { updateUserProfile, cancelDraftOrder } from '@/app/actions';
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
import AddressInputSignup from '@/components/AddressInputSignup';
import { type EnhancedAddress, validatedToEnhanced } from '@/lib/addressCompat';
import { type ValidatedAddress } from '@/types/address';
import { parseAddressString, serializeAddress, formatAddressForDisplay } from '@/lib/addressUtils';
import { useCartStore } from '@/stores/cartStore';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Clock,
  Receipt,
  Edit2,
  Save,
  X,
  CheckCircle,
  Bell,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { 
  OrderStatusSkeleton
} from '@/components/LoadingComponents';
import { NotificationPermissionPrompt } from '@/components/NotificationPermissionPrompt';
import NotificationSettingsPanel from '@/components/NotificationSettingsPanel';
import NotificationHistoryList from '@/components/NotificationHistoryList';

interface OrderItem {
  menu_item_id?: string | null;
  quantity?: number;
  price?: number;
  menu_items?: { name?: string } | null;
}

interface Order {
  id: string;
  order_number: string | null;
  status: string | null;
  total_amount: number | null;
  created_at: string | null;
  special_instructions?: string | null;
  payment_status: string | null;
  order_items: OrderItem[];
}

interface HallBooking {
  id: string;
  booking_reference: string;
  status: string;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  event_type: string;
  total_guests: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

// Inline editing state
interface EditingField {
  field: 'full_name' | 'phone' | 'address' | null;
  value: string;
  saving: boolean;
}

export default function AccountPage() {
  const { session, profile, user, refreshProfile } = useAuth();
  const router = useRouter();
  const { loadOrderToCart } = useCartStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [hallBookings, setHallBookings] = useState<HallBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  
  // Inline editing state
  const [editingField, setEditingField] = useState<EditingField>({
    field: null,
    value: '',
    saving: false,
  });

  // Delete account confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);

  // Address editing state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressData, setAddressData] = useState<EnhancedAddress>(parseAddressString(null));
  const [validatedAddressData, setValidatedAddressData] = useState<ValidatedAddress | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle URL parameters for payment status and tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const orderIdParam = urlParams.get('orderId') || urlParams.get('order_id');
      const _paymentIdParam = urlParams.get('payment_id');
      const tabParam = urlParams.get('tab');

      // Set active tab from URL parameter
      if (tabParam && ['active', 'drafts', 'profile', 'orders'].includes(tabParam)) {
        setActiveTab(tabParam);
      }

      // Handle payment status notifications from payment gateway callback
      // Note: Browser auto-close is handled by global App URL listener in ClientWrapper
      if (paymentStatus === 'success') {
        // Switch to the active orders tab to show the completed order
        setActiveTab('active');
        
        toast.success(
          `🎉 Payment successful! ${orderIdParam ? `Order #${orderIdParam}` : 'Your order'} has been confirmed and sent to the kitchen.`,
          { duration: 6000 }
        );
        // Clean up URL parameters after showing notification
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } else if (paymentStatus === 'error' || paymentStatus === 'cancelled' || paymentStatus === 'failed') {
        const reason = urlParams.get('reason') || 'Payment was not completed';
        toast.error(
          `❌ Payment ${paymentStatus === 'cancelled' ? 'cancelled' : 'failed'}: ${reason}. Your order is saved as a draft - you can complete payment anytime.`,
          { duration: 8000 }
        );
        // Clean up URL parameters after showing notification
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Initialize address data from profile
  useEffect(() => {
    if (profile?.address) {
      setAddressData(parseAddressString(profile.address));
    } else {
      setAddressData(parseAddressString(null));
    }
  }, [profile?.address]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        console.log('🔄 Account Page: Fetching orders for user:', session.user.id);
        
        const supabase = getSupabaseClient();
        
        // Fetch orders with menu item details
        const { data: orderData, error } = await supabase
          .from('orders')
          .select(
            `
            *,
            order_items (
              menu_item_id,
              quantity,
              price,
              menu_items (name)
            )
          `
          )
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('❌ Account Page: Error fetching orders:', error);
          toast.error('Failed to load orders');
          return;
        }

        console.log('✅ Account Page: Orders fetched:', orderData?.length || 0);
        console.log('📋 Account Page: Order details:', orderData?.slice(0, 3));

        setOrders((orderData as unknown as Order[]) || []);

        // Fetch hall bookings
        const { data: hallBookingData, error: hallError } = await supabase
          .from('hall_bookings')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (hallError) {
          console.error('❌ Account Page: Error fetching hall bookings:', hallError);
        } else {
          console.log('✅ Account Page: Hall bookings fetched:', hallBookingData?.length || 0);
          setHallBookings((hallBookingData as HallBooking[]) || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up real-time subscriptions
    const supabase = getSupabaseClient();
    const orderSub = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${session.user.id}`,
        },
        fetchData
      )
      .subscribe();

      return () => {
        orderSub.unsubscribe();
      };
    }, [session?.user?.id, refreshTrigger]); // Re-run when user ID changes or manual refresh triggered
  
  // Manual refresh handler
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Address management functions
  const handleAddressSave = async () => {
    if (!session) return;
    
    setSavingAddress(true);
    try {
      console.log('🔄 Saving enhanced address:', addressData);

      const serializedAddress = serializeAddress(addressData);
      
      // Use server action to update profile with serialized address
      const result = await updateUserProfile(
        session.user.id,
        'address',
        serializedAddress
      );

      if (!result.success) {
        throw new Error(result.error || 'Address update failed');
      }

      toast.success('Address updated successfully!');
      
      // Refresh profile and exit editing mode
      await refreshProfile();
      setIsEditingAddress(false);
      
      // Trigger a refresh of the orders list to ensure all data is current
      setRefreshTrigger(prev => prev + 1);

    } catch (error) {
      console.error('❌ Address update error:', error);
      toast.error('Failed to update address');
    } finally {
      setSavingAddress(false);
    }
  };

  const cancelAddressEdit = () => {
    // Reset to current profile address
    if (profile?.address) {
      setAddressData(parseAddressString(profile.address));
    } else {
      setAddressData(parseAddressString(null));
    }
    setIsEditingAddress(false);
  };

  // Inline editing functions
  const startEditing = (field: 'full_name' | 'phone' | 'address') => {
    if (field === 'address') {
      // Use enhanced address editing
      setIsEditingAddress(true);
    } else {
      // Use inline editing for other fields
      const currentValue = field === 'full_name' ? profile?.full_name || '' :
                          field === 'phone' ? profile?.phone || '' :
                          '';
      
      setEditingField({
        field,
        value: currentValue,
        saving: false,
      });
    }
  };

  const cancelEditing = () => {
    setEditingField({
      field: null,
      value: '',
      saving: false,
    });
  };

  const saveField = async () => {
    if (!session || !editingField.field) return;
    
    setEditingField(prev => ({ ...prev, saving: true }));

    try {
      console.log('🔄 Updating field:', editingField.field, 'to:', editingField.value);

      // Use server action to update profile
      const result = await updateUserProfile(
        session.user.id,
        editingField.field,
        editingField.value || null
      );

      if (!result.success) {
        throw new Error(result.error || 'Update failed');
      }

      toast.success(`${editingField.field.replace('_', ' ')} updated successfully!`);
      
      // Refresh profile and exit editing mode
      await refreshProfile();
      cancelEditing();

    } catch (error) {
      console.error('❌ Field update error:', error);
      toast.error(`Failed to update ${editingField.field.replace('_', ' ')}`);
    } finally {
      setEditingField(prev => ({ ...prev, saving: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500 text-yellow-50';
      case 'confirmed':
        return 'bg-blue-500 text-blue-50';
      case 'preparing':
        return 'bg-orange-500 text-orange-50';
      case 'ready':
        return 'bg-green-500 text-green-50';
      case 'completed':
        return 'bg-gray-500 text-gray-50';
      case 'cancelled':
        return 'bg-red-500 text-red-50';
      default:
        return 'bg-gray-400 text-gray-50';
    }
  };

  const formatDateTime = (dateStr: string, timeStr?: string) => {
    const date = new Date(timeStr ? `${dateStr}T${timeStr}` : dateStr);
    return date.toLocaleString('en-ZA', {
      dateStyle: 'medium',
      timeStyle: timeStr ? 'short' : 'short',
    });
  };

  // Show auth prompt if no session
  if (!session) {
    return (
      <AuthRequiredPrompt
        title="Account Access Required"
        message="Please sign in to view and manage your account information, order history, and personal details."
        feature="account"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Enhanced header skeleton */}
          <div className="text-center space-y-4">
            <div className="w-48 h-12 bg-gradient-to-r from-neonCyan/30 via-neonPink/30 to-neonCyan/30 rounded-lg shimmer mx-auto" />
            <div className="w-64 h-4 bg-gray-700 rounded shimmer mx-auto" />
          </div>

          {/* Tab navigation skeleton */}
          <div className="flex justify-center">
            <div className="flex space-x-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-24 h-10 bg-gray-700 rounded-lg shimmer" />
              ))}
            </div>
          </div>

          {/* Enhanced content skeleton */}
          <div className="space-y-6">
            {/* Profile/Orders skeleton based on likely content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 space-y-4 animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-neonCyan/30 to-neonPink/30 rounded-full shimmer" />
                    <div className="space-y-2 flex-1">
                      <div className="w-3/4 h-4 bg-gray-700 rounded shimmer" />
                      <div className="w-1/2 h-3 bg-gray-700 rounded shimmer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-700 rounded shimmer" />
                    <div className="w-2/3 h-3 bg-gray-700 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>

            {/* Order history skeleton */}
            <OrderStatusSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-2">
            My Account
          </h1>
          <p className="text-gray-400">
            Welcome back,{' '}
            {profile?.full_name || user?.email?.split('@')[0] || 'Customer'}!
          </p>
          <p className="text-xs text-gray-500 mt-1">
            User ID: {session?.user?.id} | Email: {session?.user?.email}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 sm:gap-2 bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'active', label: 'Active Orders', icon: Clock, shortLabel: 'Active' },
            { id: 'drafts', label: 'Draft Orders', icon: Edit2, shortLabel: 'Drafts' },
            { id: 'hall-bookings', label: 'Hall Bookings', icon: Building2, shortLabel: 'Hall' },
            { id: 'profile', label: 'My Profile', icon: User, shortLabel: 'Profile' },
            { id: 'notifications', label: 'Notifications', icon: Bell, shortLabel: 'Notify' },
            { id: 'orders', label: 'Order History', icon: Receipt, shortLabel: 'History' },
          ].map(({ id, label, icon: Icon, shortLabel }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 min-w-[60px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-neonCyan text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden xs:inline">{label}</span>
              <span className="xs:hidden">{shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'active' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Active Orders
                  </CardTitle>
                  <CardDescription>
                    Track your current orders from kitchen to pickup/delivery
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="border-orange-500/50 hover:bg-orange-500/20"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {orders.filter(order => 
                order.status && ['confirmed', 'preparing', 'ready'].includes(order.status.toLowerCase())
              ).length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No active orders</p>
                  <p className="text-sm text-gray-500">
                    Your active orders will appear here once you place an order
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter(order => 
                      order.status && ['confirmed', 'preparing', 'ready'].includes(order.status.toLowerCase())
                    )
                    .map((order) => (
                      <div
                        key={order.id}
                        className="border-2 border-orange-500/30 bg-orange-900/10 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">
                              Order #{order.order_number || order.id.slice(-8)}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {order.created_at ? formatDateTime(order.created_at) : 'Date unknown'}
                              • Pickup
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={`${getStatusColor(order.status || 'pending')} mb-2 animate-pulse`}
                            >
                              {order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Unknown'}
                            </Badge>
                            <p className="text-lg font-bold text-white">
                              R{order.total_amount?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-700/50 p-3 rounded">
                          <div className={`flex flex-col items-center ${order.status === 'confirmed' ? 'text-orange-400' : 'text-green-400'}`}>
                            <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                            <span>Confirmed</span>
                          </div>
                          <div className="flex-1 h-px bg-gray-600 mx-2"></div>
                          <div className={`flex flex-col items-center ${order.status === 'preparing' ? 'text-orange-400' : order.status === 'ready' ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                            <span>Preparing</span>
                          </div>
                          <div className="flex-1 h-px bg-gray-600 mx-2"></div>
                          <div className={`flex flex-col items-center ${order.status === 'ready' ? 'text-green-400' : 'text-gray-500'}`}>
                            <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                            <span>Ready</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-300">
                            Items:
                          </p>
                          {order.order_items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm bg-gray-700 p-2 rounded"
                            >
                              <span className="text-gray-300">
                                {item.menu_items?.name ||
                                  `Item #${item.menu_item_id}`}{' '}
                                × {item.quantity}
                              </span>
                              <span className="text-white">
                                R{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.special_instructions && (
                          <div className="bg-gray-700 p-3 rounded">
                            <p className="text-sm font-medium text-gray-300">
                              Special Instructions:
                            </p>
                            <p className="text-sm text-gray-400">
                              {order.special_instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'drafts' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Edit2 className="h-5 w-5" />
                Draft Orders
              </CardTitle>
              <CardDescription>
                Complete payment for these orders to send them to the kitchen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.filter(order => 
                order.status && ['draft', 'pending'].includes(order.status.toLowerCase())
              ).length === 0 ? (
                <div className="text-center py-12">
                  <Edit2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No draft orders</p>
                  <p className="text-sm text-gray-500">
                    Orders pending payment will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter(order => 
                      order.status && ['draft', 'pending'].includes(order.status.toLowerCase())
                    )
                    .map((order) => (
                      <div
                        key={order.id}
                        className="border-2 border-yellow-500/30 bg-yellow-900/10 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">
                              Order #{order.order_number || order.id.slice(-8)}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {order.created_at ? formatDateTime(order.created_at) : 'Date unknown'}
                              • Pickup
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={`${getStatusColor(order.status || 'pending')} mb-2`}
                            >
                              {order.payment_status === 'failed' ? 'Payment Failed' : 'Awaiting Payment'}
                            </Badge>
                            <p className="text-lg font-bold text-white">
                              R{order.total_amount?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-300">
                            Items:
                          </p>
                          {order.order_items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm bg-gray-700 p-2 rounded"
                            >
                              <span className="text-gray-300">
                                {item.menu_items?.name ||
                                  `Item #${item.menu_item_id}`}{' '}
                                × {item.quantity}
                              </span>
                              <span className="text-white">
                                R{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.special_instructions && (
                          <div className="bg-gray-700 p-3 rounded">
                            <p className="text-sm font-medium text-gray-300">
                              Special Instructions:
                            </p>
                            <p className="text-sm text-gray-400">
                              {order.special_instructions}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-col xs:flex-row gap-2 pt-3 border-t border-gray-600">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                            onClick={async () => {
                              try {
                                console.log('🔄 Loading order to cart for retry:', order.id);
                                
                                const response = await fetch('/api/orders/retry', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    orderId: order.id,
                                    userId: session.user.id,
                                  }),
                                });

                                const result = await response.json();
                                
                                if (result.success && result.orderItems) {
                                  // Load the order items into the cart
                                  loadOrderToCart(result.orderItems);
                                  
                                  // Redirect to menu page where they can proceed to checkout
                                  router.push('/ordering');
                                  
                                  toast.success(`Order #${result.orderNumber || order.order_number || order.id.slice(-8)} loaded to cart!`);
                                } else {
                                  toast.error(result.error || 'Failed to load order');
                                }
                              } catch (error) {
                                console.error('❌ Load order error:', error);
                                toast.error('Failed to load order. Please try again.');
                              }
                            }}
                          >
                            Complete Payment
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-red-500 text-red-400 hover:bg-red-500 hover:text-white text-sm whitespace-nowrap"
                            onClick={async () => {
                              if (confirm(`Are you sure you want to cancel Order #${order.order_number || order.id.slice(-8)}? This action cannot be undone.`)) {
                                try {
                                  console.log('🗑️ Canceling order:', order.id);
                                  
                                  const result = await cancelDraftOrder(order.id, session.user.id);
                                  
                                  if (result.success) {
                                    toast.success(`Order #${order.order_number || order.id.slice(-8)} canceled successfully`);
                                    // Refresh the orders list
                                    setRefreshTrigger(prev => prev + 1);
                                  } else {
                                    toast.error(result.error || 'Failed to cancel order');
                                  }
                                } catch (error) {
                                  console.error('❌ Cancel order error:', error);
                                  toast.error('Failed to cancel order. Please try again.');
                                }
                              }
                            }}
                          >
                            Cancel Order
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {activeTab === 'profile' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-neonCyan flex items-center gap-2">
                <User className="h-5 w-5" />
                My Profile
              </CardTitle>
              <CardDescription>
                Click the edit button next to any field to update your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Profile Picture Section */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center border-4 border-neonCyan shadow-lg">
                    <span className="text-black font-bold text-4xl">
                      {(profile?.full_name || user?.email || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inline Editable Fields */}
              <div className="space-y-6">
                {/* Email (Read-only) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Mail className="h-5 w-5 text-neonCyan flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-400">Email Address</p>
                      <p className="text-white font-medium truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-gray-500 text-gray-400 text-xs whitespace-nowrap self-start sm:self-center">
                    Cannot be changed
                  </Badge>
                </div>

                {/* Full Name - Inline Editable */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <User className="h-5 w-5 text-neonPink" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Full Name</p>
                      {editingField.field === 'full_name' ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={editingField.value}
                            onChange={(e) => setEditingField(prev => ({ ...prev, value: e.target.value }))}
                            className="bg-gray-600 border-gray-500 text-white focus:border-neonPink"
                            placeholder="Enter your full name"
                            disabled={editingField.saving}
                          />
                          <Button
                            size="sm"
                            onClick={saveField}
                            disabled={editingField.saving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {editingField.saving ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={editingField.saving}
                            className="border-gray-500 text-gray-400 hover:bg-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-white font-medium">
                          {profile?.full_name || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                  {editingField.field !== 'full_name' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing('full_name')}
                      className="border-neonPink text-neonPink hover:bg-neonPink hover:text-black"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Phone Number - Inline Editable */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Phone className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Phone Number</p>
                      {editingField.field === 'phone' ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={editingField.value}
                            onChange={(e) => setEditingField(prev => ({ ...prev, value: e.target.value }))}
                            className="bg-gray-600 border-gray-500 text-white focus:border-yellow-500"
                            placeholder="Enter your phone number"
                            type="tel"
                            disabled={editingField.saving}
                          />
                          <Button
                            size="sm"
                            onClick={saveField}
                            disabled={editingField.saving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {editingField.saving ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={editingField.saving}
                            className="border-gray-500 text-gray-400 hover:bg-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-white font-medium">
                          {profile?.phone || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                  {editingField.field !== 'phone' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing('phone')}
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Enhanced Address Management */}
                {isEditingAddress ? (
                  <div className="space-y-4 p-4 bg-gray-900/30 rounded-lg border border-purple-400/30">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-purple-400" />
                      <h3 className="text-white font-medium">Update Delivery Address</h3>
                    </div>
                    <AddressInputSignup
                      address={validatedAddressData}
                      onChange={(newValidatedAddress) => {
                        setValidatedAddressData(newValidatedAddress);
                        if (newValidatedAddress) {
                          setAddressData(validatedToEnhanced(newValidatedAddress));
                        }
                      }}
                      required={false}
                    />
                    <div className="flex gap-2 justify-end pt-4 border-t border-gray-700">
                      <Button
                        onClick={handleAddressSave}
                        disabled={savingAddress || !validatedAddressData}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {savingAddress ? <Clock className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Address
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelAddressEdit}
                        disabled={savingAddress}
                        className="border-gray-500 text-gray-400 hover:bg-gray-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <MapPin className="h-5 w-5 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Delivery Address</p>
                        <p className="text-white font-medium">
                          {profile?.address ? formatAddressForDisplay(parseAddressString(profile.address)) : 'Not set'}
                        </p>
                        {addressData.isRobertsEstateResident && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400">Roberts Estate Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing('address')}
                      className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Account Info (Read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
                    <Badge
                      variant="outline"
                      className={`${profile?.is_admin ? 'border-red-500 text-red-400' : profile?.is_staff ? 'border-yellow-500 text-yellow-400' : 'border-green-500 text-green-400'}`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {profile?.is_admin
                        ? 'Administrator'
                        : profile?.is_staff
                          ? 'Staff Member'
                          : 'Customer'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="text-white font-medium">
                        {profile?.created_at 
                          ? new Date(profile.created_at).toLocaleDateString('en-ZA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delete Account Section - Collapsible with Multi-Step Confirmation */}
                <div className="mt-12">
                  {!showDeleteConfirm ? (
                    // Initial collapsed state - looks like other fields
                    <div className="flex items-center justify-between p-4 bg-red-900/20 border-2 border-red-500/30 rounded-lg hover:bg-red-900/30 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <X className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-400">Danger Zone</p>
                          <p className="text-white font-medium">Delete Account</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setDeleteConfirmStep(1);
                        }}
                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    // Expanded confirmation flow
                    <div className="p-4 sm:p-6 bg-red-900/20 border-2 border-red-500/30 rounded-lg space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-500/20 rounded-full flex-shrink-0">
                          <X className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-2">
                            Delete Account
                          </h3>
                          
                          {deleteConfirmStep === 1 && (
                            <>
                              <p className="text-sm text-gray-300 mb-4">
                                Permanently delete your account and all associated data. This action cannot be undone.
                              </p>
                              <ul className="text-xs sm:text-sm text-gray-400 space-y-1 mb-4 list-disc list-inside">
                                <li>All personal information will be deleted</li>
                                <li>Order history will be removed</li>
                                <li>You will be immediately signed out</li>
                                <li>Active orders will be cancelled</li>
                              </ul>
                              <div className="flex flex-col xs:flex-row gap-2">
                                <Button
                                  variant="outline"
                                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white text-sm"
                                  onClick={() => setDeleteConfirmStep(2)}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Continue to Delete
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-gray-500 text-gray-400 hover:bg-gray-600 text-sm"
                                  onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmStep(0);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          )}

                          {deleteConfirmStep === 2 && (
                            <>
                              <div className="bg-red-500/10 border border-red-500/50 rounded p-3 sm:p-4 mb-4">
                                <p className="text-sm sm:text-base font-bold text-red-300 mb-2">
                                  ⚠️ Final Warning
                                </p>
                                <p className="text-xs sm:text-sm text-gray-300 mb-2">
                                  Are you absolutely sure? This will permanently delete:
                                </p>
                                <ul className="text-xs sm:text-sm text-gray-400 space-y-1 list-disc list-inside">
                                  <li>Your profile and personal information</li>
                                  <li>All order history and data</li>
                                  <li>Saved addresses and preferences</li>
                                  <li>Notification settings</li>
                                </ul>
                              </div>
                              <div className="flex flex-col xs:flex-row gap-2">
                                <Button
                                  variant="outline"
                                  className="border-red-600 bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white text-sm font-bold"
                                  onClick={() => setDeleteConfirmStep(3)}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Yes, Delete Everything
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-gray-500 text-gray-400 hover:bg-gray-600 text-sm"
                                  onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmStep(0);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          )}

                          {deleteConfirmStep === 3 && (
                            <>
                              <div className="bg-red-600/20 border-2 border-red-600 rounded p-3 sm:p-4 mb-4">
                                <p className="text-sm sm:text-base font-bold text-red-200 mb-2">
                                  🚨 FINAL CONFIRMATION
                                </p>
                                <p className="text-xs sm:text-sm text-red-100 mb-3">
                                  This is your last chance to cancel. Click the button below to permanently delete your account.
                                </p>
                                <p className="text-xs text-red-200 font-mono bg-black/30 p-2 rounded">
                                  This action is irreversible. All data will be lost forever.
                                </p>
                              </div>
                              <div className="flex flex-col xs:flex-row gap-2">
                                <Button
                                  variant="outline"
                                  className="border-red-700 bg-red-700 text-white hover:bg-red-800 text-sm font-bold"
                                  onClick={async () => {
                                    try {
                                      const supabase = getSupabaseClient();
                                      
                                      const response = await fetch('/api/account/delete', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          userId: session.user.id,
                                        }),
                                      });

                                      const result = await response.json();

                                      if (!result.success) {
                                        throw new Error(result.error || 'Failed to delete account');
                                      }

                                      await supabase.auth.signOut();
                                      toast.success('Account deleted successfully. You have been signed out.');
                                      router.push('/');
                                    } catch (error) {
                                      console.error('❌ Delete account error:', error);
                                      toast.error('Failed to delete account. Please contact support.');
                                    }
                                  }}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  DELETE MY ACCOUNT
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-gray-500 text-gray-400 hover:bg-gray-600 text-sm"
                                  onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmStep(0);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-neonCyan flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Manage your notification preferences and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Settings Section */}
              <div>
                <NotificationSettingsPanel />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700" />

              {/* History Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-neonPink" />
                  Notification History
                </h3>
                <NotificationHistoryList />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'hall-bookings' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-neonPink flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    My Hall Bookings
                  </CardTitle>
                  <CardDescription>
                    View and manage your Roberts Hall bookings
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push('/hall-booking')}
                  className="bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-semibold"
                >
                  + New Booking
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hallBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No hall bookings yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Book Roberts Hall for your next event
                  </p>
                  <Button
                    onClick={() => router.push('/hall-booking')}
                    className="bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-semibold"
                  >
                    Book Roberts Hall →
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {hallBookings.map((booking) => {
                    const statusColors: Record<string, string> = {
                      draft: 'bg-gray-500',
                      pending_payment: 'bg-yellow-500',
                      payment_processing: 'bg-blue-500',
                      confirmed: 'bg-green-500',
                      completed: 'bg-purple-500',
                      deposit_refunded: 'bg-teal-500',
                      cancelled: 'bg-red-500',
                      rejected: 'bg-red-700',
                    };

                    const statusLabels: Record<string, string> = {
                      draft: 'Draft',
                      pending_payment: 'Pending Payment',
                      payment_processing: 'Processing',
                      confirmed: 'Confirmed',
                      completed: 'Completed',
                      deposit_refunded: 'Deposit Refunded',
                      cancelled: 'Cancelled',
                      rejected: 'Rejected',
                    };

                    const eventDate = new Date(booking.event_date).toLocaleDateString('en-ZA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={booking.id}
                        className="border-2 border-neonPink/30 bg-gradient-to-br from-neonPink/5 to-purple-500/5 rounded-lg p-4 space-y-3 hover:border-neonPink/50 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white text-lg">
                              🏛️ {booking.booking_reference}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {eventDate}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.event_start_time} - {booking.event_end_time}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={`${statusColors[booking.status] || 'bg-gray-500'} text-white mb-2`}
                            >
                              {statusLabels[booking.status] || booking.status}
                            </Badge>
                            <p className="text-lg font-bold text-white">
                              R {booking.total_amount.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm bg-gray-700/50 p-3 rounded">
                          <div>
                            <p className="text-gray-400">Event Type</p>
                            <p className="text-white font-medium capitalize">{booking.event_type.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Guests</p>
                            <p className="text-white font-medium">{booking.total_guests} people</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Payment Status</p>
                            <p className="text-white font-medium">
                              {booking.payment_status === 'paid' ? '✅ Paid' : '⏳ ' + booking.payment_status}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Booked On</p>
                            <p className="text-white font-medium">
                              {new Date(booking.created_at).toLocaleDateString('en-ZA')}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {booking.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => router.push(`/hall-booking?resume=${booking.id}`)}
                              className="bg-neonCyan/20 hover:bg-neonCyan/30 text-neonCyan border border-neonCyan/30"
                            >
                              Continue Booking
                            </Button>
                          )}
                          {booking.status === 'confirmed' && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded px-3 py-2 text-sm">
                              <p className="text-green-400">✅ Confirmed! You'll receive the access code 24hrs before your event.</p>
                            </div>
                          )}
                          {booking.status === 'completed' && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded px-3 py-2 text-sm">
                              <p className="text-purple-400">🎉 Event completed! Deposit refund processing.</p>
                            </div>
                          )}
                          {booking.status === 'deposit_refunded' && (
                            <div className="bg-teal-500/10 border border-teal-500/30 rounded px-3 py-2 text-sm">
                              <p className="text-teal-400">💰 Deposit refunded successfully!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'orders' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-neonPink flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order History
              </CardTitle>
              <CardDescription>
                View your recent orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No orders yet</p>
                  <p className="text-sm text-gray-500">
                    Your order history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-600 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">
                            Order #{order.order_number || order.id.slice(-8)}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {order.created_at ? formatDateTime(order.created_at) : 'Date unknown'}
                            • Pickup
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`${getStatusColor(order.status || 'pending')} mb-2`}
                          >
                            {order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Unknown'}
                          </Badge>
                          <p className="text-lg font-bold text-white">
                            R{order.total_amount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-300">
                          Items:
                        </p>
                        {order.order_items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm bg-gray-700 p-2 rounded"
                          >
                            <span className="text-gray-300">
                              {item.menu_items?.name ||
                                `Item #${item.menu_item_id}`}{' '}
                              × {item.quantity}
                            </span>
                            <span className="text-white">
                              R{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.special_instructions && (
                        <div className="bg-gray-700 p-3 rounded">
                          <p className="text-sm font-medium text-gray-300">
                            Special Instructions:
                          </p>
                          <p className="text-sm text-gray-400">
                            {order.special_instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notification Permission Prompt - Auto-show for users with orders */}
      {orders.length > 0 && (
        <NotificationPermissionPrompt
          autoShow={true}
          onPermissionGranted={() => {
            console.log('✅ User enabled notifications');
            toast.success('Notifications enabled! You\'ll be notified when your orders are ready.', {
              duration: 5000,
              style: {
                background: '#10b981',
                color: 'white',
              },
            });
          }}
          onDismiss={() => {
            console.log('ℹ️ User dismissed notification prompt');
          }}
        />
      )}
    </div>
  );
}
