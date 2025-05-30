import React, { useRef } from 'react';
import { animations } from '../../lib/animations';
import LoadingSpinner from './LoadingSpinner';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  effect?: 'click' | 'pulse' | 'glow' | 'ripple';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  effect = 'click',
  onClick,
  disabled,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseClasses = 'relative overflow-hidden font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white focus:ring-purple-500 shadow-lg hover:shadow-xl hover:shadow-purple-500/25',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white focus:ring-gray-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white focus:ring-purple-500 hover:shadow-lg hover:shadow-purple-400/25',
    ghost: 'text-purple-400 hover:bg-purple-400/10 focus:ring-purple-500 hover:shadow-lg'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;

    // Apply animation effect
    if (buttonRef.current) {
      switch (effect) {
        case 'click':
          animations.button.click(buttonRef.current);
          break;
        case 'pulse':
          animations.button.pulse(buttonRef.current);
          break;
        case 'glow':
          // Custom glow effect
          buttonRef.current.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.6)';
          setTimeout(() => {
            if (buttonRef.current) {
              buttonRef.current.style.boxShadow = '';
            }
          }, 300);
          break;
        case 'ripple':
          createRippleEffect(e);
          break;
      }
    }

    if (onClick) {
      onClick(e);
    }
  };

  const createRippleEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
      z-index: 10;
    `;

    // Add keyframes for ripple animation
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    button.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  return (
    <button
      ref={buttonRef}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" variant="spinner" />
          <span>Đang xử lý...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default AnimatedButton; 