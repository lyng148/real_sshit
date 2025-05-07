import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Skeleton } from '@/components/ui/skeleton';
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
    .max(100, { message: 'Weight factor must not exceed 100.' }),
  weightFactorW2: z.coerce
    .number()
    .min(0, { message: 'Weight factor must be non-negative.' })
    .max(100, { message: 'Weight factor must not exceed 100.' }),
  weightFactorW3: z.coerce
    .number()
    .min(0, { message: 'Weight factor must be non-negative.' })
    .max(100, { message: 'Weight factor must not exceed 100.' }),
  weightFactorW4: z.coerce
    .number()
    .min(0, { message: 'Weight factor must be non-negative.' })
    .max(100, { message: 'Weight factor must not exceed 100.' }),
  freeRiderDetectionThreshold: z.coerce
    .number()
    .min(0, { message: 'Threshold must be non-negative.' })
    .max(100, { message: 'Threshold must not exceed 100.' }),
  pressureScoreThreshold: z.coerce
    .number()
    .min(0, { message: 'Threshold must be non-negative.' })
    .max(100, { message: 'Threshold must not exceed 100.' }),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const ProjectEdit: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  
  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');
  const canEdit = isAdmin || isInstructor;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      evaluationCriteria: '',
      maxMembers: 5,
      weightFactorW1: 0.1,
      weightFactorW2: 0.1,
      weightFactorW3: 0.1,
      weightFactorW4: 0.1,
      freeRiderDetectionThreshold: 0.3,
      pressureScoreThreshold: 15,
    },
  });

  // Fetch project details and populate the form
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjectById(Number(projectId));
        
        if (response.success) {
          const project = response.data;
          
          // Reset form with project data
          form.reset({
            name: project.name,
            description: project.description,
            evaluationCriteria: project.evaluationCriteria || '',
            maxMembers: project.maxMembers,
            weightFactorW1: project.weightFactorW1,
            weightFactorW2: project.weightFactorW2,
            weightFactorW3: project.weightFactorW3,
            weightFactorW4: project.weightFactorW4,
            freeRiderDetectionThreshold: project.freeRiderDetectionThreshold,
            pressureScoreThreshold: project.pressureScoreThreshold,
          });
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load project details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading project details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, form, toast]);

  const onSubmit = async (data: ProjectFormValues) => {
    if (!canEdit) {
      toast({
        title: "Error",
        description: "You don't have permission to edit projects",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await projectService.updateProject(Number(projectId), {
        ...data,
        id: Number(projectId),
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Project has been updated successfully!",
        });
        navigate(`/projects/${projectId}/details`);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update project",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!canEdit) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
              <p className="text-gray-600 mt-2">
                You must be an instructor or admin to edit projects.
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
            <h1 className="text-2xl font-bold text-gray-800">Edit Project</h1>
            <p className="text-gray-600">Update project details and configurations</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
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
                              <FormLabel>Weight Factor W4 (Instructor)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Weight for instructor assessment (default: 25).
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
                      onClick={() => navigate(`/projects/${projectId}/details`)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEdit;