'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, X } from 'lucide-react';
import type { MenuItem } from '@/types/app-types';

interface SelectedAddon {
  addonId: string;
  addonName: string;
  variationId?: string;
  variationName?: string;
  price: number;
  quantity: number;
}

interface AddOnCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
  selectedSize?: string;
  onAddToCart: (selectedAddons: SelectedAddon[]) => void;
}

export default function AddOnCustomizationModal({
  isOpen,
  onClose,
  item,
  selectedSize,
  onAddToCart,
}: AddOnCustomizationModalProps) {
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

  const addons = item.available_addons || [];

  // Handle add-on variation selection
  const handleAddonToggle = (
    addonId: string,
    addonName: string,
    variationId: string | undefined,
    variationName: string | undefined,
    price: number
  ) => {
    const key = variationId || addonId;
    const existingIndex = selectedAddons.findIndex(
      (a) => (a.variationId || a.addonId) === key
    );

    if (existingIndex >= 0) {
      // Remove if already selected
      setSelectedAddons(selectedAddons.filter((_, i) => i !== existingIndex));
    } else {
      // Add new selection
      setSelectedAddons([
        ...selectedAddons,
        {
          addonId,
          addonName,
          variationId,
          variationName,
          price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleQuantityChange = (index: number, delta: number) => {
    const updated = [...selectedAddons];
    const newQuantity = updated[index].quantity + delta;

    if (newQuantity <= 0) {
      // Remove if quantity becomes 0
      setSelectedAddons(selectedAddons.filter((_, i) => i !== index));
    } else {
      updated[index].quantity = newQuantity;
      setSelectedAddons(updated);
    }
  };

  const calculateTotal = () => {
    return selectedAddons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0);
  };

  const handleAddToCart = () => {
    onAddToCart(selectedAddons);
    setSelectedAddons([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedAddons([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Customize {item.name}
              </DialogTitle>
              {selectedSize && (
                <p className="text-gray-400 text-sm mt-1">Size: {selectedSize}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {addons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No customization options available</p>
            </div>
          ) : (
            addons.map((addon) => {
              const hasVariations = addon.addon_variations && addon.addon_variations.length > 0;

              return (
                <div
                  key={addon.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {addon.name}
                        {addon.is_required && (
                          <Badge className="bg-neonPink text-black text-xs">
                            Required
                          </Badge>
                        )}
                      </h3>
                      {addon.description && (
                        <p className="text-gray-400 text-sm mt-1">{addon.description}</p>
                      )}
                    </div>
                  </div>

                  {hasVariations ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {addon.addon_variations!
                        .filter((v) => v.is_available !== false)
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        .map((variation) => {
                          const isSelected = selectedAddons.some(
                            (s) => s.variationId === variation.id
                          );
                          const selectedAddon = selectedAddons.find(
                            (s) => s.variationId === variation.id
                          );

                          return (
                            <div
                              key={variation.id}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'border-neonCyan bg-neonCyan/10'
                                  : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-white font-medium">{variation.name}</p>
                                  <p className="text-neonCyan text-sm font-bold">
                                    +R{(variation.absolute_price || 0).toFixed(2)}
                                  </p>
                                </div>

                                {isSelected && selectedAddon ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        handleQuantityChange(
                                          selectedAddons.indexOf(selectedAddon),
                                          -1
                                        )
                                      }
                                      className="w-7 h-7 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center"
                                    >
                                      <Minus className="h-4 w-4 text-white" />
                                    </button>
                                    <span className="text-white font-bold min-w-[1.5rem] text-center">
                                      {selectedAddon.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleQuantityChange(
                                          selectedAddons.indexOf(selectedAddon),
                                          1
                                        )
                                      }
                                      className="w-7 h-7 rounded-full bg-neonCyan hover:bg-neonCyan/80 flex items-center justify-center"
                                    >
                                      <Plus className="h-4 w-4 text-black" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleAddonToggle(
                                        addon.id,
                                        addon.name,
                                        variation.id,
                                        variation.name,
                                        variation.absolute_price || 0
                                      )
                                    }
                                    className="w-7 h-7 rounded-full bg-neonCyan hover:bg-neonCyan/80 flex items-center justify-center"
                                  >
                                    <Plus className="h-4 w-4 text-black" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-600 bg-gray-700/30">
                      <div className="flex-1">
                        <p className="text-white font-medium">{addon.name}</p>
                        <p className="text-neonCyan text-sm font-bold">
                          +R{addon.price.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          handleAddonToggle(addon.id, addon.name, undefined, undefined, addon.price)
                        }
                        className="bg-neonCyan text-black hover:bg-neonCyan/80"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {selectedAddons.length > 0 && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-semibold mb-3">Selected Add-ons:</h4>
            <div className="space-y-2">
              {selectedAddons.map((addon, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">
                    {addon.quantity}x {addon.addonName}
                    {addon.variationName && ` (${addon.variationName})`}
                  </span>
                  <span className="text-neonCyan font-bold">
                    +R{(addon.price * addon.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-white font-bold">Add-ons Total:</span>
                <span className="text-neonCyan font-bold text-lg">
                  +R{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-gradient-to-r from-neonPink to-neonCyan text-black font-bold hover:scale-105 transition-transform"
          >
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
