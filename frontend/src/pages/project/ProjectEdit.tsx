import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import projectService from '@/services/projectService';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: number;
  name: string;
  description: string;
  maxMembers: number;
  evaluationCriteria: string;
  weightW1: number;
  weightW2: number;
  weightW3: number;
  weightW4: number;
  freeriderThreshold: number;
  pressureThreshold: number;
  createdAt?: string;
  updatedAt?: string;
  creatorId?: number;
  creatorName?: string;
}

interface ProjectUpdateRequest {
  id: number;
  name: string;
  description: string;
  maxMembers: number;
  evaluationCriteria: string;
  weightW1: number;
  weightW2: number;
  weightW3: number;
  weightW4: number;
  freeriderThreshold: number;
  pressureThreshold: number;
}

const ProjectEdit = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 4,
    evaluationCriteria: '',
    weightW1: 0.25,
    weightW2: 0.25,
    weightW3: 0.25,
    weightW4: 0.25,
    freeriderThreshold: 0.5,
    pressureThreshold: 70,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      setIsLoading(true);
      try {
        const response = await projectService.getProjectById(Number(projectId));
        if (response.success) {
          console.log("Project data:", response.data);
          setProject(response.data);
          setFormData({
            name: response.data.name,
            description: response.data.description,
            maxMembers: response.data.maxMembers,
            evaluationCriteria: response.data.evaluationCriteria,
            weightW1: response.data.weightW1,
            weightW2: response.data.weightW2,
            weightW3: response.data.weightW3,
            weightW4: response.data.weightW4,
            freeriderThreshold: response.data.freeriderThreshold,
            pressureThreshold: response.data.pressureThreshold,
          });
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load project",
            variant: "destructive",
          });
        }      
      } catch (error: any) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: error.message || error.response?.data?.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? Number(value) : value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting form data:", formData);
      // Prepare the project update data
      const projectData: ProjectUpdateRequest = {
        id: Number(projectId),
        name: formData.name,
        description: formData.description,
        maxMembers: formData.maxMembers,
        evaluationCriteria: formData.evaluationCriteria,
        weightW1: formData.weightW1,
        weightW2: formData.weightW2,
        weightW3: formData.weightW3,
        weightW4: formData.weightW4,
        freeriderThreshold: formData.freeriderThreshold,
        pressureThreshold: formData.pressureThreshold,
      };

      const response = await projectService.updateProject(Number(projectId), projectData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
        navigate(`/projects/${projectId}/details`);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update project",
          variant: "destructive",
        });
      }    
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: error.message || error.response?.data?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-80" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-60" /></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name"><Skeleton className="h-4 w-32" /></Label>
                    <Skeleton className="h-8 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description"><Skeleton className="h-4 w-32" /></Label>
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxMembers"><Skeleton className="h-4 w-32" /></Label>
                    <Skeleton className="h-8 w-full" />
                  </div>
                  <Button disabled><Skeleton className="h-8 w-32" /></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent>
                <p>Project not found.</p>
              </CardContent>
            </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Edit Project</CardTitle>
              <CardDescription>Update project details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Max Members</Label>
                  <Input
                    type="number"
                    id="maxMembers"
                    name="maxMembers"
                    value={formData.maxMembers}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evaluationCriteria">Evaluation Criteria</Label>
                  <Textarea
                    id="evaluationCriteria"
                    name="evaluationCriteria"
                    value={formData.evaluationCriteria}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                {/* Additional fields for weight factors and detection thresholds */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weightW1">Weight Factor W1</Label>
                    <Input type="number" id="weightW1" name="weightW1" value={formData.weightW1} onChange={handleChange} step="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightW2">Weight Factor W2</Label>
                    <Input type="number" id="weightW2" name="weightW2" value={formData.weightW2} onChange={handleChange} step="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightW3">Weight Factor W3</Label>
                    <Input type="number" id="weightW3" name="weightW3" value={formData.weightW3} onChange={handleChange} step="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightW4">Weight Factor W4</Label>
                    <Input type="number" id="weightW4" name="weightW4" value={formData.weightW4} onChange={handleChange} step="0.01" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freeriderThreshold">Free Rider Detection Threshold</Label>
                  <Input type="number" id="freeriderThreshold" name="freeriderThreshold" value={formData.freeriderThreshold} onChange={handleChange} step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pressureThreshold">Pressure Score Threshold</Label>
                  <Input type="number" id="pressureThreshold" name="pressureThreshold" value={formData.pressureThreshold} onChange={handleChange} required />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Project"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectEdit;
