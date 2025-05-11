
import { Task as ApiTask } from '@/services/taskService';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'completed';
  assignee?: string;
  assigneeName?: string;
  assigneeAvatarUrl?: string;
  dueDate?: string;
  originalTask?: ApiTask;
}
