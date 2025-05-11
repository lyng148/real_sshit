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

// Group info
export interface GroupInfo {
  id: number;
  name: string;
  description: string;
  repositoryUrl: string;
  projectId: number;
  projectName: string;
  memberCount: number;
  maxMembers: number;
}

// Group task statistics
export interface GroupTaskStatistics {
  totalTasks: number;
  tasksByStatus: {
    notStarted: number;
    inProgress: number;
    completed: number;
  };
  completionRate: number;
  avgCompletionTime: string;
  onTimeCompletionRate: number;
}

// Member contribution factors
export interface ContributionFactors {
  taskCompletion: number;
  peerReview: number;
  commitCount: number;
  lateTaskCount: number;
}

// Member contribution
export interface MemberContribution {
  id: number;
  name: string;
  isLeader: boolean;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  contributionScore: number;
  contributionFactors: ContributionFactors;
}

// Group contribution statistics
export interface GroupContributionStatistics {
  avgContributionScore: number;
  highestScore: number;
  lowestScore: number;
}

// Recent task
export interface RecentTask {
  id: number;
  title: string;
  assigneeId: number;
  assigneeName: string;
  status: string;
  deadline: string;
}

// Complete group statistics response
export interface GroupStatisticsResponse {
  groupInfo: GroupInfo;
  taskStatistics: GroupTaskStatistics;
  memberContributions: MemberContribution[];
  contributionStatistics: GroupContributionStatistics;
  timeStatistics: TimeStatistics;
  recentTasks: RecentTask[];
}