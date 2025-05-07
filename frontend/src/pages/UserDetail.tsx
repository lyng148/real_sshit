import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import userService from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserDetail {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  enabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Redirect if not admin
  if (!currentUser?.user.roles.includes('ADMIN')) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    if (!id) return;
    
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserById(parseInt(id));
        setUser(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load user details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [id]);

  const handleDeleteUser = async () => {
    if (!user) return;
    
    try {
      await userService.deleteUser(user.id);
      navigate('/admin/users', { 
        state: { message: `User ${user.fullName} has been deleted.` } 
      });
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-red-500 mb-4">{error || "User not found"}</p>
          <Button onClick={() => navigate('/admin/users')}>
            Back to User List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/users')}
            className="mb-4"
          >
            ← Back to Users
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">User Details</h1>
              <p className="text-gray-600 mt-1">Detailed information for user {user.fullName}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate(`/admin/users/${id}/edit`)}
              >
                Edit User
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Basic user details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Username</span>
                <span className="text-lg font-medium">{user.username}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Full Name</span>
                <span className="text-lg font-medium">{user.fullName}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-lg font-medium">{user.email}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Status</span>
                <span>
                  <Badge variant={user.enabled ? "success" : "secondary"}>
                    {user.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Roles</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant={
                      role === 'ADMIN' ? 'destructive' : 
                      role === 'INSTRUCTOR' ? 'outline' : 'default'
                    }>
                      {role.toLowerCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>System information about the user account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">User ID</span>
                <span className="text-lg font-medium">{user.id}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Last Login</span>
                <span className="text-lg font-medium">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Created At</span>
                <span className="text-lg font-medium">
                  {new Date(user.createdAt).toLocaleString()}
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-lg font-medium">
                  {new Date(user.updatedAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user "{user.fullName}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteUser}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserDetail;