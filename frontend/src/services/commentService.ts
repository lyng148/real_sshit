import axiosInstance from './axiosInstance';

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  taskId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentCreateRequest {
  content: string;
  taskId: number;
}

class CommentService {
  async getCommentsByTaskId(taskId: number): Promise<Comment[]> {
    try {
      const response = await axiosInstance.get(`/api/comments/task/${taskId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async createComment(comment: CommentCreateRequest): Promise<Comment> {
    try {
      const response = await axiosInstance.post('/api/comments', comment);
      return response.data.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async updateComment(commentId: number, content: string): Promise<Comment> {
    try {
      const response = await axiosInstance.put(`/api/comments/${commentId}`, { content });
      return response.data.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/comments/${commentId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export default new CommentService();
