import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  Crown,
  GraduationCap,
  User,
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { animations } from '../lib/animations';
import userManagementService from '../services/userManagementService';

// Types based on backend API
interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  roles: string[];
  enabled: boolean;
}

interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // For stats calculation
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    roles: ['STUDENT'],
    enabled: true
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true
  });
  const [sortBy, setSortBy] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('ASC');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchAllUsersForStats();
  }, [pagination.page, pagination.size, sortBy, sortDirection]);

  useEffect(() => {
    // Animate cards when users change
    if (users.length > 0) {
      setTimeout(() => {
        animations.card.staggerIn('.user-card', 100);
      }, 100);
    }
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userManagementService.getAllUsersPaginated(
        pagination.page, 
        pagination.size, 
        sortBy, 
        sortDirection
      );
      
      if (response.success && response.data) {
        setUsers(response.data.content || []);
        setPagination({
          page: response.data.page || 0,
          size: response.data.size || 10,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
          first: response.data.first || true,
          last: response.data.last || true
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load user list",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsersForStats = async () => {
    try {
      const response = await userManagementService.getAllUsers();
      if (response.success && response.data) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching all users for stats:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.enabled) ||
                         (statusFilter === 'inactive' && !user.enabled);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (roles: string[]) => {
    if (roles.includes('ADMIN')) {
      return <Shield className="h-4 w-4" />;
    } else if (roles.includes('INSTRUCTOR')) {
      return <GraduationCap className="h-4 w-4" />;
    } else {
      return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (roles: string[]) => {
    if (roles.includes('ADMIN')) {
      return 'bg-red-100 text-red-700 border-red-200';
    } else if (roles.includes('INSTRUCTOR')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    } else {
      return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getRoleLabel = (roles: string[]) => {
    if (roles.includes('ADMIN')) {
      return 'Admin';
    } else if (roles.includes('INSTRUCTOR')) {
      return 'Instructor';
    } else {
      return 'Student';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.fullName || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await userManagementService.createUser(newUser);
      if (response.success) {
        toast({
          title: "Success",
          description: "User created successfully",
          variant: "default",
        });
        setNewUser({
          username: '',
          email: '',
          fullName: '',
          password: '',
          roles: ['STUDENT'],
          enabled: true
        });
        setIsCreateModalOpen(false);
        fetchUsers(); // Refresh the list
        fetchAllUsersForStats(); // Refresh stats
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create user",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      const response = await userManagementService.updateUser(selectedUser.id.toString(), {
        username: selectedUser.username,
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        roles: selectedUser.roles,
        enabled: selectedUser.enabled
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
          variant: "default",
        });
        setIsEditModalOpen(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the list
        fetchAllUsersForStats(); // Refresh stats
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await userManagementService.deleteUser(userId.toString());
      if (response.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
          variant: "default",
        });
        fetchUsers(); // Refresh the list
        fetchAllUsersForStats(); // Refresh stats
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await userManagementService.enableDisableUser(userId.toString(), !currentStatus);
      if (response.success) {
        toast({
          title: "Success",
          description: `${!currentStatus ? 'Activated' : 'Disabled'} user successfully`,
        });
        fetchUsers(); // Refresh the list
        fetchAllUsersForStats(); // Refresh stats
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update user status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser({ ...user });
    setIsEditModalOpen(true);
  };

  const getStatsData = () => {
    return {
      total: allUsers.length,
      students: allUsers.filter(u => u.roles.includes('STUDENT')).length,
      instructors: allUsers.filter(u => u.roles.includes('INSTRUCTOR')).length,
      admins: allUsers.filter(u => u.roles.includes('ADMIN')).length,
    };
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: string) => {
    setPagination(prev => ({ ...prev, size: parseInt(newSize), page: 0 }));
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortDirection('ASC');
    }
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const stats = getStatsData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ITss System Administration
          </h1>
          <p className="text-gray-600 text-lg">
            User management and system permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Students</p>
                  <p className="text-3xl font-bold">{stats.students}</p>
                </div>
                <User className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Instructors</p>
                  <p className="text-3xl font-bold">{stats.instructors}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Administrators</p>
                  <p className="text-3xl font-bold">{stats.admins}</p>
                </div>
                <Shield className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-white to-gray-50 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">User Management</CardTitle>
                <p className="text-gray-600 mt-1">Add, edit, delete and manage user accounts</p>
              </div>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Filters and Sort */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Disabled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullName">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="lastLoginAt">Last Login</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => handleSortChange(sortBy)}
                className="w-full md:w-auto"
              >
                {sortDirection === 'ASC' ? '↑' : '↓'}
              </Button>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="user-card border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
                          <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                            <Badge className={getRoleBadgeColor(user.roles)}>
                              {getRoleIcon(user.roles)}
                              <span className="ml-1">{getRoleLabel(user.roles)}</span>
                            </Badge>
                            <Badge variant={user.enabled ? "default" : "secondary"}>
                              {user.enabled ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Created: {new Date(user.createdAt).toLocaleDateString('en-US')}</span>
                            {user.lastLoginAt && (
                              <span>Last login: {new Date(user.lastLoginAt).toLocaleDateString('en-US')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.enabled)}>
                            {user.enabled ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Enable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No users found</p>
                  <p className="text-gray-400 text-sm">Try changing filters or search keywords</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <span className="text-sm text-gray-600">Display</span>
                <Select value={pagination.size.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">
                  of total {pagination.totalElements} users
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.first}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i;
                    } else if (pagination.page < 3) {
                      pageNum = i;
                    } else if (pagination.page > pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 5 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.last}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription className="text-gray-600">
              Create new account for ITss system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>

            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.roles[0]} onValueChange={(value) => setNewUser({ ...newUser, roles: [value] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={!newUser.fullName || !newUser.email || !newUser.password || !newUser.username || submitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update account information
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editUsername">Username</Label>
                <Input
                  id="editUsername"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="editFullName">Full Name</Label>
                <Input
                  id="editFullName"
                  value={selectedUser.fullName}
                  onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select value={selectedUser.roles[0]} onValueChange={(value) => setSelectedUser({ ...selectedUser, roles: [value] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditUser}
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard; 