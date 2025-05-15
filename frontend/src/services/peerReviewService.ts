import axiosInstance from './axiosInstance';
import { UserSummary } from '@/types/user';

export interface PeerReviewRequest {
  revieweeId: number;
  projectId: number;
  completionScore: number;
  cooperationScore: number;
  comment?: string;
}

export interface PeerReviewResponse {
  id: number;
  reviewer: UserSummary;
  reviewee: UserSummary;
  projectId: number;
  projectName: string;
  score: number;
  completionScore: number;
  cooperationScore: number;
  reviewWeek: number;
  comment: string | null;
  isCompleted: boolean;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
}

export const peerReviewService = {  // Submit a peer review
  async submitReview(review: PeerReviewRequest) {
    try {
      const response = await axiosInstance.post('/api/peer-reviews', review);
      return response.data;
    } catch (error) {
      console.error("Error in peer review submission:", error);
      // Trả về một object với thông tin lỗi thay vì throw error
      return { 
        success: false, 
        message: error.response?.data?.message || "Error submitting peer review" 
      };
    }
  },

  // Start peer review process for a group (group leader only)
  async startPeerReviewForGroup(groupId: number) {
    try {
      const response = await axiosInstance.post(`/api/peer-reviews/start-review?groupId=${groupId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get reviews submitted by the current user for a project
  async getSubmittedReviews(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/peer-reviews/submitted?projectId=${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get reviews received by the current user for a project
  async getReceivedReviews(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/peer-reviews/received?projectId=${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get list of team members that need to be reviewed by the current user
  async getMembersToReview(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/peer-reviews/members-to-review?projectId=${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if the current user has completed all required peer reviews
  async hasCompletedAllReviews(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/peer-reviews/completion-status?projectId=${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Detect free riders in a project
  async detectFreeRiders(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/peer-reviews/free-riders?projectId=${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default peerReviewService;
