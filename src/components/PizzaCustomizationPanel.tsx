'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface PizzaTopping {
  name: string;
  smallPrice: number;
  largePrice: number;
}

interface PizzaType {
  name: string;
  description: string;
  smallPrice: number;
  largePrice: number;
}

const PIZZA_TYPES: PizzaType[] = [
  {
    name: 'Regina',
    description: 'Ham & Cheese on wood-fired base',
    smallPrice: 42.0,
    largePrice: 98.0,
  },
  {
    name: 'Margarita',
    description: 'Mozzarella & Basil on wood-fired base',
    smallPrice: 35.0,
    largePrice: 82.0,
  },
];

const PIZZA_TOPPINGS: PizzaTopping[] = [
  { name: 'Salami', smallPrice: 10.0, largePrice: 15.0 },
  { name: 'Ham', smallPrice: 7.0, largePrice: 12.0 },
  { name: 'Avo', smallPrice: 10.0, largePrice: 15.0 },
  { name: 'Pineapple', smallPrice: 7.0, largePrice: 12.0 },
  { name: 'Figs', smallPrice: 12.0, largePrice: 17.0 },
  { name: 'Olives', smallPrice: 8.0, largePrice: 17.0 },
  { name: 'Mushrooms', smallPrice: 12.0, largePrice: 17.0 },
  { name: 'Garlic', smallPrice: 5.0, largePrice: 10.0 },
  { name: 'Feta', smallPrice: 10.0, largePrice: 15.0 },
];

interface PizzaCustomizationPanelProps {
  onAddToCart?: (item: CartItem) => void;
}

export default function PizzaCustomizationPanel({
  onAddToCart,
}: PizzaCustomizationPanelProps) {
  const [selectedPizzaType, setSelectedPizzaType] = useState<PizzaType>(
    PIZZA_TYPES[0]
  );
  const [selectedSize, setSelectedSize] = useState<'small' | 'large'>('small');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();

  const calculateTotalPrice = useCallback(() => {
    const basePrice =
      selectedSize === 'small'
        ? selectedPizzaType.smallPrice
        : selectedPizzaType.largePrice;

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
  }, [selectedPizzaType, selectedSize, selectedToppings, quantity]);

  const handlePizzaTypeChange = (pizzaType: PizzaType) => {
    setSelectedPizzaType(pizzaType);
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
    const toppingsText =
      selectedToppings.length > 0 ? ` + ${selectedToppings.join(', ')}` : '';
    const sizeText =
      selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1);

    const cartItem: CartItem = {
      id: Date.now().toString(),
      name: `${selectedPizzaType.name} Pizza (${sizeText})${toppingsText}`,
      price: calculateTotalPrice() / quantity,
      quantity: quantity,
      customization: {
        pizzaType: selectedPizzaType.name,
        size: selectedSize,
        toppings: selectedToppings,
        basePrice:
          selectedSize === 'small'
            ? selectedPizzaType.smallPrice
            : selectedPizzaType.largePrice,
        toppingsPrice: selectedToppings.reduce((sum, toppingName) => {
          const topping = PIZZA_TOPPINGS.find((t) => t.name === toppingName);
          return sum + (topping ? getToppingPrice(topping) : 0);
        }, 0),
        isCustomized: true, // Mark this as a customized item
      },
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    } else {
      addItem(cartItem);
    }

    toast.success(`${cartItem.name} added to cart!`);
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="space-y-6 p-6">
      {/* Pizza Customization Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-neon-green mb-2">
          🍕 Customize Your Pizza
        </h2>
        <p className="text-gray-300">
          Build your perfect pizza with our fresh ingredients
        </p>
      </div>

      {/* Step 1: Choose Pizza Type */}
      <Card className="bg-gray-900/80 border-neon-blue/50">
        <CardHeader>
          <CardTitle className="text-neon-blue text-xl">
            Step 1: Choose Your Pizza
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {PIZZA_TYPES.map((pizzaType) => (
            <div
              key={pizzaType.name}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPizzaType?.name === pizzaType.name
                  ? 'border-neon-blue bg-neon-blue/10'
                  : 'border-gray-600 hover:border-neon-blue/50'
              }`}
              onClick={() => handlePizzaTypeChange(pizzaType)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {pizzaType.name}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {pizzaType.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-neon-green font-semibold text-sm">
                    Small: R{pizzaType.smallPrice.toFixed(2)}
                  </div>
                  <div className="text-neon-green font-semibold text-sm">
                    Large: R{pizzaType.largePrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Step 2: Choose Size */}
      <Card className="bg-gray-900/80 border-neon-green/50">
        <CardHeader>
          <CardTitle className="text-neon-green text-xl">
            Step 2: Choose Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['small', 'large'].map((size) => (
              <div
                key={size}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSize === size
                    ? 'border-neon-green bg-neon-green/10'
                    : 'border-gray-600 hover:border-neon-green/50'
                }`}
                onClick={() => handleSizeChange(size as 'small' | 'large')}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {size} {size === 'small' ? '(8-10 inch)' : '(12-14 inch)'}
                  </h3>
                  <p className="text-neon-green font-bold text-xl">
                    R
                    {(size === 'small'
                      ? selectedPizzaType.smallPrice
                      : selectedPizzaType.largePrice
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Add Toppings */}
      <Card className="bg-gray-900/80 border-neon-pink/50">
        <CardHeader>
          <CardTitle className="text-neon-pink text-xl">
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
                  key={topping.name}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-neon-pink bg-neon-pink/10'
                      : 'border-gray-600 hover:border-neon-pink/50'
                  }`}
                  onClick={() => handleToppingToggle(topping.name)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      {topping.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-neon-pink text-neon-pink"
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
      <Card className="bg-gray-900/80 border-neon-green/50">
        <CardHeader>
          <CardTitle className="text-neon-green text-xl">
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>
                {selectedPizzaType.name} Pizza ({selectedSize})
              </span>
              <span>
                R
                {(selectedSize === 'small'
                  ? selectedPizzaType.smallPrice
                  : selectedPizzaType.largePrice
                ).toFixed(2)}
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

            <div className="flex justify-between text-xl font-bold text-neon-green">
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
              className="bg-neon-green text-black hover:bg-neon-green/80 font-semibold py-3 px-8"
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
