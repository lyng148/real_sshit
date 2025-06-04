import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, GitBranch, CheckCircle, XCircle, Loader2, ArrowLeft, Plus } from 'lucide-react';
import groupService from '@/services/groupService';
import { displayEnhancedError, getDetailedError, ValidationError } from '@/utils/errorHandling';
import { ValidationErrorDisplay, ValidationErrorInline } from '@/components/ui/ValidationErrorDisplay';
import { useFormErrors } from '@/hooks/useFormErrors';

const CreateGroupPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validationErrors, clearErrors, handleError, getFieldErrorClass } = useFormErrors({ toast });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    repositoryUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingRepo, setIsCheckingRepo] = useState(false);
  const [repoConnectionValid, setRepoConnectionValid] = useState<boolean | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'repositoryUrl') {
      setRepoConnectionValid(null);
      setConnectionMessage('');
    }
  };
  const handleCheckConnection = async () => {
    if (!formData.repositoryUrl) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập URL repository trước', variant: 'destructive' });
      return;
    }    
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;
    if (!githubUrlPattern.test(formData.repositoryUrl)) {
      setRepoConnectionValid(false);
      setConnectionMessage('Invalid GitHub repository URL format. Must be like: https://github.com/username/repository');
      toast({ 
        title: 'Lỗi', 
        description: 'URL GitHub repository không đúng định dạng. Phải có dạng: https://github.com/username/repository', 
        variant: 'destructive' 
      });
      return;
    }
    
    setIsCheckingRepo(true);
    try {
      const response = await groupService.checkRepositoryConnection(formData.repositoryUrl);
      setRepoConnectionValid(response.success);
      setConnectionMessage(response.message);
      
      if (response.success) {
        toast({ title: 'Thành công', description: 'Kết nối repository thành công!' });
      } else {
        toast({ title: 'Lỗi', description: response.message || 'Kết nối repository thất bại', variant: 'destructive' });
      }
    } catch (error: any) {
      setRepoConnectionValid(false);
      const { mainMessage } = getDetailedError(error);
      setConnectionMessage(mainMessage);
      displayEnhancedError(error, toast, 'Lỗi kết nối repository');
    } finally {
      setIsCheckingRepo(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    clearErrors();
    
    // Check if repository connection has been verified
    if (repoConnectionValid !== true) {
      toast({ 
        title: 'Lỗi', 
        description: 'Vui lòng xác minh kết nối repository trước khi tạo nhóm', 
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (!projectId) {
        toast({ title: 'Lỗi', description: 'Thiếu ID dự án', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }
      if (!formData.repositoryUrl) {
        toast({ title: 'Lỗi', description: 'URL Repository là bắt buộc', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }
      const groupData = {
        name: formData.name,
        description: formData.description,
        repositoryUrl: formData.repositoryUrl,
        projectId: Number(projectId)
      };
      const response = await groupService.createGroup(groupData);
      if (response.success) { 
        toast({ title: 'Thành công', description: 'Tạo nhóm thành công!' });
        navigate(`/projects/${projectId}/groups`);
      } else {
        toast({ title: 'Lỗi', description: response.message || 'Tạo nhóm thất bại', variant: 'destructive' });
      }    
    } catch (error: any) {
      handleError(error, 'Lỗi tạo nhóm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      
      <main className="flex-1 overflow-auto">
        {/* Modern header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/projects/${projectId}/groups`)}
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Create New Group</h1>
                    <p className="text-purple-100">Project #{projectId}</p>
                  </div>
                </div>
              </div>
              
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Users className="h-3 w-3 mr-1" />
                Group Management
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Group Information</CardTitle>
                      <CardDescription className="text-gray-600">
                        Fill in complete information to create a new work group
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Display validation errors */}
                  <ValidationErrorDisplay validationErrors={validationErrors} />
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Group Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Group Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your group name"
                        className={getFieldErrorClass('name', 'h-11 border-gray-200 focus:border-purple-400 focus:ring-purple-400')}
                        required
                      />
                      <ValidationErrorInline fieldName="name" validationErrors={validationErrors} />
                      <p className="text-xs text-gray-500">Group name will be displayed to all members in the project</p>
                    </div>
                    
                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                        Group Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Brief description of the group and work objectives..."
                        rows={4}
                        className={getFieldErrorClass('description', 'border-gray-200 focus:border-purple-400 focus:ring-purple-400 resize-none')}
                      />
                      <ValidationErrorInline fieldName="description" validationErrors={validationErrors} />
                      <p className="text-xs text-gray-500">This description will help members understand more about the group</p>
                    </div>

                    {/* Repository URL */}
                    <div className="space-y-2">
                      <Label htmlFor="repositoryUrl" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        GitHub Repository URL <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          id="repositoryUrl"
                          name="repositoryUrl"
                          value={formData.repositoryUrl}
                          onChange={handleChange}
                          className={`flex-1 h-11 ${
                            getFieldErrorClass('repositoryUrl', '', 'border-red-400 bg-red-50') ||
                            (repoConnectionValid === true ? 'border-green-400 bg-green-50' : 
                            repoConnectionValid === false ? 'border-red-400 bg-red-50' : 'border-gray-200')
                          } focus:border-purple-400 focus:ring-purple-400`}
                          required
                          placeholder="https://github.com/username/repository"
                        />
                        <Button
                          type="button"
                          onClick={handleCheckConnection}
                          variant={repoConnectionValid === true ? "default" : "outline"}
                          className={`whitespace-nowrap ${
                            repoConnectionValid === true 
                              ? 'bg-green-600 hover:bg-green-700 border-green-600' 
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          disabled={isCheckingRepo || !formData.repositoryUrl}
                        >
                          {isCheckingRepo ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Checking...
                            </>
                          ) : repoConnectionValid === true ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Connected
                            </>
                          ) : (
                            'Check Connection'
                          )}
                        </Button>
                      </div>
                      
                      <ValidationErrorInline fieldName="repositoryUrl" validationErrors={validationErrors} />
                      
                      {/* Connection Status */}
                      {connectionMessage && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                          repoConnectionValid === true 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {repoConnectionValid === true ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          {connectionMessage}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Repository must be in format: https://github.com/username/repository
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <Button
                        type="submit"
                        disabled={isSubmitting || repoConnectionValid !== true}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating group...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Group
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Repository Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <p>Create a public repository on GitHub</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <p>Copy full repository URL</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <p>Check connection before creating group</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Group Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-purple-800">
                  <p>• Maximum 6 members per group</p>
                  <p>• Each member belongs to only 1 group</p>
                  <p>• Repository must have public access</p>
                  <p>• Group name must not be duplicated</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateGroupPage;

