import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import projectService from '@/services/projectService';

const projectFormSchema = z.object({
  name: z.string()
    .min(3, { message: 'Name must be at least 3 characters.' })
    .max(100, { message: 'Name must not exceed 100 characters.' }),
  description: z.string()
    .min(10, { message: 'Description must be at least 10 characters.' })
    .max(500, { message: 'Description must not exceed 500 characters.' }),
  evaluationCriteria: z.string()
    .min(10, { message: 'Evaluation criteria must be at least 10 characters.' })
    .max(1000, { message: 'Evaluation criteria must not exceed 1000 characters.' }),
  maxMembers: z.coerce
    .number()
    .min(1, { message: 'Maximum members must be at least 1.' })
    .max(100, { message: 'Maximum members must not exceed 100.' }),
  weightFactorW1: z.coerce
    .number()
    .min(0, { message: 'Weight factor must be non-negative.' })
    .max(100, { message: 'Weight factor must not exceed 100.' })
    .default(25),
  weightFactorW2: z.coerce
    .number()
    .min(0, { message: 'Weight factor must be non-negative.' })
    .max(100, { message: 'Weight factor must not exceed 100.' })
    .default(25),
  weightFactorW3: z.coerce
    .number()
    .min(0, { message: 'Weight factor must be non-negative.' })
    .max(100, { message: 'Weight factor must not exceed 100.' })
    .default(25),
  weightFactorW4: z.coerce
    .number()
    .min(0, { message: 'Weight factor must be non-negative.' })
    .max(100, { message: 'Weight factor must not exceed 100.' })
    .default(25),
  freeRiderDetectionThreshold: z.coerce
    .number()
    .min(0, { message: 'Threshold must be non-negative.' })
    .max(100, { message: 'Threshold must not exceed 100.' })
    .default(30),
  pressureScoreThreshold: z.coerce
    .number()
    .min(0, { message: 'Threshold must be non-negative.' })
    .max(100, { message: 'Threshold must not exceed 100.' })
    .default(70),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const ProjectCreate: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is an instructor
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');

  // Default values for the form
  const defaultValues: Partial<ProjectFormValues> = {
    evaluationCriteria: '',
    weightFactorW1: 0.1,
    weightFactorW2: 0.1,
    weightFactorW3: 0.1,
    weightFactorW4: 0.1,
    freeRiderDetectionThreshold: 0.3,
    pressureScoreThreshold: 15,
  };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      // Normalize the strings to ensure consistent encoding
      const normalizedData = {
        ...data,
        name: data.name.trim(),
        description: data.description.trim(),
        evaluationCriteria: data.evaluationCriteria.trim(),
      };
      
      const response = await projectService.createProject(normalizedData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Project has been created successfully!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create project",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!isInstructor) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
              <p className="text-gray-600 mt-2">
                You must be an instructor to create projects.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="mt-4"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Create New Project</h1>
            <p className="text-gray-600">Set up a new project with all necessary configurations</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter project name" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of your project.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter project description" 
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            A detailed description of your project.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="evaluationCriteria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evaluation Criteria</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter evaluation criteria" 
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Define how the project will be evaluated. Include metrics, expectations, and assessment criteria.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxMembers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Members</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Enter maximum member count" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The maximum number of members per group.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Assessment Configuration Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Assessment Configuration</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="weightFactorW1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight Factor W1 (Tasks)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Weight for task completion (default: 25).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weightFactorW2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight Factor W2 (Commits)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Weight for commit contributions (default: 25).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weightFactorW3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight Factor W3 (Peer Reviews)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Weight for peer review scores (default: 25).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weightFactorW4"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight Factor W4 (Late tasks counts)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Weight for late tasks counts punishment (default: 25).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Thresholds Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Thresholds & Limits</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="freeRiderDetectionThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Free-Rider Detection Threshold (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum contribution percentage before flagging as a free-rider (default: 30%).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pressureScoreThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pressure Score Threshold (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Threshold for displaying pressure warnings (default: 70%).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Project</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreate;