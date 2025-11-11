'use client';

/**
 * Enhanced Menu Management Component - Revised
 * Supports categories, items with inline variations, and add-ons
 * Updated: November 11, 2025
 */

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import {
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createItemVariation,
  updateItemVariation,
  deleteItemVariation,
  createAddon,
  updateAddon,
  deleteAddon,
  linkAddonToItem,
  unlinkAddon,
} from '@/app/admin/actions';
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
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  PlusCircle,
  Link as LinkIcon,
  Search,
  X,
} from 'lucide-react';

// Types
interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  is_available: boolean | null;
}

interface ItemVariation {
  id: string;
  menu_item_id: string;
  name: string;
  price_adjustment: number;
  is_default: boolean | null;
  display_order: number | null;
  is_available: boolean | null;
}

interface Addon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  display_order: number | null;
  is_available: boolean | null;
}

interface AddonLink {
  id: string;
  menu_item_id: string | null;
  category_id: string | null;
  addon_id: string;
  is_required: boolean | null;
  max_quantity: number | null;
  addon?: Addon;
}

export default function EnhancedMenuManagement() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [variations, setVariations] = useState<ItemVariation[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [addonLinks, setAddonLinks] = useState<AddonLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isAddonDialogOpen, setIsAddonDialogOpen] = useState(false);
  const [isLinkAddonDialogOpen, setIsLinkAddonDialogOpen] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({});
  const [itemForm, setItemForm] = useState<Partial<MenuItem>>({});
  const [addonForm, setAddonForm] = useState<Partial<Addon>>({});
  const [linkForm, setLinkForm] = useState<Partial<AddonLink>>({});

  // Inline variations for item form
  const [itemVariations, setItemVariations] = useState<Array<{
    name: string;
    price_adjustment: number;
    is_default: boolean;
  }>>([]);

  // Editing states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();

      const [catsRes, itemsRes, varsRes, addonsRes, linksRes] = await Promise.all([
        supabase.from('menu_categories').select('*').order('display_order'),
        supabase.from('menu_items').select('*').order('name'),
        (supabase as any).from('menu_item_variations').select('*').order('display_order'),
        (supabase as any).from('menu_addons').select('*').order('display_order'),
        (supabase as any).from('menu_item_addons').select(`
          *,
          addon:menu_addons(*)
        `),
      ]);

      setCategories(catsRes.data || []);
      setMenuItems(itemsRes.data || []);
      setVariations(varsRes.data || []);
      setAddons(addonsRes.data || []);
      setAddonLinks(linksRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'N/A';
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getItemVariations = (itemId: string) =>
    variations.filter(v => v.menu_item_id === itemId);

  const getItemAddons = (itemId: string) =>
    addonLinks.filter(l => l.menu_item_id === itemId);

  const getCategoryAddons = (categoryId: string) =>
    addonLinks.filter(l => l.category_id === categoryId);

  const getAddonLinkedItems = (addonId: string) => {
    const links = addonLinks.filter(l => l.addon_id === addonId);
    return links.map(link => {
      if (link.menu_item_id) {
        const item = menuItems.find(i => i.id === link.menu_item_id);
        return item ? { type: 'item', name: item.name } : null;
      } else if (link.category_id) {
        const cat = categories.find(c => c.id === link.category_id);
        return cat ? { type: 'category', name: cat.name } : null;
      }
      return null;
    }).filter(Boolean);
  };

  // Filtering
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAddons = addons.filter(addon =>
    addon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Category operations
  const handleSaveCategory = async () => {
    try {
      if (!categoryForm.name) {
        toast.error('Category name is required');
        return;
      }

      if (editingCategory) {
        await updateMenuCategory(editingCategory.id, categoryForm);
        toast.success('Category updated!');
      } else {
        await createMenuCategory(categoryForm as { name: string; description?: string | null; display_order?: number | null; is_active?: boolean | null });
        toast.success('Category created!');
      }
      setIsCategoryDialogOpen(false);
      setCategoryForm({});
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category and all its items?')) return;
    try {
      await deleteMenuCategory(id);
      toast.success('Category deleted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // Item operations
  const handleSaveItem = async () => {
    try {
      if (!itemForm.name || itemForm.price === undefined) {
        toast.error('Item name and price are required');
        return;
      }

      let itemId: string;

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemForm);
        itemId = editingItem.id;
        toast.success('Item updated!');
      } else {
        const result = await createMenuItem(itemForm as { name: string; description?: string | null; price: number; category_id?: string | null; is_available?: boolean | null });
        itemId = result.data?.id!;
        if (!itemId) throw new Error('Failed to get item ID');
        toast.success('Item created!');
      }

      // Save variations if any
      if (itemVariations.length > 0) {
        for (const variation of itemVariations) {
          await createItemVariation({
            menu_item_id: itemId,
            name: variation.name,
            price_adjustment: variation.price_adjustment,
            is_default: variation.is_default,
            display_order: 0,
          });
        }
        toast.success(`Added ${itemVariations.length} size variation(s)!`);
      }

      setIsItemDialogOpen(false);
      setItemForm({});
      setItemVariations([]);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this item and all its variations?')) return;
    try {
      await deleteMenuItem(id);
      toast.success('Item deleted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleDeleteVariation = async (id: string) => {
    if (!confirm('Delete this size variation?')) return;
    try {
      await deleteItemVariation(id);
      toast.success('Variation deleted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete variation');
    }
  };

  // Add-on operations
  const handleSaveAddon = async () => {
    try {
      if (!addonForm.name || addonForm.price === undefined) {
        toast.error('Add-on name and price are required');
        return;
      }

      if (editingAddon) {
        await updateAddon(editingAddon.id, addonForm);
        toast.success('Add-on updated!');
      } else {
        await createAddon(addonForm as { name: string; price: number });
        toast.success('Add-on created!');
      }
      setIsAddonDialogOpen(false);
      setAddonForm({});
      setEditingAddon(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save add-on');
    }
  };

  const handleDeleteAddon = async (id: string) => {
    if (!confirm('Delete this add-on?')) return;
    try {
      await deleteAddon(id);
      toast.success('Add-on deleted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete add-on');
    }
  };

  // Link operations
  const handleLinkAddon = async () => {
    try {
      if (!linkForm.addon_id) {
        toast.error('Please select an add-on');
        return;
      }
      await linkAddonToItem(linkForm as { addon_id: string });
      toast.success('Add-on linked!');
      setIsLinkAddonDialogOpen(false);
      setLinkForm({});
      fetchData();
    } catch (error) {
      toast.error('Failed to link add-on');
    }
  };

  const handleUnlinkAddon = async (id: string) => {
    if (!confirm('Remove this add-on link?')) return;
    try {
      await unlinkAddon(id);
      toast.success('Add-on unlinked!');
      fetchData();
    } catch (error) {
      toast.error('Failed to unlink add-on');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading menu data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="h-6 w-6 text-neonCyan" />
          <div>
            <h2 className="text-2xl font-bold text-white">Menu Management</h2>
            <p className="text-gray-400">Manage items, sizes, and add-ons</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Search and Filter Bar */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu items, categories, or add-ons..."
                className="bg-gray-900 border-gray-600 text-white pl-10"
              />
              {searchQuery && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-gray-900 border-gray-600 text-white">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Button-Style Navigation */}
      <div className="bg-gray-800/30 backdrop-blur-sm p-2 rounded-2xl border border-gray-700/30">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'items', label: 'Menu Items', icon: UtensilsCrossed },
            { id: 'categories', label: 'Categories', icon: PlusCircle },
            { id: 'addons', label: 'Add-ons', icon: LinkIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 lg:px-6 py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-r from-neonCyan/30 via-neonPink/20 to-neonCyan/30 text-white border-2 border-neonCyan/50 shadow-lg shadow-neonCyan/20'
                    : 'text-gray-300 bg-gray-800/40 border-2 border-gray-600/50 hover:text-white hover:bg-gray-700/60 hover:border-gray-500/70'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonCyan/10 to-neonPink/10 blur-sm"></div>
                )}
                <Icon className={`relative z-10 h-4 w-4 ${isActive ? 'text-neonCyan' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* MENU ITEMS TAB */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Menu Items {searchQuery && `(${filteredItems.length} results)`}
              </h3>
              <Button
                onClick={() => {
                  setEditingItem(null);
                  setItemForm({});
                  setItemVariations([]);
                  setIsItemDialogOpen(true);
                }}
                className="bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">Sizes</TableHead>
                    <TableHead className="text-gray-300">Add-ons</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const itemVars = getItemVariations(item.id);
                    const itemAddons = getItemAddons(item.id);

                    return (
                      <TableRow key={item.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{item.name}</TableCell>
                        <TableCell className="text-gray-300">{getCategoryName(item.category_id)}</TableCell>
                        <TableCell className="text-neonCyan">R{item.price}</TableCell>
                        <TableCell>
                          {itemVars.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {itemVars.map(v => (
                                <Badge key={v.id} variant="outline" className="text-xs">
                                  {v.name} ({v.price_adjustment >= 0 ? '+' : ''}R{v.price_adjustment})
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">No sizes</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{itemAddons.length} linked</Badge>
                        </TableCell>
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
                              onClick={() => {
                                setSelectedItem(item);
                                setEditingItem(item);
                                setItemForm(item);
                                setItemVariations([]);
                                setIsItemDialogOpen(true);
                              }}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(item);
                                setLinkForm({ menu_item_id: item.id });
                                setIsLinkAddonDialogOpen(true);
                              }}
                              className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
                              title="Link Add-ons"
                            >
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteItem(item.id)}
                              className="border-red-600 text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Categories {searchQuery && `(${filteredCategories.length} results)`}
              </h3>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({});
                  setIsCategoryDialogOpen(true);
                }}
                className="bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => {
                const itemCount = menuItems.filter(i => i.category_id === category.id).length;
                const categoryAddons = getCategoryAddons(category.id);

                return (
                  <Card key={category.id} className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">{category.name}</CardTitle>
                          {category.description && (
                            <p className="text-gray-400 text-sm mt-1">{category.description}</p>
                          )}
                        </div>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Items: {itemCount}</span>
                        <span className="text-gray-400">Add-ons: {categoryAddons.length}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryForm(category);
                            setIsCategoryDialogOpen(true);
                          }}
                          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCategory(category);
                            setLinkForm({ category_id: category.id });
                            setIsLinkAddonDialogOpen(true);
                          }}
                          className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
                          title="Link Add-ons"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ADD-ONS TAB */}
        {activeTab === 'addons' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Add-ons & Modifiers {searchQuery && `(${filteredAddons.length} results)`}
              </h3>
              <Button
                onClick={() => {
                  setEditingAddon(null);
                  setAddonForm({});
                  setIsAddonDialogOpen(true);
                }}
                className="bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Add-on
              </Button>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">Linked To</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAddons.map((addon) => {
                    const linkedItems = getAddonLinkedItems(addon.id);

                    return (
                      <TableRow key={addon.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{addon.name}</TableCell>
                        <TableCell className="text-gray-300">{addon.category || 'N/A'}</TableCell>
                        <TableCell className="text-neonCyan">R{addon.price}</TableCell>
                        <TableCell>
                          {linkedItems.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {linkedItems.map((link: any, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {link.type === 'category' && '📁 '}
                                  {link.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">Not linked</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={addon.is_available ? "default" : "secondary"}>
                            {addon.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingAddon(addon);
                                setAddonForm(addon);
                                setIsAddonDialogOpen(true);
                              }}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAddon(addon.id)}
                              className="border-red-600 text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>

      {/* DIALOGS - Category, Item with Inline Variations, Addon, Link */}

      {/* CATEGORY DIALOG */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={categoryForm.name || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="e.g., Cold Drinks"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={categoryForm.description || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Brief description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={categoryForm.display_order || 0}
                  onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label>Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    checked={categoryForm.is_active !== false}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCategory} className="bg-neonCyan text-black">
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ITEM DIALOG WITH INLINE VARIATIONS */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neonCyan">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={itemForm.name || ''}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="e.g., Cappuccino"
                  />
                </div>

                <div>
                  <Label>Category *</Label>
                  <Select
                    value={itemForm.category_id || ''}
                    onValueChange={(value) => setItemForm({ ...itemForm, category_id: value })}
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

              <div>
                <Label>Description</Label>
                <Textarea
                  value={itemForm.description || ''}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Price (R) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={itemForm.price || 0}
                    onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      checked={itemForm.is_available !== false}
                      onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Size Variations */}
            {!editingItem && (
              <div className="border-t border-gray-700 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neonCyan">Size Variations (Optional)</h3>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setItemVariations([...itemVariations, { name: '', price_adjustment: 0, is_default: itemVariations.length === 0 }]);
                    }}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>

                {itemVariations.length > 0 && (
                  <div className="space-y-3">
                    {itemVariations.map((variation, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Size Name *</Label>
                            <Input
                              value={variation.name}
                              onChange={(e) => {
                                const newVars = [...itemVariations];
                                newVars[index].name = e.target.value;
                                setItemVariations(newVars);
                              }}
                              placeholder="e.g., Small"
                              className="bg-gray-900 border-gray-600 text-white text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Price Adjustment (R)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variation.price_adjustment}
                              onChange={(e) => {
                                const newVars = [...itemVariations];
                                newVars[index].price_adjustment = parseFloat(e.target.value) || 0;
                                setItemVariations(newVars);
                              }}
                              placeholder="e.g., -5 or +10"
                              className="bg-gray-900 border-gray-600 text-white text-sm"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={variation.is_default}
                                onChange={(e) => {
                                  const newVars = itemVariations.map((v, i) => ({
                                    ...v,
                                    is_default: i === index ? e.target.checked : false
                                  }));
                                  setItemVariations(newVars);
                                }}
                                className="rounded"
                              />
                              <Label className="text-xs">Default</Label>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setItemVariations(itemVariations.filter((_, i) => i !== index));
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Show Existing Variations for Editing */}
            {editingItem && (
              <div className="border-t border-gray-700 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-neonCyan">Existing Size Variations</h3>
                {getItemVariations(editingItem.id).length > 0 ? (
                  <div className="space-y-2">
                    {getItemVariations(editingItem.id).map((v) => (
                      <div key={v.id} className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg">
                        <div>
                          <span className="text-white font-medium">{v.name}</span>
                          <span className="text-gray-400 ml-3">
                            {v.price_adjustment >= 0 ? '+' : ''}R{v.price_adjustment}
                          </span>
                          {v.is_default && <Badge className="ml-2" variant="default">Default</Badge>}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteVariation(v.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No size variations for this item</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsItemDialogOpen(false);
                  setItemVariations([]);
                }}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveItem} className="bg-neonCyan text-black">
                {editingItem ? 'Update' : 'Create'} Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADDON DIALOG */}
      <Dialog open={isAddonDialogOpen} onOpenChange={setIsAddonDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAddon ? 'Edit Add-on' : 'Add New Add-on'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name * (e.g., "Boba", "Extra Cheese")</Label>
                <Input
                  value={addonForm.name || ''}
                  onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="e.g., Boba"
                />
              </div>

              <div>
                <Label>Price (R) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={addonForm.price || 0}
                  onChange={(e) => setAddonForm({ ...addonForm, price: parseFloat(e.target.value) })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={addonForm.description || ''}
                onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category (optional grouping)</Label>
                <Input
                  value={addonForm.category || ''}
                  onChange={(e) => setAddonForm({ ...addonForm, category: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="e.g., Toppings, Extras"
                />
              </div>

              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={addonForm.display_order || 0}
                  onChange={(e) => setAddonForm({ ...addonForm, display_order: parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  checked={addonForm.is_available !== false}
                  onChange={(e) => setAddonForm({ ...addonForm, is_available: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Available</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddonDialogOpen(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAddon} className="bg-neonCyan text-black">
                {editingAddon ? 'Update' : 'Create'} Add-on
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LINK ADDON DIALOG */}
      <Dialog open={isLinkAddonDialogOpen} onOpenChange={setIsLinkAddonDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Link Add-on
              {selectedItem && <span className="text-gray-400 ml-2">to {selectedItem.name}</span>}
              {selectedCategory && <span className="text-gray-400 ml-2">to {selectedCategory.name} category</span>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Add-on *</Label>
              <Select
                value={linkForm.addon_id || ''}
                onValueChange={(value) => setLinkForm({ ...linkForm, addon_id: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select add-on" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {addons.map((addon) => (
                    <SelectItem key={addon.id} value={addon.id}>
                      {addon.name} - R{addon.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Quantity</Label>
                <Input
                  type="number"
                  value={linkForm.max_quantity || 1}
                  onChange={(e) => setLinkForm({ ...linkForm, max_quantity: parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  How many of this add-on can be selected
                </p>
              </div>

              <div>
                <Label>Required?</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    checked={linkForm.is_required || false}
                    onChange={(e) => setLinkForm({ ...linkForm, is_required: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Customer must select this</span>
                </div>
              </div>
            </div>

            {/* Show existing linked add-ons */}
            {(selectedItem || selectedCategory) && (
              <div className="border-t border-gray-700 pt-4">
                <Label className="text-gray-400 mb-2 block">
                  Currently Linked Add-ons:
                </Label>
                <div className="space-y-1">
                  {(selectedItem ? getItemAddons(selectedItem.id) : selectedCategory ? getCategoryAddons(selectedCategory.id) : []).map((link) => (
                    <div key={link.id} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded">
                      <span className="text-white">{link.addon?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">
                          Max: {link.max_quantity}
                          {link.is_required && <Badge className="ml-2" variant="default">Required</Badge>}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnlinkAddon(link.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLinkAddonDialogOpen(false);
                  setSelectedItem(null);
                  setSelectedCategory(null);
                }}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={handleLinkAddon} className="bg-neonCyan text-black">
                Link Add-on
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
