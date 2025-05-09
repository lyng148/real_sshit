import axiosInstance from './axiosInstance';

export interface Task {
  id: number;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deadline: string;
  assigneeId: number | null;
  assigneeName: string | null;
  groupId: number;
  groupName: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  pressureWarning: string | null;
}

export interface TaskCreateRequest {
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deadline: string;
  assigneeId?: number;
  groupId: number;
}

class TaskService {
  async getTasks(groupId: number): Promise<Task[]> {
    const response = await axiosInstance.get(`/tasks/group/${groupId}`);
    return response.data;
  }

  async getTaskById(taskId: number): Promise<Task> {
    const response = await axiosInstance.get(`/tasks/${taskId}`);
    return response.data;
  }

  async createTask(task: TaskCreateRequest): Promise<Task> {
    const response = await axiosInstance.post('/tasks', task);
    return response.data;
  }

  async updateTask(taskId: number, task: TaskCreateRequest): Promise<Task> {
    const response = await axiosInstance.put(`/tasks/${taskId}`, task);
    return response.data;
  }

  async deleteTask(taskId: number): Promise<void> {
    await axiosInstance.delete(`/tasks/${taskId}`);
  }

  async assignTask(taskId: number, assigneeId: number): Promise<Task> {
    const response = await axiosInstance.put(`/tasks/${taskId}/assign/${assigneeId}`);
    return response.data;
  }

  async updateTaskStatus(taskId: number, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): Promise<Task> {
    const response = await axiosInstance.put(`/tasks/${taskId}/status/${status}`);
    return response.data;
  }
}

export default new TaskService();
