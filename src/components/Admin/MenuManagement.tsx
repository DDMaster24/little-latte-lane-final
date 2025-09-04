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
import { getSupabaseClient } from '@/lib/supabase-client';
import { 
  Plus, Edit, Trash2, RefreshCw, Search, Filter, 
  DollarSign, Image as ImageIcon, Save, X, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  } | null;
}

interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true
  });

  const supabase = getSupabaseClient();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order');
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch menu items with categories
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:menu_categories(id, name)
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

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      is_available: true
    });
    setEditingItem(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        image_url: formData.image_url || null,
        is_available: formData.is_available
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        toast.success('Menu item updated successfully');
      } else {
        // Create new item
        const { error } = await supabase
          .from('menu_items')
          .insert(itemData);
        
        if (error) throw error;
        toast.success('Menu item created successfully');
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id || '',
      image_url: item.image_url || '',
      is_available: item.is_available ?? true
    });
    setEditingItem(item);
    setShowCreateForm(true);
  };

  const handleDelete = async (itemId: string) => {
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

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
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
        <span className="ml-2 text-gray-300">Loading menu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchData} variant="outline" className="border-gray-600 text-gray-300">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowCreateForm(true)} className="neon-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
              <Button onClick={resetForm} variant="ghost" size="sm" className="text-gray-400">
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Menu item name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-300">Price (R) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Category *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-gray-300">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700/50 border-gray-600 text-white"
                  placeholder="Describe the menu item..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
                />
                <Label htmlFor="is_available" className="text-gray-300">Available for ordering</Label>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" onClick={resetForm} variant="outline" className="border-gray-600 text-gray-300">
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

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 transition-colors ${!item.is_available ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
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
                      <span className="font-bold text-neonCyan">{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {item.category?.name || 'No Category'}
                    </Badge>
                    <Badge className={(item.is_available ?? false) ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                      {(item.is_available ?? false) ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(item)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => toggleAvailability(item.id, item.is_available ?? false)}
                    variant="outline"
                    size="sm"
                    className={`border-gray-600 ${(item.is_available ?? false) ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                  >
                    {(item.is_available ?? false) ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
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
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-gray-400 mb-2">No Menu Items Found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first menu item to get started'}
            </p>
            {!searchTerm && categoryFilter === 'all' && (
              <Button onClick={() => setShowCreateForm(true)} className="neon-button">
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
