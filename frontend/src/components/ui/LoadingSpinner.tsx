import React, { useEffect, useRef } from 'react';
import { animations } from '../../lib/animations';
import { animate, stagger } from 'animejs';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  className = '' 
}) => {
  const spinnerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  useEffect(() => {
    if (!spinnerRef.current) return;

    switch (variant) {
      case 'spinner':
        animations.loading.spinner(spinnerRef.current);
        break;
      case 'dots':
        animations.loading.dots('.loading-dot');
        break;
      case 'pulse':
        animate(spinnerRef.current, {
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
          duration: 1000,
          loop: true,
          easing: 'easeInOutSine'
        });
        break;
      case 'wave':
        animate('.wave-bar', {
          scaleY: [0.5, 1.5, 0.5],
          duration: 1200,
          delay: stagger(150),
          loop: true,
          easing: 'easeInOutSine'
        });
        break;
    }
  }, [variant]);

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div 
            ref={spinnerRef}
            className={`${sizeClasses[size]} border-2 border-purple-200 border-t-purple-600 rounded-full`}
          />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map(i => (
              <div 
                key={i}
                className={`loading-dot ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} bg-purple-600 rounded-full`}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div 
            ref={spinnerRef}
            className={`${sizeClasses[size]} bg-gradient-to-r from-purple-600 to-pink-600 rounded-full`}
          />
        );
      
      case 'wave':
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div 
                key={i}
                className={`wave-bar ${size === 'sm' ? 'w-1 h-4' : size === 'md' ? 'w-1.5 h-6' : 'w-2 h-8'} bg-gradient-to-t from-purple-600 to-pink-600 rounded-full origin-bottom`}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <div 
            ref={spinnerRef}
            className={`${sizeClasses[size]} border-2 border-purple-200 border-t-purple-600 rounded-full`}
          />
        );
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderSpinner()}
    </div>
  );
};

export default LoadingSpinner; 