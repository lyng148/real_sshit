import axiosInstance from './axiosInstance';
import { ContributionScoreResponse } from '../types/contribution';

class ContributionScoreService {
  // Get all contribution scores for a project
  async getScoresByProject(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/contribution-scores/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contribution scores:', error);
      throw error;
    }
  }

  // Get all contribution scores for a group
  async getScoresByGroup(groupId: number) {
    try {
      const response = await axiosInstance.get(`/api/contribution-scores/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group contribution scores:', error);
      throw error;
    }
  }

  // Get contribution score for a specific user in a project
  async getScoreByUserAndProject(projectId: number, userId: number) {
    try {
      const response = await axiosInstance.get(`/api/contribution-scores/projects/${projectId}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user contribution score:', error);
      throw error;
    }
  }

  // Adjust a user's contribution score (for instructors/admins)
  async adjustScore(scoreId: number, adjustedScore: number, adjustmentReason: string) {
    try {
      const response = await axiosInstance.put(`/api/contribution-scores/${scoreId}/adjust`, {
        adjustedScore,
        adjustmentReason
      });
      return response.data;
    } catch (error) {
      console.error('Error adjusting contribution score:', error);
      throw error;
    }
  }

  // Finalize all contribution scores for a project
  async finalizeScores(projectId: number) {
    try {
      const response = await axiosInstance.put(`/api/contribution-scores/projects/${projectId}/finalize`);
      return response.data;
    } catch (error) {
      console.error('Error finalizing contribution scores:', error);
      throw error;
    }
  }
}

export default new ContributionScoreService();
