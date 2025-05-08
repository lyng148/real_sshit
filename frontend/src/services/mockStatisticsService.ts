import { ProjectStatisticsResponse } from '@/types/statistics';

// Mock data for project statistics
export const generateMockStatistics = (projectId: number): ProjectStatisticsResponse => {
  return {
    projectSummary: {
      totalGroups: Math.floor(Math.random() * 10) + 1,
      totalStudents: Math.floor(Math.random() * 50) + 10,
      avgGroupSize: Math.floor(Math.random() * 5) + 3,
      completionRate: Math.floor(Math.random() * 100),
    },
    taskStatistics: {
      totalTasks: Math.floor(Math.random() * 100) + 20,
      tasksByStatus: {
        notStarted: Math.floor(Math.random() * 30),
        inProgress: Math.floor(Math.random() * 40),
        completed: Math.floor(Math.random() * 50),
      },
      avgCompletionTime: `${Math.floor(Math.random() * 7) + 1} days`,
      onTimeCompletionRate: Math.floor(Math.random() * 100),
      tasksByDifficulty: {
        easy: Math.floor(Math.random() * 30),
        medium: Math.floor(Math.random() * 40),
        hard: Math.floor(Math.random() * 30),
      },
    },
    contributionStatistics: {
      avgContributionScore: Math.floor(Math.random() * 100),
      groupDistribution: {
        min: Math.floor(Math.random() * 40) + 10,
        max: Math.floor(Math.random() * 30) + 70,
        median: Math.floor(Math.random() * 20) + 50,
      },
      topContributors: [
        { studentId: `student${Math.floor(Math.random() * 100)}`, score: Math.floor(Math.random() * 20) + 80 },
        { studentId: `student${Math.floor(Math.random() * 100)}`, score: Math.floor(Math.random() * 10) + 80 },
      ],
      lowContributors: [
        { studentId: `student${Math.floor(Math.random() * 100)}`, score: Math.floor(Math.random() * 20) },
        { studentId: `student${Math.floor(Math.random() * 100)}`, score: Math.floor(Math.random() * 10) + 20 },
      ],
      freeRiderCount: Math.floor(Math.random() * 5),
    },
    peerReviewStatistics: {
      avgReviewScore: (Math.random() * 4) + 1,
      completionRate: Math.floor(Math.random() * 100),
      correlationWithTasks: Math.random() * 0.9,
    },
    pressureScoreAnalysis: {
      avgPressureScore: Math.floor(Math.random() * 100),
      highPressureCount: Math.floor(Math.random() * 10),
      pressureTrend: [
        { week: 1, avgScore: Math.floor(Math.random() * 40) },
        { week: 2, avgScore: Math.floor(Math.random() * 40) + 20 },
        { week: 3, avgScore: Math.floor(Math.random() * 40) + 30 },
      ],
    },
    timeStatistics: {
      weeklyActivity: [
        { week: 1, taskCount: Math.floor(Math.random() * 20), commitCount: Math.floor(Math.random() * 40) },
        { week: 2, taskCount: Math.floor(Math.random() * 20), commitCount: Math.floor(Math.random() * 40) },
        { week: 3, taskCount: Math.floor(Math.random() * 20), commitCount: Math.floor(Math.random() * 40) },
      ]
    },
  };
};

class MockStatisticsService {
  async getProjectStatistics(projectId: number) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: generateMockStatistics(projectId),
    };
  }
}

export default new MockStatisticsService();