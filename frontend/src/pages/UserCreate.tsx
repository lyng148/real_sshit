import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CardFooter,
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
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  roles: z.array(z.string()).min(1, {
    message: "Please select at least one role.",
  }),
  enabled: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const UserCreate = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
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
      roles: ["STUDENT"], // Default role
      enabled: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const response = await userService.createUser(values);
      
      toast({
        title: "User created successfully",
        description: `User ${values.username} has been created.`,
      });
      
      navigate('/admin/users');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating user",
        description: error.response?.data?.message || "An error occurred while creating the user",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-800">Create New User</h1>
          <p className="text-gray-600 mt-1">Add a new user to the system</p>
        </div>
        
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Enter the details for the new user. All fields are required.
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
                        <Input type="password" placeholder="••••••••" {...field} />
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
                    <FormMessage />
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
                    {loading ? "Creating..." : "Create User"}
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

export default UserCreate;