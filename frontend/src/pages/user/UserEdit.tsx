import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from '@/types/user';
import  userManagementService from '@/services/userManagementService';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    roles: [] as string[],
    enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const response = await userManagementService.getUserById(Number(id));
          if (response.success && response.data) {
            const userData = response.data;
            setUser(userData);
            setFormData({
              username: userData.username,
              email: userData.email,
              fullName: userData.fullName,
              roles: userData.roles,
              enabled: userData.enabled,
            });
          } else {
            toast({
              title: "Error",
              description: response.message || "Failed to load user",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "Failed to load user",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
  
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleChange = (value: string | string[]) => {
    setFormData(prev => ({ ...prev, roles: Array.isArray(value) ? value : [value] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (id) {
        const response = await userManagementService.updateUser(Number(id), {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          roles: formData.roles,
          enabled: formData.enabled,
        });

        if (response.success) {
          toast({
            title: "Success",
            description: "User updated successfully",
          });
          navigate('/admin/users');
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to update user",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Edit User</h1>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Edit User</h1>
          <p>User not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Edit User</h1>

        <form onSubmit={handleSubmit} className="max-w-md">
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="roles">Roles</Label>
              <Select onValueChange={(value) => handleRoleChange(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select role" defaultValue={formData.roles.join(', ')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Optional. Role can be one of: STUDENT, INSTRUCTOR, ADMIN.
              </p>
            </div>
            <div>
              <label htmlFor="enabled" className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span>Enabled</span>
              </label>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update User"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;
