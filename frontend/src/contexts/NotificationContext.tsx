import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, NotificationResponse } from '@/types/notification';
import { useNotificationService } from '@/services/notificationService';
import { useAuth } from './AuthContext';

// Define the notification context type
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

// Create context with default values
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {}
});

// Provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificationService = useNotificationService();
  const { currentUser } = useAuth();

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (currentUser?.user?.id) {
      fetchNotifications();
      
      // Use polling for notifications (every 30 seconds)
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      // Cleanup on unmount
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [currentUser]);
  // Function to fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications();
      if (response.success && response.data) {
        // Sort notifications: unread first, then by date (newest first)
        const sortedNotifications = [...response.data].sort((a, b) => {
          // First sort by read status
          if (a.read !== b.read) {
            return a.read ? 1 : -1; // Unread first
          }
          // Then sort by date
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setNotifications(sortedNotifications);
        setUnreadCount(response.unreadCount || 0);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };
  // Function to mark a notification as read
  const markAsRead = async (id: number) => {
    try {
      // Update local state immediately for better UX
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      // Update unread count immediately
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Then call API
      const success = await notificationService.markAsRead(id);
      
      // If API call fails, revert changes
      if (!success) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === id ? { ...notification, read: false } : notification
          )
        );
        setUnreadCount(prev => prev + 1);
        setError('Failed to mark notification as read');
      }
    } catch (err) {
      // Revert changes on error
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: false } : notification
        )
      );
      setUnreadCount(prev => prev + 1);
      setError('Failed to mark notification as read');
    }
  };
  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Save current state in case we need to revert
      const previousNotifications = [...notifications];
      const previousUnreadCount = unreadCount;
      
      // Update local state immediately for better UX
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      // Reset unread count immediately 
      setUnreadCount(0);
      
      // Then call API
      const success = await notificationService.markAllAsRead();
      
      // If API call fails, revert changes
      if (!success) {
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        setError('Failed to mark all notifications as read');
      }
    } catch (err) {
      // In case of error, refetch to get accurate state
      fetchNotifications();
      setError('Failed to mark all notifications as read');
    }
  };

  // Function to delete a notification
  const deleteNotification = async (id: number) => {
    try {
      const success = await notificationService.deleteNotification(id);
      if (success) {
        // Remove from local state
        const updatedNotifications = notifications.filter(notification => notification.id !== id);
        setNotifications(updatedNotifications);
        
        // Update unread count if deleted notification was unread
        const deletedNotification = notifications.find(notification => notification.id === id);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      setError('Failed to delete notification');
    }
  };

  // Context value
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  return useContext(NotificationContext);
};
