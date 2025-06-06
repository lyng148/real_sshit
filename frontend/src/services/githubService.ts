import axiosInstance from './axiosInstance';
import { toast } from '@/components/ui/use-toast';

export interface GitCommit {
  id: string;
  message: string;
  author: string;
  authorEmail: string;
  timestamp: string;
  sha: string;
  url?: string;
}

class GitHubService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
  }

  async fetchGroupCommits(groupId: number): Promise<{ success: boolean; data?: GitCommit[]; message?: string }> {
    try {
      const response = await axiosInstance.get(`/api/github/commits/group/${groupId}`, {
        headers: this.getAuthHeaders()
      });
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Commits fetched successfully",
        });
        return { success: true, data: response.data.data };
      } else {
        const message = response.data.message || 'Failed to fetch commits';
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        return { success: false, message };
      }
    } catch (error: any) {
      console.error('Error fetching commits:', error);
      const message = error.response?.data?.message || 'Failed to fetch commits';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return { success: false, message };
    }
  }

  async triggerCommitSync(groupId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axiosInstance.post(`/api/github/sync-commits/group/${groupId}`, {}, {
        headers: this.getAuthHeaders()
      });
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Commit sync initiated successfully",
        });
        return { success: true };
      } else {
        const message = response.data.message || 'Failed to sync commits';
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        return { success: false, message };
      }
    } catch (error: any) {
      console.error('Error syncing commits:', error);
      const message = error.response?.data?.message || 'Failed to sync commits';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return { success: false, message };
    }
  }

  async checkRepositoryConnection(repoUrl: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Validate URL format on client side first
      const urlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;
      if (!urlPattern.test(repoUrl)) {
        return {
          success: false,
          message: 'Invalid GitHub repository URL format. Must be like: https://github.com/username/repository'
        };
      }
      
      // Call server-side API to check repository connection
      const response = await axiosInstance.post('/api/github/check-repository', {
        repoUrl: repoUrl
      }, {
        headers: this.getAuthHeaders()
      });
      
      if (response.data?.success && response.data?.data) {
        return {
          success: response.data.data.success,
          message: response.data.data.message
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to check repository connection'
        };
      }
    } catch (error: any) {
      console.error('Repository connection check error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to connect to repository'
      };
    }
  }
}

const githubService = new GitHubService();
export default githubService; 