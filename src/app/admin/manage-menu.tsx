'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import toast from 'react-hot-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Coffee,
  Sandwich,
  Cookie,
  Salad,
  Pizza,
  RefreshCw,
} from 'lucide-react';

interface Category {
  id: string;  // UUID
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

interface MenuItem {
  id: string;  // UUID
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id: string;  // UUID
  is_available?: boolean;
}

type ViewMode = 'categories' | 'items';

export default function ManageMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const itemForm = useForm<MenuItem>();
  const categoryForm = useForm<Category>();
  const isEditingItem = Boolean(editingItem);
  const isEditingCategory = Boolean(editingCategory);

  useEffect(() => {
    fetchData();

    const menuChannel = supabase
      .channel('menu')
      .on('postgres_changes', { event: '*', schema: 'public' }, () =>
        fetchData()
      )
      .subscribe();

    return () => {
      void menuChannel.unsubscribe();
    };
  }, []);

  const fetchData = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      // For admin panel, fetch ALL categories including pizza add-ons
      const { data: cats } = await supabase.from('menu_categories').select();
      const { data: items } = await supabase.from('menu_items').select();
      setCategories((cats || []) as Category[]);
      setMenuItems((items || []) as MenuItem[]);
      if (showToast) {
        toast.success('Data refreshed successfully!');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (showToast) {
        toast.error('Failed to refresh data');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData(true); // Show toast for manual refresh
  };

  const onSubmitCategory = async (data: Category) => {
    let result;
    
    if (isEditingCategory && editingCategory) {
      result = await supabase
        .from('menu_categories')
        .update({ ...data })
        .eq('id', editingCategory.id);
    } else {
      result = await supabase
        .from('menu_categories')
        .insert(data);
    }

    const { error } = result;

    if (error) {
      toast.error(`Failed: ${error.message}`);
    } else {
      toast.success(`Category ${isEditingCategory ? 'updated' : 'created'}!`);
      categoryForm.reset();
      setEditingCategory(null);
      setIsCategoryDialogOpen(false);
      // Automatically refresh data after successful operation
      await fetchData();
    }
  };

  const onSubmitItem = async (data: MenuItem) => {
    if (data.price < 0) {
      toast.error('Price must be positive.');
      return;
    }

    // Set category_id to selected category if creating new item
    if (!isEditingItem && selectedCategory) {
      data.category_id = selectedCategory.id;
    }

    let result;
    
    if (isEditingItem && editingItem) {
      result = await supabase
        .from('menu_items')
        .update({ ...data })
        .eq('id', editingItem.id);
    } else {
      result = await supabase
        .from('menu_items')
        .insert(data);
    }

    const { error } = result;

    if (error) {
      toast.error(`Failed: ${error.message}`);
    } else {
      toast.success(`Item ${isEditingItem ? 'updated' : 'created'}!`);
      itemForm.reset();
      setEditingItem(null);
      setIsItemDialogOpen(false);
      // Automatically refresh data after successful operation
      await fetchData();
    }
  };

  const deleteCategory = async (id: string) => {
    if (
      !confirm(
        'Are you sure? This will also delete all items in this category.'
      )
    )
      return;

    const { error } = await supabase.from('menu_categories').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Category deleted');
      // Automatically refresh data after successful deletion
      await fetchData();
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Item deleted');
      // Automatically refresh data after successful deletion
      await fetchData();
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (
      name.includes('coffee') ||
      name.includes('beverage') ||
      name.includes('drink')
    ) {
      return <Coffee className="h-6 w-6" />;
    } else if (name.includes('sandwich') || name.includes('burger')) {
      return <Sandwich className="h-6 w-6" />;
    } else if (
      name.includes('dessert') ||
      name.includes('cake') ||
      name.includes('sweet')
    ) {
      return <Cookie className="h-6 w-6" />;
    } else if (name.includes('salad') || name.includes('healthy')) {
      return <Salad className="h-6 w-6" />;
    } else if (name.includes('pizza') || name.includes('main')) {
      return <Pizza className="h-6 w-6" />;
    }
    return <UtensilsCrossed className="h-6 w-6" />;
  };

  const getCategoryItemCount = (categoryId: string) => {
    return menuItems.filter((item) => item.category_id === categoryId).length;
  };

  const getFilteredMenuItems = () => {
    if (!selectedCategory) return [];
    return menuItems.filter((item) => item.category_id === selectedCategory.id);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset(category);
    setIsCategoryDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    itemForm.reset(item);
    setIsItemDialogOpen(true);
  };

  const handleAddNewCategory = () => {
    setEditingCategory(null);
    categoryForm.reset();
    setIsCategoryDialogOpen(true);
  };

  const handleAddNewItem = () => {
    setEditingItem(null);
    itemForm.reset();
    setIsItemDialogOpen(true);
  };

  const handleViewCategoryItems = (category: Category) => {
    setSelectedCategory(category);
    setViewMode('items');
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {viewMode === 'items' && (
            <Button
              variant="ghost"
              onClick={handleBackToCategories}
              className="text-neonCyan hover:text-neonPink hover:bg-neonPink/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-neonCyan flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6" />
              Menu Management
            </h2>
            <p className="text-neonText/70 mt-1">
              Organize and manage your menu categories and items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="neon-button bg-transparent border-2 border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-darkBg hover:shadow-[0_0_15px_#00FFFF] transition-all duration-300"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Always show both sections when in categories view */}
      {viewMode === 'categories' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Categories Section */}
          <Card className="bg-darkBg border-2 border-neonCyan shadow-neon">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-neonCyan">Categories</CardTitle>
                <Button
                  onClick={handleAddNewCategory}
                  className="neon-button bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-darkBg hover:shadow-[0_0_15px_#00FF00]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-neonText/70">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No categories created yet</p>
                  <p className="text-sm">
                    Create your first category to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-darkBg border-2 border-neonPink/50 hover:border-neonPink hover:shadow-[0_0_10px_#FF00FF] transition-all duration-300 rounded-lg p-4 cursor-pointer group"
                      onClick={() => handleViewCategoryItems(category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-neonPink group-hover:text-neonCyan transition-colors duration-300">
                            {getCategoryIcon(category.name)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-neonText">
                              {category.name}
                              {category.name.toLowerCase().includes('pizza add-ons') && (
                                <Badge className="ml-2 bg-yellow-600 text-yellow-100 text-xs">
                                  Customization Only
                                </Badge>
                              )}
                            </h3>
                            <p className="text-neonText/70 text-sm">
                              {getCategoryItemCount(category.id)} items
                              {category.name.toLowerCase().includes('pizza add-ons') && (
                                <span className="text-yellow-400 text-xs ml-1">
                                  (Not shown to customers)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(category);
                            }}
                            className="text-neonCyan hover:text-neon-green hover:bg-neon-green/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCategory(category.id);
                            }}
                            className="text-neonPink hover:text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Menu Items Overview */}
          <Card className="bg-darkBg border-2 border-neonPink shadow-[0_0_10px_#FF00FF]">
            <CardHeader>
              <CardTitle className="text-neonPink">
                Menu Items Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {menuItems.length === 0 ? (
                <div className="text-center py-8 text-neonText/70">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No menu items yet</p>
                  <p className="text-sm">
                    Create categories first, then add items!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {categories.map((category) => {
                    const categoryItems = menuItems.filter(
                      (item) => item.category_id === category.id
                    );
                    if (categoryItems.length === 0) return null;

                    return (
                      <div
                        key={category.id}
                        className="border-b border-neonText/20 pb-3 mb-3 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-neonText flex items-center gap-2">
                            {getCategoryIcon(category.name)}
                            {category.name}
                          </h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewCategoryItems(category)}
                            className="text-neonCyan hover:text-neonPink text-xs"
                          >
                            View All ({categoryItems.length})
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {categoryItems.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-neonText/70">
                                {item.name}
                              </span>
                              <span className="text-neon-green font-medium">
                                R{item.price}
                              </span>
                            </div>
                          ))}
                          {categoryItems.length > 3 && (
                            <div className="text-xs text-neonText/50 italic">
                              ...and {categoryItems.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Items View */}
      {viewMode === 'items' && selectedCategory && (
        <Card className="bg-darkBg border-2 border-neonCyan shadow-neon">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-neonCyan flex items-center gap-2">
                {getCategoryIcon(selectedCategory.name)}
                {selectedCategory.name} Items
              </CardTitle>
              <Button
                onClick={handleAddNewItem}
                className="neon-button bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-darkBg hover:shadow-[0_0_15px_#00FF00]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-neonCyan/30">
                    <TableHead className="text-neonCyan">Image</TableHead>
                    <TableHead className="text-neonCyan">Name</TableHead>
                    <TableHead className="text-neonCyan">Description</TableHead>
                    <TableHead className="text-neonCyan">Price</TableHead>
                    <TableHead className="text-neonCyan">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredMenuItems().map((item) => (
                    <TableRow key={item.id} className="border-neonCyan/20">
                      <TableCell>
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover border border-neonPink/50"
                          />
                        ) : (
                          <div className="w-[60px] h-[60px] bg-darkBg border-2 border-neonText/20 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="h-6 w-6 text-neonText/50" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-neonText font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-neonText/70 max-w-xs truncate">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-neon-green font-bold">
                        R{item.price}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditItem(item)}
                            className="text-neonCyan hover:text-neon-green hover:bg-neon-green/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteItem(item.id)}
                            className="text-neonPink hover:text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {getFilteredMenuItems().length === 0 && (
                <div className="text-center py-12 text-neonText/70">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    No items in this category yet. Add your first item above!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="bg-darkBg border-2 border-neonCyan text-neonText max-w-md">
          <DialogHeader>
            <DialogTitle className="text-neonCyan">
              {isEditingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={categoryForm.handleSubmit(onSubmitCategory)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="categoryName" className="text-neonText">
                Category Name
              </Label>
              <Input
                id="categoryName"
                placeholder="e.g., Beverages, Sandwiches, Desserts"
                {...categoryForm.register('name', { required: true })}
                className="bg-darkBg border-2 border-neonPink/50 text-neonText focus:border-neonPink"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCategoryDialogOpen(false)}
                className="text-neonText/70 hover:text-neonText hover:bg-neonText/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="neon-button bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-darkBg"
              >
                {isEditingCategory ? 'Update' : 'Create'} Category
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="bg-darkBg border-2 border-neonCyan text-neonText max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-neonCyan">
              {isEditingItem
                ? 'Edit Menu Item'
                : `Add New Item to ${selectedCategory?.name}`}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={itemForm.handleSubmit(onSubmitItem)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName" className="text-neonText">
                  Item Name
                </Label>
                <Input
                  id="itemName"
                  placeholder="e.g., Cappuccino, Club Sandwich"
                  {...itemForm.register('name', { required: true })}
                  className="bg-darkBg border-2 border-neonPink/50 text-neonText focus:border-neonPink"
                />
              </div>
              <div>
                <Label htmlFor="itemPrice" className="text-neonText">
                  Price (R)
                </Label>
                <Input
                  id="itemPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...itemForm.register('price', { required: true })}
                  className="bg-darkBg border-2 border-neonPink/50 text-neonText focus:border-neonPink"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="itemDescription" className="text-neonText">
                Description
              </Label>
              <Textarea
                id="itemDescription"
                placeholder="Describe this delicious item..."
                {...itemForm.register('description')}
                className="bg-darkBg border-2 border-neonPink/50 text-neonText focus:border-neonPink"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="itemCategory" className="text-neonText">
                Category
              </Label>
              <select
                {...itemForm.register('category_id')}
                className="w-full p-3 bg-darkBg border-2 border-neonPink/50 text-neonText rounded-md focus:border-neonPink"
                defaultValue={selectedCategory?.id || ''}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
            </div>

            <div>
              <Label htmlFor="itemImage" className="text-neonText">
                Image URL (Optional)
              </Label>
              <Input
                id="itemImage"
                placeholder="https://example.com/image.jpg"
                {...itemForm.register('image_url')}
                className="bg-darkBg border-2 border-neonPink/50 text-neonText focus:border-neonPink"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsItemDialogOpen(false)}
                className="text-neonText/70 hover:text-neonText hover:bg-neonText/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="neon-button bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-darkBg"
              >
                {isEditingItem ? 'Update' : 'Create'} Item
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
