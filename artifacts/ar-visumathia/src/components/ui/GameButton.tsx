import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GameButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'outline' | 'dark' | 'danger' | 'wood';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

/**
 * Handpainted cartoon button — chunky border, offset shadow, solid color fills.
 * Matches the reference game's button style perfectly.
 */
export const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      primary:   { background: '#2E86C1', color: '#fff' },
      secondary: { background: '#E8B830', color: '#2D1B0E' },
      accent:    { background: '#E07B39', color: '#fff' },
      success:   { background: '#4A9E3F', color: '#fff' },
      danger:    { background: '#C0392B', color: '#fff' },
      outline:   { background: '#F5E8C8', color: '#2D1B0E' },
      dark:      { background: '#3D2055', color: '#fff' },
      wood:      { background: '#8B5E3C', color: '#FFE555' },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm:   { padding: '6px 14px', fontSize: '0.8rem' },
      md:   { padding: '10px 22px', fontSize: '0.95rem' },
      lg:   { padding: '13px 28px', fontSize: '1.05rem' },
      icon: { padding: '10px', fontSize: '1rem' },
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ x: 3, y: 4 }}
        style={{
          border: '3px solid #2D1B0E',
          borderRadius: 12,
          boxShadow: '4px 5px 0 #2D1B0E',
          fontFamily: "'Fredoka One', cursive",
          letterSpacing: '0.01em',
          cursor: 'pointer',
          transition: 'box-shadow 0.08s, transform 0.08s',
          ...variantStyles[variant],
          ...sizeStyles[size],
        }}
        className={cn("active:shadow-none", className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
GameButton.displayName = 'GameButton';
