'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase-client';

interface PizzaVariation {
  id: string;
  name: string;
  absolute_price: number;
  is_available: boolean;
}

interface PizzaItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  variations: PizzaVariation[];
}

interface PizzaTopping {
  id: string;
  name: string;
  smallPrice: number;
  largePrice: number;
}

// Hardcoded toppings - these could also be fetched from database in future
const PIZZA_TOPPINGS: PizzaTopping[] = [
  { id: '1', name: 'Salami', smallPrice: 10.0, largePrice: 15.0 },
  { id: '2', name: 'Ham', smallPrice: 7.0, largePrice: 12.0 },
  { id: '3', name: 'Avo', smallPrice: 10.0, largePrice: 15.0 },
  { id: '4', name: 'Pineapple', smallPrice: 7.0, largePrice: 12.0 },
  { id: '5', name: 'Figs', smallPrice: 12.0, largePrice: 17.0 },
  { id: '6', name: 'Olives', smallPrice: 8.0, largePrice: 17.0 },
  { id: '7', name: 'Mushrooms', smallPrice: 12.0, largePrice: 17.0 },
  { id: '8', name: 'Garlic', smallPrice: 5.0, largePrice: 10.0 },
  { id: '9', name: 'Feta', smallPrice: 10.0, largePrice: 15.0 },
];

interface PizzaCustomizationPanelProps {
  onAddToCart?: (item: CartItem) => void;
}

export default function PizzaCustomizationPanel({
  onAddToCart,
}: PizzaCustomizationPanelProps) {
  const [pizzaItems, setPizzaItems] = useState<PizzaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPizza, setSelectedPizza] = useState<PizzaItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'small' | 'large'>('small');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();

  // Fetch pizza items from database
  useEffect(() => {
    const fetchPizzas = async () => {
      setLoading(true);
      setError(null);

      try {
        const supabase = getSupabaseClient();

        // Get Pizza category ID
        const { data: categoryData, error: categoryError } = await supabase
          .from('menu_categories')
          .select('id')
          .eq('name', 'Pizza')
          .eq('category_type', 'menu_items')
          .single();

        if (categoryError || !categoryData) {
          setError('Could not find Pizza category');
          setLoading(false);
          return;
        }

        // Get all pizza items with their variations
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select(`
            id,
            name,
            description,
            price,
            menu_item_variations (
              id,
              name,
              absolute_price,
              is_available
            )
          `)
          .eq('category_id', categoryData.id)
          .eq('is_available', true)
          .order('name');

        if (itemsError) {
          setError('Failed to load pizza items');
          setLoading(false);
          return;
        }

        // Transform data
        const pizzas: PizzaItem[] = (itemsData || []).map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          variations: (item.menu_item_variations || [])
            .filter((v) => v.is_available)
            .map((v) => ({
              id: v.id,
              name: v.name,
              absolute_price: Number(v.absolute_price || 0),
              is_available: v.is_available ?? false,
            })),
        }));

        setPizzaItems(pizzas);

        // Auto-select first pizza if available
        if (pizzas.length > 0) {
          setSelectedPizza(pizzas[0]);
        }
      } catch (err) {
        setError('Failed to load pizza menu');
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, []);

  // Get price for selected size
  const getSelectedPrice = useCallback(() => {
    if (!selectedPizza) return 0;

    const sizeMap: Record<string, string> = {
      'small': 'Small',
      'large': 'Large',
    };

    const variation = selectedPizza.variations.find(
      v => v.name.toLowerCase() === sizeMap[selectedSize].toLowerCase()
    );

    return variation?.absolute_price || selectedPizza.price;
  }, [selectedPizza, selectedSize]);

  // Check if pizza has both sizes available
  const availableSizes = useMemo(() => {
    if (!selectedPizza) return { small: false, large: false };

    const hasSmall = selectedPizza.variations.some(
      v => v.name.toLowerCase() === 'small' && v.is_available
    );
    const hasLarge = selectedPizza.variations.some(
      v => v.name.toLowerCase() === 'large' && v.is_available
    );

    return { small: hasSmall, large: hasLarge };
  }, [selectedPizza]);

  // Auto-select available size when pizza changes
  useEffect(() => {
    if (selectedPizza) {
      if (availableSizes.small) {
        setSelectedSize('small');
      } else if (availableSizes.large) {
        setSelectedSize('large');
      }
    }
  }, [selectedPizza, availableSizes]);

  const calculateTotalPrice = useCallback(() => {
    const basePrice = getSelectedPrice();

    const toppingsPrice = selectedToppings.reduce((sum, toppingName) => {
      const topping = PIZZA_TOPPINGS.find((t) => t.name === toppingName);
      if (topping) {
        return (
          sum +
          (selectedSize === 'small' ? topping.smallPrice : topping.largePrice)
        );
      }
      return sum;
    }, 0);

    return (basePrice + toppingsPrice) * quantity;
  }, [selectedSize, selectedToppings, quantity, getSelectedPrice]);

  const handlePizzaChange = (pizza: PizzaItem) => {
    setSelectedPizza(pizza);
    setSelectedToppings([]); // Reset toppings when changing pizza
  };

  const handleSizeChange = (size: 'small' | 'large') => {
    setSelectedSize(size);
  };

  const handleToppingToggle = (toppingName: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingName)
        ? prev.filter((name) => name !== toppingName)
        : [...prev, toppingName]
    );
  };

  const getToppingPrice = (topping: PizzaTopping) => {
    return selectedSize === 'small' ? topping.smallPrice : topping.largePrice;
  };

  const handleAddToCart = () => {
    if (!selectedPizza) return;

    const toppingsText =
      selectedToppings.length > 0 ? ` + ${selectedToppings.join(', ')}` : '';
    const sizeText =
      selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1);

    // Find the variation ID for the selected size
    const selectedVariation = selectedPizza.variations.find(
      v => v.name.toLowerCase() === selectedSize
    );

    const cartItem: CartItem = {
      id: selectedPizza.id, // Use actual menu item ID
      name: `${selectedPizza.name} (${sizeText})${toppingsText}`,
      price: calculateTotalPrice() / quantity,
      quantity: quantity,
      customization: {
        variationId: selectedVariation?.id,
        variationName: sizeText,
        pizzaType: selectedPizza.name,
        size: selectedSize,
        toppings: selectedToppings,
        basePrice: getSelectedPrice(),
        toppingsPrice: selectedToppings.reduce((sum, toppingName) => {
          const topping = PIZZA_TOPPINGS.find((t) => t.name === toppingName);
          return sum + (topping ? getToppingPrice(topping) : 0);
        }, 0),
        isCustomized: true,
      },
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    } else {
      addItem(cartItem);
    }

    // Reset after adding
    setSelectedToppings([]);
    setQuantity(1);
  };

  const totalPrice = calculateTotalPrice();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neonCyan" />
        <span className="ml-3 text-gray-300">Loading pizzas...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // No pizzas available
  if (pizzaItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No pizzas available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-neonCyan via-neonPink to-neonBlue bg-clip-text text-transparent">
          Build Your Pizza
        </h1>
        <p className="text-gray-300 text-lg">
          Create your perfect pizza with our fresh ingredients
        </p>
      </div>

      {/* Step 1: Choose Pizza Type */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-neonBlue/50">
        <CardHeader>
          <CardTitle className="text-neonBlue text-xl">
            Step 1: Choose Your Pizza
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pizzaItems.map((pizza) => (
            <div
              key={pizza.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPizza?.id === pizza.id
                  ? 'border-neonBlue bg-neonBlue/10'
                  : 'border-gray-600 hover:border-neonBlue/50'
              }`}
              onClick={() => handlePizzaChange(pizza)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {pizza.name}
                  </h3>
                  {pizza.description && (
                    <p className="text-gray-300 text-sm">
                      {pizza.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {pizza.variations.length > 0 && (
                    <p className="text-neonCyan text-sm">
                      From R{Math.min(...pizza.variations.map(v => v.absolute_price)).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Step 2: Choose Size */}
      {selectedPizza && (availableSizes.small || availableSizes.large) && (
        <Card className="bg-gray-800/50 backdrop-blur-sm border-neonCyan/50">
          <CardHeader>
            <CardTitle className="text-neonCyan text-xl">
              Step 2: Choose Size
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['small', 'large'] as const).map((size) => {
                const isAvailable = availableSizes[size];
                const variation = selectedPizza.variations.find(
                  v => v.name.toLowerCase() === size
                );
                const price = variation?.absolute_price || selectedPizza.price;

                if (!isAvailable) return null;

                return (
                  <div
                    key={size}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSize === size
                        ? 'border-neonCyan bg-neonCyan/10'
                        : 'border-gray-600 hover:border-neonCyan/50'
                    }`}
                    onClick={() => handleSizeChange(size)}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white capitalize">
                        {size} {size === 'small' ? '(8-10 inch)' : '(12-14 inch)'}
                      </h3>
                      <p className="text-neonCyan font-bold text-xl">
                        R{price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add Toppings */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-neonPink/50">
        <CardHeader>
          <CardTitle className="text-neonPink text-xl">
            Step 3: Add Toppings
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({selectedToppings.length} selected)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PIZZA_TOPPINGS.map((topping) => {
              const isSelected = selectedToppings.includes(topping.name);
              const price = getToppingPrice(topping);

              return (
                <div
                  key={topping.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-neonPink bg-neonPink/10'
                      : 'border-gray-600 hover:border-neonPink/50'
                  }`}
                  onClick={() => handleToppingToggle(topping.name)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      {topping.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-neonPink text-neonPink"
                    >
                      +R{price.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary & Add to Cart */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-neonCyan/50">
        <CardHeader>
          <CardTitle className="text-neonCyan text-xl">
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>
                {selectedPizza?.name} ({selectedSize})
              </span>
              <span>
                R{getSelectedPrice().toFixed(2)}
              </span>
            </div>

            {selectedToppings.map((toppingName) => {
              const topping = PIZZA_TOPPINGS.find(
                (t) => t.name === toppingName
              );
              const price = topping ? getToppingPrice(topping) : 0;
              return (
                <div
                  key={toppingName}
                  className="flex justify-between text-gray-400"
                >
                  <span>+ {toppingName}</span>
                  <span>+R{price.toFixed(2)}</span>
                </div>
              );
            })}

            {quantity > 1 && (
              <div className="flex justify-between text-gray-400 border-t border-gray-700 pt-2">
                <span>Quantity: {quantity}</span>
                <span>×{quantity}</span>
              </div>
            )}

            <Separator className="border-gray-700" />

            <div className="flex justify-between text-xl font-bold text-neonCyan">
              <span>Total:</span>
              <span>R{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-gray-300">Quantity:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="border-gray-600"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-white w-8 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="border-gray-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!selectedPizza}
              className="bg-neonCyan text-black hover:bg-neonCyan/80 font-semibold py-3 px-8"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart - R{totalPrice.toFixed(2)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
