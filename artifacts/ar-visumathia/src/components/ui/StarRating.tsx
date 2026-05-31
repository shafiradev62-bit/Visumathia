import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ rating, maxStars = 3, className, size = 'md' }: StarRatingProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: i * 0.1
          }}
        >
          <Star
            className={cn(
              sizes[size],
              i < rating 
                ? "fill-yellow-400 text-yellow-500 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" 
                : "fill-gray-200 text-gray-300"
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}
