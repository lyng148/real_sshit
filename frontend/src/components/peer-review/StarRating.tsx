import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  className
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    if (disabled) return;
    setHoverValue(index);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverValue(null);
  };

  const handleClick = (index: number) => {
    if (disabled) return;
    onChange(index);
  };

  return (
    <div className={cn("flex items-center", className)}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          size={24}
          className={cn(
            "cursor-pointer transition-all duration-200",
            {
              "text-yellow-400 fill-yellow-400": (hoverValue !== null ? index <= hoverValue : index <= value),
              "text-gray-300": (hoverValue !== null ? index > hoverValue : index > value),
              "cursor-not-allowed opacity-70": disabled
            }
          )}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
};

export default StarRating;
