/**
 * Desktop Menu Content - Three Panel Layout
 *
 * Layout: Categories (left) | Menu Items (center) | Cart (right)
 * This matches the wireframe for the modern ordering experience.
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import {
  CategorySkeleton,
  MenuItemSkeleton,
  ErrorState,
} from '@/components/LoadingComponents';
import PizzaCustomizationPanel from '@/components/PizzaCustomizationPanel';
import CartSidebar from '@/components/CartSidebar';
import AddOnCustomizationModal from '@/components/AddOnCustomizationModal';
import type { MenuItem } from '@/types/app-types';

export default function MenuContentDesktop() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({}); // Track selected size for each grouped item
  const [customizingItem, setCustomizingItem] = useState<{ item: MenuItem; selectedSize?: string } | null>(null);
  const [paymentAlert, setPaymentAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');
  const paymentStatus = searchParams.get('payment');
  const paymentId = searchParams.get('payment_id');
  const paymentReason = searchParams.get('reason');

  const { categories, menuItems, loading, error, refetch } = useMenu();
  
  // Filter out Pizza Add-Ons category and sort alphabetically
  const filteredAndSortedCategories = useMemo(() => {
    return categories
      .filter(category => {
        const name = category.name.toLowerCase();
        // Exclude pizza add-ons/add-ons/toppings categories
        return !(name.includes('pizza add') || name.includes('add-on') || name.includes('add on') || name.includes('addon'));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);
  const {
    items: cartItems,
    addItem,
    updateQuantity,
    removeItem,
    total,
    clearCart,
  } = useCartStore();

  // Handle payment status from URL
  useEffect(() => {
    if (paymentStatus === 'success') {
      setIsProcessingPayment(true);
      setPaymentAlert({
        type: 'success',
        message: `Payment successful! ${paymentId ? `Payment ID: ${paymentId}` : 'Your order has been confirmed.'}`,
      });
      // Clear cart on successful payment
      clearCart();
      // Clean up URL immediately using window.history instead of router.replace
      if (typeof window !== 'undefined') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment');
        newUrl.searchParams.delete('payment_id');
        window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
      }
      // Auto-dismiss alert after 5 seconds and clear processing state
      const timer = setTimeout(() => {
        setPaymentAlert(null);
        setIsProcessingPayment(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (paymentStatus === 'error') {
      setIsProcessingPayment(true);
      setPaymentAlert({
        type: 'error',
        message: `Payment failed. ${paymentReason ? `Reason: ${paymentReason.replace(/_/g, ' ')}` : 'Please try again.'}`,
      });
      // Clean up URL but keep cart intact for retry
      if (typeof window !== 'undefined') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment');
        newUrl.searchParams.delete('reason');
        window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
      }
      // Auto-dismiss error alert after 7 seconds and clear processing state
      const timer = setTimeout(() => {
        setPaymentAlert(null);
        setIsProcessingPayment(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, paymentId, paymentReason, clearCart]);

  // Enhanced initialization logic
  useEffect(() => {
    if (loading || filteredAndSortedCategories.length === 0) return;

    if (categoryParam && filteredAndSortedCategories.some(cat => cat.id === categoryParam)) {
      // Valid category from URL
      setSelectedCategory(categoryParam);
    } else if (!selectedCategory && filteredAndSortedCategories.length > 0) {
      // No category selected, choose first one
      setSelectedCategory(filteredAndSortedCategories[0].id);
    }
  }, [categoryParam, filteredAndSortedCategories, loading, selectedCategory]);

  // Optimized: Handle category change with proper Next.js routing
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    // Use Next.js router for proper navigation
    router.push(`/ordering?category=${categoryId}`, { scroll: false });
  }, [router]);

  // Filter items by selected category (no grouping - show each item separately)
  const currentItems = useMemo(() => {
    if (!selectedCategory || menuItems.length === 0) return [];

    return menuItems.filter((item) => item.category_id === selectedCategory);
  }, [selectedCategory, menuItems]);

  // Optimized: Get category name with fallback
  const selectedCategoryName = useMemo(() => {
    return filteredAndSortedCategories.find((cat) => cat.id === selectedCategory)?.name || 'Menu';
  }, [filteredAndSortedCategories, selectedCategory]);

  // Optimized: Check if current category is Pizza
  const isPizzaCategory = useMemo(() => {
    return selectedCategoryName.toLowerCase().includes('pizza');
  }, [selectedCategoryName]);

  // Check if current category is a showcase category
  const isShowcaseCategory = useMemo(() => {
    const category = filteredAndSortedCategories.find((cat) => cat.id === selectedCategory);
    return category?.is_showcase === true;
  }, [filteredAndSortedCategories, selectedCategory]);

  // Optimized: Get accurate item count for each category with memoization
  const getCategoryItemCount = useCallback((categoryId: string) => {
    return menuItems.filter((item) => item.category_id === categoryId).length;
  }, [menuItems]);

  const handleCustomize = (item: MenuItem, variationId?: string) => {
    const variations = item.menu_item_variations || [];
    const selectedVariation = variations.find(v => v.id === variationId);

    setCustomizingItem({
      item,
      selectedSize: selectedVariation?.name,
    });
  };

  const handleAddWithAddons = (selectedAddons: any[]) => {
    if (!customizingItem) return;

    const { item, selectedSize } = customizingItem;
    const variations = item.menu_item_variations || [];
    const selectedVariation = variations.find(v => v.name === selectedSize);
    const variationId = selectedVariation?.id;

    // Calculate total price including add-ons
    const basePrice = selectedVariation?.absolute_price || item.price;
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0);
    const totalPrice = basePrice + addonsPrice;

    // Build cart item name with add-ons
    let itemName = item.name;
    if (selectedSize) itemName += ` (${selectedSize})`;

    const addonNames = selectedAddons
      .map(a => `${a.quantity}x ${a.addonName}${a.variationName ? ` (${a.variationName})` : ''}`)
      .join(', ');

    if (addonNames) itemName += ` + ${addonNames}`;

    const cartItem: CartItem = {
      id: item.id, // Always use menu_item_id, not variation ID
      name: itemName,
      price: totalPrice,
      quantity: 1,
      customization: {
        variationId: selectedVariation?.id,
        variationName: selectedVariation?.name,
        isCustomized: true,
      },
    };

    addItem(cartItem);
  };

  const handleAddToCart = (item: MenuItem, variationId?: string) => {
    const variations = item.menu_item_variations || [];
    const hasAddons = item.available_addons && item.available_addons.length > 0;

    // If item has variations and none is selected, don't add to cart
    if (variations.length > 0 && !variationId) {
      return;
    }

    // If item has add-ons, open customization modal
    if (hasAddons) {
      handleCustomize(item, variationId);
      return;
    }

    // Get the selected variation or use item itself
    const selectedVariation = variations.find(v => v.id === variationId);

    const cartItem: CartItem = {
      id: item.id, // Always use menu_item_id, not variation ID
      name: selectedVariation ? `${item.name} (${selectedVariation.name})` : item.name,
      price: selectedVariation?.absolute_price || item.price,
      quantity: 1,
      customization: selectedVariation ? {
        variationId: selectedVariation.id,
        variationName: selectedVariation.name,
      } : undefined,
    };

    addItem(cartItem);
    // Toast is now handled in the store
  };

  const getCartQuantity = (itemId: string): number => {
    const item = cartItems.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      // Toast is now handled in the store
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (loading && !isProcessingPayment) {
    return (
      <div className="min-h-screen bg-darkBg">
        <div className="flex">
          {/* Left Panel - Categories Skeleton */}
          <div className="w-64 xl:w-72 bg-gray-900 border-r border-gray-700 p-4">
            <div className="mb-4">
              <div className="w-32 h-6 bg-gradient-to-r from-neonCyan/30 to-neonPink/30 rounded shimmer" />
            </div>
            <CategorySkeleton count={8} />
          </div>

          {/* Center Panel - Items Skeleton */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <div className="w-48 h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded shimmer" />
              <div className="w-32 h-4 bg-gray-700 rounded shimmer mt-2" />
            </div>
            <MenuItemSkeleton count={6} />
          </div>

          {/* Right Panel - Enhanced Cart Skeleton */}
          <div className="w-80 xl:w-96 bg-gray-900 border-l border-gray-700 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-20 h-6 bg-gradient-to-r from-neonCyan/30 to-neonPink/30 rounded shimmer" />
                <div className="w-8 h-8 bg-gray-700 rounded-full shimmer" />
              </div>
              
              {/* Cart items skeleton */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-12 h-12 bg-gray-700 rounded shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-gray-700 rounded shimmer" />
                    <div className="w-1/2 h-3 bg-gray-700 rounded shimmer" />
                  </div>
                  <div className="w-16 h-6 bg-gray-700 rounded shimmer" />
                </div>
              ))}
              
              {/* Cart total skeleton */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-6 bg-gray-700 rounded shimmer" />
                  <div className="w-20 h-8 bg-gradient-to-r from-neonCyan/30 to-neonPink/30 rounded shimmer" />
                </div>
                <div className="w-full h-12 bg-gradient-to-r from-neonCyan/20 to-neonPink/20 rounded-lg shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-darkBg">
        <ErrorState
          title="Menu Temporarily Unavailable"
          message={`We're having trouble loading the menu. ${error}`}
          onRetry={refetch}
          className="min-h-screen"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen bg-darkBg overflow-hidden">
      {/* Payment Status Alert */}
      {paymentAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <Alert
            className={`${
              paymentAlert.type === 'success'
                ? 'bg-green-900/90 border-green-500 text-green-100'
                : 'bg-red-900/90 border-red-500 text-red-100'
            } backdrop-blur-sm`}
          >
            {paymentAlert.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className="flex items-center justify-between">
              <span>{paymentAlert.message}</span>
              <button
                onClick={() => setPaymentAlert(null)}
                className="ml-2 hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex overflow-hidden h-screen pt-4">
        {/* LEFT PANEL - Categories */}
        <div className="w-64 xl:w-72 bg-gray-900 border-r border-gray-700 h-full flex-shrink-0 overflow-y-auto scrollbar-thin scrollbar-thumb-neonCyan/50 scrollbar-track-gray-800 hover:scrollbar-thumb-neonCyan">
          <div className="p-3 xl:p-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-neonCyan" />
              Categories
            </h2>

            <div className="space-y-2">
              {filteredAndSortedCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`w-full text-left p-2 xl:p-3 rounded-lg transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-neonCyan text-black font-semibold shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm xl:text-base truncate flex-1">{category.name}</span>
                    <Badge
                      variant="secondary"
                      className="bg-gray-600 text-gray-200 text-xs"
                    >
                      {getCategoryItemCount(category.id)}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER PANEL - Menu Items or Pizza Customizer */}
        <div className="flex-1 p-4 xl:p-6 overflow-y-auto overflow-x-hidden h-full scrollbar-thin scrollbar-thumb-neonPink/50 scrollbar-track-gray-900 hover:scrollbar-thumb-neonPink">
          <div className="mb-4 xl:mb-6">
            <h1 className="text-2xl xl:text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent line-clamp-2">
              {selectedCategoryName}
            </h1>
            {isShowcaseCategory && (
              <div className="mt-3 p-3 bg-neonCyan/10 border border-neonCyan/30 rounded-lg">
                <p className="text-neonCyan text-sm">
                  ✨ All items shown here can be customized with {selectedCategoryName.toLowerCase()}
                </p>
              </div>
            )}
            {!isPizzaCategory && !isShowcaseCategory && (
              <p className="text-gray-400 mt-1 text-sm">
                {currentItems.length} items available
              </p>
            )}
          </div>

          {isPizzaCategory ? (
            // Show Pizza Customization Panel
            <PizzaCustomizationPanel />
          ) : (
            // Show Regular Menu Items
            <>
              {currentItems.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    No items available in this category
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 xl:gap-6">
                  {currentItems.map((item) => {
                    const variations = item.menu_item_variations || [];
                    // Get selected variation for this item
                    const selectedVariationId = selectedSizes[item.id] || variations[0]?.id;
                    
                    return (
                      <Card
                        key={item.id}
                        className="group relative bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in overflow-hidden flex flex-col"
                        style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)',
                          maxWidth: '100%'
                        }}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-neonCyan group-hover:text-neonPink transition-colors duration-300 text-base xl:text-lg line-clamp-2 min-h-[3rem]">
                            {item.name}
                          </CardTitle>
                          <div className="min-h-[2.5rem]">
                            {item.description && (
                              <p className="text-gray-300 text-xs xl:text-sm mt-1 group-hover:text-gray-200 transition-colors duration-300 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="overflow-hidden flex-grow flex flex-col justify-end">
                          {/* Size Selection for Items with Multiple Variations */}
                          {variations.length > 0 && (
                            <div className="mb-3">
                              <p className="text-gray-300 text-sm mb-2 group-hover:text-gray-200 transition-colors duration-300">Size:</p>
                              <div className="flex gap-2 flex-wrap">
                                {variations.map((variation) => {
                                  const isSelected = selectedVariationId === variation.id;

                                  return (
                                    <button
                                      key={variation.id}
                                      onClick={() => setSelectedSizes(prev => ({
                                        ...prev,
                                        [item.id]: variation.id
                                      }))}
                                      className={`px-2 xl:px-3 py-1 rounded text-xs xl:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                                        isSelected
                                          ? 'bg-neonCyan/80 text-black backdrop-blur-sm shadow-md'
                                          : 'bg-black/30 text-gray-300 hover:bg-black/50 hover:text-neonCyan backdrop-blur-sm border border-gray-600/50 hover:border-neonCyan/30'
                                      }`}
                                    >
                                      {variation.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Add-Ons Button - Shows if item has add-ons */}
                          {item.available_addons && item.available_addons.length > 0 && (
                            <div className="mb-3">
                              <Button
                                onClick={() => handleCustomize(item, selectedVariationId)}
                                size="sm"
                                variant="outline"
                                className="w-full bg-transparent border-2 border-purple-500/50 text-purple-400 hover:border-purple-400 hover:text-purple-300 hover:bg-purple-500/10 font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add-Ons
                              </Button>
                            </div>
                          )}

                          {/* Price and Action Buttons Row */}
                          <div className="space-y-2">
                            {/* Price and Main Add Button */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xl xl:text-2xl font-bold text-neonPink group-hover:text-neonCyan transition-colors duration-300 whitespace-nowrap">
                                R{(() => {
                                  const selectedVariation = variations.find(v => v.id === selectedVariationId);
                                  return (selectedVariation?.absolute_price || item.price || 0).toFixed(2);
                                })()}
                              </span>

                              {(() => {
                                // Get the ID to use for cart operations
                                const cartItemId = selectedVariationId || item.id;
                                const quantity = getCartQuantity(cartItemId);

                                // Check if this item needs size selection and none is selected
                                const needsSelection = variations.length > 0 && !selectedVariationId;

                                return quantity === 0 ? (
                                  <Button
                                    onClick={() => {
                                      // Always skip add-ons modal when clicking Add directly
                                      // Users must click "Add Extras" button to customize
                                      const variations = item.menu_item_variations || [];
                                      const selectedVariation = variations.find(v => v.id === selectedVariationId);

                                      const cartItem = {
                                        id: selectedVariationId || item.id,
                                        name: selectedVariation ? `${item.name} (${selectedVariation.name})` : item.name,
                                        price: selectedVariation?.absolute_price || item.price,
                                        quantity: 1,
                                      };

                                      addItem(cartItem);
                                    }}
                                    disabled={needsSelection}
                                    size="sm"
                                    className={`font-semibold transition-all duration-300 backdrop-blur-sm shadow-md text-xs xl:text-sm whitespace-nowrap ${
                                      needsSelection
                                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-600/30'
                                        : 'bg-gradient-to-r from-neonPink to-orange-500 text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(255,105,180,0.5)] border-0'
                                    }`}
                                  >
                                    <Plus className="h-3 w-3 xl:h-4 xl:w-4 mr-1" />
                                    {needsSelection ? 'Select Size' : 'Add'}
                                  </Button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateCartQuantity(cartItemId, quantity - 1)
                                    }
                                    className="border-neonCyan/30 text-neonCyan hover:bg-neonCyan/20 hover:text-neonPink backdrop-blur-sm transition-all duration-300"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-white font-semibold min-w-[2rem] text-center">
                                    {quantity}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateCartQuantity(cartItemId, quantity + 1)
                                    }
                                    className="border-neonCyan/30 text-neonCyan hover:bg-neonCyan/20 hover:text-neonPink backdrop-blur-sm transition-all duration-300"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              );
                            })()}
                            </div>
                          </div>
                          
                          {/* Hover Effect Glow */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT PANEL - Cart */}
        <div className="w-64 xl:w-72 bg-gray-900 border-l border-gray-700 h-full flex-shrink-0 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-gray-800 hover:scrollbar-thumb-orange-500">
          <div className="p-3 xl:p-4 sticky top-0">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-neonPink" />
              Your Cart
              {cartItems.length > 0 && (
                <Badge className="bg-neonPink text-black ml-2">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </h2>

            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Your cart is empty</p>
                <p className="text-gray-500 text-sm">Add items from the menu</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-gray-800 rounded-lg p-2 xl:p-3">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-semibold text-white text-xs xl:text-sm line-clamp-2 flex-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-white font-semibold min-w-[1.5rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <span className="text-neonPink font-bold">
                          R{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-neonCyan">
                      R{total().toFixed(2)}
                    </span>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-neonPink to-neonCyan text-black font-bold py-3 hover:scale-105 transition-transform"
                    onClick={() => setIsCartOpen(true)}
                  >
                    Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Add-On Customization Modal */}
      {customizingItem && (
        <AddOnCustomizationModal
          isOpen={true}
          onClose={() => setCustomizingItem(null)}
          item={customizingItem.item}
          selectedSize={customizingItem.selectedSize}
          onAddToCart={handleAddWithAddons}
        />
      )}
    </div>
  );
}
