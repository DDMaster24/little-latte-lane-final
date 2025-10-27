'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/components/AuthProvider';
import { useRestaurantClosure } from '@/hooks/useRestaurantClosure';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getSupabaseClient } from '@/lib/supabase-client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { createOrderServerAction } from '@/app/actions';
import YocoPayment from '@/components/YocoPayment';
import {
  formatSouthAfricanPhone,
  isValidSouthAfricanPhone,
  displaySouthAfricanPhone,
} from '@/lib/phoneUtils';
import { type EnhancedAddress } from '@/lib/addressCompat';
import { parseAddressString, serializeAddress, formatAddressForDisplay } from '@/lib/addressUtils';
import { Checkbox } from '@/components/ui/checkbox';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItemWithMenu {
  quantity: number;
  price: number;
  menu_items: {
    name: string;
  } | null;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const cart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = useCartStore((state) => state.total());
  const { user, profile } = useAuth();
  const { isClosed, message: closureMessage } = useRestaurantClosure();
  const router = useRouter();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>(
    'delivery'
  );
  const [address, setAddress] = useState<EnhancedAddress>(parseAddressString(null));
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // New state for streamlined checkout
  const [isRobertsEstateResident, setIsRobertsEstateResident] = useState(false);
  const [confirmAddressCorrect, setConfirmAddressCorrect] = useState(false);
  
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    id: string;
    order_number: string | null;
    total_amount: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  } | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [hasLoadedProfileData, setHasLoadedProfileData] = useState(false);
  const [draftOrders, setDraftOrders] = useState<Array<{
    id: string;
    order_number: string | null;
    total_amount: number | null;
    created_at: string | null;
    order_items: OrderItemWithMenu[];
  }>>([]);

  // ✨ Auto-populate checkout form when profile data is available
  useEffect(() => {
    if (profile && !hasLoadedProfileData) {
      console.log('🔄 Auto-populating checkout form from profile:', {
        full_name: profile.full_name,
        phone: profile.phone,
      });

      const fieldsPopulated = [];

      // Auto-populate phone number if available
      if (profile.phone && profile.phone.trim()) {
        setPhone(profile.phone);
        fieldsPopulated.push('phone number');
        console.log('📱 Auto-populated phone:', profile.phone);
      }

      // Auto-populate address if available
      if (profile.address && profile.address.trim()) {
        const parsedAddress = parseAddressString(profile.address);
        setAddress(parsedAddress);
        setIsRobertsEstateResident(parsedAddress.isRobertsEstateResident);
        fieldsPopulated.push('delivery address');
        console.log('🏠 Auto-populated address:', profile.address);
        console.log('🏘️ Roberts Estate status:', parsedAddress.isRobertsEstateResident);
      }

      // Auto-populate full name if available
      if (profile.full_name && profile.full_name.trim()) {
        fieldsPopulated.push('name');
        console.log('👤 Found saved name:', profile.full_name);
      }

      // Auto-fill completed - no notification needed for better UX
      if (fieldsPopulated.length > 0) {
        setHasLoadedProfileData(true);
      }
      
      // Always mark as loaded to prevent multiple executions
      setHasLoadedProfileData(true);
    }
  }, [profile, hasLoadedProfileData]);

  // Reset form when user changes (e.g., logout/login)
  useEffect(() => {
    if (!profile) {
      setAddress(parseAddressString(null));
      setPhone('');
      setDeliveryType('delivery');
      setIsRobertsEstateResident(false);
      setConfirmAddressCorrect(false);
      setHasLoadedProfileData(false);
    }
  }, [profile]);

  // Calculate delivery fee from profile address
  const deliveryFee = isRobertsEstateResident ? 10 : 30;
  const totalWithDelivery = total + (deliveryType === 'delivery' ? deliveryFee : 0);

  // Fetch draft orders when cart is empty and sidebar opens
  useEffect(() => {
    const fetchDraftOrders = async () => {
      if (!user || !isOpen || cart.length > 0) return;

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            created_at,
            order_items (
              quantity,
              price,
              menu_items (name)
            )
          `)
          .eq('user_id', user.id)
          .in('status', ['draft', 'pending'])
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setDraftOrders(data || []);
      } catch (error) {
        console.error('Failed to fetch draft orders:', error);
      }
    };

    fetchDraftOrders();
  }, [user, isOpen, cart.length]);

  const handleCreateOrder = async () => {
    // Check if restaurant is closed
    if (isClosed) {
      toast.error(closureMessage || 'Restaurant is currently closed. Please try again later.');
      return;
    }

    if (!profile) {
      toast.error('Please log in to checkout');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Simplified validation using checkboxes
    if (deliveryType === 'delivery') {
      if (!profile?.address && !address.fullAddress.trim()) {
        toast.error('Please set up your delivery address');
        return;
      }

      if (!isRobertsEstateResident) {
        toast.error('Please confirm you are a Roberts Estate resident');
        return;
      }

      if (!confirmAddressCorrect) {
        toast.error('Please confirm your address is correct');
        return;
      }
    }

    if (!phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!isValidSouthAfricanPhone(phone)) {
      toast.error('Please enter a valid South African phone number');
      return;
    }

    const validFormattedPhone = formatSouthAfricanPhone(phone);
    if (!validFormattedPhone) {
      toast.error('Invalid phone number format');
      return;
    }

    // Prevent duplicate order creation if order already exists
    if (orderId) {
      toast.info('Order already created, proceeding to payment...');
      return;
    }

    setIsCreatingOrder(true);
    
    // Enhanced loading with progress steps
    const orderSteps = [
      'Validating order details...',
      'Creating your order...',
      'Processing payment setup...',
      'Preparing checkout...'
    ];
    
    let currentStep = 0;
    toast.loading(orderSteps[currentStep], { id: 'create-order' });

    try {
      // Step 1: Validate
      await new Promise(resolve => setTimeout(resolve, 500));
      currentStep = 1;
      toast.loading(orderSteps[currentStep], { id: 'create-order' });

      // Transform cart items to match the expected interface
      const checkoutItems = cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        customization: item.customization as Record<string, unknown>,
      }));

      // Step 2: Create order using server action (bypasses RLS issues)
      await new Promise(resolve => setTimeout(resolve, 300));
      currentStep = 2;
      toast.loading(orderSteps[currentStep], { id: 'create-order' });

      const result = await createOrderServerAction({
        userId: profile.id,
        items: checkoutItems,
        total: totalWithDelivery,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' 
          ? serializeAddress(address)
          : undefined,
        delivery_fee: deliveryType === 'delivery' ? deliveryFee : null,
        delivery_zone: deliveryType === 'delivery' && isRobertsEstateResident 
          ? 'roberts_estate' 
          : 'middleburg',
        delivery_coordinates: null,
        address_verified: false,
        specialInstructions: specialInstructions.trim() || undefined,
      });

      // Step 3: Finalize
      currentStep = 3;
      toast.loading(orderSteps[currentStep], { id: 'create-order' });
      await new Promise(resolve => setTimeout(resolve, 200));

      if (result.success && result.orderId) {
        setOrderId(result.orderId);
        
        // Fetch the complete order data including order_number
        try {
          const supabase = getSupabaseClient();
          const { data: orderDetails, error: fetchError } = await supabase
            .from('orders')
            .select(`
              id,
              order_number,
              total_amount,
              order_items (
                quantity,
                price,
                menu_items (name)
              )
            `)
            .eq('id', result.orderId)
            .single();

          if (fetchError) throw fetchError;

          if (orderDetails) {
            setOrderData({
              id: orderDetails.id,
              order_number: orderDetails.order_number,
              total_amount: orderDetails.total_amount || total,
              items: orderDetails.order_items.map((item: OrderItemWithMenu) => ({
                name: item.menu_items?.name || 'Unknown Item',
                quantity: item.quantity,
                price: item.price
              }))
            });
          }
        } catch (fetchError) {
          console.error('Error fetching order details:', fetchError);
          // Still set basic order data even if fetch fails
          setOrderData({
            id: result.orderId,
            order_number: null,
            total_amount: total,
            items: cart.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          });
        }
        
        toast.success('✅ Order ready for payment!', { 
          id: 'create-order',
          duration: 2000
        });
        // Payment will be handled in the same checkout step
      } else {
        toast.error(
          '❌ Error creating order: ' + (result.error || 'Unknown error'),
          { id: 'create-order' }
        );
      }
    } catch (error) {
      console.error('Exception in handleCreateOrder:', error);
      toast.error(
        'Failed to create order: ' + 
        (error instanceof Error ? error.message : 'Unknown error'),
        { id: 'create-order' }
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentInitiated = () => {
    clearCart();
    setStep('cart');
    setOrderId(null);
    setSpecialInstructions(''); // Clear special instructions when payment is initiated
    onClose();
    toast.success('Payment initiated! Redirecting to payment gateway...');
  };

  const getItemDescription = () => {
    if (cart.length === 0) return 'Little Latte Lane Order';
    
    if (cart.length === 1) {
      const item = cart[0];
      return `${item.name} x${item.quantity}${item.customization ? ' (Customized)' : ''}`;
    }
    
    if (cart.length <= 3) {
      return cart.map((item) => `${item.name} x${item.quantity}`).join(', ');
    }
    
    // For many items, show count and first item
    const firstItem = cart[0];
    return `${cart.length} items: ${firstItem.name}${cart.length > 1 ? ' & more' : ''}`;
  };

  const getOrderTitle = () => {
    if (cart.length === 0) return 'Little Latte Lane Order';
    
    if (cart.length === 1) {
      return cart[0].name;
    }
    
    return `Little Latte Lane Order (${cart.length} items)`;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed right-0 top-0 h-full w-full max-w-md bg-darkBg/95 backdrop-blur-xl border-l border-neonCyan/50
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neonCyan/30 bg-darkBg">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-neonCyan" />
              <h2 className="text-neonCyan font-semibold text-lg">
                {step === 'cart'
                  ? 'Your Order'
                  : orderId
                    ? 'Payment'
                    : 'Checkout Details'}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (step === 'cart') {
                  // If on cart step, close sidebar and go back to ordering page
                  onClose();
                } else {
                  // If on checkout/payment step, go back to cart
                  setStep('cart');
                }
              }}
              className="text-gray-400 hover:text-white hover:bg-gray-700/50 px-3 py-2 text-xs whitespace-nowrap"
            >
              {step === 'cart' ? 'Back to Menu' : 'Back to Cart'}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {step === 'cart' && (
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Add items from the menu to get started
                    </p>

                    {/* Draft Orders Detection */}
                    {draftOrders.length > 0 && (
                      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-400 font-medium mb-3">
                          📋 You have {draftOrders.length} draft order{draftOrders.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-300 mb-4">
                          Would you like to continue with a previous order?
                        </p>
                        <div className="space-y-2">
                          {draftOrders.map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                            >
                              <div className="text-left">
                                <p className="text-white text-sm font-medium">
                                  Order #{order.order_number || order.id.slice(-6)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  R{(order.total_amount || 0).toFixed(2)} • {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/orders/retry', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          orderId: order.id,
                                          userId: user?.id,
                                        }),
                                      });
                                      const result = await response.json();
                                      if (result.success && result.orderItems) {
                                        useCartStore.getState().loadOrderToCart(result.orderItems);
                                        toast.success('Draft order loaded!');
                                        setDraftOrders([]); // Clear draft orders
                                      } else {
                                        toast.error('Failed to load order');
                                      }
                                    } catch (error) {
                                      console.error('Load order error:', error);
                                      toast.error('Failed to load order');
                                    }
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                >
                                  Continue
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    router.push('/account?tab=drafts');
                                    onClose();
                                  }}
                                  className="border-gray-500 text-gray-300 text-xs"
                                >
                                  View All
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <Card
                          key={item.id}
                          className="bg-darkBg/60 backdrop-blur-md border-neonPink/40"
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="text-neonCyan font-medium text-sm">
                                  {item.name}
                                </h4>
                                <p className="text-neonPink text-sm">
                                  R{item.price}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      Math.max(1, item.quantity - 1)
                                    )
                                  }
                                  className="h-6 w-6 p-0 border-neonPink/50 text-neonPink"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-neonPink text-sm w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="h-6 w-6 p-0 border-neonPink/50 text-neonPink"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="text-neonCyan font-semibold text-sm">
                                R{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-neonCyan/30 pt-4 pb-safe-bottom">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white">Subtotal:</span>
                          <span className="text-white">R{total.toFixed(2)}</span>
                        </div>
                        {deliveryType === 'delivery' && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">
                              Delivery Fee {isRobertsEstateResident ? '(Roberts Estate)' : '(Middleburg)'}:
                            </span>
                            <span className="text-neonCyan">R{deliveryFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center border-t border-gray-600 pt-2">
                          <span className="text-lg font-semibold text-white">Total:</span>
                          <span className="text-xl font-bold text-neonCyan">R{totalWithDelivery.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Restaurant closure notice */}
                      {isClosed && (
                        <div className="bg-red-600/20 border border-red-600 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 text-red-400">
                            <span>🔒</span>
                            <span className="text-sm font-medium">Restaurant Closed</span>
                          </div>
                          <p className="text-red-300 text-sm mt-1">
                            {closureMessage || 'We are currently closed. Please try again later.'}
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={() => setStep('checkout')}
                        className="w-full neon-button"
                        disabled={cart.length === 0 || isClosed}
                      >
                        {isClosed ? 'Restaurant Closed' : 'Proceed to Checkout'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 'checkout' && (
              <div className="space-y-4">
                {orderId ? (
                  // STEP 3: PAYMENT PAGE - Final confirmation + Pay Now
                  <>
                    <div className="bg-gradient-to-r from-neonCyan/20 to-neonPink/20 border border-neonCyan/40 rounded-lg p-4 backdrop-blur-md">
                      <h3 className="text-neonCyan font-bold text-lg mb-3 flex items-center gap-2">
                        💳 Payment
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Order:</span>
                          <span className="text-white font-medium">#{orderData?.order_number || orderId.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Total:</span>
                          <span className="text-neonPink font-bold text-lg">R{orderData?.total_amount?.toFixed(2) || total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Type:</span>
                          <span className="text-white">{deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</span>
                        </div>
                        {deliveryType === 'delivery' && address.fullAddress && (
                          <div className="flex justify-between">
                            <span className="text-gray-300">Address:</span>
                            <span className="text-white text-right flex-1 ml-2">{formatAddressForDisplay(address)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-300">Phone:</span>
                          <span className="text-white">{displaySouthAfricanPhone(phone)}</span>
                        </div>
                      </div>
                      
                      {orderData?.items && orderData.items.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-neonCyan/30">
                          <p className="text-white font-medium text-sm mb-2">Order Items:</p>
                          <div className="space-y-1">
                            {orderData.items.map((item, index) => (
                              <div key={index} className="text-xs text-gray-300 flex justify-between">
                                <span>{item.quantity}x {item.name}</span>
                                <span>R{item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-neonPink/10 border border-neonPink/30 rounded-lg p-3 backdrop-blur-md">
                      <p className="text-neonPink text-sm text-center">
                        🔒 Secure payment powered by Yoco
                      </p>
                    </div>

                    <YocoPayment
                      orderId={orderId!}
                      userId={profile?.id || ''}
                      amount={totalWithDelivery}
                      itemName={getOrderTitle()}
                      itemDescription={getItemDescription()}
                      userDetails={{
                        email: user?.email || 'customer@example.com',
                        firstName:
                          profile?.full_name?.split(' ')[0] || 'Customer',
                        lastName:
                          profile?.full_name?.split(' ').slice(1).join(' ') ||
                          'User',
                        phone: formatSouthAfricanPhone(phone) || phone,
                        deliveryType,
                        deliveryAddress:
                          deliveryType === 'delivery' ? serializeAddress(address) : undefined,
                      }}
                      onPaymentInitiated={handlePaymentInitiated}
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setStep('cart')}
                        variant="outline"
                        className="flex-1 border-neonPink/50 text-neonPink hover:bg-neonPink/10"
                      >
                        Back to Cart
                      </Button>
                      <Button
                        onClick={() => {
                          setOrderId(null);
                          // This allows editing details and creating a new order if needed
                        }}
                        variant="outline"
                        className="flex-1 border-red-400/50 text-red-400 hover:bg-red-400/10"
                      >
                        Cancel Order
                      </Button>
                    </div>
                  </>
                ) : (
                  // STEP 2: CHECKOUT DETAILS - Order summary + Customer details + Address
                  <>
                    <div className="bg-gradient-to-r from-neonCyan/20 to-neonPink/20 border border-neonCyan/40 rounded-lg p-4 backdrop-blur-md">
                      <h3 className="text-neonCyan font-bold text-lg mb-3 flex items-center gap-2">
                        📋 Checkout Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Items:</span>
                          <span className="text-white">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Subtotal:</span>
                          <span className="text-white">R{total.toFixed(2)}</span>
                        </div>
                        {deliveryType === 'delivery' && (
                          <div className="flex justify-between">
                            <span className="text-gray-300">
                              Delivery Fee {isRobertsEstateResident ? '(Roberts Estate)' : '(Middleburg)'}:
                            </span>
                            <span className="text-neonCyan">R{deliveryFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-600 pt-2">
                          <span className="text-gray-300 font-semibold">Total:</span>
                          <span className="text-neonPink font-bold text-lg">R{totalWithDelivery.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Show cart items summary */}
                      <div className="mt-3 pt-3 border-t border-neonCyan/30">
                        <p className="text-white font-medium text-sm mb-2">Your Order:</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {cart.map((item) => (
                            <div key={item.id} className="text-xs text-gray-300 flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span>R{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {(profile?.phone || profile?.full_name) && (
                        <div className="mt-3 pt-2 border-t border-neonCyan/30">
                          <p className="text-xs text-neonCyan/80 flex items-center gap-1">
                            ✨ Using your saved profile details
                            <button
                              onClick={() => {
                                onClose();
                                router.push('/account');
                              }}
                              className="text-neonPink hover:text-neonCyan underline ml-1"
                            >
                              (update)
                            </button>
                          </p>
                        </div>
                      )}
                    </div>

                    <form
                      autoComplete="off"
                      onSubmit={(e) => e.preventDefault()}
                      data-form-type="checkout"
                    >
                      <div className="space-y-6">
                        {/* Contact Information Panel */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 space-y-4">
                          <h3 className="text-white font-medium text-sm">Contact Information</h3>
                          
                          <div className="grid grid-cols-1 gap-4">
                            {/* Delivery Type */}
                            <div>
                              <Label className="text-gray-300 text-sm">
                                Delivery Type *
                              </Label>
                              <Select
                                value={deliveryType}
                                onValueChange={(value) =>
                                  setDeliveryType(value as 'delivery' | 'pickup')
                                }
                              >
                                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:border-neonCyan focus:ring-1 focus:ring-neonCyan/20 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-600">
                                  <SelectItem value="delivery">🚚 Delivery</SelectItem>
                                  <SelectItem value="pickup">🏪 Pickup</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Phone Number */}
                            <div>
                              <Label
                                htmlFor="contact-number"
                                className="text-gray-300 text-sm flex items-center gap-1"
                              >
                                Phone Number *
                                {profile?.phone && (
                                  <span className="text-xs text-neonCyan/60">
                                    (from profile)
                                  </span>
                                )}
                              </Label>
                              <Input
                                id="contact-number"
                                name="contact_number"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-neonCyan focus:ring-1 focus:ring-neonCyan/20 mt-1"
                                placeholder={
                                  profile?.phone
                                    ? 'Your saved phone number'
                                    : '082 345 6789'
                                }
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                data-form-type="other"
                                data-lpignore="true"
                                required
                              />
                              {phone && isValidSouthAfricanPhone(phone) && (
                                <p className="text-neonCyan text-xs mt-1">
                                  ✓ {displaySouthAfricanPhone(phone)}
                                </p>
                              )}
                              {phone &&
                                !isValidSouthAfricanPhone(phone) &&
                                phone.length > 5 && (
                                  <p className="text-red-400 text-xs mt-1">
                                    Please enter a valid SA phone number
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address Panel */}
                        {deliveryType === 'delivery' && (
                          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 space-y-4">
                            <h3 className="text-white font-medium text-sm">Delivery Address</h3>

                            {/* Address Preview - Redirects to profile page for editing */}
                            <div className="space-y-4">
                              {/* Address Preview */}
                              <div className="bg-gray-700/30 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-400 mb-1">Address Preview</p>
                                      <p className="text-white font-medium leading-relaxed text-sm">
                                        {profile?.address 
                                          ? formatAddressForDisplay(parseAddressString(profile.address))
                                          : address.fullAddress || 'No address set'
                                        }
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      toast.info('Redirecting to profile to update address...');
                                      onClose();
                                      router.push('/account?tab=profile');
                                    }}
                                    className="border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500 ml-3 text-xs"
                                    title="Update address on profile page"
                                  >
                                    <Edit2 className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </div>

                              {/* Confirmation Checkboxes */}
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id="roberts-estate-resident"
                                    checked={isRobertsEstateResident}
                                    onCheckedChange={(checked) => setIsRobertsEstateResident(checked === true)}
                                    className="border-gray-500 data-[state=checked]:bg-neonCyan data-[state=checked]:border-neonCyan"
                                  />
                                  <Label 
                                    htmlFor="roberts-estate-resident" 
                                    className="text-gray-300 text-sm cursor-pointer"
                                  >
                                    I confirm I am a Roberts Estate resident
                                  </Label>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id="address-correct"
                                    checked={confirmAddressCorrect}
                                    onCheckedChange={(checked) => setConfirmAddressCorrect(checked === true)}
                                    className="border-gray-500 data-[state=checked]:bg-neonCyan data-[state=checked]:border-neonCyan"
                                  />
                                  <Label 
                                    htmlFor="address-correct" 
                                    className="text-gray-300 text-sm cursor-pointer"
                                  >
                                    I confirm my address is correct
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Special Instructions Panel */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                          <h3 className="text-white font-medium text-sm mb-3">Special Instructions</h3>
                          <div>
                            <Textarea
                              id="special-instructions"
                              name="special_instructions"
                              value={specialInstructions}
                              onChange={(e) => setSpecialInstructions(e.target.value)}
                              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-neonCyan focus:ring-1 focus:ring-neonCyan/20 min-h-[80px] text-sm"
                              placeholder="Any special requests or dietary requirements..."
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              data-form-type="other"
                              data-lpignore="true"
                              rows={3}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                              Optional: Add any special instructions for your order
                            </p>
                          </div>
                        </div>
                      </div>
                    </form>

                    <div className="mt-6 pb-safe-bottom">
                      <Button
                        onClick={handleCreateOrder}
                        disabled={isCreatingOrder || isClosed}
                        className="w-full bg-gradient-to-r from-neonCyan to-neonPink hover:from-neonCyan/90 hover:to-neonPink/90 text-black font-medium py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isClosed 
                          ? 'Restaurant Closed' 
                          : isCreatingOrder 
                            ? 'Creating Order...' 
                            : 'Proceed to Payment'
                        }
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
