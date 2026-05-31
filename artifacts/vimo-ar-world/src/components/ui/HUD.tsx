import { useGetProgress } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HUD({ className }: { className?: string }) {
  const { data: progress } = useGetProgress();
  const stars = progress?.totalStars ?? 0;
  const crystals = progress?.totalCrystals ?? 0;

  const HUDItem = ({ children, glowColor }: { children: React.ReactNode; glowColor?: string }) => (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white/15 backdrop-blur-xl border-2 border-white/25 rounded-full px-4 h-[52px] flex items-center gap-2 shadow-lg neon-border transition-all duration-200"
      style={{ boxShadow: glowColor ? `0 0 20px ${glowColor}40, 0 4px 12px rgba(0,0,0,0.25)` : undefined }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className={cn("fixed top-0 left-0 w-full p-4 flex justify-between items-start z-50 pointer-events-none", className)}>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="flex gap-3 pointer-events-auto"
      >
        <Link href="/" className="group">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <HUDItem>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/20">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 9 L9 3 L16 9 V16 C16 16.6 15.6 17 15 17 H13 V11 H5 V17 H3 C2.4 17 2 16.6 2 16 Z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </HUDItem>
          </motion.div>
        </Link>

        <Link href="/rewards" className="group">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <HUDItem glowColor="#FFD166">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="game-glow">
                <path d="M10 2 L12.5 7.5 L19 7.5 L14 11.5 L16 18 L10 14 L4 18 L6 11.5 L1 7.5 L7.5 7.5 Z" fill="#FFD166" stroke="#D4930A" strokeWidth="0.7"/>
              </svg>
              <span className="text-white font-black text-lg drop-shadow-md">{stars}</span>
            </HUDItem>
          </motion.div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
        className="pointer-events-auto"
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <HUDItem glowColor="#4ECDC4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="teal-glow">
              <path d="M10 2 L15 8 L15 14 L10 18 L5 14 L5 8 Z" fill="#4ECDC4" stroke="#2B9B93" strokeWidth="1"/>
              <path d="M10 2 L15 8 L10 10 L5 8 Z" fill="#6BE5DE" opacity="0.8"/>
              <line x1="5" y1="8" x2="15" y2="8" stroke="#A0F0EC" strokeWidth="0.8" opacity="0.6"/>
            </svg>
            <span className="text-white font-black text-lg drop-shadow-md">{crystals}</span>
          </HUDItem>
        </motion.div>
      </motion.div>
    </div>
  );
}
