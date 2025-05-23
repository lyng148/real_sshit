import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification, NotificationType } from '@/types/notification';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';

// Icons for different notification types
const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case NotificationType.TASK_ASSIGNED:
    case NotificationType.TASK_UPDATED:
    case NotificationType.TASK_COMPLETED:
      return <span className="text-blue-500">📋</span>;
    case NotificationType.PEER_REVIEW_REQUIRED:
    case NotificationType.PEER_REVIEW_REMINDER:
      return <span className="text-purple-500">🔄</span>;
    case NotificationType.FREE_RIDER_ALERT:
      return <span className="text-red-500">⚠️</span>;
    case NotificationType.PRESSURE_SCORE_WARNING:
      return <span className="text-orange-500">📊</span>;
    default:
      return <span className="text-gray-500">📢</span>;
  }
};

// Component to display an individual notification
const NotificationItem = ({ notification, onRead }: { notification: Notification, onRead: (id: number) => void }) => {
  const navigate = useNavigate();
  const [isReadLocally, setIsReadLocally] = useState(notification.read);
  
  // Update local read state when the notification prop changes
  useEffect(() => {
    setIsReadLocally(notification.read);
  }, [notification.read]);
  
  const handleClick = () => {
    // Only mark as read if not already read
    if (!isReadLocally) {
      // Update local state immediately for better UX
      setIsReadLocally(true);
      // Call the markAsRead function
      onRead(notification.id);
    }
    
    // Navigate if there's a link
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  return (
    <div 
      className={cn(
        "p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
        !isReadLocally && "bg-blue-50"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        <div className="mt-1">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1">
          <p className={cn("text-sm font-medium", !isReadLocally && "font-semibold")}>
            {notification.title}
          </p>
          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
        {!isReadLocally && (
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
        )}
      </div>
    </div>
  );
};

// Main notification bell component
export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center" 
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-[70vh] overflow-hidden flex flex-col">
        <div className="py-2 px-3 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-medium">Thông báo</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => markAllAsRead()}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </div>
        
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Đang tải thông báo...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onRead={markAsRead}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              Không có thông báo
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
