import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import projectService, { Project, ProjectUpdateRequest } from '@/services/projectService';

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
    weightFactorW1: 0.25,
    weightFactorW2: 0.25,
    weightFactorW3: 0.25,
    weightFactorW4: 0.25,
    freeRiderDetectionThreshold: 0.5,
    pressureScoreThreshold: 70,
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
          setProject(response.data);
          setFormData({
            name: response.data.name,
            description: response.data.description,
            maxMembers: response.data.maxMembers,
            evaluationCriteria: response.data.evaluationCriteria,
            weightFactorW1: response.data.weightFactorW1,
            weightFactorW2: response.data.weightFactorW2,
            weightFactorW3: response.data.weightFactorW3,
            weightFactorW4: response.data.weightFactorW4,
            freeRiderDetectionThreshold: response.data.freeRiderDetectionThreshold,
            pressureScoreThreshold: response.data.pressureScoreThreshold,
          });
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load project",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'maxMembers' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure all required fields are provided
      const projectData: ProjectUpdateRequest = {
        id: Number(projectId),
        name: formData.name || project!.name, // Ensure name is always provided
        description: formData.description || project!.description, // Ensure description is always provided
        maxMembers: formData.maxMembers || project!.maxMembers, // Ensure maxMembers is always provided
        evaluationCriteria: formData.evaluationCriteria || project!.evaluationCriteria, // Ensure evaluationCriteria is always provided
        weightFactorW1: formData.weightFactorW1,
        weightFactorW2: formData.weightFactorW2,
        weightFactorW3: formData.weightFactorW3,
        weightFactorW4: formData.weightFactorW4,
        freeRiderDetectionThreshold: formData.freeRiderDetectionThreshold,
        pressureScoreThreshold: formData.pressureScoreThreshold,
      };

      const response = await projectService.updateProject(projectData);
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
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
