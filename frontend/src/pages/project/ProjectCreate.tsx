import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import projectService from '@/services/projectService';
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper component for field labels with tooltips
const LabelWithTooltip = ({ htmlFor, label, tooltipText }) => (
  <div className="flex items-center gap-1">
    <Label htmlFor={htmlFor}>{label}</Label>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    evaluationCriteria: '',
    maxMembers: 4,
    weightW1: 25,
    weightW2: 25,
    weightW3: 25,
    weightW4: 25,
    freeriderThreshold: 30,
    pressureThreshold: 70
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
      // Ensure maxMembers is always provided and convert freeriderThreshold from percentage to decimal
      const projectData = {
        name: formData.name,
        description: formData.description,
        evaluationCriteria: formData.evaluationCriteria,
        maxMembers: formData.maxMembers || 4, // Provide default value
        weightW1: formData.weightW1,
        weightW2: formData.weightW2,
        weightW3: formData.weightW3,
        weightW4: formData.weightW4,
        freeriderThreshold: formData.freeriderThreshold / 100, // Convert from percentage (0-100) to decimal (0-1)
        pressureThreshold: formData.pressureThreshold
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
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error.message || error.response?.data?.message || "An unexpected error occurred",
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
            <div className="mt-8 mb-2" style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>
              <LabelWithTooltip 
                htmlFor="weightFactors"
                label="Weight Factor Setting"
                tooltipText="Contribution score = W1*Task Completion + W2*Peer Review Score + W3*Commit Count - W4*Late Task Count"
              />
            </div>
            
            <div>
              <Label htmlFor="weightW1">Weight Factor W1 (Task Completion)</Label>
              <Input
                type="number"
                id="weightW1"
                name="weightW1"
                value={formData.weightW1}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="weightW2">Weight Factor W2 (Peer Review)</Label>
              <Input
                type="number"
                id="weightW2"
                name="weightW2"
                value={formData.weightW2}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="weightW3">Weight Factor W3 (Commit Count)</Label>
              <Input
                type="number"
                id="weightW3"
                name="weightW3"
                value={formData.weightW3}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>            
            <div>
              <Label htmlFor="weightW4">Weight Factor W4 (Late Task Penalty)</Label>
              <Input
                type="number"
                id="weightW4"
                name="weightW4"
                value={formData.weightW4}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>            
            <div>
              <LabelWithTooltip
                htmlFor="freeriderThreshold" 
                label="Free Rider Detection Threshold (%)"
                tooltipText="A contribution score below this percentage of the average contribution score of the team will flag a member as a potential free-rider. Value should be between 0-100%."
              />
              <Input
                type="number"
                id="freeriderThreshold"
                name="freeriderThreshold"
                value={formData.freeriderThreshold}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>

            <div>
              <LabelWithTooltip
                htmlFor="pressureThreshold"
                label="Pressure Score Threshold"
                tooltipText="When a member's pressure score exceeds this threshold, they will receive warnings about potential overload. The system monitors task assignments and deadlines to calculate pressure scores."
              />
              <Input
                type="number"
                id="pressureThreshold"
                name="pressureThreshold"
                value={formData.pressureThreshold}
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
