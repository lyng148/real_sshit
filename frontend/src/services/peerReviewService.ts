import axiosInstance from './axiosInstance';
import { UserSummary } from '@/types/user';
import { create } from 'zustand';

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

export interface FreeRiderEvidence {
  calculatedScore: number;
  groupAverageScore: number;
  percentageBelowAverage: number;
  taskEvidence: {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    lateTasks: number;
  };
  commitEvidence: {
    totalCommits: number;
    percentageOfGroupAverage: number;
  };
  peerReviewEvidence: {
    averageRating: number;
    lowRatingCount: number;
    feedback: string[];
  };
}

const peerReviewService = {  // Submit a peer review
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
      const response = await axiosInstance.get(`/api/free-rider-detection/detect?projectId=${projectId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error detecting free riders:", error);
      throw error;
    }
  },
  
  // Get free rider risk scores for all users in a project
  async getFreeRiderRiskScores(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/free-rider-detection/risk-scores?projectId=${projectId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error getting free rider risk scores:", error);
      throw error;
    }
  },
  
  // Generate report about potential free riders in a project
  async generateFreeRiderReport(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/peer-reviews/free-rider-report?projectId=${projectId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error generating free rider report:", error);
      throw error;
    }
  },    // Get evidence data for a specific free rider
  async getFreeRiderEvidence(projectId: number, userId: number) {
    try {
      const response = await axiosInstance.get(`/api/free-rider-detection/evidence?projectId=${projectId}&userId=${userId}`);
      return response.data.data as FreeRiderEvidence;
    } catch (error) {
      console.error("Error getting free rider evidence:", error);
      throw error;
    }
  },
  // Get evidence data for a free riders in a group
  async getFreeRiderGroupEvidence(projectId: number, groupId: number | null) {
    try {
      let url = `/api/free-rider-detection/group-evidence?projectId=${projectId}`;
      if (groupId !== null && groupId !== undefined) {
        url += `&groupId=${groupId}`;
      }
      // Increase timeout to 30 seconds for this specific request
      const response = await axiosInstance.get(url, { timeout: 30000 }); 
      return response.data.data;
    } catch (error) {
      console.error("Error getting group free rider evidence:", error);
      throw error;
    }
  },
  
  // Get all free rider cases for a project
  async getFreeRiderCases(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/free-rider-detection/cases?projectId=${projectId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting free rider cases:", error);
      throw error;
    }
  },
    // Resolve a free rider case
  async resolveFreeRiderCase(caseId: number, data: any) {
    try {
      // Create URL with parameters for RequestParam instead of sending in body
      const resolution = data.resolution || 'warning';
      const notes = typeof data.notes === 'string' ? data.notes : '';
      
      // Using GET parameters as backend expects @RequestParam 
      const url = `/api/free-rider-detection/resolve/${caseId}?resolution=${encodeURIComponent(resolution)}&notes=${encodeURIComponent(notes)}`;
      
      const response = await axiosInstance.post(url);
      return response.data;
    } catch (error) {
      console.error("Error resolving free rider case:", error);
      throw error;
    }
  },

  // Check if a user already has an active free rider case
  async hasActiveFreeRiderCase(projectId: number, userId: number) {
    try {
      const casesResponse = await this.getFreeRiderCases(projectId);
      const cases = Array.isArray(casesResponse) ? casesResponse : (casesResponse?.data || []);
      
      return cases.some(frCase => 
        frCase.student.id === userId && 
        frCase.status !== 'resolved'
      );
    } catch (error) {
      console.error("Error checking active free rider cases:", error);
      return false;
    }
  },

  // Check if a user was resolved for free rider this month
  async wasResolvedThisMonth(projectId: number, userId: number) {
    try {
      const casesResponse = await this.getFreeRiderCases(projectId);
      const cases = Array.isArray(casesResponse) ? casesResponse : (casesResponse?.data || []);
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      return cases.some(frCase => {
        if (frCase.student.id !== userId || frCase.status !== 'resolved' || !frCase.resolvedAt) {
          return false;
        }
        
        const resolvedDate = new Date(frCase.resolvedAt);
        return resolvedDate.getMonth() === currentMonth && resolvedDate.getFullYear() === currentYear;
      });
    } catch (error) {
      console.error("Error checking if user was resolved this month:", error);
      return false;
    }
  },
  // Check if enough time has passed since last resolution for re-detection
  async canBeDetectedAgain(projectId: number, userId: number) {
    try {
      const casesResponse = await this.getFreeRiderCases(projectId);
      const cases = Array.isArray(casesResponse) ? casesResponse : (casesResponse?.data || []);
      
      const userResolvedCases = cases.filter(frCase => 
        frCase.student.id === userId && 
        frCase.status === 'resolved' && 
        frCase.resolvedAt
      );
      
      if (userResolvedCases.length === 0) {
        return true; // No previous resolved cases, can be detected
      }
      
      // Get the most recent resolved case
      const latestResolvedCase = userResolvedCases.reduce((latest, current) => {
        const latestDate = new Date(latest.resolvedAt);
        const currentDate = new Date(current.resolvedAt);
        return currentDate > latestDate ? current : latest;
      });
      
      const resolvedDate = new Date(latestResolvedCase.resolvedAt);
      const currentDate = new Date();
      
      // Check if resolved in current month
      const resolvedMonth = resolvedDate.getMonth();
      const resolvedYear = resolvedDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const isResolvedThisMonth = (resolvedMonth === currentMonth && resolvedYear === currentYear);
      
      if (!isResolvedThisMonth) {
        return true; // Resolved in a different month, can be detected
      }
      
      // If resolved this month, check if it's been at least a week (7 days) AND we're in a new week
      const daysDifference = Math.floor((currentDate.getTime() - resolvedDate.getTime()) / (1000 * 60 * 60 * 24));
        // Get the week number for both dates
      const getWeekNumber = (date: Date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      };
      
      const resolvedWeek = getWeekNumber(resolvedDate);
      const currentWeek = getWeekNumber(currentDate);
      
      // Allow re-detection if:
      // 1. At least 7 days have passed AND
      // 2. We're in a different week than when it was resolved
      return daysDifference >= 7 && currentWeek > resolvedWeek;
    } catch (error) {
      console.error("Error checking if user can be detected again:", error);
      return true; // Default to allowing detection if there's an error
    }
  },

  // Manually trigger free rider detection with notifications  
  async triggerFreeRiderDetection(projectId: number) {
    try {
      const response = await axiosInstance.post(`/api/free-rider-detection/trigger-detection?projectId=${projectId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error triggering free rider detection:", error);
      throw error;
    }
  },
  
  // Create a free rider case for a specific user
  async createFreeRiderCase(projectId: number, userId: number) {
    try {
      const response = await axiosInstance.post(`/api/free-rider-detection/create-case?projectId=${projectId}&userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error creating free rider case:", error);
      throw error;
    }
  },
};

export default peerReviewService;

// Custom hook để sử dụng peerReviewService
export const usePeerReviewService = () => {
  return peerReviewService;
};
