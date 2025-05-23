import axiosInstance from './axiosInstance';
import { Notification, NotificationResponse, NotificationType } from '@/types/notification';

class NotificationService {  // Retrieve all notifications for the current user
  async getNotifications(): Promise<NotificationResponse> {
    try {
      // Call the backend API
      const response = await axiosInstance.get('/api/notifications');
      return response.data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }
  // Mark a notification as read with retry mechanism
  async markAsRead(notificationId: number, retryCount = 2): Promise<boolean> {
    try {
      const response = await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      
      // Verify the response contains success flag
      if (response.data && response.data.success === true) {
        return true;
      } else if (retryCount > 0) {
        // If response doesn't indicate success, retry
        console.log(`Retrying markAsRead for notification ${notificationId}, ${retryCount} attempts left`);
        return this.markAsRead(notificationId, retryCount - 1);
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (retryCount > 0) {
        // If there's an error, retry
        console.log(`Retrying markAsRead after error for notification ${notificationId}, ${retryCount} attempts left`);
        return this.markAsRead(notificationId, retryCount - 1);
      }
      return false;
    }
  }
  // Mark all notifications as read with retry mechanism
  async markAllAsRead(retryCount = 2): Promise<boolean> {
    try {
      const response = await axiosInstance.put('/api/notifications/read-all');
      
      // Verify the response contains success flag
      if (response.data && response.data.success === true) {
        return true;
      } else if (retryCount > 0) {
        // If response doesn't indicate success, retry
        console.log(`Retrying markAllAsRead, ${retryCount} attempts left`);
        return this.markAllAsRead(retryCount - 1);
      }
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      if (retryCount > 0) {
        // If there's an error, retry
        console.log(`Retrying markAllAsRead after error, ${retryCount} attempts left`);
        return this.markAllAsRead(retryCount - 1);
      }
      return false;
    }
  }
  // Delete a notification
  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      const response = await axiosInstance.delete(`/api/notifications/${notificationId}`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

// Hook to use the notification service
export const useNotificationService = () => {
  return notificationService;
};

export default notificationService;
