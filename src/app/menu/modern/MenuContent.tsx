/**
 * Modern Menu Content - Three Panel Layout
 *
 * Layout: Categories (left) | Menu Items (center) | Cart (right)
 * This matches the wireframe for the modern ordering experience.
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  Clock,
} from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import {
  CategorySkeleton,
  MenuItemSkeleton,
} from '@/components/LoadingComponents';
import { type MenuItem } from '@/lib/dataClient';
import PizzaCustomizationPanel from '@/components/PizzaCustomizationPanel';

export default function MenuContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const { categories, menuItems, loading, error, refetch } = useMenu();
  const {
    items: cartItems,
    addItem,
    updateQuantity,
    removeItem,
    total,
  } = useCartStore();

  // Enhanced initialization logic
  useEffect(() => {
    if (loading || categories.length === 0) return;

    if (categoryParam && categories.some(cat => cat.id === categoryParam)) {
      // Valid category from URL
      setSelectedCategory(categoryParam);
    } else if (!selectedCategory && categories.length > 0) {
      // No category selected, choose first one
      setSelectedCategory(categories[0].id);
    }
  }, [categoryParam, categories, loading, selectedCategory]);

  // Handle category change with proper URL updates
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('category', categoryId);
    window.history.pushState({}, '', url.toString());
  };

  // Filter items by selected category with loading state check
  const currentMenuItems = selectedCategory && menuItems.length > 0
    ? menuItems.filter((item) => item.category_id === selectedCategory)
    : [];

  // Get category name with fallback
  const selectedCategoryName =
    categories.find((cat) => cat.id === selectedCategory)?.name || 'Menu';

  // Check if current category is Pizza
  const isPizzaCategory = selectedCategoryName.toLowerCase().includes('pizza');

  // Get accurate item count for each category
  const getCategoryItemCount = (categoryId: string) => {
    return menuItems.filter((item) => item.category_id === categoryId).length;
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    const cartItem: CartItem = {
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      ...(menuItem.description && { description: menuItem.description }),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg">
        <div className="flex">
          {/* Left Panel - Categories Skeleton */}
          <div className="w-64 bg-gray-900 border-r border-gray-700 p-4">
            <CategorySkeleton />
          </div>

          {/* Center Panel - Items Skeleton */}
          <div className="flex-1 p-6">
            <MenuItemSkeleton />
          </div>

          {/* Right Panel - Cart Skeleton */}
          <div className="w-80 bg-gray-900 border-l border-gray-700 p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            Menu temporarily unavailable
          </h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button
            onClick={refetch}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg">
      <div className="flex">
        {/* LEFT PANEL - Categories */}
        <div className="w-64 bg-gray-900 border-r border-gray-700 min-h-screen">
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-neonCyan" />
              Categories
            </h2>

            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-neonCyan text-black font-semibold shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
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
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent">
              {selectedCategoryName}
            </h1>
            {!isPizzaCategory && (
              <p className="text-gray-400 mt-1">
                {currentMenuItems.length} items available
              </p>
            )}
          </div>

          {isPizzaCategory ? (
            // Show Pizza Customization Panel
            <PizzaCustomizationPanel />
          ) : (
            // Show Regular Menu Items
            <>
              {currentMenuItems.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    No items available in this category
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentMenuItems.map((item) => {
                    const quantity = getCartQuantity(item.id);
                    return (
                      <Card
                        key={item.id}
                        className="bg-gray-800 border-gray-600 hover:border-gray-500 transition-all duration-200 hover:scale-105"
                      >
                        <CardHeader className="pb-3">
                          {item.image_url && (
                            <div className="relative w-full h-40 mb-3 overflow-hidden rounded bg-gray-700">
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                width={320}
                                height={160}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <CardTitle className="text-white text-lg">
                            {item.name}
                          </CardTitle>
                          {item.description && (
                            <p className="text-gray-400 text-sm mt-1">
                              {item.description}
                            </p>
                          )}
                        </CardHeader>

                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-neonPink">
                              R{item.price.toFixed(2)}
                            </span>

                            {quantity === 0 ? (
                              <Button
                                onClick={() => handleAddToCart(item)}
                                className="bg-neonCyan text-black hover:bg-cyan-400 font-semibold"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateCartQuantity(item.id, quantity - 1)
                                  }
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
                                    updateCartQuantity(item.id, quantity + 1)
                                  }
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
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
        <div className="w-80 bg-gray-900 border-l border-gray-700 min-h-screen">
          <div className="p-4 sticky top-0">
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
                    <div key={item.id} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white text-sm">
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
                    onClick={() => {
                      // Navigate to orders page for now (checkout will be implemented later)
                      window.location.href = '/orders';
                    }}
                  >
                    View Orders
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
