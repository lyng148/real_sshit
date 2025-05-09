
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from '@/types/user';
import userManagementService from '@/services/userManagementService';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    roles: [] as string[]
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await userManagementService.getUserById(Number(id));
        if (response.success && response.data) {
          setUser(response.data);
          setFormData({
            fullName: response.data.fullName || '',
            email: response.data.email || '',
            roles: response.data.roles || []
          });
        } else {
          setError(response.message || 'Failed to fetch user');
        }
      } catch (error) {
        setError('An error occurred while fetching user data');
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => {
      const roleExists = prev.roles.includes(role);
      
      if (roleExists) {
        return {
          ...prev,
          roles: prev.roles.filter(r => r !== role)
        };
      } else {
        return {
          ...prev,
          roles: [...prev.roles, role]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await userManagementService.updateUser(Number(id), {
        fullName: formData.fullName,
        email: formData.email,
        roles: formData.roles
      });

      if (response.success) {
        navigate('/admin/users');
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (error) {
      setError('An error occurred while updating user');
      console.error('Error updating user:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-8">User not found</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Roles</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="role-admin" 
                    checked={formData.roles.includes('ADMIN')} 
                    onCheckedChange={() => handleRoleChange('ADMIN')}
                  />
                  <Label htmlFor="role-admin">Administrator</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="role-instructor" 
                    checked={formData.roles.includes('INSTRUCTOR')} 
                    onCheckedChange={() => handleRoleChange('INSTRUCTOR')}
                  />
                  <Label htmlFor="role-instructor">Instructor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="role-student" 
                    checked={formData.roles.includes('STUDENT')} 
                    onCheckedChange={() => handleRoleChange('STUDENT')}
                  />
                  <Label htmlFor="role-student">Student</Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/users')}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEdit;
