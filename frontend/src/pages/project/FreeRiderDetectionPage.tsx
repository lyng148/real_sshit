import React, { useState, useEffect } from 'react';
import FreeRiderDetectionDashboard from '@/components/free-rider-detection/FreeRiderDetectionDashboard';
import FreeRiderEvidenceDisplay from '@/components/free-rider-detection/FreeRiderEvidenceDisplay';
import FreeRiderCaseManagement from '@/components/free-rider-detection/FreeRiderCaseManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import projectService from '@/services/projectService';
import { useAuth } from '@/contexts/AuthContext';

const FreeRiderDetectionPage = () => {
  const { projectId } = useParams();
  const parsedProjectId = projectId ? parseInt(projectId, 10) : null;
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(parsedProjectId);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');
  const isAdmin = currentUser?.user.roles?.includes('ADMIN');

  useEffect(() => {
    // If we're on a specific project page, set that as the selected project
    if (parsedProjectId) {
      setSelectedProjectId(parsedProjectId);
    }
    
    // Fetch projects for the dropdown
    const fetchProjects = async () => {
      try {
        setLoading(true);
        let response;
        if (isInstructor || isAdmin) {
          response = await projectService.getAllProjects();
        } else {
          response = await projectService.getMyProjects();
        }
        
        if (response.success) {
          setProjects(response.data || []);
          
          // If we're on the global page and have projects, select the first one
          if (!parsedProjectId && response.data && response.data.length > 0) {
            setSelectedProjectId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [parsedProjectId, isInstructor, isAdmin]);

  const handleProjectChange = (value) => {
    const newProjectId = parseInt(value, 10);
    setSelectedProjectId(newProjectId);
    
    // If we're on the project-specific page, navigate to the new project
    if (projectId) {
      navigate(`/projects/${newProjectId}/free-rider-detection`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Free-Rider Detection System</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Chose project</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedProjectId?.toString()} 
                onValueChange={handleProjectChange}
                disabled={loading}
              >
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue placeholder="Chọn dự án để phân tích..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          {selectedProjectId && (
            <>
              <p className="text-gray-600 mb-6">
                The "free-rider" detection system helps identify members who show signs of not fully contributing to the group work, based on multiple data sources such as task completion rates, number of commits, and evaluations from other members.
              </p>
              
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dashboard">Overview</TabsTrigger>
                  <TabsTrigger value="evidence">Evidences</TabsTrigger>
                  <TabsTrigger value="cases">Case Management</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard">
                  <FreeRiderDetectionDashboard projectId={selectedProjectId} />
                </TabsContent>
                
                <TabsContent value="evidence">
                  <FreeRiderEvidenceDisplay projectId={selectedProjectId} groupId={null} />
                </TabsContent>
                
                <TabsContent value="cases">
                  <FreeRiderCaseManagement projectId={selectedProjectId} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeRiderDetectionPage;
