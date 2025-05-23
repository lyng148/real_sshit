import axiosInstance from './axiosInstance';

interface ProjectCreateRequest {
  name: string;
  description: string;
  maxMembers: number;
  evaluationCriteria: string;
  weightW1: number;
  weightW2: number;
  weightW3: number;
  weightW4: number;
  freeriderThreshold: number;
  pressureThreshold: number;
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
      const response = await axiosInstance.get(`/api/projects/${id}/statistics`);
      return response.data;
    } catch (error) {
      console.error("Error in getProjectStatistics:", error);
      throw error;
    }
  }

  async getGroupStatistics(groupId: number) {
    try {
      // Attempt to get group statistics data using available APIs
      try {
        // Get basic group info
        const groupInfoResponse = await axiosInstance.get(`/api/groups/${groupId}`);
        
        // Get all tasks for the group
        const tasksResponse = await axiosInstance.get(`/api/tasks/group/${groupId}`);
        
        // Get commit history for the group
        const commitsResponse = await axiosInstance.get(`/api/github/commits/group/${groupId}`);
        
        // Get contribution data for the group
        const contributionsResponse = await axiosInstance.get(`/api/contribution-scores/groups/${groupId}`);

        // Process tasks data to extract statistics
        const tasks = tasksResponse.data.data || [];
        const taskStatistics = this.processTaskStatistics(tasks);
        
        // Get the most recent tasks (limit to 5)
        const recentTasks = [...tasks]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);

        // Process contribution data from API response
        const contributionScores = contributionsResponse.data.data || [];
        
        // Transform contribution scores to match expected format for the UI
        const memberContributions = contributionScores.map(score => {
          // Count tasks in different states for this user
          const userTasks = tasks.filter(task => task.assigneeId === score.userId);
          const completedTasks = userTasks.filter(task => task.status === 'COMPLETED').length;
          const inProgressTasks = userTasks.filter(task => task.status === 'IN_PROGRESS').length;
          const notStartedTasks = userTasks.filter(task => task.status === 'NOT_STARTED').length;
          
          // Check if this user is the group leader
          const isLeader = score.userId === groupInfoResponse.data.data?.leader?.id;
          
          // Use adjusted score if available, otherwise use calculated score, and round to 1 decimal place
          const contributionScore = parseFloat((score.adjustedScore || score.calculatedScore).toFixed(1));
          
          return {
            id: score.userId,
            name: score.fullName,
            username: score.username,
            email: score.email,
            isLeader,
            completedTasks,
            inProgressTasks,
            notStartedTasks,
            contributionScore,
            contributionFactors: {
              taskCompletion: parseFloat(score.taskCompletionScore.toFixed(1)),
              peerReview: parseFloat(score.peerReviewScore.toFixed(1)),
              commitCount: parseFloat(score.commitCount.toFixed(1)),
              lateTaskCount: parseFloat((score.lateTaskCount || 0).toFixed(1))
            }
          };
        });
        
        // Calculate contribution statistics with 1 decimal place
        const contributionScoreValues = memberContributions.map(member => member.contributionScore);
        const avgContributionScore = contributionScoreValues.length > 0
          ? parseFloat((contributionScoreValues.reduce((sum, score) => sum + score, 0) / contributionScoreValues.length).toFixed(1))
          : 0;
          
        const contributionStatistics = {
          avgContributionScore,
          highestScore: contributionScoreValues.length > 0 
            ? parseFloat(Math.max(...contributionScoreValues).toFixed(1))
            : 0,
          lowestScore: contributionScoreValues.length > 0 
            ? parseFloat(Math.min(...contributionScoreValues).toFixed(1)) 
            : 0
        };

        // Process commit data for time statistics
        const commits = commitsResponse.data.data || [];
        const timeStatistics = this.processTimeStatistics(tasks, commits);

        // Combine all responses into one object
        return {
          success: true,
          message: 'Group statistics retrieved successfully',
          data: {
            groupInfo: groupInfoResponse.data.data,
            taskStatistics,
            memberContributions,
            contributionStatistics,
            timeStatistics,
            recentTasks
          }
        };
      } catch (apiError) {
        console.error("Error fetching group statistics from API:", apiError);
        throw apiError;
      }
    } catch (error) {
      console.error("Error in getGroupStatistics:", error);
      throw error;
    }
  }
  
  // Get project access code
  async getProjectAccessCode(projectId: number) {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/access-code`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get QR code URL for a project (returns the URL to fetch the QR code image)
  getProjectQRCodeUrl(projectId: number) {
    return `${axiosInstance.defaults.baseURL}/api/projects/${projectId}/qrcode`;
  }
  
  // Join a project with access code
  async joinProjectWithAccessCode(accessCode: string) {
    try {
      const response = await axiosInstance.post('/api/projects/join', {
        accessCode: accessCode
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Invite students to a project
  async inviteStudentsToProject(projectId: number, usernames: string[]) {
    try {
      const response = await axiosInstance.post(`/api/projects/${projectId}/invite`, {
        usernames: usernames
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Remove a student from a project
  async removeStudentFromProject(projectId: number, studentId: number) {
    try {
      const response = await axiosInstance.delete(`/api/projects/${projectId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Process task data to extract statistics
  private processTaskStatistics(tasks) {
    // Calculate statistics from task data
    const totalTasks = tasks.length;
    
    const tasksByStatus = {
      notStarted: tasks.filter(task => task.status === 'NOT_STARTED').length,
      inProgress: tasks.filter(task => task.status === 'IN_PROGRESS').length,
      completed: tasks.filter(task => task.status === 'COMPLETED').length,
    };
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 
      ? Math.round((tasksByStatus.completed / totalTasks) * 100) 
      : 0;
    
    // Calculate average completion time for completed tasks that have completedAt
    const completedTasks = tasks.filter(task => 
      task.status === 'COMPLETED' && task.completedAt && task.createdAt
    );
    
    let avgCompletionTime = 'N/A';
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const created = new Date(task.createdAt);
        const completed = new Date(task.completedAt);
        const diffTime = Math.abs(completed.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      
      const avgDays = Math.round(totalDays / completedTasks.length);
      avgCompletionTime = `${avgDays} days`;
    }
    
    // Calculate on-time completion rate
    const onTimeCompletedTasks = completedTasks.filter(task => {
      const completed = new Date(task.completedAt);
      const deadline = new Date(task.deadline);
      return completed <= deadline;
    });
    
    const onTimeCompletionRate = completedTasks.length > 0
      ? Math.round((onTimeCompletedTasks.length / completedTasks.length) * 100)
      : 0;
    
    return {
      totalTasks,
      tasksByStatus,
      completionRate,
      avgCompletionTime,
      onTimeCompletionRate
    };
  }

  // Process time-based statistics
  private processTimeStatistics(tasks, commits) {
    // Group tasks and commits by week
    const weekMap = new Map();
    
    // Process tasks
    tasks.forEach(task => {
      const date = new Date(task.updatedAt || task.createdAt);
      const weekNumber = this.getWeekNumber(date);
      
      if (!weekMap.has(weekNumber)) {
        weekMap.set(weekNumber, { week: weekNumber, taskCount: 0, commitCount: 0 });
      }
      
      const weekData = weekMap.get(weekNumber);
      weekData.taskCount++;
    });
    
    // Process commits
    commits.forEach(commit => {
      const date = new Date(commit.timestamp);
      const weekNumber = this.getWeekNumber(date);
      
      if (!weekMap.has(weekNumber)) {
        weekMap.set(weekNumber, { week: weekNumber, taskCount: 0, commitCount: 0 });
      }
      
      const weekData = weekMap.get(weekNumber);
      weekData.commitCount++;
    });
    
    // Convert map to array and sort by week
    const weeklyActivity = Array.from(weekMap.values())
      .sort((a, b) => a.week - b.week);
    
    return {
      weeklyActivity
    };
  }
  
  // Helper function to get week number
  private getWeekNumber(date) {
    // Get first day of the year
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    // Calculate the difference in days
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    // Return the week number
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

export default new ProjectService();