import React, { useRef, useEffect, useState } from 'react';
import { animations, animateOnScroll } from '../../lib/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: 'fade' | 'slide' | 'scale' | 'flip';
  hoverEffect?: boolean;
  gradient?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0,
  variant = 'fade',
  hoverEffect = true,
  gradient = 'from-white/5 to-white/10'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!cardRef.current || hasAnimated) return;

    // Generate unique class for this card instance
    const uniqueClass = `animated-card-${Math.random().toString(36).substr(2, 9)}`;
    cardRef.current.classList.add(uniqueClass);

    // Animation map for different variants
    const animationMap = {
      fade: () => {
        if (cardRef.current) {
          animations.page.fadeIn(cardRef.current, delay);
          setHasAnimated(true);
        }
      },
      slide: () => {
        if (cardRef.current) {
          animations.page.slideInFromRight(cardRef.current, delay);
          setHasAnimated(true);
        }
      },
      scale: () => {
        if (cardRef.current) {
          animations.page.scaleIn(cardRef.current, delay);
          setHasAnimated(true);
        }
      },
      flip: () => {
        if (cardRef.current) {
          animations.page.slideInFromLeft(cardRef.current, delay);
          setHasAnimated(true);
        }
      }
    };

    // Use the unique class selector for animateOnScroll
    animateOnScroll(`.${uniqueClass}`, animationMap[variant]);

    // Cleanup function to prevent memory leaks
    return () => {
      const element = document.querySelector(`.${uniqueClass}`);
      if (element) {
        element.classList.remove(uniqueClass);
      }
    };
  }, []); // Empty dependency array to run only once

  const handleMouseEnter = () => {
    if (hoverEffect && cardRef.current) {
      animations.card.hoverScale(cardRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (hoverEffect && cardRef.current) {
      animations.card.hoverReset(cardRef.current);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`
        bg-gradient-to-br ${gradient} 
        backdrop-blur-sm 
        rounded-2xl 
        border border-white/10 
        transition-all duration-500 
        hover:border-purple-400/50 
        hover:shadow-xl 
        hover:shadow-purple-500/10
        cursor-pointer
        opacity-0
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default AnimatedCard; 