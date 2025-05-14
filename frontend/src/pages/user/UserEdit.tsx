import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import userManagementService from '@/services/userManagementService';
import { Roles } from '@/types/user';

const UserEdit = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<Roles[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    if (!params.id) return;
    
    setLoading(true);
    try {
      const response = await userManagementService.getUserById(params.id);
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setEmail(userData.email);
        setRoles(userData.roles);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load user.',
          variant: 'destructive',
        });
      }    
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || error.response?.data?.message || 'Failed to load user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.currentTarget;
    if (checked) {
      setRoles([...roles, value as Roles]);
    } else {
      setRoles(roles.filter((role) => role !== value));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!params.id) return;
    
    setSubmitting(true);
    try {
      await userManagementService.updateUser(params.id, {
        firstName,
        lastName,
        email,
        roles,
      });
      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });
      navigate('/admin/users');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update user.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Edit User</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Roles</Label>
            <div className="flex flex-col space-y-2">
              <div>
                <Input
                  type="checkbox"
                  id="admin"
                  value="ADMIN"
                  checked={roles.includes('ADMIN')}
                  onChange={handleRoleChange}
                />
                <Label htmlFor="admin" className="ml-2">
                  Admin
                </Label>
              </div>
              <div>
                <Input
                  type="checkbox"
                  id="instructor"
                  value="INSTRUCTOR"
                  checked={roles.includes('INSTRUCTOR')}
                  onChange={handleRoleChange}
                />
                <Label htmlFor="instructor" className="ml-2">
                  Instructor
                </Label>
              </div>
              <div>
                <Input
                  type="checkbox"
                  id="student"
                  value="STUDENT"
                  checked={roles.includes('STUDENT')}
                  onChange={handleRoleChange}
                />
                <Label htmlFor="student" className="ml-2">
                  Student
                </Label>
              </div>
            </div>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update User'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;
