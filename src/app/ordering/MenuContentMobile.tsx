/**
 * Mobile-Optimized Menu Content - Responsive Design
 *
 * Mobile-first approach with:
 * - Hamburger-style category selector
 * - Tabbed interface (Categories | Menu | Cart)
 * - No horizontal scrolling
 * - Optimized for all device sizes (mobile to Z-Fold)
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
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
  ArrowLeft,
  Package,
  Filter,
} from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import {
  MenuItemSkeleton,
  ErrorState,
} from '@/components/LoadingComponents';
import { type MenuItem } from '@/lib/dataClient';
import PizzaCustomizationPanel from '@/components/PizzaCustomizationPanel';
import CartSidebar from '@/components/CartSidebar';

type MobileTab = 'categories' | 'menu' | 'cart';

export default function MenuContentMobile() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [paymentAlert, setPaymentAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Mobile-specific state
  const [activeTab, setActiveTab] = useState<MobileTab>('menu');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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
      clearCart();
      if (typeof window !== 'undefined') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment');
        newUrl.searchParams.delete('payment_id');
        window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
      }
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
      if (typeof window !== 'undefined') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment');
        newUrl.searchParams.delete('reason');
        window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
      }
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
      setSelectedCategory(categoryParam);
    } else if (!selectedCategory && filteredAndSortedCategories.length > 0) {
      setSelectedCategory(filteredAndSortedCategories[0].id);
    }
  }, [categoryParam, filteredAndSortedCategories, loading, selectedCategory]);

  // Handle category change with proper Next.js routing
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
    setActiveTab('menu'); // Switch to menu tab when category is selected
    router.push(`/ordering?category=${categoryId}`, { scroll: false });
  }, [router]);

  // Filter items by selected category with memoization and consolidate duplicates
  const currentMenuItems = useMemo(() => {
    if (!selectedCategory || menuItems.length === 0) return [];
    
    const categoryItems = menuItems.filter((item) => item.category_id === selectedCategory);
    
    // Group similar items (same base name but different sizes)
    const itemGroups = new Map<string, MenuItem[]>();
    
    categoryItems.forEach(item => {
      const baseName = item.name
        .replace(/\s+(Regular|Large|Small|Medium)$/i, '')
        .replace(/\s+(R|L|S|M)$/i, '')
        .trim();
      
      if (!itemGroups.has(baseName)) {
        itemGroups.set(baseName, []);
      }
      itemGroups.get(baseName)!.push(item);
    });
    
    // Convert groups back to consolidated items
    const consolidatedItems: (MenuItem & { variants?: MenuItem[] })[] = [];
    
    itemGroups.forEach((items, baseName) => {
      if (items.length === 1) {
        consolidatedItems.push(items[0]);
      } else {
        const baseItem = items[0];
        consolidatedItems.push({
          ...baseItem,
          name: baseName,
          variants: items.sort((a, b) => a.price - b.price),
        });
      }
    });
    
    return consolidatedItems;
  }, [selectedCategory, menuItems]);

  // Get category name with fallback
  const selectedCategoryName = useMemo(() => {
    return filteredAndSortedCategories.find((cat) => cat.id === selectedCategory)?.name || 'Menu';
  }, [filteredAndSortedCategories, selectedCategory]);

  // Check if current category is Pizza
  const isPizzaCategory = useMemo(() => {
    return selectedCategoryName.toLowerCase().includes('pizza');
  }, [selectedCategoryName]);

  // Get accurate item count for each category
  const getCategoryItemCount = useCallback((categoryId: string) => {
    return menuItems.filter((item) => item.category_id === categoryId).length;
  }, [menuItems]);

  const handleAddToCart = (menuItem: MenuItem & { variants?: MenuItem[] }, variantIndex?: number) => {
    const itemToAdd = menuItem.variants && variantIndex !== undefined 
      ? menuItem.variants[variantIndex] 
      : menuItem;

    const cartItem: CartItem = {
      id: itemToAdd.id,
      name: itemToAdd.name,
      price: itemToAdd.price,
      quantity: 1,
      ...(itemToAdd.description && { description: itemToAdd.description }),
    };

    addItem(cartItem);
  };

  const getCartQuantity = (itemId: string): number => {
    const item = cartItems.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Mobile loading state
  if (loading && !isProcessingPayment) {
    return (
      <div className="min-h-screen bg-darkBg">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-darkBg/95 backdrop-blur-sm border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-neon-gradient bg-clip-text text-transparent">
              Little Latte Lane
            </h1>
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="sticky top-14 z-30 bg-darkBg/95 backdrop-blur-sm border-b border-gray-700 px-4">
          <div className="flex">
            {['Categories', 'Menu', 'Cart'].map((tab) => (
              <div
                key={tab}
                className="flex-1 py-3 text-center bg-gray-700 animate-pulse text-gray-500"
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* Loading Content */}
        <div className="p-4">
          <MenuItemSkeleton count={4} />
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
    <div className="min-h-screen bg-darkBg">
      {/* Payment Status Alert */}
      {paymentAlert && (
        <div className="fixed top-4 left-4 right-4 z-50">
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
              <span className="text-sm">{paymentAlert.message}</span>
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

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-darkBg/95 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Little Latte Lane
          </h1>
          
          {/* Category Selector (Hamburger Style) */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="bg-darkBg border-neonCyan/30 text-neonCyan hover:bg-neonCyan/10 flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">{selectedCategoryName}</span>
              <span className="sm:hidden">Filter</span>
            </Button>

            {/* Category Dropdown */}
            {showCategoryDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center justify-between p-2 border-b border-gray-700 mb-2">
                    <span className="text-sm font-semibold text-white">Select Category</span>
                    <button
                      onClick={() => setShowCategoryDropdown(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {filteredAndSortedCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 mb-1 ${
                        selectedCategory === category.id
                          ? 'bg-neonCyan text-black font-semibold'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
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
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="sticky top-14 z-30 bg-darkBg/95 backdrop-blur-sm border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === 'categories'
                ? 'bg-neonCyan/20 text-neonCyan border-b-2 border-neonCyan'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ChefHat className="h-4 w-4" />
              <span className="text-sm">Categories</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === 'menu'
                ? 'bg-neonPink/20 text-neonPink border-b-2 border-neonPink'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="h-4 w-4" />
              <span className="text-sm">Menu</span>
              {currentMenuItems.length > 0 && (
                <Badge variant="secondary" className="bg-gray-600 text-xs">
                  {currentMenuItems.length}
                </Badge>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === 'cart'
                ? 'bg-orange-500/20 text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Cart</span>
              {cartItems.length > 0 && (
                <Badge className="bg-orange-500 text-black text-xs">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="p-4 space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white mb-1">Browse Categories</h2>
              <p className="text-gray-400 text-sm">Select a category to view menu items</p>
            </div>
            
            {filteredAndSortedCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-neonCyan/20 border border-neonCyan text-white'
                    : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-gray-600 text-gray-200 text-xs"
                    >
                      {getCategoryItemCount(category.id)} items
                    </Badge>
                    {selectedCategory === category.id && (
                      <div className="text-neonCyan text-xs">Selected</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="p-4">
            {!selectedCategory ? (
              <div className="text-center py-12">
                <ChefHat className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Select a category first</p>
                <Button
                  onClick={() => setActiveTab('categories')}
                  className="bg-neonCyan/20 text-neonCyan hover:bg-neonCyan/30"
                >
                  Browse Categories
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedCategoryName}</h2>
                    <p className="text-gray-400 text-sm">
                      {currentMenuItems.length} items available
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('categories')}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                </div>

                {isPizzaCategory ? (
                  <PizzaCustomizationPanel />
                ) : (
                  <>
                    {currentMenuItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">
                          No items available in this category
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentMenuItems.map((item) => {
                          const selectedVariantIndex = selectedVariants[item.name] ? 
                            parseInt(selectedVariants[item.name]) : 0;
                          
                          return (
                            <Card
                              key={item.id}
                              className="bg-gray-800/50 border border-gray-700 hover:border-neonCyan/50 transition-all duration-300"
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">
                                      {item.name}
                                    </h3>
                                    {item.description && (
                                      <p className="text-gray-400 text-sm line-clamp-2">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Size Selection for Items with Variants */}
                                  {item.variants && item.variants.length > 1 && (
                                    <div>
                                      <p className="text-gray-300 text-sm mb-2">Size:</p>
                                      <div className="flex gap-2 flex-wrap">
                                        {item.variants.map((variant, index) => {
                                          const sizeLabel = variant.name.match(/(Regular|Large|Small|Medium|R|L|S|M)$/i)?.[0] || 
                                                           (index === 0 ? 'Regular' : 'Large');
                                          const isSelected = selectedVariantIndex === index;
                                          
                                          return (
                                            <button
                                              key={variant.id}
                                              onClick={() => setSelectedVariants(prev => ({
                                                ...prev,
                                                [item.name]: index.toString()
                                              }))}
                                              className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 ${
                                                isSelected
                                                  ? 'bg-neonCyan text-black'
                                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                              }`}
                                            >
                                              {sizeLabel} - R{variant.price.toFixed(2)}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-neonPink">
                                      R{(item.variants ? 
                                        item.variants[selectedVariantIndex]?.price || item.price : 
                                        item.price
                                      ).toFixed(2)}
                                    </span>

                                    {(() => {
                                      const currentItem = item.variants ? item.variants[selectedVariantIndex] : item;
                                      const quantity = currentItem ? getCartQuantity(currentItem.id) : 0;
                                      
                                      return quantity === 0 ? (
                                        <Button
                                          onClick={() => handleAddToCart(item, selectedVariantIndex)}
                                          className="bg-neonCyan text-black hover:bg-neonCyan/80 font-semibold"
                                        >
                                          <Plus className="h-4 w-4 mr-1" />
                                          Add to Cart
                                        </Button>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              updateCartQuantity(currentItem.id, quantity - 1)
                                            }
                                            className="border-gray-600 text-gray-300 hover:bg-gray-700 h-8 w-8 p-0"
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
                                              updateCartQuantity(currentItem.id, quantity + 1)
                                            }
                                            className="border-gray-600 text-gray-300 hover:bg-gray-700 h-8 w-8 p-0"
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-400" />
                Your Cart
              </h2>
              {cartItems.length > 0 && (
                <Badge className="bg-orange-500 text-black">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
                </Badge>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">Your cart is empty</p>
                <p className="text-gray-500 text-sm mb-4">Add items from the menu</p>
                <Button
                  onClick={() => setActiveTab('menu')}
                  className="bg-neonCyan/20 text-neonCyan hover:bg-neonCyan/30"
                >
                  Browse Menu
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <Card key={item.id} className="bg-gray-800/50 border border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 p-1 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
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
                            <span className="text-white font-semibold min-w-[2rem] text-center">
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

                          <span className="text-lg font-bold text-orange-400">
                            R{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
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
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cart Sidebar for Checkout */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
}
