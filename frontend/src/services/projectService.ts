import axiosInstance from './axiosInstance';
import mockStatisticsService from './mockStatisticsService';

interface ProjectCreateRequest {
  name: string;
  description: string;
  maxMembers: number;
  evaluationCriteria: string;
  weightFactorW1: number;
  weightFactorW2: number;
  weightFactorW3: number;
  weightFactorW4: number;
  freeRiderDetectionThreshold: number;
  pressureScoreThreshold: number;
}

interface ProjectUpdateRequest extends ProjectCreateRequest {
  id: number;
}

class ProjectService {
  async getAllProjects() {
    try {
      const response = await axiosInstance.get('/api/projects');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getProjectById(id: number) {
    try {
      const response = await axiosInstance.get(`/api/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createProject(projectData: ProjectCreateRequest) {
    try {
      const response = await axiosInstance.post('/api/projects', projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProject(id: number, projectData: ProjectUpdateRequest) {
    try {
      const response = await axiosInstance.put(`/api/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteProject(id: number) {
    try {
      const response = await axiosInstance.delete(`/api/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getProjectStatistics(id: number) {
    try {
      // Try to get real statistics from the API
      try {
        const response = await axiosInstance.get(`/api/projects/${id}/statistics`);
        return response.data;
      } catch (apiError) {
        console.warn("Failed to fetch real statistics, falling back to mock data:", apiError);
        // If API call fails, fall back to mock service
        return await mockStatisticsService.getProjectStatistics(id);
      }
    } catch (error) {
      console.error("Error in getProjectStatistics:", error);
      throw error;
    }
  }
}

export default new ProjectService();