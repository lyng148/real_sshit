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
        
        // Calculate min and max scores for normalization
        const rawScores = contributionScores.map((score: any) => score.adjustedScore || score.calculatedScore);
        const minScore = Math.min(...rawScores);
        const maxScore = Math.max(...rawScores);
        const scoreRange = maxScore - minScore;
        
        // Function to normalize score to 0-10 scale
        const normalizeScore = (rawScore: number): number => {
          if (scoreRange === 0) return 5; // If all scores are the same, return middle value
          return Math.min(10, Math.max(0, ((rawScore - minScore) / scoreRange) * 10));
        };
        
        // Calculate unique groups - since API doesn't provide groupId, we'll use a placeholder
        const uniqueUsers = new Set(contributionScores.map((score: any) => score.userId));
        
        const assessmentData: ProjectAssessment = {
          projectId: projectId,
          projectName: project.name,
          totalStudents: contributionScores.length,
          totalGroups: uniqueUsers.size, // Assuming each user is in a different group for now
          averageScore: contributionScores.length > 0 
            ? contributionScores.reduce((sum: number, score: any) => sum + normalizeScore(score.adjustedScore || score.calculatedScore), 0) / contributionScores.length 
            : 0,
          freeriderCount: contributionScores.filter((score: any) => normalizeScore(score.adjustedScore || score.calculatedScore) < 4).length, // Scores below 4/10 are considered freeriders
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
            commitScore: score.commitCount || 0, // Using commitCount as commitScore
            latePenalty: score.lateTaskCount || 0, // Using lateTaskCount as penalty
            finalScore: normalizeScore(score.adjustedScore || score.calculatedScore), // Normalize to 0-10 scale
            contributionPercentage: scoreRange === 0 ? 50 : Math.min(100, Math.max(0, ((score.adjustedScore || score.calculatedScore - minScore) / scoreRange) * 100)),
            isFreerider: normalizeScore(score.adjustedScore || score.calculatedScore) < 4, // Threshold for freerider on normalized scale
            lastUpdated: score.updatedAt || new Date().toISOString(),
            // Store original score for adjustment calculations
            _originalScore: score.adjustedScore || score.calculatedScore,
            _minScore: minScore,
            _maxScore: maxScore
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
      // First get current assessment data to get min/max values
      const assessmentResponse = await this.getProjectAssessment(projectId);
      if (!assessmentResponse.success || !assessmentResponse.data) {
        return { success: false, message: 'Failed to get current assessment data' };
      }
      
      const currentStudent = assessmentResponse.data.students.find(s => s.studentId === studentId);
      if (!currentStudent) {
        return { success: false, message: 'Student not found in assessment' };
      }
      
      // Convert the new score from 0-10 scale back to original scale using min-max
      const minScore = currentStudent._minScore;
      const maxScore = currentStudent._maxScore;
      const scoreRange = maxScore - minScore;
      
      let adjustedScoreInOriginalScale: number;
      if (scoreRange === 0) {
        // If all scores are the same, keep the original score
        adjustedScoreInOriginalScale = currentStudent._originalScore;
      } else {
        // Convert from 0-10 scale back to original scale
        adjustedScoreInOriginalScale = minScore + (adjustment.newScore / 10) * scoreRange;
      }
      
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
      
      const response = await axios.put(
        `${API_BASE_URL}/contribution-scores/${studentScore.id}/adjust`,
        {
          adjustedScore: adjustedScoreInOriginalScale,
          adjustmentReason: adjustment.adjustmentReason
        },
        { headers: this.getAuthHeaders() }
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Student score adjusted successfully",
        });
        
        // Return updated assessment data
        const updatedAssessment = await this.getProjectAssessment(projectId);
        if (updatedAssessment.success && updatedAssessment.data) {
          const updatedStudent = updatedAssessment.data.students.find(s => s.studentId === studentId);
          if (updatedStudent) {
            return { success: true, data: updatedStudent };
          }
        }
        
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      console.error('Error adjusting student score:', error);
      const message = error.response?.data?.message || 'Failed to adjust student score';
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