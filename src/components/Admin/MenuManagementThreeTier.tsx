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
  DollarSign, Image as ImageIcon, Save, X, AlertTriangle, 
  FolderPlus, Package, MenuSquare, ChevronRight,
  Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean | null;
  section?: string; // Derived from display_order ranges
  items?: MenuItem[];
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

// Section mapping based on display_order ranges
const SECTION_RANGES = {
  'Drinks': { min: 10, max: 19, color: 'neonCyan' },
  'Food': { min: 20, max: 29, color: 'neonPink' },
  'All Day Menu': { min: 30, max: 39, color: 'orange-500' },
  'Kids': { min: 40, max: 49, color: 'purple-500' }
};

export default function MenuManagementThreeTier() {
  // State
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form data
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    display_order: '',
    is_active: true
  });

  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true
  });

  const supabase = getSupabaseClient();

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
    return SECTION_RANGES[sectionName as keyof typeof SECTION_RANGES]?.color || 'gray-500';
  };

  const getAvailableDisplayOrders = (sectionName: string): number[] => {
    const range = SECTION_RANGES[sectionName as keyof typeof SECTION_RANGES];
    if (!range) return [];
    
    const usedOrders = categories
      .filter(cat => cat.id !== editingCategory?.id)
      .map(cat => cat.display_order);
    
    const available = [];
    for (let i = range.min; i <= range.max; i++) {
      if (!usedOrders.includes(i)) {
        available.push(i);
      }
    }
    return available;
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

      // Fetch menu items with categories
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
      console.error('Error fetching menu data:', error);
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Organize data by sections
  const sections = Object.keys(SECTION_RANGES).map(sectionName => {
    const sectionCategories = categories.filter(cat => cat.section === sectionName);
    const sectionItems = menuItems.filter(item => {
      const categoryDisplayOrder = item.category?.display_order || 0;
      return getSectionFromDisplayOrder(categoryDisplayOrder) === sectionName;
    });
    
    return {
      name: sectionName,
      categories: sectionCategories,
      items: sectionItems,
      color: getSectionColor(sectionName),
      range: SECTION_RANGES[sectionName as keyof typeof SECTION_RANGES]
    };
  });

  // Filtering
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const itemSection = getSectionFromDisplayOrder(item.category?.display_order || 0);
    const matchesSection = sectionFilter === 'all' || itemSection === sectionFilter;
    const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;
    
    return matchesSearch && matchesSection && matchesCategory;
  });

  // Category form handlers
  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      display_order: '',
      is_active: true
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryFormData.name || !categoryFormData.display_order) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const categoryData = {
        name: categoryFormData.name,
        description: categoryFormData.description || null,
        display_order: parseInt(categoryFormData.display_order),
        is_active: categoryFormData.is_active
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('menu_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('menu_categories')
          .insert(categoryData);
        
        if (error) throw error;
        toast.success('Category created successfully');
      }

      resetCategoryForm();
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEditCategory = (category: MenuCategory) => {
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      display_order: category.display_order?.toString() || '',
      is_active: category.is_active ?? true
    });
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Check if category has items
    const hasItems = menuItems.some(item => item.category_id === categoryId);
    if (hasItems) {
      toast.error('Cannot delete category with menu items. Please move or delete items first.');
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      toast.success('Category deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  // Item form handlers
  const resetItemForm = () => {
    setItemFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      is_available: true
    });
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemFormData.name || !itemFormData.price || !itemFormData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        name: itemFormData.name,
        description: itemFormData.description || null,
        price: parseFloat(itemFormData.price),
        category_id: itemFormData.category_id,
        image_url: itemFormData.image_url || null,
        is_available: itemFormData.is_available
      };

      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        toast.success('Menu item updated successfully');
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert(itemData);
        
        if (error) throw error;
        toast.success('Menu item created successfully');
      }

      resetItemForm();
      fetchData();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setItemFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id || '',
      image_url: item.image_url || '',
      is_available: item.is_available ?? true
    });
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      toast.success('Menu item deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId);
      
      if (error) throw error;
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Failed to update category status');
    }
  };

  const toggleItemAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentStatus })
        .eq('id', itemId);
      
      if (error) throw error;
      toast.success(`Item ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-neonCyan" />
        <span className="ml-2 text-gray-300">Loading three-tier menu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Three-Tier Menu Management</h2>
              <p className="text-gray-400">Manage your menu sections, categories, and items</p>
            </div>
            <Button onClick={fetchData} variant="outline" className="border-gray-600 text-gray-300">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* React Bricks Integration Info */}
          <div className="mb-6 p-4 bg-neonCyan/10 border border-neonCyan/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-neonCyan/20 rounded-lg">
                <MenuSquare className="h-5 w-5 text-neonCyan" />
              </div>
              <div className="flex-1">
                <h3 className="text-neonCyan font-semibold mb-2">🔗 React Bricks Integration</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Connect these database categories to your menu page panels in React Bricks. Each category has a unique ID shown below.
                </p>
                <div className="space-y-2 text-xs text-gray-400">
                  <p><strong>How to use:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Copy the <span className="text-neonCyan font-mono">Category ID</span> from below</li>
                    <li>Go to your menu page in React Bricks editor mode</li>
                    <li>Select a category panel and paste the ID in &quot;Database Category ID&quot; field</li>
                    <li>Content will automatically sync from this database</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sections.map(section => (
              <div key={section.name} className="bg-gray-700/30 rounded-lg p-4">
                <div className={`w-2 h-2 bg-${section.color} rounded-full mb-2`}></div>
                <div className="text-sm text-gray-400">{section.name}</div>
                <div className="text-lg font-bold text-white">{section.categories.length} categories</div>
                <div className="text-xs text-gray-500">{section.items.length} items</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Management Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-neonCyan/20">
            <MenuSquare className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-neonPink/20">
            <FolderPlus className="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="items" className="data-[state=active]:bg-orange-500/20">
            <Package className="w-4 h-4 mr-2" />
            Menu Items
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="space-y-6">
            {sections.map(section => (
              <Card key={section.name} className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-3 h-3 bg-${section.color} rounded-full`}></div>
                    <span className="text-white">{section.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {section.categories.length} categories, {section.items.length} items
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.categories.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FolderPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No categories in this section</p>
                        <Button 
                          onClick={() => {
                            const availableOrders = getAvailableDisplayOrders(section.name);
                            if (availableOrders.length > 0) {
                              setCategoryFormData(prev => ({
                                ...prev,
                                display_order: availableOrders[0].toString()
                              }));
                              setActiveTab('categories');
                              setShowCategoryForm(true);
                            } else {
                              toast.error(`No available positions in ${section.name} section`);
                            }
                          }}
                          className="mt-2 text-xs"
                          variant="outline"
                        >
                          Add Category
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.categories.map(category => (
                          <Card key={category.id} className="bg-gray-700/30 border-gray-600/50">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-white">{category.name}</h4>
                                    <p className="text-xs text-gray-400">Order: {category.display_order}</p>
                                    <p className="text-xs text-neonCyan font-mono">ID: {category.id}</p>
                                  </div>
                                  <Badge className={category.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                
                                {category.description && (
                                  <p className="text-sm text-gray-400 line-clamp-2">{category.description}</p>
                                )}
                                
                                <div className="text-xs text-gray-500">
                                  {section.items.filter(item => item.category_id === category.id).length} items
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleEditCategory(category)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => toggleCategoryStatus(category.id, category.is_active ?? false)}
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                                  >
                                    {category.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {/* Controls */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search categories..."
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
                </div>
                <Button onClick={() => setShowCategoryForm(true)} className="neon-button">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category Form */}
          {showCategoryForm && (
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                  <Button onClick={resetCategoryForm} variant="ghost" size="sm" className="text-gray-400">
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name" className="text-gray-300">Category Name *</Label>
                      <Input
                        id="cat-name"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        placeholder="Category name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cat-display-order" className="text-gray-300">Section & Position *</Label>
                      <Select 
                        value={categoryFormData.display_order} 
                        onValueChange={(value) => setCategoryFormData(prev => ({ ...prev, display_order: value }))}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue placeholder="Select section and position" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {Object.entries(SECTION_RANGES).map(([sectionName]) => {
                            const available = getAvailableDisplayOrders(sectionName);
                            return available.map(order => (
                              <SelectItem key={order} value={order.toString()}>
                                {sectionName} - Position {order}
                              </SelectItem>
                            ));
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cat-description" className="text-gray-300">Description</Label>
                    <Textarea
                      id="cat-description"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      placeholder="Describe the category..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={categoryFormData.is_active}
                      onCheckedChange={(checked) => setCategoryFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label className="text-gray-300">Active (visible to customers)</Label>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button type="button" onClick={resetCategoryForm} variant="outline" className="border-gray-600 text-gray-300">
                      Cancel
                    </Button>
                    <Button type="submit" className="neon-button">
                      <Save className="w-4 h-4 mr-2" />
                      {editingCategory ? 'Update' : 'Create'} Category
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            {sections
              .filter(section => sectionFilter === 'all' || section.name === sectionFilter)
              .map(section => (
                <Card key={section.name} className="bg-gray-800/50 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-3 h-3 bg-${section.color} rounded-full`}></div>
                      <span className="text-white">{section.name}</span>
                      <Badge variant="outline">{section.categories.length} categories</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {section.categories.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <FolderPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No categories in this section</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {section.categories.map(category => (
                          <div key={category.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium text-white">{category.name}</h4>
                                <Badge variant="outline" className="text-xs">Order: {category.display_order}</Badge>
                                <Badge variant="outline" className="text-xs text-neonCyan border-neonCyan/30">ID: {category.id}</Badge>
                                <Badge className={category.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                                  {category.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              {category.description && (
                                <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {menuItems.filter(item => item.category_id === category.id).length} items
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditCategory(category)}
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => toggleCategoryStatus(category.id, category.is_active ?? false)}
                                variant="outline"
                                size="sm"
                                className={`border-gray-600 ${category.is_active ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                              >
                                {category.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                onClick={() => handleDeleteCategory(category.id)}
                                variant="outline"
                                size="sm"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          {/* Controls */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search menu items..."
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
                            {category.section} → {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setShowItemForm(true)} className="neon-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Item Form */}
          {showItemForm && (
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
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
                        placeholder="Menu item name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="item-price" className="text-gray-300">Price (R) *</Label>
                      <Input
                        id="item-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={itemFormData.price}
                        onChange={(e) => setItemFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="item-category" className="text-gray-300">Category *</Label>
                      <Select value={itemFormData.category_id} onValueChange={(value) => setItemFormData(prev => ({ ...prev, category_id: value }))}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {sections.map(section => (
                            section.categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {section.name} → {category.name}
                              </SelectItem>
                            ))
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="item-image" className="text-gray-300">Image URL</Label>
                      <Input
                        id="item-image"
                        value={itemFormData.image_url}
                        onChange={(e) => setItemFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="item-description" className="text-gray-300">Description</Label>
                    <Textarea
                      id="item-description"
                      value={itemFormData.description}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      placeholder="Describe the menu item..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={itemFormData.is_available}
                      onCheckedChange={(checked) => setItemFormData(prev => ({ ...prev, is_available: checked }))}
                    />
                    <Label className="text-gray-300">Available for ordering</Label>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button type="button" onClick={resetItemForm} variant="outline" className="border-gray-600 text-gray-300">
                      Cancel
                    </Button>
                    <Button type="submit" className="neon-button">
                      <Save className="w-4 h-4 mr-2" />
                      {editingItem ? 'Update' : 'Create'} Item
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const itemSection = getSectionFromDisplayOrder(item.category?.display_order || 0);
              const sectionColor = getSectionColor(itemSection);
              
              return (
                <Card key={item.id} className={`bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 transition-colors ${!item.is_available ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Section indicator */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 bg-${sectionColor} rounded-full`}></div>
                        <span className="text-xs text-gray-400">{itemSection}</span>
                        <ChevronRight className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400">{item.category?.name}</span>
                      </div>

                      {/* Image */}
                      <div className="aspect-square bg-gray-700/50 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="text-gray-400"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-white line-clamp-2">{item.name}</h3>
                          <div className="flex items-center gap-1 ml-2">
                            <DollarSign className="w-4 h-4 text-neonCyan" />
                            <span className="font-bold text-neonCyan">R{item.price.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Badge className={item.is_available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditItem(item)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => toggleItemAvailability(item.id, item.is_available ?? false)}
                          variant="outline"
                          size="sm"
                          className={`border-gray-600 ${item.is_available ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                        >
                          {item.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={() => handleDeleteItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl text-gray-400 mb-2">No Menu Items Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || sectionFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first menu item to get started'}
                </p>
                {!searchTerm && sectionFilter === 'all' && categoryFilter === 'all' && (
                  <Button onClick={() => setShowItemForm(true)} className="neon-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Item
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
