import { ApiResponse } from '@/types/common';
import axiosInstance from './axiosInstance';
import { PressureScoreResponse } from '@/types/pressure';

export interface PressureScoreAnalysisData {
  avgPressureScore: number;
  highPressureCount: number;
  pressureTrend: {
    week: number;
    avgScore: number;
  }[];
}

export const pressureScoreService = {
  /**
   * Get pressure score for the current authenticated user
   */
  getCurrentUserPressureScore: async (): Promise<PressureScoreResponse> => {
    try {
      const response = await axiosInstance.get<ApiResponse<PressureScoreResponse>>('/api/pressure-scores/me');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching current user pressure score:', error);
      throw error;
    }
  },

  /**
   * Get pressure score for a specific user
   * @param userId User ID to get pressure score for
   */
  getUserPressureScore: async (userId: number): Promise<PressureScoreResponse> => {
    try {
      const response = await axiosInstance.get<ApiResponse<PressureScoreResponse>>(`/api/pressure-scores/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching user pressure score for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get pressure scores for all users in a project
   * @param projectId Project ID
   */
  getProjectPressureScores: async (projectId: number): Promise<PressureScoreResponse[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<PressureScoreResponse[]>>(`/api/pressure-scores/projects/${projectId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching project pressure scores for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get pressure scores for all users in a group
   * @param groupId Group ID
   */
  getGroupPressureScores: async (groupId: number): Promise<PressureScoreResponse[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<PressureScoreResponse[]>>(`/api/pressure-scores/groups/${groupId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching group pressure scores for group ${groupId}:`, error);
      throw error;
    }
  }
};
