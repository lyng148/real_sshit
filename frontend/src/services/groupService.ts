
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
  }
};

export default groupService;
