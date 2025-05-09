import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import projectService from '@/services/projectService';

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    evaluationCriteria: '',
    maxMembers: 4,
    weightFactorW1: 25,
    weightFactorW2: 25,
    weightFactorW3: 25,
    weightFactorW4: 25,
    freeRiderDetectionThreshold: 30,
    pressureScoreThreshold: 70
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Ensure maxMembers is always provided
      const projectData = {
        name: formData.name,
        description: formData.description,
        evaluationCriteria: formData.evaluationCriteria,
        maxMembers: formData.maxMembers || 4, // Provide default value
        weightFactorW1: formData.weightFactorW1,
        weightFactorW2: formData.weightFactorW2,
        weightFactorW3: formData.weightFactorW3,
        weightFactorW4: formData.weightFactorW4,
        freeRiderDetectionThreshold: formData.freeRiderDetectionThreshold,
        pressureScoreThreshold: formData.pressureScoreThreshold
      };
      
      const response = await projectService.createProject(projectData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Project created successfully",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create project",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
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
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="evaluationCriteria">Evaluation Criteria</Label>
              <Textarea 
                id="evaluationCriteria" 
                name="evaluationCriteria" 
                value={formData.evaluationCriteria} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <Input 
                type="number" 
                id="maxMembers" 
                name="maxMembers" 
                value={formData.maxMembers} 
                onChange={handleChange} 
                required
                min="1"
                max="10"
              />
            </div>

            <div>
              <Label htmlFor="weightFactorW1">Weight Factor W1</Label>
              <Input
                type="number"
                id="weightFactorW1"
                name="weightFactorW1"
                value={formData.weightFactorW1}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="weightFactorW2">Weight Factor W2</Label>
              <Input
                type="number"
                id="weightFactorW2"
                name="weightFactorW2"
                value={formData.weightFactorW2}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="weightFactorW3">Weight Factor W3</Label>
              <Input
                type="number"
                id="weightFactorW3"
                name="weightFactorW3"
                value={formData.weightFactorW3}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="weightFactorW4">Weight Factor W4</Label>
              <Input
                type="number"
                id="weightFactorW4"
                name="weightFactorW4"
                value={formData.weightFactorW4}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="freeRiderDetectionThreshold">Free Rider Detection Threshold</Label>
              <Input
                type="number"
                id="freeRiderDetectionThreshold"
                name="freeRiderDetectionThreshold"
                value={formData.freeRiderDetectionThreshold}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="pressureScoreThreshold">Pressure Score Threshold</Label>
              <Input
                type="number"
                id="pressureScoreThreshold"
                name="pressureScoreThreshold"
                value={formData.pressureScoreThreshold}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProjectCreate;
