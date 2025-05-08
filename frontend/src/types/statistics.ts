// Project statistics types

// General project summary
export interface ProjectSummary {
  totalGroups: number;
  totalStudents: number;
  avgGroupSize: number;
  completionRate: number;
}

// Task statistics
export interface TaskStatistics {
  totalTasks: number;
  tasksByStatus: {
    notStarted: number;
    inProgress: number;
    completed: number;
  };
  avgCompletionTime: string;
  onTimeCompletionRate: number;
  tasksByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

// Contribution statistics 
export interface ContributionStatistics {
  avgContributionScore: number;
  groupDistribution: {
    min: number;
    max: number;
    median: number;
  };
  topContributors: {
    studentId: string;
    score: number;
  }[];
  lowContributors: {
    studentId: string;
    score: number;
  }[];
  freeRiderCount: number;
}

// Peer review statistics
export interface PeerReviewStatistics {
  avgReviewScore: number;
  completionRate: number;
  correlationWithTasks: number;
}

// Pressure score analysis
export interface PressureScoreAnalysis {
  avgPressureScore: number;
  highPressureCount: number;
  pressureTrend: {
    week: number;
    avgScore: number;
  }[];
}

// Time-based statistics
export interface TimeStatistics {
  weeklyActivity: {
    week: number;
    taskCount: number;
    commitCount: number;
  }[];
}

// Complete project statistics response
export interface ProjectStatisticsResponse {
  projectSummary: ProjectSummary;
  taskStatistics: TaskStatistics;
  contributionStatistics: ContributionStatistics;
  peerReviewStatistics: PeerReviewStatistics;
  pressureScoreAnalysis: PressureScoreAnalysis;
  timeStatistics: TimeStatistics;
}