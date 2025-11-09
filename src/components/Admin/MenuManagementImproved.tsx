'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSupabaseClient } from '@/lib/supabase-client';
import {
  Plus, Edit, Trash2, RefreshCw, Search, Filter,
  DollarSign, Save, X, AlertTriangle, ChevronDown, ChevronRight,
  Eye, EyeOff, Copy, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean | null;
  section?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  is_available: boolean | null;
  created_at: string | null;
  category?: {
    id: string;
    name: string;
    display_order: number | null;
  } | null;
}

interface GroupedItem {
  baseName: string;
  variants: MenuItem[];
  category?: MenuCategory;
  section: string;
}

// Section mapping
const SECTION_RANGES = {
  'Drinks': { min: 10, max: 19, color: 'cyan' },
  'Food': { min: 20, max: 29, color: 'pink' },
  'All Day Menu': { min: 30, max: 39, color: 'orange' },
  'Kids': { min: 40, max: 49, color: 'purple' }
};

export default function MenuManagementImproved() {
  // State
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Form states
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true
  });

  const supabase = getSupabaseClient();

  // Helper to extract base name and size from item name
  const extractBaseNameAndSize = (name: string): { baseName: string; size: string | null } => {
    // Match patterns like (S), (M), (L), (Small), (Medium), (Large), etc.
    const sizePattern = /\s*\((S|M|L|XL|Small|Medium|Large|X-?Large|Regular)\)\s*$/i;
    const match = name.match(sizePattern);

    if (match) {
      return {
        baseName: name.replace(sizePattern, '').trim(),
        size: match[1]
      };
    }

    return {
      baseName: name.trim(),
      size: null
    };
  };

  // Group items by base name
  const groupItemsByBaseName = useCallback((items: MenuItem[]): GroupedItem[] => {
    const groups = new Map<string, MenuItem[]>();

    items.forEach(item => {
      const { baseName } = extractBaseNameAndSize(item.name);
      if (!groups.has(baseName)) {
        groups.set(baseName, []);
      }
      groups.get(baseName)!.push(item);
    });

    return Array.from(groups.entries()).map(([baseName, variants]) => {
      // Sort variants by size (S, M, L)
      const sizeOrder = { 'S': 1, 'Small': 1, 'M': 2, 'Medium': 2, 'Regular': 2, 'L': 3, 'Large': 3, 'XL': 4, 'X-Large': 4 };
      variants.sort((a, b) => {
        const sizeA = extractBaseNameAndSize(a.name).size || '';
        const sizeB = extractBaseNameAndSize(b.name).size || '';
        return (sizeOrder[sizeA as keyof typeof sizeOrder] || 999) - (sizeOrder[sizeB as keyof typeof sizeOrder] || 999);
      });

      const firstItem = variants[0];
      const category = categories.find(c => c.id === firstItem.category_id);
      const section = getSectionFromDisplayOrder(category?.display_order || 0);

      return {
        baseName,
        variants,
        category,
        section
      };
    });
  }, [categories]);

  // Helper functions
  const getSectionFromDisplayOrder = (displayOrder: number): string => {
    for (const [sectionName, range] of Object.entries(SECTION_RANGES)) {
      if (displayOrder >= range.min && displayOrder <= range.max) {
        return sectionName;
      }
    }
    return 'Other';
  };

  const getSectionColor = (sectionName: string): string => {
    const section = SECTION_RANGES[sectionName as keyof typeof SECTION_RANGES];
    return section?.color || 'gray';
  };

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order');

      if (categoriesError) throw categoriesError;

      const categoriesWithSections = (categoriesData || []).map(cat => ({
        ...cat,
        section: getSectionFromDisplayOrder(cat.display_order || 0)
      }));

      setCategories(categoriesWithSections);

      // Fetch menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:menu_categories(id, name, display_order)
        `)
        .order('name');

      if (itemsError) throw itemsError;

      setMenuItems(itemsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle expansion
  const toggleExpanded = (baseName: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(baseName)) {
        newSet.delete(baseName);
      } else {
        newSet.add(baseName);
      }
      return newSet;
    });
  };

  // Filter grouped items
  const filteredGroupedItems = groupItemsByBaseName(
    menuItems.filter(item => {
      const { baseName } = extractBaseNameAndSize(item.name);
      const matchesSearch = baseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesSection = sectionFilter === 'all' || getSectionFromDisplayOrder(item.category?.display_order || 0) === sectionFilter;
      const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;

      return matchesSearch && matchesSection && matchesCategory;
    })
  ).sort((a, b) => a.baseName.localeCompare(b.baseName));

  // CRUD operations
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id || '',
      is_available: item.is_available ?? true
    });
    setShowItemForm(true);
  };

  const handleDuplicateItem = (item: MenuItem, newSize: string) => {
    const { baseName } = extractBaseNameAndSize(item.name);
    setEditingItem(null);
    setItemFormData({
      name: `${baseName} (${newSize})`,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id || '',
      is_available: item.is_available ?? true
    });
    setShowItemForm(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const itemData = {
        name: itemFormData.name,
        description: itemFormData.description || null,
        price: parseFloat(itemFormData.price),
        category_id: itemFormData.category_id || null,
        is_available: itemFormData.is_available,
        image_url: null // Always null since we don't use images
      };

      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Item updated successfully');
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert(itemData);

        if (error) throw error;
        toast.success('Item created successfully');
      }

      fetchData();
      resetItemForm();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Item deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const toggleItemAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Item ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchData();
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Failed to update item status');
    }
  };

  const resetItemForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setItemFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_available: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 text-neonCyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Menu Management</h2>
          <p className="text-gray-400 text-sm mt-1">
            {filteredGroupedItems.length} unique items • {menuItems.length} total variants
          </p>
        </div>
        <Button onClick={() => setShowItemForm(true)} className="bg-neonCyan hover:bg-neonCyan/80 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Sections</SelectItem>
                {Object.keys(SECTION_RANGES).map(section => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Categories</SelectItem>
                {categories
                  .filter(cat => sectionFilter === 'all' || cat.section === sectionFilter)
                  .map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              onClick={fetchData}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Item Form */}
      {showItemForm && (
        <Card className="bg-gray-800/50 border-neonCyan/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-neonCyan">
              <span>{editingItem ? 'Edit' : 'Add'} Menu Item</span>
              <Button onClick={resetItemForm} variant="ghost" size="sm" className="text-gray-400">
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name" className="text-gray-300">Item Name *</Label>
                  <Input
                    id="item-name"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="e.g., 5 Roses Tea (M)"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Tip: Add size in parentheses like (S), (M), (L) to group items
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-price" className="text-gray-300">Price (R) *</Label>
                  <Input
                    id="item-price"
                    type="number"
                    step="0.01"
                    value={itemFormData.price}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="35.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-category" className="text-gray-300">Category *</Label>
                <Select
                  value={itemFormData.category_id}
                  onValueChange={(value) => setItemFormData(prev => ({ ...prev, category_id: value }))}
                  required
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.section} → {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-description" className="text-gray-300">Description</Label>
                <Textarea
                  id="item-description"
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700/50 border-gray-600 text-white"
                  placeholder="Describe the item..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={itemFormData.is_available}
                  onCheckedChange={(checked) => setItemFormData(prev => ({ ...prev, is_available: checked }))}
                />
                <Label className="text-gray-300">Available for customers</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" onClick={resetItemForm} variant="outline" className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-neonCyan hover:bg-neonCyan/80 text-black font-semibold">
                  <Save className="w-4 h-4 mr-2" />
                  {editingItem ? 'Update' : 'Create'} Item
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Grouped Items List */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-0">
          {filteredGroupedItems.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl text-gray-400 mb-2">No Menu Items Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || sectionFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first menu item to get started'}
              </p>
              {!searchTerm && sectionFilter === 'all' && categoryFilter === 'all' && (
                <Button onClick={() => setShowItemForm(true)} className="bg-neonCyan hover:bg-neonCyan/80 text-black font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {filteredGroupedItems.map((group) => {
                const isExpanded = expandedItems.has(group.baseName);
                const hasMultipleVariants = group.variants.length > 1;
                const sectionColor = getSectionColor(group.section);

                return (
                  <div key={group.baseName} className="hover:bg-gray-700/20 transition-colors">
                    {/* Main Row */}
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Expand Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(group.baseName)}
                          className="p-0 h-8 w-8 hover:bg-gray-700"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>

                        {/* Section Indicator */}
                        <div className={`w-1 h-8 bg-${sectionColor}-500 rounded`}></div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{group.baseName}</h3>
                            {hasMultipleVariants && (
                              <Badge variant="outline" className="text-xs">
                                <Layers className="w-3 h-3 mr-1" />
                                {group.variants.length} sizes
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{group.section}</span>
                            <ChevronRight className="w-3 h-3" />
                            <span>{group.category?.name}</span>
                          </div>
                        </div>

                        {/* Price Range */}
                        <div className="text-right">
                          {hasMultipleVariants ? (
                            <div className="text-sm text-gray-300">
                              <span className="text-neonCyan font-semibold">
                                R{Math.min(...group.variants.map(v => v.price)).toFixed(2)}
                              </span>
                              {' - '}
                              <span className="text-neonCyan font-semibold">
                                R{Math.max(...group.variants.map(v => v.price)).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-neonCyan" />
                              <span className="font-bold text-neonCyan">
                                R{group.variants[0].price.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Quick Actions for Single Items */}
                        {!hasMultipleVariants && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditItem(group.variants[0])}
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => toggleItemAvailability(group.variants[0].id, group.variants[0].is_available ?? false)}
                              variant="outline"
                              size="sm"
                              className={`border-gray-600 ${group.variants[0].is_available ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                            >
                              {group.variants[0].is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              onClick={() => handleDeleteItem(group.variants[0].id)}
                              variant="outline"
                              size="sm"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Description (if single item or not expanded) */}
                      {!isExpanded && group.variants[0].description && (
                        <p className="text-sm text-gray-400 mt-2 ml-12 line-clamp-1">
                          {group.variants[0].description}
                        </p>
                      )}
                    </div>

                    {/* Expanded Variants */}
                    {isExpanded && hasMultipleVariants && (
                      <div className="bg-gray-900/30 border-t border-gray-700/50">
                        <div className="p-4 space-y-3">
                          {group.variants.map((variant) => {
                            const { size } = extractBaseNameAndSize(variant.name);

                            return (
                              <div key={variant.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg ml-12">
                                {/* Size Badge */}
                                <Badge className="bg-neonCyan/20 text-neonCyan border-neonCyan/30 font-semibold min-w-[60px] justify-center">
                                  {size || 'Regular'}
                                </Badge>

                                {/* Details */}
                                <div className="flex-1">
                                  {variant.description && (
                                    <p className="text-sm text-gray-400">{variant.description}</p>
                                  )}
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4 text-neonCyan" />
                                  <span className="font-bold text-neonCyan">R{variant.price.toFixed(2)}</span>
                                </div>

                                {/* Status */}
                                <Badge className={variant.is_available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                                  {variant.is_available ? 'Available' : 'Unavailable'}
                                </Badge>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleEditItem(variant)}
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => toggleItemAvailability(variant.id, variant.is_available ?? false)}
                                    variant="outline"
                                    size="sm"
                                    className={`border-gray-600 ${variant.is_available ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                                  >
                                    {variant.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteItem(variant.id)}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
