import { PressureStatus } from './enums';

/**
 * Represents a user's pressure score data
 */
export interface PressureScoreResponse {
  userId: number;
  username: string;
  fullName: string;
  pressureScore: number;
  status: PressureStatus;
  taskCount: number;
  threshold: number;
  thresholdPercentage: number;
  statusDescription: string;
  projectId: number;
  projectName: string;
}
