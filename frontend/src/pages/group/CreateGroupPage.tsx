import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import groupService from '@/services/groupService';

const CreateGroupPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
      // Reset repo connection status when URL changes
    if (name === 'repositoryUrl') {
      setRepoConnectionValid(null);
      setConnectionMessage('');
    }
  };
  const handleCheckConnection = async () => {
    if (!formData.repositoryUrl) {
      toast({ title: 'Error', description: 'Please enter a repository URL first', variant: 'destructive' });
      return;
    }
      // Validate GitHub URL format before making API call
    const githubUrlPattern = /^(https:\/\/github\.com\/[\w-]+\/[\w\.-_]+|git@github\.com:[\w-]+\/[\w\.-_]+(?:\.git)?)$/;
    if (!githubUrlPattern.test(formData.repositoryUrl)) {
      setRepoConnectionValid(false);
      setConnectionMessage('Invalid GitHub repository URL format. Must be like: https://github.com/username/repository');
      toast({ 
        title: 'Error', 
        description: 'Invalid GitHub repository URL format', 
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
        toast({ title: 'Success', description: 'Repository connection successful!' });
      } else {
        toast({ title: 'Error', description: response.message || 'Repository connection failed', variant: 'destructive' });
      }
    } catch (error: any) {
      setRepoConnectionValid(false);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to check repository connection';
      setConnectionMessage(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsCheckingRepo(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if repository connection has been verified
    if (repoConnectionValid !== true) {
      toast({ 
        title: 'Error', 
        description: 'Please verify the repository connection before creating the group', 
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (!projectId) {
        toast({ title: 'Error', description: 'Missing project ID', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }
      if (!formData.repositoryUrl) {
        toast({ title: 'Error', description: 'Repository URL is required', variant: 'destructive' });
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
        toast({ title: 'Success', description: 'Group created successfully!' });
        navigate(`/projects/${projectId}/groups`);
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to create group', variant: 'destructive' });
      }    
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || error.message || 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create New Group</h1>
          <p className="text-gray-600">Project ID: {projectId}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="repositoryUrl" className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Repository URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="repositoryUrl"
                  name="repositoryUrl"
                  value={formData.repositoryUrl}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    repoConnectionValid === true ? 'border-green-500' : 
                    repoConnectionValid === false ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  placeholder="https://github.com/your-repo"
                />                <button
                  type="button"
                  onClick={handleCheckConnection}
                  className={`px-4 py-2 text-white rounded-md whitespace-nowrap ${
                    repoConnectionValid === true ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                  disabled={isCheckingRepo || !formData.repositoryUrl}
                >
                  {isCheckingRepo ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </span>
                  ) : (
                    'Check Connection'
                  )}
                </button>
              </div>              {repoConnectionValid === true && (
                <div className="mt-1 text-sm text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Repository connection successful
                </div>
              )}
              {repoConnectionValid === false && (
                <div className="mt-1 text-sm text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {connectionMessage || 'Repository connection failed'}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(`/projects/${projectId}/groups`)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isSubmitting || !repoConnectionValid}
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;
