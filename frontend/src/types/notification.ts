// Define notification types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: NotificationType;
  data?: any; // Additional data for specific notification types
  link?: string; // Optional link to redirect when clicked
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  PEER_REVIEW_ASSIGNED = 'PEER_REVIEW_ASSIGNED',
  PEER_REVIEW_COMPLETED = 'PEER_REVIEW_COMPLETED',
  PEER_REVIEW_REQUIRED = 'PEER_REVIEW_REQUIRED',
  PEER_REVIEW_REMINDER = 'PEER_REVIEW_REMINDER',
  GROUP_INVITATION = 'GROUP_INVITATION',
  PROJECT_INVITATION = 'PROJECT_INVITATION',
  PROJECT_NOTIFICATION = 'PROJECT_NOTIFICATION',
  FREE_RIDER_ALERT = 'FREE_RIDER_ALERT',
  PRESSURE_SCORE_WARNING = 'PRESSURE_SCORE_WARNING',
  GENERAL = 'GENERAL',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION'
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: Notification[];
  unreadCount?: number;
}
