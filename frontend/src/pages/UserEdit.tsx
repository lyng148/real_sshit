import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import userService from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }).max(50),
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }).max(100),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().optional(),
  roles: z.array(z.string()).min(1, {
    message: "Please select at least one role.",
  }),
  enabled: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Redirect if not admin
  if (!currentUser?.user.roles.includes('ADMIN')) {
    return <Navigate to="/" />;
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      roles: [],
      enabled: true,
    },
  });

  useEffect(() => {
    if (!id) return;
    
    const fetchUser = async () => {
      try {
        setInitialLoading(true);
        const response = await userService.getUserById(parseInt(id));
        const userData = response.data;
        
        form.reset({
          username: userData.username,
          fullName: userData.fullName,
          email: userData.email,
          password: "",  // Don't show existing password
          roles: userData.roles,
          enabled: userData.enabled,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching user",
          description: "Could not load user information. Please try again.",
        });
        navigate('/admin/users');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchUser();
  }, [id, form, navigate]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      // If password is empty, remove it from the request
      const userData = { ...values };
      if (!userData.password) {
        delete userData.password;
      }
      
      await userService.updateUser(parseInt(id!), userData);
      
      toast({
        title: "User updated successfully",
        description: `User ${values.username} has been updated.`,
      });
      
      navigate('/admin/users');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating user",
        description: error.response?.data?.message || "An error occurred while updating the user",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading user information...</p>
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
          <h1 className="text-3xl font-bold text-gray-800">Edit User</h1>
          <p className="text-gray-600 mt-1">Update user information</p>
        </div>
        
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Edit User</CardTitle>
            <CardDescription>
              Update the user's information. Leave the password field blank to keep the current password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Leave blank to keep current password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Roles</FormLabel>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="roles"
                      render={() => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={form.watch("roles").includes("STUDENT")}
                              onCheckedChange={(checked) => {
                                const currentRoles = form.watch("roles");
                                if (checked) {
                                  form.setValue("roles", [...currentRoles, "STUDENT"]);
                                } else {
                                  form.setValue(
                                    "roles",
                                    currentRoles.filter(role => role !== "STUDENT")
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Student</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="roles"
                      render={() => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={form.watch("roles").includes("INSTRUCTOR")}
                              onCheckedChange={(checked) => {
                                const currentRoles = form.watch("roles");
                                if (checked) {
                                  form.setValue("roles", [...currentRoles, "INSTRUCTOR"]);
                                } else {
                                  form.setValue(
                                    "roles",
                                    currentRoles.filter(role => role !== "INSTRUCTOR")
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Instructor</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="roles"
                      render={() => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={form.watch("roles").includes("ADMIN")}
                              onCheckedChange={(checked) => {
                                const currentRoles = form.watch("roles");
                                if (checked) {
                                  form.setValue("roles", [...currentRoles, "ADMIN"]);
                                } else {
                                  form.setValue(
                                    "roles",
                                    currentRoles.filter(role => role !== "ADMIN")
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Admin</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormMessage name="roles" />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Account enabled
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/admin/users')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update User"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserEdit;