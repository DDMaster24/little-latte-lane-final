'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSupabaseClient } from '@/lib/supabase-client';
import { useAuth } from '@/components/AuthProvider';
import { 
  Users, Search, User, Mail, Calendar,
  RefreshCw, Crown, Briefcase, Trash2, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteUserCompletely } from '@/app/admin/actions';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean | null;
  is_staff: boolean | null;
  created_at: string | null;
}

export default function UserManagement() {
  const { profile, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all, admin, staff, customer
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = getSupabaseClient();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(profiles || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteClick = (userProfile: UserProfile) => {
    // Prevent deleting yourself
    if (userProfile.id === profile?.id || userProfile.email === user?.email) {
      toast.error('You cannot delete your own account');
      return;
    }
    
    setUserToDelete(userProfile);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete?.email) {
      toast.error('No user email found');
      return;
    }

    try {
      setIsDeleting(true);
      
      const result = await deleteUserCompletely(userToDelete.email);
      
      if (result.success) {
        toast.success(result.message || 'User deleted successfully');
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        // Refresh user list
        await fetchUsers();
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' ||
      (filterRole === 'admin' && user.is_admin) ||
      (filterRole === 'staff' && user.is_staff) ||
      (filterRole === 'customer' && !user.is_admin && !user.is_staff);

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (user: UserProfile) => {
    if (user.is_admin) {
      return <Badge className="bg-red-500 text-white">Admin</Badge>;
    }
    if (user.is_staff) {
      return <Badge className="bg-blue-500 text-white">Staff</Badge>;
    }
    return <Badge variant="outline" className="border-gray-500 text-gray-300">Customer</Badge>;
  };

  const getStatusBadge = (_user: UserProfile) => {
    // For now, assume all users are verified since we don't have email_confirmed_at
    return <Badge className="bg-green-500 text-white">Verified</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-neonCyan" />
        <span className="ml-2 text-gray-300">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
          <p className="text-gray-400">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} className="neon-button">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="h-12 w-12 text-neonCyan" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Admins</p>
                <p className="text-3xl font-bold text-white">
                  {users.filter(u => u.is_admin).length}
                </p>
              </div>
              <Crown className="h-12 w-12 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Staff</p>
                <p className="text-3xl font-bold text-white">
                  {users.filter(u => u.is_staff && !u.is_admin).length}
                </p>
              </div>
              <Briefcase className="h-12 w-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Customers</p>
                <p className="text-3xl font-bold text-white">
                  {users.filter(u => !u.is_admin && !u.is_staff).length}
                </p>
              </div>
              <User className="h-12 w-12 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700/50 text-white"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'admin', 'staff', 'customer'].map((role) => (
            <Button
              key={role}
              onClick={() => setFilterRole(role)}
              variant={filterRole === role ? 'default' : 'outline'}
              className={
                filterRole === role 
                  ? 'bg-neonCyan text-black' 
                  : 'border-gray-700 text-gray-300 hover:bg-gray-700/50'
              }
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-neonCyan" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user.id} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-neonCyan to-neonPink rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">
                              {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">
                              {user.full_name || 'No name'}
                            </h3>
                            <p className="text-gray-400 text-sm flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email || 'No email'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {getRoleBadge(user)}
                          {getStatusBadge(user)}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined: {formatDate(user.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Status: Active
                          </div>
                        </div>
                      </div>

                      {/* Role Display and Actions */}
                      <div className="flex flex-col gap-2 lg:w-64">
                        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                          <div className="text-center">
                            <p className="text-gray-400 text-xs mb-2">User Role</p>
                            <div className="flex justify-center">
                              {getRoleBadge(user)}
                            </div>
                            <p className="text-gray-500 text-xs mt-2">
                              Contact system admin to change roles
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/30 rounded-lg p-2 border border-gray-700/50">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            {user.is_admin && (
                              <div className="flex items-center gap-1 text-red-400">
                                <Crown className="w-3 h-3" />
                                <span>Admin Access</span>
                              </div>
                            )}
                            {user.is_staff && (
                              <div className="flex items-center gap-1 text-blue-400">
                                <Briefcase className="w-3 h-3" />
                                <span>Staff Access</span>
                              </div>
                            )}
                            {!user.is_admin && !user.is_staff && (
                              <div className="flex items-center gap-1 text-gray-400">
                                <User className="w-3 h-3" />
                                <span>Customer</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.id === profile?.id}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No users found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-red-500/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Confirm User Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              This action cannot be undone. This will permanently delete the user account
              and all associated data including:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* User Info */}
            {userToDelete && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {userToDelete.full_name?.charAt(0) || userToDelete.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {userToDelete.full_name || 'No name'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {userToDelete.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getRoleBadge(userToDelete)}
                </div>
              </div>
            )}

            {/* Warning List */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                The following data will be permanently deleted:
              </p>
              <ul className="text-gray-300 text-sm space-y-1 ml-6 list-disc">
                <li>User profile and account information</li>
                <li>Order history and items</li>
                <li>Booking records</li>
                <li>Notifications and notification history</li>
                <li>Staff requests (if any)</li>
                <li>Contact form submissions</li>
              </ul>
            </div>

            <p className="text-gray-400 text-sm">
              Type the user&apos;s email to confirm: <span className="text-white font-mono">{userToDelete?.email}</span>
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600 border-red-500"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
