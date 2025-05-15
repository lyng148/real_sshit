import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck, User, Mail, Calendar, BadgeCheck, Trash2 } from 'lucide-react';
import userManagementService from '@/services/userManagementService';
import { useToast } from "@/components/ui/use-toast";

const UserDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = async () => {
    if (!params.id) return;
    
    setLoading(true);
    try {
      const response = await userManagementService.getUserById(params.id);
      if (response.success) {
        setUser(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch user details.",
          variant: "destructive",
        });      
      }
    } catch (error: any) {
      console.error("Error fetching user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to fetch user details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleEnableDisable = async () => {
    if (!user || !params.id) return;
    
    setActionLoading(true);
    try {
      await userManagementService.enableDisableUser(params.id, !user.enabled);
      toast({
        title: "Success",
        description: `User ${user.enabled ? 'disabled' : 'enabled'} successfully.`,
      });
      fetchUser(); // Refresh user data    
    } catch (error: any) {
      console.error("Error enabling/disabling user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message|| "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!params.id) return;
    
    setActionLoading(true);
    try {
      await userManagementService.deleteUser(params.id);
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });  
      navigate('/admin/users'); // Redirect to user list    
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message ||"Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading user details...</div>;
  }

  if (!user) {
    return <div className="text-center">User not found.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">            <Avatar className="h-24 w-24">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{user.fullName}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="grid gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{user.username}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Created at: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BadgeCheck className="h-4 w-4 text-gray-500" />
              <span>Status: {user.enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold mt-4 mb-2">Roles:</h3>
              <ul className="list-disc list-inside">
                {user.roles.map((role: string) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => navigate(`/admin/users/${params.id}/edit`)}>
              Edit User
            </Button>
            <div className="flex space-x-2">
              <Button
                variant={user.enabled ? "destructive" : "outline"}
                onClick={handleEnableDisable}
                disabled={actionLoading}
              >
                {actionLoading ? 'Loading...' : (user.enabled ? 'Disable User' : 'Enable User')}
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? <span className="animate-pulse">Deleting...</span> : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetail;
