import React, { useState, useRef, useEffect } from 'react';
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
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { animations } from '@/lib/animations';
import { animate, stagger } from 'animejs';

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
  const pageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
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

  // Entrance animations
  useEffect(() => {
    if (pageRef.current) {
      animations.page.fadeIn(pageRef.current, 0);
    }
    
    // Stagger form field animations
    setTimeout(() => {
      animate('.form-field', {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: stagger(80),
        easing: 'easeOutExpo'
      });
    }, 300);
  }, []);

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
        weightW1: formData.weightW1 / 100, // Convert from percentage (0-100) to decimal (0-1)
        weightW2: formData.weightW2 / 100, // Convert from percentage (0-100) to decimal (0-1)
        weightW3: formData.weightW3 / 100, // Convert from percentage (0-100) to decimal (0-1)
        weightW4: formData.weightW4 / 100, // Convert from percentage (0-100) to decimal (0-1)
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
    <div>
      
      <main 
        ref={pageRef}
        className="flex-1 overflow-auto p-6 opacity-0"
      >
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Create New Project ✨
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Set up your project with optimal parameters for your team
            </p>
          </div>

          <AnimatedCard 
            className="p-8 max-w-3xl mx-auto"
            variant="scale"
            delay={200}
            gradient="from-white/95 to-gray-50/95"
          >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="form-field opacity-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  📝 Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Project Name</Label>
                    <Input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      placeholder="Enter project name..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Describe your project in detail...</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      required 
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      placeholder="Describe your project in detail..."
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="evaluationCriteria" className="text-sm font-medium text-gray-700">Project evaluation criteria...</Label>
                    <Textarea 
                      id="evaluationCriteria" 
                      name="evaluationCriteria" 
                      value={formData.evaluationCriteria} 
                      onChange={handleChange} 
                      required 
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      placeholder="Project evaluation criteria..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxMembers" className="text-sm font-medium text-gray-700">Maximum Members</Label>
                    <Input 
                      type="number" 
                      id="maxMembers" 
                      name="maxMembers" 
                      value={formData.maxMembers} 
                      onChange={handleChange} 
                      required
                      min="1"
                      max="10"
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Weight Factors Section */}
              <div className="form-field opacity-0">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                  <LabelWithTooltip 
                    htmlFor="weightFactors"
                    label="⚖️ Weight Factor Configuration"
                    tooltipText="Contribution Score = W1*Task Completion + W2*Peer Review Score + W3*Commit Count - W4*Late Tasks"
                  />
                  <p className="text-sm text-gray-600 mt-2 mb-4">
                    Adjust the importance of each factor in evaluating contributions
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weightW1" className="text-sm font-medium text-gray-700">W1: Task Completion (%)</Label>
                      <Input
                        type="number"
                        id="weightW1"
                        name="weightW1"
                        value={formData.weightW1}
                        onChange={handleChange}
                        required
                        min="0"
                        max="100"
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="weightW2" className="text-sm font-medium text-gray-700">W2: Peer Review (%)</Label>
                      <Input
                        type="number"
                        id="weightW2"
                        name="weightW2"
                        value={formData.weightW2}
                        onChange={handleChange}
                        required
                        min="0"
                        max="100"
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="weightW3" className="text-sm font-medium text-gray-700">W3: Commit Count (%)</Label>
                      <Input
                        type="number"
                        id="weightW3"
                        name="weightW3"
                        value={formData.weightW3}
                        onChange={handleChange}
                        required
                        min="0"
                        max="100"
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      />
                    </div>            
                    
                    <div>
                      <Label htmlFor="weightW4" className="text-sm font-medium text-gray-700">W4: Late Task Penalty (%)</Label>
                      <Input
                        type="number"
                        id="weightW4"
                        name="weightW4"
                        value={formData.weightW4}
                        onChange={handleChange}
                        required
                        min="0"
                        max="100"
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings Section */}
              <div className="form-field opacity-0">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    🔧 Advanced Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <LabelWithTooltip
                        htmlFor="freeriderThreshold" 
                        label="Free-rider Detection Threshold (%)"
                        tooltipText="Contribution score below this threshold compared to team average will be marked as potential Free-rider."
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
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <LabelWithTooltip
                        htmlFor="pressureThreshold"
                        label="Pressure Score Threshold"
                        tooltipText="When a member's pressure score exceeds this threshold, they will receive warnings about potential overload."
                      />
                      <Input
                        type="number"
                        id="pressureThreshold"
                        name="pressureThreshold"
                        value={formData.pressureThreshold}
                        onChange={handleChange}
                        required
                        min="1"
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-field opacity-0 flex justify-center pt-4">
                <AnimatedButton
                  type="submit"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  effect="ripple"
                  className="px-12 py-3 shadow-xl hover:shadow-2xl"
                >
                  {isSubmitting ? "Creating..." : "🚀 Create Project"}
                </AnimatedButton>
              </div>
            </form>
          </AnimatedCard>
        </div>
      </main>
    </div>
  );
};

export default ProjectCreate;

