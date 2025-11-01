'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface PizzaVariant {
  name: string;
  price: number;
  size: string;
}

interface PizzaAddon {
  name: string;
  small_price: number;
  large_price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  nutritional_info: {
    variants?: PizzaVariant[];
    addons?: PizzaAddon[];
  } | null;
}

interface PizzaCustomizerProps {
  item: MenuItem;
  onAddToCart: (item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description: string;
    customization: {
      variant: PizzaVariant;
      addons: { name: string; price: number }[];
    };
  }) => void;
  onClose: () => void;
}

export default function PizzaCustomizer({
  item,
  onAddToCart,
  onClose,
}: PizzaCustomizerProps) {
  const [selectedVariant, setSelectedVariant] = useState<PizzaVariant | null>(
    null
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const variants = useMemo(
    () => item.nutritional_info?.variants || [],
    [item.nutritional_info?.variants]
  );
  const addons = useMemo(
    () => item.nutritional_info?.addons || [],
    [item.nutritional_info?.addons]
  );

  // Set default variant to small if available
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);

  // Calculate total price whenever selections change
  useEffect(() => {
    if (!selectedVariant) return;

    const basePrice = selectedVariant.price;
    let addonsPrice = 0;

    selectedAddons.forEach((addonName) => {
      const addon = addons.find((a) => a.name === addonName);
      if (addon) {
        addonsPrice +=
          selectedVariant.size === 'small'
            ? addon.small_price
            : addon.large_price;
      }
    });

    setTotalPrice((basePrice + addonsPrice) * quantity);
  }, [selectedVariant, selectedAddons, quantity, addons]);

  const handleVariantSelect = (variant: PizzaVariant) => {
    setSelectedVariant(variant);
  };

  const handleAddonToggle = (addonName: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonName)
        ? prev.filter((name) => name !== addonName)
        : [...prev, addonName]
    );
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a pizza size');
      return;
    }

    const customizedItem = {
      id: item.id,
      name: `${item.name} - ${selectedVariant.name}`,
      price: totalPrice / quantity,
      quantity: quantity,
      customization: {
        variant: selectedVariant,
        addons: selectedAddons.map((addonName) => {
          const addon = addons.find((a) => a.name === addonName);
          return {
            name: addonName,
            price: addon
              ? selectedVariant.size === 'small'
                ? addon.small_price
                : addon.large_price
              : 0,
          };
        }),
      },
      description: `${item.description}${selectedAddons.length > 0 ? ` with ${selectedAddons.join(', ')}` : ''}`,
    };

    onAddToCart(customizedItem);
    // Toast removed - cart updates visible in UI
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-black/90 border-neon-green/50 text-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-neon-green text-2xl">
                {item.name}
              </CardTitle>
              <p className="text-gray-300 mt-2">
                {item.description || 'Delicious pizza made fresh to order'}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Size Selection */}
          <div>
            <h3 className="text-lg font-semibold text-neon-blue mb-3">
              Choose Size
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {variants.map((variant) => (
                <Button
                  key={variant.name}
                  variant={
                    selectedVariant?.name === variant.name
                      ? 'default'
                      : 'outline'
                  }
                  className={`p-4 h-auto justify-between ${
                    selectedVariant?.name === variant.name
                      ? 'bg-neon-green text-black border-neon-green'
                      : 'border-gray-600 hover:border-neon-green'
                  }`}
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="text-left">
                    <div className="font-semibold">{variant.name}</div>
                    <div className="text-sm opacity-80">
                      {variant.size === 'small' ? '8-10 inch' : '12-14 inch'}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    R{variant.price.toFixed(2)}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <Separator className="border-gray-700" />

          {/* Add-ons Selection */}
          {addons.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-neon-pink mb-3">
                Add Toppings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {addons.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.name);
                  const price =
                    selectedVariant?.size === 'small'
                      ? addon.small_price
                      : addon.large_price;

                  return (
                    <Button
                      key={addon.name}
                      variant="outline"
                      className={`p-3 justify-between ${
                        isSelected
                          ? 'border-neon-pink bg-neon-pink/10 text-neon-pink'
                          : 'border-gray-600 hover:border-neon-pink'
                      }`}
                      onClick={() => handleAddonToggle(addon.name)}
                    >
                      <span>{addon.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        +R{price.toFixed(2)}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <Separator className="border-gray-700" />

          {/* Quantity and Total */}
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

            <div className="text-right">
              <div className="text-sm text-gray-400">Total</div>
              <div className="text-2xl font-bold text-neon-green">
                R{totalPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {selectedVariant && (
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h4 className="font-semibold text-neon-blue mb-2">
                Order Summary
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>
                    {item.name} ({selectedVariant.name})
                  </span>
                  <span>R{selectedVariant.price.toFixed(2)}</span>
                </div>
                {selectedAddons.map((addonName) => {
                  const addon = addons.find((a) => a.name === addonName);
                  const price = addon
                    ? selectedVariant.size === 'small'
                      ? addon.small_price
                      : addon.large_price
                    : 0;
                  return (
                    <div
                      key={addonName}
                      className="flex justify-between text-gray-400"
                    >
                      <span>+ {addonName}</span>
                      <span>+R{price.toFixed(2)}</span>
                    </div>
                  );
                })}
                {quantity > 1 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Quantity: {quantity}</span>
                    <span>×{quantity}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full bg-neon-green text-black hover:bg-neon-green/80 font-semibold py-3"
            disabled={!selectedVariant}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart - R{totalPrice.toFixed(2)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
