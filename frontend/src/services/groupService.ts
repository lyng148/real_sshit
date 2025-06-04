import axiosInstance from './axiosInstance';

export interface Member {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface GroupLeader {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
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
  
  async getAllGroupsPaginated(projectId: number, page: number = 0, size: number = 10, sortBy: string = 'name', sortDirection: string = 'ASC') {
    try {
      const response = await axiosInstance.get(`/api/groups/project/${projectId}/paginated`, {
        params: {
          page,
          size,
          sortBy,
          sortDirection
        }
      });
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
  
  async transferLeadership(groupId: number, newLeaderId: number) {
    try {
      const response = await axiosInstance.post(`/api/groups/${groupId}/transfer-leadership`, newLeaderId);
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
    async checkRepositoryConnection(repoUrl: string) {
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
};

export default groupService;
