import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, Edit, Trash2, Users, ChartBar, BarChart, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import projectService from '@/services/projectService';
import groupService from '@/services/groupService';
import { Badge } from '@/components/ui/badge';
import ProjectAccessCode from '@/components/project/ProjectAccessCode';
import ManageProjectStudents from '@/components/project/ManageProjectStudents';
import JoinProject from '@/components/project/JoinProject';

// Define the Project interface
interface Project {
  id: number;
  name: string;
  description: string;
  evaluationCriteria: string;
  maxMembers: number;
  weightW1: number;
  weightW2: number;
  weightW3: number;
  weightW4: number;
  freeriderThreshold: number;
  pressureThreshold: number;
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
  const [isGroupLeader, setIsGroupLeader] = useState<boolean>(false);

  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');
  const isStudent = currentUser?.user.roles?.includes('STUDENT');
  const canEdit = isAdmin || isInstructor;

  const fetchIsGroupLeader = async () => {
    try {
      const response = await groupService.getMyLedGroups();
      if (response.success) {
        const ledGroups = response.data || [];
        const isLeader = ledGroups.some(group => group.projectId === Number(projectId));
        return isLeader;
      }
    } catch (error) {
      console.error("Error fetching led groups:", error);
    }
    return false;
  };

  useEffect(() => {
    const checkGroupLeaderStatus = async () => {
      const isLeader = await fetchIsGroupLeader();
      setIsGroupLeader(isLeader);
    };

    checkGroupLeaderStatus();
  }, [projectId]);

  const fetchProject = async () => {
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

  // Fetch project details
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, toast]);
  
  const handleDeleteProject = async () => {
    try {
      const response = await projectService.deleteProject(Number(projectId));
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Project and all related data (groups, tasks, comments) deleted successfully",
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
      <div className="flex-1 overflow-auto p-6 relative">
        {/* Overlay Spinner */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          {!loading && project ? (
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
                      <DialogContent>                        <DialogHeader>
                          <DialogTitle>Delete Project</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this project? This action cannot be undone and will permanently delete:
                            <ul className="list-disc pl-5 mt-2">
                              <li>All groups in this project</li>
                              <li>All tasks assigned to these groups</li>
                              <li>All comments on tasks</li>
                              <li>All commit records for these groups</li>
                              <li>All peer review data for this project</li>
                            </ul>
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
                    <div className="text-2xl font-bold">{project.freeriderThreshold}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pressure Score Threshold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{project.pressureThreshold}</div>
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
                  <CardDescription>Weights used for calculating contribution scores: W1*Task Completion + W2*Peer Review + W3*Commit Count + W4*Task Late Count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-sm font-medium text-gray-500">Task Completion (W1)</div>
                      <div className="text-xl font-bold mt-1">{project.weightW1}</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-sm font-medium text-gray-500">Peer Review (W2)</div>
                      <div className="text-xl font-bold mt-1">{project.weightW2}</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-sm font-medium text-gray-500">Commit Count (W3)</div>
                      <div className="text-xl font-bold mt-1">{project.weightW3}</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-sm font-medium text-gray-500">Task Late Count (W4)</div>
                      <div className="text-xl font-bold mt-1">{project.weightW4}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Only show Actions section for staff or group leaders */}
              {(isInstructor || isAdmin || isGroupLeader) && (
                <div className="mt-8 space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">Actions</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* For instructors and admins: show analyze options */}
                    {(isInstructor || isAdmin) && (
                      <>
                        <Button 
                          variant="default" 
                          className="w-full" 
                          onClick={() => navigate(`/projects/${projectId}/project-analyze`)}
                        >
                          <BarChart className="h-5 w-5 mr-2" /> Project Analysis
                        </Button>
                        <Button 
                          variant="default" 
                          className="w-full" 
                          onClick={() => navigate(`/projects/${projectId}/groups`)}
                        >
                          <ChartBar className="h-5 w-5 mr-2" /> Group Management
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Access Management Section */}
              <div className="mt-8 space-y-4">
                {(isAdmin || isInstructor) && (
                    <h2 className="text-xl font-bold text-gray-800">Access Management</h2>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Show access management for instructors/admins */}
                  {(isInstructor || isAdmin) && (
                    <>
                      <ProjectAccessCode 
                        projectId={Number(projectId)} 
                        projectName={project?.name || ""} 
                      />
                      
                      <ManageProjectStudents 
                        projectId={Number(projectId)} 
                        projectName={project?.name || ""} 
                      />
                    </>
                  )}
                </div>
              </div>

              {/* For regular students: show join/create group options */}
              {isStudent && (
                <div className="mt-8 space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">Group Options</h2>
                  
                  <div className="grid grid-cols-1  gap-4">
                    <Button 
                      variant="default" 
                      className="w-full" 
                      onClick={() => navigate(`/projects/${projectId}/groups`)}
                    >
                      <Users className="h-5 w-5 mr-2" /> View Groups
                    </Button>
  
                  </div>
                </div>
              )}
            </>
          ) : !loading && !project ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800">Project Not Found</h2>
              <p className="text-gray-600 mt-2">The project you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button variant="outline" className="mt-6" onClick={() => navigate('/')}>
                Return to Dashboard
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
