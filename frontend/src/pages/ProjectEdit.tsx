
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import projectService from '@/services/projectService';

// Define interface for Project and ProjectUpdateRequest if not exported by projectService
interface Project {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface ProjectUpdateRequest {
  name: string;
  description: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectUpdateRequest>({
    name: '',
    description: '',
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjectById(Number(id));
        if (response.success && response.data) {
          setProject(response.data);
          setFormData({
            name: response.data.name || '',
            description: response.data.description || '',
            isActive: response.data.isActive !== undefined ? response.data.isActive : true,
            startDate: response.data.startDate || '',
            endDate: response.data.endDate || ''
          });
        } else {
          setError(response.message || 'Failed to fetch project');
        }
      } catch (error) {
        setError('An error occurred while fetching project data');
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isActive: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Fix: Add the project ID as the first argument
      const response = await projectService.updateProject(Number(id), formData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
        navigate(`/projects/${id}`);
      } else {
        setError(response.message || 'Failed to update project');
        toast({
          title: "Error",
          description: response.message || 'Failed to update project',
          variant: "destructive",
        });
      }
    } catch (error) {
      setError('An error occurred while updating project');
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: 'An error occurred while updating project',
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!project) {
    return <div className="text-center p-8">Project not found</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Edit Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive"
                checked={formData.isActive} 
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isActive">Active Project</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/projects/${id}`)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectEdit;
