
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
  
  async joinGroup(groupId: number) {
    try {
      const response = await axiosInstance.post(`/api/groups/${groupId}/join`);
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
  }
};

export default groupService;
