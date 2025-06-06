import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface StudentScore {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  groupId: number;
  groupName: string;
  taskScore: number;
  peerReviewScore: number;
  commitScore: number;
  latePenalty: number;
  finalScore: number;
  contributionPercentage: number;
  isFreerider: boolean;
  lastUpdated: string;
  // Internal fields for score calculations
  _originalScore: number;
  _minScore: number;
  _maxScore: number;
}

export interface ProjectAssessment {
  projectId: number;
  projectName: string;
  totalStudents: number;
  totalGroups: number;
  averageScore: number;
  freeriderCount: number;
  assessmentStatus: 'DRAFT' | 'FINALIZED';
  finalizedAt?: string;
  finalizedBy?: string;
  students: StudentScore[];
}

export interface ScoreAdjustment {
  studentId: number;
  adjustmentReason: string;
  newScore: number; // This should be on 0-10 scale (will be converted to original scale using min-max normalization)
}

class FinalAssessmentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getProjectAssessment(projectId: number): Promise<{ success: boolean; data?: ProjectAssessment; message?: string }> {
    try {
      // First ensure contribution scores are calculated
      await this.calculateContributionScores(projectId);
      
      // Get project details and contribution scores in parallel
      const [projectResponse, scoresResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/projects/${projectId}`, { headers: this.getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/contribution-scores/projects/${projectId}`, { headers: this.getAuthHeaders() })
      ]);
      
      if (scoresResponse.data.success && projectResponse.data.success) {
        const contributionScores = scoresResponse.data.data;
        const project = projectResponse.data.data;
        
        // Scores are already normalized to 0-10 by the backend
        const normalizedScores = contributionScores.map((score: any) => score.adjustedScore || score.calculatedScore);
        
        // Calculate unique groups - since API doesn't provide groupId, we'll use a placeholder
        const uniqueUsers = new Set(contributionScores.map((score: any) => score.userId));
        
        const assessmentData: ProjectAssessment = {
          projectId: projectId,
          projectName: project.name,
          totalStudents: contributionScores.length,
          totalGroups: uniqueUsers.size, // Assuming each user is in a different group for now
          averageScore: contributionScores.length > 0 
            ? contributionScores.reduce((sum: number, score: any) => sum + (score.adjustedScore || score.calculatedScore), 0) / contributionScores.length 
            : 0,
          freeriderCount: contributionScores.filter((score: any) => (score.adjustedScore || score.calculatedScore) < 4).length, // Scores below 4/10 are considered freeriders
          assessmentStatus: contributionScores.some((score: any) => score.isFinal) ? 'FINALIZED' : 'DRAFT',
          students: contributionScores.map((score: any) => ({
            id: score.id,
            studentId: score.userId,
            studentName: score.fullName,
            studentEmail: score.email,
            studentAvatar: undefined, // API doesn't provide avatar
            groupId: score.userId, // Using userId as groupId since no group info
            groupName: `Group ${score.userId}`, // Placeholder group name
            taskScore: score.taskCompletionScore || 0,
            peerReviewScore: score.peerReviewScore || 0,
            commitScore: score.codeContributionScore || 0, // Use normalized code contribution score
            latePenalty: score.lateTaskCount || 0, // Using lateTaskCount as penalty
            finalScore: score.adjustedScore || score.calculatedScore, // Already normalized to 0-10
            contributionPercentage: ((score.adjustedScore || score.calculatedScore) / 10) * 100, // Convert 0-10 to percentage
            isFreerider: (score.adjustedScore || score.calculatedScore) < 4, // Threshold for freerider on normalized scale
            lastUpdated: score.updatedAt || new Date().toISOString(),
            // Store original score for adjustment calculations (already normalized)
            _originalScore: score.adjustedScore || score.calculatedScore,
            _minScore: 0, // Always 0 in normalized system
            _maxScore: 10 // Always 10 in normalized system
          }))
        };
        
        return { success: true, data: assessmentData };
      } else {
        return { success: false, message: scoresResponse.data.message || projectResponse.data.message };
      }
    } catch (error: any) {
      console.error('Error fetching project assessment:', error);
      const message = error.response?.data?.message || 'Failed to fetch project assessment';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return { success: false, message };
    }
  }

  private async calculateContributionScores(projectId: number): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/contribution-scores/calculate?projectId=${projectId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      // Silently fail - scores might already be calculated
      console.log('Contribution scores calculation skipped or failed');
    }
  }

  async adjustStudentScore(
    projectId: number, 
    studentId: number, 
    adjustment: ScoreAdjustment
  ): Promise<{ success: boolean; data?: StudentScore; message?: string }> {
    try {
      // In the normalized system, scores are already 0-10, so we can use the adjustment directly
      const scoresResponse = await axios.get(
        `${API_BASE_URL}/contribution-scores/projects/${projectId}`,
        { headers: this.getAuthHeaders() }
      );
      
      if (!scoresResponse.data.success) {
        return { success: false, message: 'Failed to find student score' };
      }
      
      const studentScore = scoresResponse.data.data.find((score: any) => score.userId === studentId);
      if (!studentScore) {
        return { success: false, message: 'Student score not found' };
      }
      
      // Use the adjustment score directly since we're working in 0-10 scale
      const response = await axios.put(
        `${API_BASE_URL}/contribution-scores/${studentScore.id}/adjust`,
        {
          adjustedScore: adjustment.newScore, // Direct use of 0-10 scale score
          adjustmentReason: adjustment.adjustmentReason
        },
        { headers: this.getAuthHeaders() }
      );
      
      if (response.data.success) {
        // Convert response back to expected format
        const updatedScore = response.data.data;
        return {
          success: true,
          data: {
            id: updatedScore.id,
            studentId: updatedScore.userId,
            studentName: updatedScore.fullName,
            studentEmail: updatedScore.email,
            studentAvatar: undefined,
            groupId: updatedScore.userId,
            groupName: `Group ${updatedScore.userId}`,
            taskScore: updatedScore.taskCompletionScore || 0,
            peerReviewScore: updatedScore.peerReviewScore || 0,
            commitScore: updatedScore.codeContributionScore || 0,
            latePenalty: updatedScore.lateTaskCount || 0,
            finalScore: updatedScore.adjustedScore || updatedScore.calculatedScore,
            contributionPercentage: ((updatedScore.adjustedScore || updatedScore.calculatedScore) / 10) * 100,
            isFreerider: (updatedScore.adjustedScore || updatedScore.calculatedScore) < 4,
            lastUpdated: updatedScore.updatedAt || new Date().toISOString(),
            _originalScore: updatedScore.adjustedScore || updatedScore.calculatedScore,
            _minScore: 0,
            _maxScore: 10
          }
        };
      } else {
        return { success: false, message: response.data.message || 'Failed to adjust score' };
      }
    } catch (error: any) {
      console.error('Error adjusting score:', error);
      const message = error.response?.data?.message || 'Failed to adjust score';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return { success: false, message };
    }
  }

  async finalizeAssessment(projectId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/contribution-scores/projects/${projectId}/finalize`,
        {},
        { headers: this.getAuthHeaders() }
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Assessment finalized successfully",
        });
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      console.error('Error finalizing assessment:', error);
      const message = error.response?.data?.message || 'Failed to finalize assessment';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return { success: false, message };
    }
  }

  async exportAssessmentReport(projectId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projects/${projectId}/report`,
        { 
          headers: this.getAuthHeaders(),
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assessment-report-project-${projectId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Assessment report downloaded successfully",
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error exporting assessment report:', error);
      const message = error.response?.data?.message || 'Failed to export assessment report';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return { success: false, message };
    }
  }

  async getAssessmentHistory(projectId: number): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      return { 
        success: true, 
        data: [],
        message: "Assessment history feature not yet implemented"
      };
    } catch (error: any) {
      console.error('Error fetching assessment history:', error);
      const message = error.response?.data?.message || 'Failed to fetch assessment history';
      return { success: false, message };
    }
  }
}

const finalAssessmentService = new FinalAssessmentService();
export default finalAssessmentService; 