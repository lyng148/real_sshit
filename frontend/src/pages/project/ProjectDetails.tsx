import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {AlertTriangle , AlertCircle, CheckCircle, Clock, Edit, Trash2, Users, ChartBar, BarChart, QrCode, Settings, Shield, UserCog, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import projectService from '@/services/projectService';
import groupService from '@/services/groupService';
import { Badge } from '@/components/ui/badge';
import ProjectAccessCode from '@/components/project/ProjectAccessCode';
import ManageProjectStudents from '@/components/project/ManageProjectStudents';
import JoinProject from '@/components/project/JoinProject';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
    } catch (error: any) {
      console.error("Error fetching led groups:", error);
      toast({
        title: "Error",
        description: error.message || error.response?.data?.message || "Failed to check project leadership status.",
        variant: "destructive",
      });
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
    } catch (error: any) {
      console.error("Error fetching project details:", error);
      toast({
        title: "Error",
        description: error.message || error.response?.data?.message || "An unexpected error occurred while loading project details",
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
      }    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: error.message || error.response?.data?.message || "An unexpected error occurred while deleting the project",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      
      <main className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LoadingSpinner size="lg" variant="spinner" />
              <p className="text-gray-500 mt-4">Loading project information...</p>
            </div>
          </div>
        ) : project ? (
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Section with Edit/Delete buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {project.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3">
                    {project.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Created by <strong>{project.creatorName}</strong> on {formatDate(project.createdAt)}</span>
                  </div>
                </div>
                
                {/* Edit/Delete buttons in top right */}
                {canEdit && (
                  <div className="flex gap-2 ml-6">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/projects/${projectId}/edit`)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Project</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this project? This action cannot be undone and will permanently delete:
                            <ul className="list-disc pl-5 mt-2">
                              <li>All groups in this project</li>
                              <li>All tasks assigned to groups</li>
                              <li>All comments on tasks</li>
                              <li>All commit data for these groups</li>
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
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Maximum Member</p>
                      <p className="text-2xl font-bold text-gray-900">{project.maxMembers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Free-rider Threshold</p>
                      <p className="text-2xl font-bold text-gray-900">{(project.freeriderThreshold * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
                
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pressure Threshold</p>
                      <p className="text-2xl font-bold text-gray-900">{project.pressureThreshold}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Project Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Project Details
                  </CardTitle>
                  <CardDescription>
                    Basic information and evaluation criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Description:</h4>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Evaluation Criteria:</h4>
                    <p className="text-blue-700 leading-relaxed whitespace-pre-wrap">
                      {project.evaluationCriteria || "No evaluation criteria provided."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Weight Factors Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Weight Factors
                  </CardTitle>
                  <CardDescription>
                    Calculation method for member contribution points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="font-medium text-green-800">W1: Task Completion</span>
                      <Badge variant="secondary" className="bg-green-200 text-green-800">
                        {(project.weightW1 * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-medium text-blue-800">W2: Peer Review Score</span>
                      <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                        {(project.weightW2 * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="font-medium text-purple-800">W3: Commit Count</span>
                      <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                        {(project.weightW3 * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="font-medium text-red-800">W4: Late Task Penalty</span>
                      <Badge variant="secondary" className="bg-red-200 text-red-800">
                        {(project.weightW4 * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                      <strong>Formula:</strong> Score = W1×Task + W2×Peer Review + W3×Commit - W4×Late Task
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
              
            {/* Management Actions */}
            {(isInstructor || isAdmin || isGroupLeader) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    Management Actions
                  </CardTitle>
                  <CardDescription>
                    Management tools and project analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {(isInstructor || isAdmin) && (
                      <>
                        <Button
                          variant="outline"
                          className="h-20 flex flex-col gap-2 border-blue-200 hover:bg-blue-50"
                          onClick={() => navigate(`/projects/${projectId}/project-analyze`)}
                        >
                          <BarChart className="h-6 w-6 text-blue-600" />
                          <span className="font-medium">Project Analysis</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="h-20 flex flex-col gap-2 border-orange-200 hover:bg-orange-50"
                          onClick={() => navigate(`/projects/${projectId}/free-rider-detection`)}
                        >
                          <AlertTriangle className="h-6 w-6 text-orange-600" />
                          <span className="font-medium">Free-rider Detection</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="h-20 flex flex-col gap-2 border-green-200 hover:bg-green-50"
                          onClick={() => navigate(`/projects/${projectId}/final-assessment`)}
                        >
                          <Award className="h-6 w-6 text-green-600" />
                          <span className="font-medium">Final Assessment</span>
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col gap-2 border-purple-200 hover:bg-purple-50"
                      onClick={() => navigate(`/projects/${projectId}/groups`)}
                    >
                      <Users className="h-6 w-6 text-purple-600" />
                      <span className="font-medium">Group Management</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Access Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Access Management
                </CardTitle>
                <CardDescription>
                  Set access permissions and manage members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex flex-col gap-4">
                {/* Project Access Code */}
                {(isInstructor || isAdmin) && (
                  <ProjectAccessCode projectId={parseInt(projectId!)} projectName={project.name} />
                )}
                
                {/* Manage Students */}
                {(isInstructor || isAdmin) && (
                  <ManageProjectStudents projectId={parseInt(projectId!)} projectName={project.name} />
                )}

                {/* Join Project */}
                {isStudent && (
                  <JoinProject />
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Project Not Found</h2>
              <p className="text-gray-600">The project you are looking for does not exist or has been deleted.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetails;

