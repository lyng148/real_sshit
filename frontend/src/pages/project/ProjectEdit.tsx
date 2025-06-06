import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { CalendarIcon, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    weightW1: 50,  // 50% (0.5 normalized)
    weightW2: 30,  // 30% (0.3 normalized)
    weightW3: 20,  // 20% (0.2 normalized)
    weightW4: 10,  // 10% penalty (0.1 normalized)
    freeriderThreshold: 50,
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
            weightW1: response.data.weightW1 * 100, // Convert from decimal (0-1) to percentage (0-100)
            weightW2: response.data.weightW2 * 100, // Convert from decimal (0-1) to percentage (0-100)
            weightW3: response.data.weightW3 * 100, // Convert from decimal (0-1) to percentage (0-100)
            weightW4: response.data.weightW4 * 100, // Convert from decimal (0-1) to percentage (0-100)
            freeriderThreshold: response.data.freeriderThreshold * 100, // Convert from decimal (0-1) to percentage (0-100)
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
  
  // Validation helper for weight sum
  const validateWeightSum = () => {
    const w1 = parseFloat(formData.weightW1) || 0;
    const w2 = parseFloat(formData.weightW2) || 0;
    const w3 = parseFloat(formData.weightW3) || 0;
    const sum = w1 + w2 + w3;
    return !isNaN(sum) && Math.abs(sum - 100) < 0.1; // Allow small floating point tolerance
  };
  
  const getWeightSumError = () => {
    const w1 = parseFloat(formData.weightW1) || 0;
    const w2 = parseFloat(formData.weightW2) || 0;
    const w3 = parseFloat(formData.weightW3) || 0;
    const sum = w1 + w2 + w3;
    
    if (isNaN(sum)) {
      return "Invalid weight values detected";
    }
    
    if (Math.abs(sum - 100) >= 0.1) {
      return `W1 + W2 + W3 must equal 100% (current: ${sum.toFixed(1)}%)`;
    }
    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate weight sum before submission
    if (!validateWeightSum()) {
      toast({
        title: "Validation Error",
        description: getWeightSumError(),
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log("Submitting form data:", formData);      // Prepare the project update data
      const projectData: ProjectUpdateRequest = {
        id: Number(projectId),
        name: formData.name,
        description: formData.description,
        maxMembers: formData.maxMembers,
        evaluationCriteria: formData.evaluationCriteria,
        weightW1: formData.weightW1 / 100, // Convert from percentage (0-100) to decimal (0-1)
        weightW2: formData.weightW2 / 100, // Convert from percentage (0-100) to decimal (0-1)
        weightW3: formData.weightW3 / 100, // Convert from percentage (0-100) to decimal (0-1)
        weightW4: formData.weightW4 / 100, // Convert from percentage (0-100) to decimal (0-1)
        freeriderThreshold: formData.freeriderThreshold / 100, // Convert from percentage (0-100) to decimal (0-1)
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
      <div>
        
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
      <div>
        
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
    <div>
      
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
                {/* Weight Factors Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                  <LabelWithTooltip 
                    htmlFor="weightFactors"
                    label="⚖️ Normalized Weight Configuration"
                    tooltipText="Each component is normalized to 0-10 scale, then weighted. Final Score = W1*TaskCompletion + W2*PeerReview + W3*CodeContribution - W4*LateTasks (0-10 scale)"
                  />
                  <p className="text-sm text-gray-600 mt-2 mb-4">
                    <strong>Important:</strong> W1 + W2 + W3 must equal 100% for normalized scoring. Each component is scaled to 0-10 within the project.
                  </p>
                  
                  {/* Weight Sum Indicator */}
                  <div className={`mb-4 p-3 rounded-lg border ${
                    validateWeightSum() 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Weight Sum: {(() => {
                          const w1 = parseFloat(formData.weightW1) || 0;
                          const w2 = parseFloat(formData.weightW2) || 0;
                          const w3 = parseFloat(formData.weightW3) || 0;
                          const sum = w1 + w2 + w3;
                          return isNaN(sum) ? '0.0' : sum.toFixed(1);
                        })()}%
                      </span>
                      <span className="text-sm">
                        {validateWeightSum() ? '✅ Valid' : '❌ Must equal 100%'}
                      </span>
                    </div>
                    {!validateWeightSum() && (
                      <p className="text-sm mt-1">{getWeightSumError()}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weightW1">W1: Task Completion (%) <span className="text-red-500">*</span></Label>
                      <Input type="number" id="weightW1" name="weightW1" value={formData.weightW1} onChange={handleChange} step="0.1" min="0" max="100" required />
                      <p className="text-xs text-gray-500">Weighted by task difficulty (Easy=1, Medium=2, Hard=3)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightW2">W2: Peer Review (%) <span className="text-red-500">*</span></Label>
                      <Input type="number" id="weightW2" name="weightW2" value={formData.weightW2} onChange={handleChange} step="0.1" min="0" max="100" required />
                      <p className="text-xs text-gray-500">Average peer evaluation score</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightW3">W3: Code Contribution (%) <span className="text-red-500">*</span></Label>
                      <Input type="number" id="weightW3" name="weightW3" value={formData.weightW3} onChange={handleChange} step="0.1" min="0" max="100" required />
                      <p className="text-xs text-gray-500">Line-based: (additions×1.0) + (deletions×1.25)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightW4">W4: Late Task Penalty (%) <span className="text-red-500">*</span></Label>
                      <Input type="number" id="weightW4" name="weightW4" value={formData.weightW4} onChange={handleChange} step="0.1" min="0" max="100" required />
                      <p className="text-xs text-gray-500">Independent penalty factor (per late task)</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>🔍 How it works:</strong> Each component (Task, Peer, Code) is normalized to 0-10 scale within your project using Min-Max scaling. 
                      Then weighted according to your percentages. Final scores range 0-10.
                    </p>
                  </div>
                </div>
                
                {/* Advanced Settings Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    🔧 Advanced Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <LabelWithTooltip 
                        htmlFor="freeriderThreshold" 
                        label="Free-rider Detection Threshold (%) *"
                        tooltipText="Contribution score below this threshold compared to team average will be marked as potential Free-rider."
                      />
                      <Input type="number" id="freeriderThreshold" name="freeriderThreshold" value={formData.freeriderThreshold} onChange={handleChange} step="1" min="0" max="100" required />
                    </div>
                    <div className="space-y-2">
                      <LabelWithTooltip
                        htmlFor="pressureThreshold"
                        label="Pressure Score Threshold *"
                        tooltipText="When a member's pressure score exceeds this threshold, they will receive warnings about potential overload."
                      />
                      <Input type="number" id="pressureThreshold" name="pressureThreshold" value={formData.pressureThreshold} onChange={handleChange} min="1" required />
                    </div>
                  </div>
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

