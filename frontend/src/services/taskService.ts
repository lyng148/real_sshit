
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
  assigneeAvatarUrl?: string | null;
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
  assigneeId?: number | undefined;
  groupId: number;
}

class TaskService {
  async getTasks(groupId: number): Promise<any> {
    try {
      const response = await axiosInstance.get(`/api/tasks/group/${groupId}`);
      // Return the full response, as the API returns a structured response
      // with data nested under a 'data' property 
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }
  async getTaskById(taskId: number): Promise<any> {
    try {
      const response = await axiosInstance.get(`/api/tasks/${taskId}`);
      // Return the data part directly, handling both formats
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      throw error;
    }
  }
  
  async createTask(task: TaskCreateRequest): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/tasks', task);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(taskId: number, task: TaskCreateRequest): Promise<Task> {
    const response = await axiosInstance.put(`/api/tasks/${taskId}`, task);
    return response.data;
  }

  async deleteTask(taskId: number): Promise<void> {
    await axiosInstance.delete(`/api/tasks/${taskId}`);
  }

  async assignTask(taskId: number, assigneeId: number): Promise<Task> {
    const response = await axiosInstance.put(`/api/tasks/${taskId}/assign/${assigneeId}`);
    return response.data;
  }
  
  async updateTaskStatus(taskId: number, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): Promise<any> {
    try {
      // Based on the controller's implementation, the status is a query param, not part of the path
      const response = await axiosInstance.put(`/api/tasks/${taskId}/status?taskStatus=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }
}

export default new TaskService();
