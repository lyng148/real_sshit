import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Edit, User, Mail, Lock, CheckCircle, Ban } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/AuthContext';
import userManagementService  from '@/services/userManagementService';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await userManagementService.getUserById(Number(id));
        if (response.success) {
          setUser(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load user details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, toast]);

  const handleEditUser = () => {
    navigate(`/admin/users/${id}/edit`);
  };

  const handleEnableDisableUser = async (userId: number, enable: boolean) => {
    try {
      const response = await userManagementService.enableDisableUser(userId, enable);
      if (response.success) {
        toast({
          title: "Success",
          description: enable ? "User enabled successfully" : "User disabled successfully",
        });
        // Refresh user details after enabling/disabling
        const updatedUserResponse = await userManagementService.getUserById(Number(id));
        if (updatedUserResponse.success) {
          setUser(updatedUserResponse.data);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update user status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error enabling/disabling user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
            <p className="text-gray-600">View and manage user information</p>
          </div>

          {loading ? (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ) : user ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>
                  {user.fullName}
                </CardTitle>
                <CardDescription>
                  {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Username</p>
                    <p className="text-gray-800">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Full Name</p>
                    <p className="text-gray-800">{user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Roles</p>
                    <p className="text-gray-800">{user.roles.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className={`font-medium ${user.enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {user.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created At</p>
                    <p className="text-gray-800">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleEditUser}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit User
                  </Button>
                  {user.enabled ? (
                    <Button variant="default" className="bg-red-500 hover:bg-red-600" onClick={() => handleEnableDisableUser(user.id, false)}>
                      <Ban className="h-4 w-4 mr-2" />
                      Disable User
                    </Button>
                  ) : (
                    <Button variant="default" className="bg-green-500 hover:bg-green-600" onClick={() => handleEnableDisableUser(user.id, true)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enable User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardContent>
                <p className="text-gray-500">User not found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
