'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Menu, Plus, Edit, Search, Filter, 
  Package, DollarSign, Eye, ChevronRight,
  AlertCircle, CheckCircle
} from 'lucide-react';

export default function MenuManagement() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Menu Management</h2>
          <p className="text-gray-400">Manage menu items, categories, and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-gradient-to-r from-neonCyan to-blue-600 hover:from-neonCyan/80 hover:to-blue-600/80">
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>
          <Button variant="outline" className="border-neonPink/30 text-neonPink hover:bg-neonPink/10">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Items", value: "147", icon: Menu, color: "neonCyan" },
          { title: "Categories", value: "12", icon: Package, color: "neonPink" },
          { title: "Avg. Price", value: "R89", icon: DollarSign, color: "green-500" },
          { title: "Popular Items", value: "23", icon: Eye, color: "yellow-500" }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-${stat.color}/20`}>
                    <Icon className={`h-5 w-5 text-${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Section Navigation */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex gap-2 mb-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'items', label: 'Menu Items' },
              { id: 'categories', label: 'Categories' },
              { id: 'pricing', label: 'Pricing Rules' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Content based on active section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gray-700/30 border-gray-600/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Categories Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Pizzas", items: 24, status: "active" },
                        { name: "Burgers", items: 18, status: "active" },
                        { name: "Salads", items: 12, status: "active" },
                        { name: "Beverages", items: 31, status: "active" },
                        { name: "Desserts", items: 8, status: "inactive" }
                      ].map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-600/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            {category.status === 'active' ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-400" />
                            )}
                            <span className="text-gray-300">{category.name}</span>
                          </div>
                          <span className="text-white font-medium">{category.items} items</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-700/30 border-gray-600/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Recent Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { action: "Updated Margherita Pizza price", time: "2 hours ago" },
                        { action: "Added new Vegan Burger", time: "1 day ago" },
                        { action: "Disabled Seasonal Soup", time: "2 days ago" },
                        { action: "Updated Pasta category", time: "3 days ago" }
                      ].map((update, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-600/30 rounded-lg">
                          <Edit className="h-4 w-4 text-neonCyan" />
                          <div className="flex-1">
                            <p className="text-gray-300 text-sm">{update.action}</p>
                            <p className="text-gray-500 text-xs">{update.time}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'items' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neonCyan"
                    />
                  </div>
                </div>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Development in Progress</span>
                </div>
                <p className="text-gray-300 text-sm">
                  The full menu management system is currently being built. This will include:
                </p>
                <ul className="text-gray-300 text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>Complete CRUD operations for menu items</li>
                  <li>Category management with drag-and-drop ordering</li>
                  <li>Bulk pricing updates and promotional pricing</li>
                  <li>Image upload and management</li>
                  <li>Availability scheduling and stock management</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'categories' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-medium">Category Management</span>
              </div>
              <p className="text-gray-300 text-sm">
                Category management features coming soon. Will include category creation, editing, reordering, and nested categories.
              </p>
            </div>
          )}

          {activeSection === 'pricing' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Pricing Management</span>
              </div>
              <p className="text-gray-300 text-sm">
                Advanced pricing features coming soon. Will include bulk pricing updates, promotional pricing, time-based pricing, and customer group pricing.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
