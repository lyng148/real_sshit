import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, Edit, Trash2, Users, ChartBar, BarChart } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import projectService from '@/services/projectService';
import { Badge } from '@/components/ui/badge';

// Define the Project interface
interface Project {
  id: number;
  name: string;
  description: string;
  evaluationCriteria: string;
  maxMembers: number;
  weightFactorW1: number;
  weightFactorW2: number;
  weightFactorW3: number;
  weightFactorW4: number;
  freeRiderDetectionThreshold: number;
  pressureScoreThreshold: number;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  creatorName: string;
}

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');
  const isStudent = currentUser?.user.roles?.includes('STUDENT');
  const canEdit = isAdmin || isInstructor;
  const isLeader = false; // This would need to be determined by checking if user is a group leader
  
  // For the purpose of this implementation, let's assume we have this check
  // In a real app, we would fetch this info from an API
  const isProjectLeader = true; // Placeholder - should be determined from the backend

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjectById(Number(projectId));
        
        if (response.success) {
          setProject(response.data);
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
  }, [projectId, toast]);

  const handleDeleteProject = async () => {
    try {
      const response = await projectService.deleteProject(Number(projectId));
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
        navigate('/');
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete project",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the project",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          ) : project ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
                  <p className="text-gray-600 mt-1">Created by {project.creatorName} on {formatDate(project.createdAt)}</p>
                </div>
                
                {canEdit && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/projects/${projectId}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Project</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this project? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                          <Button variant="destructive" onClick={handleDeleteProject}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Max Members per Group</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{project.maxMembers}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Free Rider Detection Threshold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{project.freeRiderDetectionThreshold}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pressure Score Threshold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{project.pressureScoreThreshold}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {project.description || "No description provided."}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Evaluation Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {project.evaluationCriteria || "No evaluation criteria specified."}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Weight Factors</CardTitle>
                  <CardDescription>Weights used for calculating contribution scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-sm font-medium text-gray-500">Task Completion (W1)</div>
                      <div className="text-xl font-bold mt-1">{project.weightFactorW1}%</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-sm font-medium text-gray-500">Peer Review (W2)</div>
                      <div className="text-xl font-bold mt-1">{project.weightFactorW2}%</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-sm font-medium text-gray-500">Commit Count (W3)</div>
                      <div className="text-xl font-bold mt-1">{project.weightFactorW3}%</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-sm font-medium text-gray-500">Task Difficulty (W4)</div>
                      <div className="text-xl font-bold mt-1">{project.weightFactorW4}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Actions</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Show different options based on user role */}
                  {(isInstructor || isProjectLeader) ? (
                    // For instructors and leaders: show analyze options
                    <>
                      <Button 
                        variant="default" 
                        className="w-full" 
                        onClick={() => navigate(`/projects/${projectId}/analyze`)}
                      >
                        <BarChart className="h-5 w-5 mr-2" /> Project Analysis
                      </Button>
                      <Button 
                        variant="default" 
                        className="w-full" 
                        onClick={() => navigate(`/projects/${projectId}/groups/analyze`)}
                      >
                        <ChartBar className="h-5 w-5 mr-2" /> Group Analysis
                      </Button>
                    </>
                  ) : (
                    // For regular students: show join/create group options
                    <>
                      <Button 
                        variant="default" 
                        className="w-full" 
                        onClick={() => navigate(`/projects/${projectId}/groups/join`)}
                      >
                        <Users className="h-5 w-5 mr-2" /> Join Group
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => navigate(`/projects/${projectId}/groups/create`)}
                      >
                        <Users className="h-5 w-5 mr-2" /> Create Group
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800">Project Not Found</h2>
              <p className="text-gray-600 mt-2">The project you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button variant="outline" className="mt-6" onClick={() => navigate('/')}>
                Return to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;