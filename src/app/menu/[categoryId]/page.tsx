'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import PizzaCustomizer from '@/components/PizzaCustomizer';
import toast from 'react-hot-toast';
import { ShoppingCart, Settings } from 'lucide-react';

const supabase = createClientComponentClient<Database>();

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: number | null;
  stock: number | null;
  is_available: boolean | null;
  nutritional_info: {
    variants?: {
      name: string;
      price: number;
      size: string;
    }[];
    addons?: {
      name: string;
      small_price: number;
      large_price: number;
    }[];
  } | null;
  ingredients: string[] | null;
  allergens: string[] | null;
}

export default function MenuCategory() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const [items, setItems] = useState<MenuItem[]>([]);
  const [category, setCategory] = useState<{
    name: string;
    description?: string;
  } | null>(null);
  const [selectedPizza, setSelectedPizza] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch category info
        const { data: categoryData } = await supabase
          .from('categories')
          .select('name, description')
          .eq('id', categoryId)
          .single();

        setCategory(categoryData);

        // Fetch menu items
        const { data: itemsData } = await supabase
          .from('menu_items')
          .select('*')
          .eq('category_id', categoryId)
          .eq('is_available', true)
          .order('sort_order');

        setItems(itemsData || []);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        toast.error('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const handleAddToCart = (item: MenuItem) => {
    // Check if this is a pizza with variants (needs customization)
    const hasVariants =
      item.nutritional_info?.variants &&
      item.nutritional_info.variants.length > 0;

    if (hasVariants && category?.name.toLowerCase().includes('pizza')) {
      setSelectedPizza(item);
      return;
    }

    // Regular item - add directly to cart
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      description: item.description || '',
    };

    addToCart(cartItem);

    toast.success(`${item.name} added to cart!`);
  };

  const handleCustomizedAddToCart = (customizedItem: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description: string;
    customization: {
      variant: { name: string; price: number; size: string };
      addons: { name: string; price: number }[];
    };
  }) => {
    const cartItem: CartItem = {
      id: customizedItem.id,
      name: customizedItem.name,
      price: customizedItem.price,
      quantity: customizedItem.quantity,
      description: customizedItem.description,
      customization: customizedItem.customization,
    };

    addToCart(cartItem);
  };

  const isPizzaCategory = category?.name.toLowerCase().includes('pizza');

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4">
            {category?.name || 'Menu'}
          </h1>
          {category?.description && (
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const hasVariants =
              item.nutritional_info?.variants &&
              item.nutritional_info.variants.length > 0;
            const isVegetarian = item.allergens?.includes('Vegetarian');
            const isCustomizable = hasVariants && isPizzaCategory;

            return (
              <Card
                key={item.id}
                className="bg-black/50 backdrop-blur-md border-neon-green/50 hover:border-neon-green transition-colors group"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-neon-green text-xl group-hover:text-neon-green/80 transition-colors">
                      {item.name}
                    </CardTitle>
                    <div className="flex flex-col items-end space-y-1">
                      {isVegetarian && (
                        <Badge
                          variant="outline"
                          className="border-green-500 text-green-400"
                        >
                          V
                        </Badge>
                      )}
                      {isCustomizable && (
                        <Badge
                          variant="outline"
                          className="border-neon-pink text-neon-pink"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.description && (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Price Display */}
                  <div className="flex items-center justify-between">
                    <div>
                      {hasVariants ? (
                        <div className="space-y-1">
                          <p className="text-neon-blue font-semibold">
                            From R{item.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Multiple sizes available
                          </p>
                        </div>
                      ) : (
                        <p className="text-neon-blue font-semibold text-xl">
                          R{item.price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {item.stock !== null &&
                      item.stock < 10 &&
                      item.stock > 0 && (
                        <Badge
                          variant="outline"
                          className="border-yellow-500 text-yellow-400"
                        >
                          Only {item.stock} left
                        </Badge>
                      )}
                  </div>

                  {/* Ingredients */}
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Ingredients:</p>
                      <p className="text-xs text-gray-300">
                        {item.ingredients.slice(0, 3).join(', ')}
                        {item.ingredients.length > 3 && '...'}
                      </p>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-neon-green text-black hover:bg-neon-green/80 font-semibold transition-colors"
                    disabled={item.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.stock === 0
                      ? 'Out of Stock'
                      : isCustomizable
                        ? 'Customize & Add'
                        : 'Add to Cart'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-xl mb-4">No items available</div>
            <p className="text-gray-500">
              This category doesn&apos;t have any items at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Pizza Customizer Modal */}
      {selectedPizza && (
        <PizzaCustomizer
          item={selectedPizza}
          onAddToCart={handleCustomizedAddToCart}
          onClose={() => setSelectedPizza(null)}
        />
      )}
    </div>
  );
}
