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

  async updateTask(taskId: number, task: TaskCreateRequest): Promise<{ success: boolean; message: string; data?: Task }> {
    try {
      const response = await axiosInstance.put(`/api/tasks/${taskId}`, task);
      return { success: true, message: "Task updated successfully", data: response.data };
    } catch (error: any) {
      console.error("Error updating task:", error);
      return { success: false, message: error.response?.data?.message || "Failed to update task" };
    }
  }

  async deleteTask(taskId: number): Promise<{ success: boolean; message: string }> {
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`);
      return { success: true, message: "Task deleted successfully" };
    } catch (error: any) {
      console.error("Error deleting task:", error);
      return { success: false, message: error.response?.data?.message || "Failed to delete task" };
    }
  }

  async assignTask(taskId: number, assigneeId: number): Promise<{ success: boolean; message: string; data?: Task }> {
    try {
      const response = await axiosInstance.put(`/api/tasks/${taskId}/assign/${assigneeId}`);
      return { success: true, message: "Task assigned successfully", data: response.data };
    } catch (error: any) {
      console.error("Error assigning task:", error);
      return { success: false, message: error.response?.data?.message || "Failed to assign task" };
    }
  }
    async updateTaskStatus(taskId: number, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): Promise<{ success: boolean; message: string }> {
    try {
      await axiosInstance.put(`/api/tasks/${taskId}/status?taskStatus=${status}`);
      return { success: true, message: "Task status updated successfully" };
    } catch (error: any) {
      console.error("Error updating task status:", error);
      // Create a structured error response
      const errorResponse = { 
        success: false, 
        message: error.response?.data?.message || "Failed to update task status" 
      };
      // Instead of returning, throw a new error with the structured response
      throw new Error(JSON.stringify(errorResponse));
    }
  }
}

export default new TaskService();
