import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListScenes, useGetProgress } from "@workspace/api-client-react";

const WORLD_THEMES = [
  {
    sceneIndex: 0,
    worldId: 1,
    label: "World 1",
    name: "Enchanted Forest",
    gradFrom: "#1B6E44",
    gradTo: "#2ECC71",
    border: "#52E090",
    glow: "rgba(46,204,113,0.35)",
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="32" r="16" fill="#1B5E38"/>
        <path d="M26 8 C26 8 36 18 40 30 C33 25 19 25 12 30 C16 18 26 8 26 8Z" fill="#2ECC71"/>
        <path d="M26 8 C26 8 18 20 16 32 C20 27 24 25 26 25 C28 25 32 27 36 32 C34 20 26 8 26 8Z" fill="#52E090" opacity="0.55"/>
        <circle cx="17" cy="33" r="2.5" fill="#FFD166" opacity="0.9"/>
        <circle cx="34" cy="29" r="2" fill="#FFD166" opacity="0.8"/>
        <circle cx="22" cy="27" r="1.5" fill="#FFD166" opacity="0.7"/>
        <circle cx="30" cy="35" r="1.5" fill="#FFD166" opacity="0.7"/>
      </svg>
    ),
  },
  {
    sceneIndex: 4,
    worldId: 5,
    label: "World 2",
    name: "Star Academy",
    gradFrom: "#0D0D4E",
    gradTo: "#4040CC",
    border: "#8888FF",
    glow: "rgba(64,64,204,0.35)",
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="13" fill="url(#planetG)"/>
        <ellipse cx="26" cy="26" rx="22" ry="8" fill="none" stroke="#AAAAFF" strokeWidth="2.5" opacity="0.65"/>
        <circle cx="26" cy="26" r="13" fill="url(#planetG)"/>
        <circle cx="22" cy="21" r="3" fill="#8888FF" opacity="0.6"/>
        <circle cx="18" cy="15" r="2.5" fill="#FFD166" opacity="0.95"/>
        <circle cx="36" cy="12" r="2" fill="white" opacity="0.8"/>
        <circle cx="10" cy="22" r="1.5" fill="white" opacity="0.6"/>
        <circle cx="40" cy="34" r="1.5" fill="white" opacity="0.5"/>
        <defs>
          <radialGradient id="planetG" cx="38%" cy="32%">
            <stop offset="0%" stopColor="#6666FF"/>
            <stop offset="100%" stopColor="#111188"/>
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    sceneIndex: 7,
    worldId: 8,
    label: "World 3",
    name: "Crystal Cave",
    gradFrom: "#2A0A4E",
    gradTo: "#9B59B6",
    border: "#CC88FF",
    glow: "rgba(155,89,182,0.35)",
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <path d="M22 44 L16 28 L22 16 L30 16 L36 28 L30 44 Z" fill="#7C3AED" opacity="0.35"/>
        <rect x="12" y="22" width="9" height="14" rx="3" fill="#A78BFA" transform="rotate(-12 16 29)"/>
        <rect x="22" y="16" width="9" height="18" rx="3" fill="#6D28D9"/>
        <rect x="32" y="24" width="8" height="12" rx="3" fill="#8B5CF6" transform="rotate(10 36 30)"/>
        <circle cx="16.5" cy="22.5" r="3" fill="#C4B5FD" opacity="0.9"/>
        <circle cx="26.5" cy="16.5" r="2.5" fill="#4ECDC4" opacity="0.9"/>
        <circle cx="35.5" cy="24.5" r="2.5" fill="#F472B6" opacity="0.9"/>
        <path d="M14 22 L26 14 L38 22" stroke="white" strokeWidth="1" opacity="0.25" fill="none"/>
      </svg>
    ),
  },
];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2 L12 7.5 L18 7.5 L13.5 11 L15.5 17 L10 13.5 L4.5 17 L6.5 11 L2 7.5 L8 7.5 Z"
        fill={filled ? "#FFD166" : "rgba(255,255,255,0.18)"}
        stroke={filled ? "#D4930A" : "transparent"}
        strokeWidth="0.5"
      />
    </svg>
  );
}

function FloatingStar({ x, y, size, delay, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, backgroundColor: color, opacity: 0.6 }}
      animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 3 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

function VimoSVG() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="110" height="130" viewBox="0 0 110 130" fill="none">
        {/* Body */}
        <rect x="30" y="62" width="50" height="52" rx="14" fill="#4ECDC4"/>
        <rect x="30" y="62" width="50" height="14" rx="7" fill="#6BE5DE" opacity="0.5"/>
        <rect x="38" y="70" width="34" height="3" rx="1.5" fill="#2B9B93" opacity="0.4"/>
        <rect x="38" y="77" width="26" height="3" rx="1.5" fill="#2B9B93" opacity="0.3"/>
        {/* Arms */}
        <rect x="14" y="70" width="18" height="30" rx="9" fill="#FFF8ED" transform="rotate(-10 14 70)"/>
        <rect x="78" y="70" width="18" height="30" rx="9" fill="#FFF8ED" transform="rotate(10 78 70)"/>
        {/* Hands */}
        <rect x="10" y="97" width="20" height="14" rx="7" fill="#FFF8ED"/>
        <rect x="80" y="97" width="20" height="14" rx="7" fill="#FFF8ED"/>
        {/* Legs */}
        <rect x="38" y="112" width="14" height="18" rx="7" fill="#4ECDC4"/>
        <rect x="58" y="112" width="14" height="18" rx="7" fill="#4ECDC4"/>
        {/* Head */}
        <rect x="22" y="20" width="66" height="46" rx="20" fill="#FFF8ED"/>
        {/* Face screen */}
        <rect x="30" y="27" width="50" height="30" rx="10" fill="#1A1A4E"/>
        {/* Eyes */}
        <ellipse cx="44" cy="42" rx="7" ry="9" fill="#FFD166"/>
        <ellipse cx="66" cy="42" rx="7" ry="9" fill="#FFD166"/>
        <circle cx="44" cy="42" r="3" fill="white" opacity="0.6"/>
        <circle cx="66" cy="42" r="3" fill="white" opacity="0.6"/>
        {/* Antenna */}
        <rect x="51" y="6" width="8" height="16" rx="4" fill="#AAAAAA"/>
        <circle cx="55" cy="5" r="7" fill="#FFD166"/>
        <circle cx="55" cy="5" r="4" fill="white" opacity="0.35"/>
        {/* Ear bolts */}
        <rect x="18" y="30" width="8" height="10" rx="4" fill="#E0E0E0"/>
        <rect x="84" y="30" width="8" height="10" rx="4" fill="#E0E0E0"/>
        {/* Smile */}
        <path d="M43 52 Q55 60 67 52" stroke="#FFD166" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    </motion.div>
  );
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1.5 + Math.random() * 3,
  delay: Math.random() * 4,
  color: ["#FFD166", "#4ECDC4", "#A78BFA", "white", "#F472B6"][i % 5],
}));

export default function HomePage() {
   const { data: scenes } = useListScenes();
   const { data: progress } = useGetProgress();

   return (
     <div className="relative min-h-screen w-full overflow-hidden" style={{ background: "radial-gradient(ellipse at top, #0B0825 0%, #08081A 40%, #050312 100%)" }}>
       {/* Animated star field */}
       <div className="absolute inset-0 pointer-events-none">
         {STARS.map((s, i) => <FloatingStar key={i} {...s} />)}
       </div>

       {/* Nebula glow blobs */}
       <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none blur-3xl"
         style={{ background: "radial-gradient(circle, rgba(78,205,196,0.12) 0%, transparent 70%)" }} />
       <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl"
         style={{ background: "radial-gradient(circle, rgba(160,92,255,0.1) 0%, transparent 70%)" }} />
       <div className="absolute top-2/3 left-1/3 w-64 h-64 rounded-full pointer-events-none blur-3xl"
         style={{ background: "radial-gradient(circle, rgba(255,209,102,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-10 pb-10">

        {/* Hero */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.45, duration: 0.7 }}
          className="text-center mb-6"
        >
          {progress !== undefined && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-1.5 mb-4">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5 L9.8 6 L15 6 L11 9 L12.5 14 L8 11 L3.5 14 L5 9 L1 6 L6.2 6 Z" fill="#FFD166"/>
              </svg>
              <span className="text-white/75 font-bold text-xs tracking-widest uppercase">
                {progress?.totalStars ?? 0} Stars Collected
              </span>
            </div>
          )}

          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            Vimo's
          </h1>
          <h1 className="text-5xl font-black leading-tight tracking-tight"
            style={{ WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #FFD166, #F5A623, #FF8C42)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>
            AR World
          </h1>
          <p className="text-white/45 text-sm font-medium mt-2 max-w-[260px] mx-auto leading-relaxed">
            Explore magical worlds and learn with your robot friend!
          </p>
        </motion.div>

        {/* Vimo mascot */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", bounce: 0.6 }}
          className="mb-4"
        >
          <VimoSVG />
        </motion.div>

{/* World cards */}
         <div className="w-full max-w-sm space-y-3">
           <p className="text-white/40 font-bold text-xs uppercase tracking-widest text-center mb-4">
             Choose Your Adventure
           </p>

           {WORLD_THEMES.map((world, i) => {
             const scene = scenes?.[world.sceneIndex];
             return (
               <motion.div
                 key={world.worldId}
                 initial={{ x: -30, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.25 + i * 0.1, type: "spring", bounce: 0.3 }}
               >
                 <Link href={`/world/${world.worldId}`}>
                   <motion.div
                     whileHover={{ scale: 1.03, y: -4 }}
                     whileTap={{ scale: 0.97 }}
                     className="relative overflow-hidden rounded-[28px] cursor-pointer group glass-strong neon-border"
                     style={{
                       boxShadow: `0 12px 32px ${world.glow}, 0 4px 12px rgba(0,0,0,0.3)`,
                     }}
                   >
                     {/* Shine effect */}
                     <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/15 rounded-t-[26px] pointer-events-none" />
                     <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                     <div className="relative p-4 flex items-center gap-4">
                       <div className="shrink-0 w-14 h-14 rounded-2xl bg-black/30 flex items-center justify-center border border-white/20 shadow-inner">
                         {world.icon}
                       </div>

                       <div className="flex-1 min-w-0">
                         <div className="text-white/60 font-bold text-[10px] uppercase tracking-widest mb-0.5">{world.label}</div>
                         <h3 className="text-white font-black text-lg leading-tight drop-shadow truncate">
                           {scene?.name ?? world.name}
                         </h3>
                         <div className="flex gap-0.5 mt-1.5">
                           {[0, 1, 2].map((j) => <StarIcon key={j} filled={j < (scene?.starsEarned ?? 0)} />)}
                         </div>
                       </div>

                       <div className="shrink-0 w-9 h-9 rounded-full bg-white/25 flex items-center justify-center border border-white/30 group-hover:bg-white/40 transition-colors shadow-lg">
                         <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                           <path d="M4.5 3 L10 7 L4.5 11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>

                     {scene?.isCompleted && (
                       <div className="absolute top-3 right-12">
                         <div className="bg-[#FFD166] text-[#1A1A4E] text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                           Done!
                         </div>
                       </div>
                     )}
                   </motion.div>
                 </Link>
               </motion.div>
             );
           })}
         </div>

{/* Trophy link */}
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.7 }}
           className="mt-7"
         >
           <Link href="/rewards">
             <motion.div
               whileHover={{ scale: 1.06, y: -2 }}
               whileTap={{ scale: 0.95 }}
               className="flex items-center gap-3 glass-strong rounded-full px-6 py-3 cursor-pointer neon-border"
             >
               <div className="w-10 h-10 rounded-full bg-[#FFD166]/20 flex items-center justify-center shadow-lg">
                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="game-glow">
                   <path d="M10 2 L12.5 7.5 L19 7.5 L14 11.5 L16 18 L10 14 L4 18 L6 11.5 L1 7.5 L7.5 7.5 Z" fill="#FFD166" stroke="#D4930A" strokeWidth="0.6"/>
                 </svg>
               </div>
               <span className="text-white font-black text-sm">Trophy Room</span>
               <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                 <path d="M4 3 L9 7 L4 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             </motion.div>
           </Link>
         </motion.div>
      </div>
    </div>
  );
}
