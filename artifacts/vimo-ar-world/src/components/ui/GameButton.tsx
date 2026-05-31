import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GameButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "accent";
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "cloud" | "star" | "pill" | "blob";
}

export function GameButton({
  children,
  variant = "primary",
  size = "md",
  shape = "pill",
  className,
  ...props
}: GameButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-sans font-bold text-white transition-all duration-200 outline-none select-none press-down shine overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-b from-[#FFD166] to-[#F5A623] text-white shadow-[0_8px_0_#D35400,0_12px_24px_rgba(0,0,0,0.25)] border-2 border-[#D4930A]",
    secondary: "bg-gradient-to-b from-[#6BE5DE] to-[#4ECDC4] text-white shadow-[0_8px_0_#2B9B93,0_12px_24px_rgba(0,0,0,0.25)] border-2 border-[#1A6A66]",
    danger: "bg-gradient-to-b from-[#FF8C8C] to-[#FF5E5E] text-white shadow-[0_8px_0_#C93030,0_12px_24px_rgba(0,0,0,0.25)] border-2 border-[#A02222]",
    success: "bg-gradient-to-b from-[#8EF08C] to-[#5CD65C] text-white shadow-[0_8px_0_#2D9B2D,0_12px_24px_rgba(0,0,0,0.25)] border-2 border-[#1A7A1A]",
    accent: "bg-gradient-to-b from-[#D498FF] to-[#A05CFF] text-white shadow-[0_8px_0_#6A22C9,0_12px_24px_rgba(0,0,0,0.25)] border-2 border-[#4A1A9A]",
  };

  const sizes = {
    sm: "px-5 py-2 text-sm",
    md: "px-7 py-3.5 text-lg tracking-wide",
    lg: "px-9 py-4.5 text-xl tracking-wider",
    xl: "px-11 py-5.5 text-2xl tracking-widest",
  };

  const shapes = {
    pill: "rounded-full",
    cloud: "rounded-[30px_30px_10px_10px]",
    star: "rounded-[20px]",
    blob: "rounded-[40px_20px_30px_50px]",
  };

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], shapes[shape], className)}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95, y: 6, boxShadow: "0_3px_0_rgba(0,0,0,0.2),0_6px_12px_rgba(0,0,0,0.2)" }}
      {...props}
    >
      <div className="absolute inset-0 rounded-inherit overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/25 rounded-t-inherit" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent rounded-b-inherit" />
      </div>
      <span className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">{children}</span>
    </motion.button>
  );
}
