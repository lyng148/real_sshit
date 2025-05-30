import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Edit, Trash2, Eye, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import userManagementService from '@/services/userManagementService';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  enabled: boolean;
}

interface PaginationData {
  content: User[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
  };
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    // Reset to first page when search changes
    if (currentPage !== 0) {
      setCurrentPage(0);
    } else {
      fetchUsers();
    }
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userManagementService.getAllUsersPaginated(
        currentPage,
        pageSize,
        'fullName',
        'ASC'
      );
      
      console.log('API Response:', response); // Debug log
      
      if (response.success) {
        const paginatedData = response.data as PaginationData;
        console.log('Paginated Data:', paginatedData); // Debug log
        console.log('Total Pages:', paginatedData.pagination.totalPages); // Debug log
        console.log('Total Elements:', paginatedData.pagination.totalElements); // Debug log
        
        setUsers(paginatedData.content);
        setTotalPages(paginatedData.pagination.totalPages);
        setTotalElements(paginatedData.pagination.totalElements);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load users",
          variant: "destructive",
        });
      }    
    } catch (error: any) {
      console.error("Could not fetch users:", error);
      toast({
        title: "Error",
        description: error.message || error.response?.data?.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableDisable = async (id: number, enable: boolean) => {
    try {
      const response = await userManagementService.updateUser(id.toString(), { enabled: enable });
      if (!response.success) throw new Error(response.message);
      setUsers(users.map(user =>
        user.id === id ? { ...user, enabled: enable } : user
      ));
      toast({
        title: "Success",
        description: `User ${enable ? 'enabled' : 'disabled'} successfully.`,
      });    
    } catch (error: any) {
      console.error("Could not enable/disable user:", error);
      toast({
        title: "Error",
        description: error.message || error.response?.data?.message || `Failed to ${enable ? 'enable' : 'disable'} user.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await userManagementService.deleteUser(id.toString());
      if (!response.success) throw new Error(response.message);
      setUsers(users.filter(user => user.id !== id));
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });    
    } catch (error: any) {
      console.error("Could not delete user:", error);
      toast({
        title: "Error",
        description: error.message || error.response?.data?.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">{totalElements} total users</p>
          </div>
          <Link to="/admin/users/create">
            <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </Link>
        </div>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton rows for loading state
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell className="text-center"><Skeleton /></TableCell>
                    <TableCell className="text-right"><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                // Display message if no users found
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No users found.</TableCell>
                </TableRow>
              ) : (
                // User rows
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.roles.join(', ')}</TableCell>
                    <TableCell className="text-center">
                      {user.enabled ? (
                        <CheckCircle className="inline-block h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="inline-block h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the user from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {user.enabled ? (
                            <DropdownMenuItem onClick={() => handleEnableDisable(user.id, false)}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Disable
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleEnableDisable(user.id, true)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Enable
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Component */}
          {console.log('Rendering pagination check - totalPages:', totalPages, 'condition:', totalPages > 1)}
          {totalPages >= 1 && (
            <div className="p-4 border-t border-gray-200">
              {console.log('Rendering pagination with:', { currentPage, totalPages, totalElements })}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 0 && handlePageChange(currentPage - 1)}
                      className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {generatePageNumbers().map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {totalPages > 6 && currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages - 1 && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

