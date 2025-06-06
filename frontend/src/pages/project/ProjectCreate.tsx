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
// Enhanced error handling imports
import { displayEnhancedError, getDetailedError, ValidationError } from '@/utils/errorHandling';
import { ValidationErrorDisplay, ValidationErrorInline } from '@/components/ui/ValidationErrorDisplay';
import { useFormErrors } from '@/hooks/useFormErrors';

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
  
  // Enhanced error handling hook
  const { validationErrors, clearErrors, handleError, getFieldErrorClass } = useFormErrors({ toast });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    evaluationCriteria: '',
    maxMembers: 4,
    weightW1: 50,  // 50% (0.5 normalized)
    weightW2: 30,  // 30% (0.3 normalized)
    weightW3: 20,  // 20% (0.2 normalized)
    weightW4: 10,  // 10% penalty (0.1 normalized)
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
    
    // Clear previous validation errors
    clearErrors();
    
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
          title: "Thành công",
          description: "Tạo dự án thành công",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Tạo dự án thất bại",
          variant: "destructive",
        });
      }    
    } catch (error: any) {
      console.error("Error creating project:", error);
      handleError(error, 'Error creating project');
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
            {/* Display validation errors */}
            <ValidationErrorDisplay validationErrors={validationErrors} />
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="form-field opacity-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  📝 Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Project Name <span className="text-red-500">*</span></Label>
                    <Input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      className={getFieldErrorClass('name', 'mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300', 'border-red-400 bg-red-50')}
                      placeholder="Enter project name..."
                    />
                    <ValidationErrorInline fieldName="name" validationErrors={validationErrors} />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Project Description <span className="text-red-500">*</span></Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      required 
                      className={getFieldErrorClass('description', 'mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300', 'border-red-400 bg-red-50')}
                      placeholder="Describe your project in detail..."
                      rows={4}
                    />
                    <ValidationErrorInline fieldName="description" validationErrors={validationErrors} />
                  </div>
                  
                  <div>
                    <Label htmlFor="evaluationCriteria" className="text-sm font-medium text-gray-700">Evaluation Criteria <span className="text-red-500">*</span></Label>
                    <Textarea 
                      id="evaluationCriteria" 
                      name="evaluationCriteria" 
                      value={formData.evaluationCriteria} 
                      onChange={handleChange} 
                      required 
                      className={getFieldErrorClass('evaluationCriteria', 'mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300', 'border-red-400 bg-red-50')}
                      placeholder="Project evaluation criteria..."
                      rows={3}
                    />
                    <ValidationErrorInline fieldName="evaluationCriteria" validationErrors={validationErrors} />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxMembers" className="text-sm font-medium text-gray-700">Maximum Members <span className="text-red-500">*</span></Label>
                    <Input 
                      type="number" 
                      id="maxMembers" 
                      name="maxMembers" 
                      value={formData.maxMembers} 
                      onChange={handleChange} 
                      required
                      min="1"
                      max="10"
                      className={getFieldErrorClass('maxMembers', 'mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300', 'border-red-400 bg-red-50')}
                    />
                    <ValidationErrorInline fieldName="maxMembers" validationErrors={validationErrors} />
                  </div>
                </div>
              </div>

              {/* Weight Factors Section */}
              <div className="form-field opacity-0">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weightW1" className="text-sm font-medium text-gray-700">W1: Task Completion (%) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        id="weightW1"
                        name="weightW1"
                        value={formData.weightW1}
                        onChange={handleChange}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                        className={getFieldErrorClass('weightW1', 'mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300', 'border-red-400 bg-red-50')}
                      />
                      <p className="text-xs text-gray-500 mt-1">Weighted by task difficulty (Easy=1, Medium=2, Hard=3)</p>
                      <ValidationErrorInline fieldName="weightW1" validationErrors={validationErrors} />
                    </div>

                    <div>
                      <Label htmlFor="weightW2" className="text-sm font-medium text-gray-700">W2: Peer Review (%) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        id="weightW2"
                        name="weightW2"
                        value={formData.weightW2}
                        onChange={handleChange}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                        className={getFieldErrorClass('weightW2', 'mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300', 'border-red-400 bg-red-50')}
                      />
                      <p className="text-xs text-gray-500 mt-1">Average peer evaluation score</p>
                      <ValidationErrorInline fieldName="weightW2" validationErrors={validationErrors} />
                    </div>

                    <div>
                      <Label htmlFor="weightW3" className="text-sm font-medium text-gray-700">W3: Code Contribution (%) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        id="weightW3"
                        name="weightW3"
                        value={formData.weightW3}
                        onChange={handleChange}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                        className={getFieldErrorClass('weightW3', 'mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300', 'border-red-400 bg-red-50')}
                      />
                      <p className="text-xs text-gray-500 mt-1">Line-based: (additions×1.0) + (deletions×1.25)</p>
                      <ValidationErrorInline fieldName="weightW3" validationErrors={validationErrors} />
                    </div>            
                    
                    <div>
                      <Label htmlFor="weightW4" className="text-sm font-medium text-gray-700">W4: Late Task Penalty (%) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        id="weightW4"
                        name="weightW4"
                        value={formData.weightW4}
                        onChange={handleChange}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                        className={getFieldErrorClass('weightW4', 'mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-300', 'border-red-400 bg-red-50')}
                      />
                      <p className="text-xs text-gray-500 mt-1">Independent penalty factor (per late task)</p>
                      <ValidationErrorInline fieldName="weightW4" validationErrors={validationErrors} />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>🔍 How it works:</strong> Each component (Task, Peer, Code) is normalized to 0-10 scale within your project using Min-Max scaling. 
                      Then weighted according to your percentages. Final scores range 0-10.
                    </p>
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
                        label="Free-rider Detection Threshold (%) *"
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
                        className={getFieldErrorClass('freeriderThreshold', 'mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300', 'border-red-400 bg-red-50')}
                      />
                      <ValidationErrorInline fieldName="freeriderThreshold" validationErrors={validationErrors} />
                    </div>

                    <div>
                      <LabelWithTooltip
                        htmlFor="pressureThreshold"
                        label="Pressure Score Threshold *"
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
                        className={getFieldErrorClass('pressureThreshold', 'mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300', 'border-red-400 bg-red-50')}
                      />
                      <ValidationErrorInline fieldName="pressureThreshold" validationErrors={validationErrors} />
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

