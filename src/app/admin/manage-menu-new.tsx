'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { getSupabaseClient } from '@/lib/supabase-client';
import { 
  createMenuCategory, 
  updateMenuCategory, 
  deleteMenuCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadImage
} from './actions';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Upload,
  X,
  RefreshCw,
  FolderOpen,
  ImageIcon,
} from 'lucide-react';
import { Category, MenuItem } from '@/types/app-types';

type ViewMode = 'categories' | 'items';

export default function ManageMenuNew() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Forms
  const categoryForm = useForm<{
    name: string;
    description: string;
    display_order: number;
    is_active: boolean;
    parent_id: string;
    image_url: string;
  }>({
    defaultValues: {
      name: '',
      description: '',
      display_order: 0,
      is_active: true,
      parent_id: '',
      image_url: '',
    },
  });

  const itemForm = useForm<{
    name: string;
    description: string;
    price: number;
    category_id: string;
    is_available: boolean;
    image_url: string;
  }>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: '',
      is_available: true,
      image_url: '',
    },
  });

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: cats } = await supabase.from('menu_categories').select(`
        *,
        parent:parent_id(name)
      `).order('display_order', { nullsFirst: false });
      const { data: items } = await supabase.from('menu_items').select('*');
      
      setCategories(cats || []);
      setMenuItems(items || []);
    } catch (_error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Since database has flat structure, all categories are main categories
  const mainCategories = categories;
  
  // For now, no subcategories since the database has flat structure
  const getSubcategories = (_parentId: string) => [];

  // Get items for a category
  const getCategoryItems = (categoryId: string) =>
    menuItems.filter(item => item.category_id === categoryId);

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'categories');
      
      const result = await uploadImage(formData);
      
      if (result.success && result.data) {
        setImagePreview(result.data.url);
        return result.data.url;
      } else {
        toast.error(result.message || 'Upload failed');
        return null;
      }
    } catch (_error) {
      toast.error('Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Category operations
  const onSubmitCategory = async (data: {
    name: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
    parent_id?: string;
    image_url?: string;
  }) => {
    try {
      let result;
      
      // Convert empty strings to null for optional fields
      const categoryData = {
        name: data.name,
        description: data.description || undefined,
        display_order: data.display_order || 0,
        is_active: data.is_active !== false,
        parent_id: data.parent_id || undefined,
        image_url: data.image_url || undefined,
      };
      
      if (editingCategory) {
        result = await updateMenuCategory(editingCategory.id, categoryData);
      } else {
        result = await createMenuCategory(categoryData);
      }

      if (!result.success) {
        toast.error(`Failed: ${result.message}`);
      } else {
        toast.success(`Category ${editingCategory ? 'updated' : 'created'}!`);
        categoryForm.reset();
        setEditingCategory(null);
        setIsCategoryDialogOpen(false);
        setImagePreview(null);
        await fetchData();
      }
    } catch (error) {
      toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all items in this category.')) return;

    try {
      const result = await deleteMenuCategory(id);
      if (!result.success) {
        toast.error(`Failed: ${result.message}`);
      } else {
        toast.success('Category deleted');
        await fetchData();
      }
    } catch (error) {
      toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Item operations
  const onSubmitItem = async (data: {
    name: string;
    description?: string;
    price: number;
    category_id?: string;
    is_available?: boolean;
    image_url?: string;
  }) => {
    try {
      let result;
      
      const itemData = {
        name: data.name,
        description: data.description || undefined,
        price: data.price,
        category_id: data.category_id || selectedCategory?.id || '',
        is_available: data.is_available !== false,
        image_url: data.image_url || undefined,
      };
      
      if (editingItem) {
        result = await updateMenuItem(editingItem.id, itemData);
      } else {
        result = await createMenuItem(itemData);
      }

      if (!result.success) {
        toast.error(`Failed: ${result.message}`);
      } else {
        toast.success(`Item ${editingItem ? 'updated' : 'created'}!`);
        itemForm.reset();
        setEditingItem(null);
        setIsItemDialogOpen(false);
        setImagePreview(null);
        await fetchData();
      }
    } catch (error) {
      toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const result = await deleteMenuItem(id);
      if (!result.success) {
        toast.error(`Failed: ${result.message}`);
      } else {
        toast.success('Item deleted');
        await fetchData();
      }
    } catch (error) {
      toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // UI handlers
  const openCategoryDialog = (category?: Category) => {
    setEditingCategory(category || null);
    if (category) {
      categoryForm.reset({
        name: category.name || '',
        description: category.description || '',
        display_order: category.display_order || 0,
        is_active: category.is_active || true,
      });
      // No parent_id or image_url in actual database schema
    } else {
      categoryForm.reset();
      setImagePreview(null);
    }
    setIsCategoryDialogOpen(true);
  };

  const openItemDialog = (item?: MenuItem) => {
    setEditingItem(item || null);
    if (item) {
      itemForm.reset({
        name: item.name || '',
        description: item.description || '',
        price: item.price || 0,
        category_id: item.category_id || '',
        is_available: item.is_available || true,
        image_url: item.image_url || '',
      });
      setImagePreview(item.image_url);
    } else {
      itemForm.reset({
        category_id: selectedCategory?.id || '',
      });
      setImagePreview(null);
    }
    setIsItemDialogOpen(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file);
      if (url) {
        if (isCategoryDialogOpen) {
          categoryForm.setValue('image_url', url);
        } else if (isItemDialogOpen) {
          itemForm.setValue('image_url', url);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="h-6 w-6 text-neonCyan" />
            <h2 className="text-2xl font-bold text-white">Menu Management</h2>
          </div>
        </div>
        <div className="text-center py-8 text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="h-6 w-6 text-neonCyan" />
          <div>
            <h2 className="text-2xl font-bold text-white">Menu Management</h2>
            <p className="text-gray-400">Organize and manage your menu categories and items with image support</p>
          </div>
        </div>
        <Button 
          onClick={fetchData} 
          variant="outline" 
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Navigation */}
      {viewMode === 'items' && selectedCategory && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setViewMode('categories');
              setSelectedCategory(null);
            }}
            className="text-neonCyan hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Categories
          </Button>
          <span>/</span>
          <span className="text-white">{selectedCategory.name}</span>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'categories' ? (
        <div className="space-y-4">
          {/* Categories Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Categories</h3>
            <Button 
              onClick={() => openCategoryDialog()}
              className="bg-neonCyan text-black hover:bg-neonCyan/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainCategories.map((category) => {
              const subcategories = getSubcategories(category.id);
              const itemsCount = getCategoryItems(category.id).length;
              
              return (
                <Card key={category.id} className="bg-gray-800 border-gray-700 hover:border-neonCyan/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* No image support in current database schema */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neonCyan/20 to-neonPink/20 flex items-center justify-center">
                          <span className="text-lg font-bold text-neonCyan">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{category.name}</CardTitle>
                          {category.description && (
                            <p className="text-gray-400 text-sm mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Items: {itemsCount}</span>
                        <span className="text-gray-400">Subcategories: {subcategories.length}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category);
                            setViewMode('items');
                          }}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          View Items
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCategoryDialog(category)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCategory(category.id)}
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {mainCategories.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-8 text-center">
                <UtensilsCrossed className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No categories found. Create your first category to get started.</p>
                <Button 
                  onClick={() => openCategoryDialog()}
                  className="bg-neonCyan text-black hover:bg-neonCyan/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Category
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Items View */
        selectedCategory && (
          <div className="space-y-4">
            {/* Items Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Items in {selectedCategory.name}
              </h3>
              <Button 
                onClick={() => openItemDialog()}
                className="bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Items Table */}
            <Card className="bg-gray-800 border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Image</TableHead>
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Description</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCategoryItems(selectedCategory.id).map((item) => (
                    <TableRow key={item.id} className="border-gray-700">
                      <TableCell>
                        {item.image_url ? (
                          <div className="relative w-10 h-10 rounded overflow-hidden">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-medium">{item.name}</TableCell>
                      <TableCell className="text-gray-300">{item.description}</TableCell>
                      <TableCell className="text-neonCyan">R{item.price}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_available ? "default" : "secondary"}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openItemDialog(item)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem(item.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {getCategoryItems(selectedCategory.id).length === 0 && (
                <div className="py-8 text-center text-gray-400">
                  <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="mb-4">No items in this category yet.</p>
                  <Button 
                    onClick={() => openItemDialog()}
                    className="bg-neonCyan text-black hover:bg-neonCyan/80"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )
      )}

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        categoryForm.setValue('image_url', '');
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded-full hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  {...categoryForm.register('name', { required: true })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="e.g., Beverages"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parent_id">Main Category</Label>
                <Select 
                  value={categoryForm.watch('parent_id')} 
                  onValueChange={(value) => categoryForm.setValue('parent_id', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select main category (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="">None (Main Category)</SelectItem>
                    {mainCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                {...categoryForm.register('description')}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  type="number"
                  {...categoryForm.register('display_order', { valueAsNumber: true })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    {...categoryForm.register('is_active')}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Item Image</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        itemForm.setValue('image_url', '');
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded-full hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  {...itemForm.register('name', { required: true })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="e.g., Cappuccino"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category_id">Category *</Label>
                <Select 
                  value={itemForm.watch('category_id')} 
                  onValueChange={(value) => itemForm.setValue('category_id', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                {...itemForm.register('description')}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Description of this menu item"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (R) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...itemForm.register('price', { required: true, valueAsNumber: true })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    {...itemForm.register('is_available')}
                    className="rounded"
                  />
                  <span className="text-sm">Available</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsItemDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                {editingItem ? 'Update' : 'Create'} Item
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
