import { useGetRewards, useGetStats } from "@workspace/api-client-react";
import { HUD } from "@/components/ui/HUD";
import { motion } from "framer-motion";
import { Link } from "wouter";

function StarIcon({ size = 32, color = "#FFD166" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 3 L19.5 12 L30 12 L22 18.5 L25 28 L16 22 L7 28 L10 18.5 L2 12 L12.5 12 Z"
        fill={color}
        stroke="#D4930A"
        strokeWidth="0.8"
      />
    </svg>
  );
}

function CrystalIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4 L24 12 L24 22 L16 28 L8 22 L8 12 Z" fill="#4ECDC4" stroke="#2B9B93" strokeWidth="1"/>
      <path d="M16 4 L24 12 L16 14 L8 12 Z" fill="#6BE5DE" opacity="0.8"/>
      <path d="M16 4 L16 14" stroke="#A0F0EC" strokeWidth="1" opacity="0.6"/>
      <path d="M8 12 L16 14 L24 12" stroke="#A0F0EC" strokeWidth="0.8" opacity="0.5"/>
    </svg>
  );
}

function CoinIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#F5A623" stroke="#D4830A" strokeWidth="1.5"/>
      <circle cx="16" cy="16" r="10" fill="#FFD166" stroke="#E8960A" strokeWidth="0.5"/>
      <text x="16" y="21" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#D4830A" fontFamily="sans-serif">G</text>
    </svg>
  );
}

function TrophyIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="20" y="38" width="8" height="5" rx="2" fill="#D4930A"/>
      <rect x="16" y="42" width="16" height="3" rx="1.5" fill="#F5A623"/>
      <rect x="19" y="33" width="10" height="6" rx="2" fill="#FFD166"/>
      <path d="M12 10 L12 26 C12 32 18 36 24 36 C30 36 36 32 36 26 L36 10 Z" fill="#FFD166" stroke="#D4930A" strokeWidth="1.5"/>
      <path d="M12 10 L36 10" stroke="#D4930A" strokeWidth="1.5"/>
      <path d="M12 14 C8 14 6 16 6 20 C6 24 8 26 12 26" stroke="#F5A623" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M36 14 C40 14 42 16 42 20 C42 24 40 26 36 26" stroke="#F5A623" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M19 20 L22 24 L29 16" stroke="#D4930A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4 L23 13 L33 13 L25.5 19 L28.5 28 L20 22.5 L11.5 28 L14.5 19 L7 13 L17 13 Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1"/>
      <circle cx="20" cy="17" r="5" fill="white" opacity="0.3"/>
    </svg>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

export default function RewardsPage() {
  const { data: rewards } = useGetRewards();
  const { data: stats } = useGetStats();

  const totalStars = rewards?.totalStars ?? 0;
  const totalCrystals = rewards?.totalCrystals ?? 0;
  const totalCoins = rewards?.totalCoins ?? 0;
  const badges = rewards?.badges ?? [];

  const statCards = [
    {
      label: "Stars",
      value: totalStars,
      icon: <StarIcon size={40} />,
      gradient: "from-[#FFD166] to-[#F5A623]",
      border: "#D4930A",
      glow: "rgba(255,209,102,0.3)",
    },
    {
      label: "Crystals",
      value: totalCrystals,
      icon: <CrystalIcon size={40} />,
      gradient: "from-[#6BE5DE] to-[#4ECDC4]",
      border: "#2B9B93",
      glow: "rgba(78,205,196,0.3)",
    },
    {
      label: "Coins",
      value: totalCoins,
      icon: <CoinIcon size={40} />,
      gradient: "from-[#D498FF] to-[#A05CFF]",
      border: "#6A22C9",
      glow: "rgba(160,92,255,0.3)",
    },
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: "#0D0D2E" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ["#FFD166", "#4ECDC4", "#A78BFA", "white"][i % 4],
              opacity: 0.3 + Math.random() * 0.4,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.4, 1] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <HUD />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-3"
          >
            <TrophyIcon size={56} />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
            Trophy Room
          </h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Your adventure rewards</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.1, type: "spring", bounce: 0.4 }}
              className={`bg-gradient-to-br ${card.gradient} p-4 rounded-[24px] flex flex-col items-center justify-center aspect-square relative overflow-hidden`}
              style={{
                border: `2.5px solid ${card.border}`,
                boxShadow: `0 8px 24px ${card.glow}`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/15 rounded-t-[22px]" />
              <div className="relative z-10 flex flex-col items-center gap-1">
                {card.icon}
                <span className="text-2xl font-black text-white drop-shadow-md">{card.value}</span>
                <span className="text-white/75 font-bold uppercase tracking-wider text-[10px]">
                  {card.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {stats && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-white/8 backdrop-blur-md rounded-[28px] p-6 border border-white/15 mb-6"
          >
            <h2 className="text-white font-black text-lg mb-5 tracking-tight">Adventure Stats</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/60 font-medium">Worlds Completed</span>
                  <span className="text-white font-bold">{stats.totalScenesCompleted} / 10</span>
                </div>
                <ProgressBar value={stats.totalScenesCompleted} max={10} color="linear-gradient(90deg, #FFD166, #F5A623)" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/60 font-medium">Time Exploring</span>
                  <span className="text-white font-bold">{Math.floor(stats.totalPlayTimeSeconds / 60)} mins</span>
                </div>
                <ProgressBar value={Math.min(stats.totalPlayTimeSeconds, 1800)} max={1800} color="linear-gradient(90deg, #6BE5DE, #4ECDC4)" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/60 font-medium">Journey Complete</span>
                  <span className="text-white font-bold">{Math.round(stats.completionPercentage)}%</span>
                </div>
                <ProgressBar value={stats.completionPercentage} max={100} color="linear-gradient(90deg, #D498FF, #A05CFF)" />
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="bg-white/8 backdrop-blur-md rounded-[28px] p-6 border border-white/15"
        >
          <h2 className="text-white font-black text-lg mb-4 tracking-tight">Badges</h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {badges.map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, type: "spring" }}
                  className="bg-white/10 aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border-2 border-white/20"
                >
                  <BadgeIcon />
                  <span className="text-[9px] font-bold text-white/80 leading-tight mt-1 line-clamp-2">{badge}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center gap-3">
              <TrophyIcon size={48} />
              <p className="text-white/50 font-medium text-sm">Keep playing to earn badges!</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex justify-center"
        >
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-[#FFD166] text-[#1A1A4E] font-black px-7 py-3.5 rounded-full cursor-pointer shadow-[0_6px_0_#D4930A]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2 L9 2 C9 2 3 6 3 11 C3 14 6 16 9 16 C12 16 15 14 15 11 C15 6 9 2 9 2Z" fill="#1A1A4E" opacity="0.3"/>
                <path d="M2 9 L9 2.5 L16 9" stroke="#1A1A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 7.5 L4 15 L14 15 L14 7.5" stroke="#1A1A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Adventure
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
