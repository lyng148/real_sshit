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

// Mock data for group statistics
export const generateMockGroupStatistics = (groupId: number) => {
  return {
    groupInfo: {
      id: groupId,
      name: `Project Group ${groupId}`,
      description: 'This is a sample group description',
      repositoryUrl: 'https://github.com/sample/repo',
      projectId: Math.floor(Math.random() * 10) + 1,
      projectName: `Project ${Math.floor(Math.random() * 10) + 1}`,
      memberCount: Math.floor(Math.random() * 8) + 3,
      maxMembers: 10,
    },
    taskStatistics: {
      totalTasks: Math.floor(Math.random() * 50) + 10,
      tasksByStatus: {
        notStarted: Math.floor(Math.random() * 10),
        inProgress: Math.floor(Math.random() * 15),
        completed: Math.floor(Math.random() * 25),
      },
      avgCompletionTime: `${Math.floor(Math.random() * 5) + 1} days`,
      onTimeCompletionRate: Math.floor(Math.random() * 100),
      completionRate: Math.floor(Math.random() * 100),
    },
    memberContributions: [
      {
        id: 1,
        name: "Nguyễn Văn A",
        isLeader: true,
        completedTasks: Math.floor(Math.random() * 15) + 5,
        inProgressTasks: Math.floor(Math.random() * 5),
        notStartedTasks: Math.floor(Math.random() * 3),
        contributionScore: Math.floor(Math.random() * 20) + 80,
        contributionFactors: {
          taskCompletion: Math.floor(Math.random() * 10) + 20,
          peerReview: Math.floor(Math.random() * 10) + 20,
          commitCount: Math.floor(Math.random() * 10) + 20,
          taskDifficulty: Math.floor(Math.random() * 10) + 20,
        }
      },
      {
        id: 2,
        name: "Trần Thị B",
        isLeader: false,
        completedTasks: Math.floor(Math.random() * 12) + 3,
        inProgressTasks: Math.floor(Math.random() * 6),
        notStartedTasks: Math.floor(Math.random() * 4),
        contributionScore: Math.floor(Math.random() * 30) + 60,
        contributionFactors: {
          taskCompletion: Math.floor(Math.random() * 10) + 15,
          peerReview: Math.floor(Math.random() * 10) + 15,
          commitCount: Math.floor(Math.random() * 10) + 15,
          taskDifficulty: Math.floor(Math.random() * 10) + 15,
        }
      },
      {
        id: 3,
        name: "Lê Văn C",
        isLeader: false,
        completedTasks: Math.floor(Math.random() * 10) + 2,
        inProgressTasks: Math.floor(Math.random() * 7),
        notStartedTasks: Math.floor(Math.random() * 5),
        contributionScore: Math.floor(Math.random() * 40) + 40,
        contributionFactors: {
          taskCompletion: Math.floor(Math.random() * 10) + 10,
          peerReview: Math.floor(Math.random() * 10) + 10,
          commitCount: Math.floor(Math.random() * 10) + 10,
          taskDifficulty: Math.floor(Math.random() * 10) + 10,
        }
      }
    ],
    contributionStatistics: {
      avgContributionScore: Math.floor(Math.random() * 30) + 60,
      highestScore: Math.floor(Math.random() * 10) + 90,
      lowestScore: Math.floor(Math.random() * 30) + 30,
    },
    timeStatistics: {
      weeklyActivity: [
        { week: 1, taskCount: Math.floor(Math.random() * 10), commitCount: Math.floor(Math.random() * 20) },
        { week: 2, taskCount: Math.floor(Math.random() * 10), commitCount: Math.floor(Math.random() * 20) },
        { week: 3, taskCount: Math.floor(Math.random() * 10), commitCount: Math.floor(Math.random() * 20) },
        { week: 4, taskCount: Math.floor(Math.random() * 10), commitCount: Math.floor(Math.random() * 20) }
      ]
    },
    recentTasks: [
      {
        id: 1,
        title: "Implement user authentication",
        assigneeId: 1,
        assigneeName: "Nguyễn Văn A",
        status: "COMPLETED",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        title: "Design database schema",
        assigneeId: 2,
        assigneeName: "Trần Thị B",
        status: "IN_PROGRESS",
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        title: "Create API documentation",
        assigneeId: 3,
        assigneeName: "Lê Văn C",
        status: "NOT_STARTED",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
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
  
  async getGroupStatistics(groupId: number) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      message: 'Group statistics retrieved successfully',
      data: generateMockGroupStatistics(groupId),
    };
  }
}

export default new MockStatisticsService();