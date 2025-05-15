import axiosInstance from './axiosInstance';

export interface Member {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

export interface GroupLeader {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  repositoryUrl: string;
  projectId: number;
  projectName: string;
  leader: GroupLeader;
  members: Member[];
  memberCount: number;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
}

export const groupService = {
  async getAllGroups(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/groups/project/${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getGroupById(id: number) {
    try {
      const response = await axiosInstance.get(`/api/groups/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async createGroup(groupData: any) {
    try {
      const response = await axiosInstance.post('/api/groups', groupData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async updateGroup(id: number, groupData: any) {
    try {
      const response = await axiosInstance.put(`/api/groups/${id}`, groupData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async deleteGroup(id: number) {
    try {
      const response = await axiosInstance.delete(`/api/groups/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async joinGroup(groupId: number, projectId: number) {
    try {
      // Kiểm tra và ép kiểu projectId thành number
      const projectIdNumber = Number(projectId);

      if (isNaN(projectIdNumber)) {
        throw new Error('projectId must be a valid number');
      }

      const data = {
        groupId: groupId,
        projectId: projectIdNumber
      };

      const response = await axiosInstance.post(`/api/groups/join`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async leaveGroup(groupId: number) {
    try {
      const response = await axiosInstance.post(`/api/groups/${groupId}/leave`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getMyGroups() {
    try {
      const response = await axiosInstance.get('/api/groups/my-groups');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getMyLedGroups() {
    try {
      const response = await axiosInstance.get('/api/groups/my-led-groups');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // This method would be implemented in a real API
  async transferLeadership(groupId: number, newLeaderId: number) {
    try {
      const response = await axiosInstance.post(`/api/groups/${groupId}/transfer-leadership`, {
        newLeaderId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async autoJoinGroup(projectId: number) {
    try {
      const response = await axiosInstance.post(`/api/groups/auto-assign`, { projectId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
    async checkRepositoryConnection(repoUrl: string) {    try {
      // Extract owner and repo name from GitHub URL
      // Updated pattern to support repo names with periods, underscores, and other valid GitHub characters
      const urlPattern = /github\.com\/([\w-]+)\/([\w\.-_]+)/;
      const matches = repoUrl.match(urlPattern);
      
      if (!matches || matches.length < 3) {
        return {
          success: false,
          message: 'Invalid GitHub repository URL format'
        };
      }
        const owner = matches[1];
      const repo = matches[2];
      
      // Get GitHub token from backend to avoid exposing it in frontend code
      const tokenResponse = await axiosInstance.get('/api/github/token');
      const token = tokenResponse.data?.token;
      
      // Prepare headers with authentication if token is available
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }
      
      // Make authenticated request to GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        method: 'GET',
        headers
      });
      
      if (response.status === 200) {
        return {
          success: true,
          message: 'Repository connection successful'
        };
      } else if (response.status === 404) {
        return {
          success: false,
          message: 'Repository not found. Please check the URL or access permissions.'
        };      } else {
        // Handle rate limit or other issues
        const data = await response.json();
        console.error('GitHub API error:', data);
        
        // Check for rate limiting specifically
        if (response.status === 403 && data.message && data.message.includes('rate limit')) {
          return {
            success: false,
            message: 'GitHub API rate limit exceeded. Please try again later.'
          };
        }
        
        return {
          success: false,
          message: data.message || 'Failed to verify repository. GitHub API error.'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to connect to repository'
      };
    }
  }
};

export default groupService;
