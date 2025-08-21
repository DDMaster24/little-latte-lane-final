'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { performCheckout } from '@/lib/orderActions';
import PayFastPayment from '@/components/PayFastPayment';
import {
  formatSouthAfricanPhone,
  isValidSouthAfricanPhone,
  displaySouthAfricanPhone,
} from '@/lib/phoneUtils';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const cart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = useCartStore((state) => state.total());
  const { user, profile } = useAuth();
  const router = useRouter();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>(
    'delivery'
  );
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [hasLoadedProfileData, setHasLoadedProfileData] = useState(false);

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
        setAddress(profile.address);
        fieldsPopulated.push('delivery address');
        console.log('🏠 Auto-populated address:', profile.address);
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
      setAddress('');
      setPhone('');
      setDeliveryType('delivery');
      setHasLoadedProfileData(false);
    }
  }, [profile]);

  const handleCreateOrder = async () => {
    if (!profile) {
      toast.error('Please log in to checkout');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (deliveryType === 'delivery' && !address.trim()) {
      toast.error('Please enter a delivery address');
      return;
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

      // Step 2: Create order
      await new Promise(resolve => setTimeout(resolve, 300));
      currentStep = 2;
      toast.loading(orderSteps[currentStep], { id: 'create-order' });

      const result = await performCheckout(
        profile.id,
        checkoutItems,
        total,
        deliveryType,
        user?.email || 'customer@example.com',
        {
          firstName: profile.full_name?.split(' ')[0] || 'Customer',
          lastName: profile.full_name?.split(' ').slice(1).join(' ') || 'User',
          phone: validFormattedPhone,
          address: deliveryType === 'delivery' ? address : undefined,
        },
        specialInstructions.trim() || undefined // Pass special instructions
      );

      // Step 3: Finalize
      currentStep = 3;
      toast.loading(orderSteps[currentStep], { id: 'create-order' });
      await new Promise(resolve => setTimeout(resolve, 200));

      if (result.success && result.orderId) {
        setOrderId(result.orderId);
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
    toast.success('Payment initiated! Redirecting to PayFast...');
  };

  const getItemDescription = () => {
    return cart.map((item) => `${item.name} x${item.quantity}`).join(', ');
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
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neonCyan/30">
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
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
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
                    <div className="border-t border-neonCyan/30 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-white">
                          Total:
                        </span>
                        <span className="text-xl font-bold text-neonCyan">
                          R{total.toFixed(2)}
                        </span>
                      </div>

                      <Button
                        onClick={() => setStep('checkout')}
                        className="w-full neon-button"
                        disabled={cart.length === 0}
                      >
                        Checkout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 'checkout' && (
              <div className="space-y-4">
                {orderId ? (
                  // Show payment section when order exists
                  <>
                    <div className="bg-neonCyan/20 border border-neonCyan/40 rounded p-3 backdrop-blur-md">
                      <h3 className="text-neonCyan font-medium mb-2">
                        Order Created!
                      </h3>
                      <p className="text-white font-semibold text-sm">Order #{orderId}</p>
                      <p className="text-neonPink text-sm">
                        Total: R{total.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-neonPink/20 border border-neonPink/40 rounded p-3 backdrop-blur-md">
                      <p className="text-neonPink text-sm">
                        Your order is ready for payment. Click below to pay
                        securely with PayFast.
                      </p>
                    </div>

                    <PayFastPayment
                      orderId={orderId!}
                      userId={profile?.id || ''}
                      amount={total}
                      itemName={`Little Latte Lane Order #${orderId}`}
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
                          deliveryType === 'delivery' ? address : undefined,
                      }}
                      onPaymentInitiated={handlePaymentInitiated}
                      className="w-full"
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
                  // Show checkout form when no order exists
                  <>
                    <div className="bg-neonCyan/20 border border-neonCyan/40 rounded p-3 backdrop-blur-md">
                      <h3 className="text-neonCyan font-medium mb-2">
                        Order Summary
                      </h3>
                      <p className="text-neonPink text-sm">
                        {cart.length} items • R{total.toFixed(2)}
                      </p>
                      {(profile?.phone || profile?.full_name) && (
                        <div className="mt-2 pt-2 border-t border-neonCyan/30">
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
                      <div className="space-y-4">
                        <div>
                          <Label className="text-neonCyan">
                            Delivery Type *
                          </Label>
                          <Select
                            value={deliveryType}
                            onValueChange={(value) =>
                              setDeliveryType(value as 'delivery' | 'pickup')
                            }
                          >
                            <SelectTrigger className="bg-darkBg/80 backdrop-blur-md border-neonPink/50 text-neonPink focus:border-neonCyan focus:ring-neonCyan/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-darkBg/95 backdrop-blur-lg border-neonPink/50">
                              <SelectItem value="delivery">Delivery</SelectItem>
                              <SelectItem value="pickup">Pickup</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {deliveryType === 'delivery' && (
                          <div>
                            <Label
                              htmlFor="delivery-address"
                              className="text-neonCyan flex items-center gap-1"
                            >
                              Delivery Address *
                              {profile?.address && (
                                <span className="text-xs text-neonCyan/60">
                                  (from profile)
                                </span>
                              )}
                            </Label>
                            <Input
                              id="delivery-address"
                              name="delivery_location"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="bg-darkBg/80 backdrop-blur-md border-neonPink/50 text-neonPink placeholder:text-neonPink/50 focus:border-neonCyan focus:ring-neonCyan/20"
                              placeholder={
                                profile?.address
                                  ? 'Your saved delivery address'
                                  : 'Enter your delivery address'
                              }
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              data-form-type="other"
                              data-lpignore="true"
                              required
                            />
                          </div>
                        )}

                        <div>
                          <Label
                            htmlFor="contact-number"
                            className="text-neonCyan flex items-center gap-1"
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
                            className="bg-darkBg/80 backdrop-blur-md border-neonPink/50 text-neonPink placeholder:text-neonPink/50 focus:border-neonCyan focus:ring-neonCyan/20"
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

                        <div>
                          <Label
                            htmlFor="special-instructions"
                            className="text-neonCyan"
                          >
                            Special Instructions
                            <span className="text-xs text-neonCyan/60 ml-1">(optional)</span>
                          </Label>
                          <Textarea
                            id="special-instructions"
                            name="special_instructions"
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                            className="bg-darkBg/80 backdrop-blur-md border-neonPink/50 text-neonPink placeholder:text-neonPink/50 focus:border-neonCyan focus:ring-neonCyan/20 min-h-[80px]"
                            placeholder="Any special requests or dietary requirements..."
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            data-form-type="other"
                            data-lpignore="true"
                            rows={3}
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Optional: Add any special instructions for your order
                          </p>
                        </div>
                      </div>
                    </form>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setStep('cart')}
                        variant="outline"
                        className="flex-1 border-neonPink/50 text-neonPink hover:bg-neonPink/10"
                      >
                        Back to Cart
                      </Button>
                      <Button
                        onClick={handleCreateOrder}
                        disabled={isCreatingOrder}
                        className="flex-1 neon-button"
                      >
                        {isCreatingOrder ? 'Processing...' : 'Pay Now'}
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
