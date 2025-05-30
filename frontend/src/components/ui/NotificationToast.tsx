import React, { useEffect, useRef, useState } from 'react';
import { animations } from '../../lib/animations';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onRemove: (id: string) => void;
}

const NotificationToast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onRemove
}) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/50',
      iconColor: 'text-green-400'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'from-red-500/20 to-rose-500/20',
      borderColor: 'border-red-500/50',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/50',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: Info,
      bgColor: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/50',
      iconColor: 'text-blue-400'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  useEffect(() => {
    if (toastRef.current) {
      // Entrance animation
      animations.notification.slideInFromTop(toastRef.current);
      setIsVisible(true);

      // Auto remove after duration
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleRemove = () => {
    if (toastRef.current) {
      animations.notification.slideOutToTop(toastRef.current).then(() => {
        onRemove(id);
      });
    }
  };

  return (
    <div
      ref={toastRef}
      className={`
        fixed top-4 right-4 z-50 min-w-80 max-w-md
        bg-gradient-to-r ${config.bgColor}
        backdrop-blur-sm border ${config.borderColor}
        rounded-lg shadow-xl
        p-4
        opacity-0
      `}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">{title}</h4>
          {message && (
            <p className="text-gray-300 text-sm mt-1">{message}</p>
          )}
        </div>

        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-white transition-colors duration-200 ml-2"
          aria-label="Đóng thông báo"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-lg overflow-hidden">
        <div 
          className={`h-full ${config.iconColor.replace('text-', 'bg-')} transition-all ease-linear`}
          style={{
            width: '100%',
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ transform: `translateY(${index * 10}px)` }}>
          <NotificationToast {...toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};

export default NotificationToast; 