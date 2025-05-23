// Contribution Score types
export interface ContributionFactors {
  taskCompletion: number;
  peerReview: number;
  commitCount: number;
  lateTaskCount: number;
}

export interface ContributionScoreResponse {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  projectId: number;
  projectName: string;
  taskCompletionScore: number;
  peerReviewScore: number;
  commitCount: number;
  lateTaskCount: number;
  calculatedScore: number;
  adjustedScore: number;
  adjustmentReason: string | null;
  isFinal: boolean;
  updatedAt: string;
}

export interface ScoreAdjustmentRequest {
  adjustedScore: number;
  adjustmentReason?: string;
}

export interface ContributionTableData {
  id: number;
  userId: number;
  name: string;
  username: string;
  email: string;
  calculatedScore: number;
  adjustedScore: number;
  contributionFactors: ContributionFactors;
  isFinal: boolean;
}
