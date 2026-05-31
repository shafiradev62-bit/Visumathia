import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetScene, getGetSceneQueryKey } from "@workspace/api-client-react";
import { HUD } from "@/components/ui/HUD";
import { GameButton } from "@/components/ui/GameButton";

const WORLDS: Record<string, {
  bg: string; accent: string; glow: string;
  deco: JSX.Element;
  games: { id: string; title: string; icon: JSX.Element }[];
}> = {
  "1": {
    bg: "linear-gradient(160deg, #071A0F 0%, #0D2B1A 50%, #102A18 100%)",
    accent: "#2ECC71",
    glow: "rgba(46,204,113,0.25)",
    deco: (
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none" className="opacity-20">
        <circle cx="90" cy="90" r="70" fill="#2ECC71" opacity="0.12"/>
        <path d="M90 20 C90 20 120 50 130 80 C110 65 70 65 50 80 C60 50 90 20 90 20Z" fill="#52E090" opacity="0.3"/>
        <circle cx="60" cy="100" r="6" fill="#FFD166" opacity="0.8"/>
        <circle cx="120" cy="85" r="5" fill="#FFD166" opacity="0.7"/>
        <circle cx="80" cy="75" r="4" fill="#FFD166" opacity="0.6"/>
        <circle cx="110" cy="110" r="4" fill="#FFD166" opacity="0.6"/>
      </svg>
    ),
    games: [
      {
        id: "count-fireflies", title: "Count the Fireflies",
        icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><ellipse cx="15" cy="20" rx="6" ry="4" fill="#A8E063"/><circle cx="15" cy="12" r="6" fill="#556B2F"/><circle cx="13" cy="11" r="1.5" fill="#FFD166"/><circle cx="17" cy="11" r="1.5" fill="#FFD166"/><circle cx="15" cy="17" r="3.5" fill="#C8FF64" opacity="0.6"/></svg>,
      },
      {
        id: "sort-leaves", title: "Sort the Leaves",
        icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M15 26 C8 21 3 14 6 8 C10 3 22 3 25 9 C28 16 22 22 15 26Z" fill="#4CAF50"/><path d="M15 26 C15 21 13 14 11 10" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round"/></svg>,
      },
      {
        id: "mushroom-patterns", title: "Mushroom Patterns",
        icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="12" y="18" width="6" height="8" rx="2" fill="#FFCC80"/><path d="M4 17 C4 9 9 4 15 4 C21 4 26 9 26 17 Z" fill="#E53935"/><circle cx="11" cy="13" r="2.5" fill="white" opacity="0.85"/><circle cx="18" cy="11" r="2" fill="white" opacity="0.85"/></svg>,
      },
    ],
  },
  "5": {
    bg: "linear-gradient(160deg, #06061E 0%, #0D0D2E 50%, #080825 100%)",
    accent: "#6666FF",
    glow: "rgba(100,100,255,0.25)",
    deco: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" className="opacity-20">
        <circle cx="100" cy="100" r="55" fill="#3333AA" opacity="0.3"/>
        <ellipse cx="100" cy="100" rx="90" ry="30" fill="none" stroke="#8888FF" strokeWidth="3" opacity="0.4"/>
        <circle cx="70" cy="60" r="8" fill="#FFD166" opacity="0.8"/>
        <circle cx="140" cy="45" r="5" fill="white" opacity="0.7"/>
        <circle cx="35" cy="80" r="4" fill="white" opacity="0.5"/>
        <circle cx="160" cy="130" r="4" fill="white" opacity="0.5"/>
      </svg>
    ),
    games: [
      {
        id: "star-math", title: "Star Math",
        icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M15 3 L18 11 L27 11 L20 16.5 L23 25 L15 20 L7 25 L10 16.5 L3 11 L12 11 Z" fill="#FFD166" stroke="#D4930A" strokeWidth="0.7"/></svg>,
      },
      {
        id: "shape-planets", title: "Shape Planets",
        icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="9" fill="#6666FF"/><ellipse cx="15" cy="15" rx="14" ry="5" fill="none" stroke="#AAAAFF" strokeWidth="2" opacity="0.7"/><circle cx="12" cy="11" r="2" fill="#9999FF" opacity="0.6"/></svg>,
      },
      {
        id: "rocket-sequence", title: "Rocket Sequence",
        icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M15 3 C15 3 22 9 22 17 L15 20 L8 17 C8 9 15 3 15 3Z" fill="#E0E0E0"/><circle cx="15" cy="13" r="3.5" fill="#4ECDC4"/><path d="M8 17 L5 24 L12 20Z" fill="#FF6B6B"/><path d="M22 17 L25 24 L18 20Z" fill="#FF6B6B"/><path d="M12 20 L15 27 L18 20Z" fill="#FFD166"/></svg>,
      },
    ],
  },
  "8": {
    bg: "linear-gradient(160deg, #0E0520 0%, #1A0A2E 50%, #160825 100%)",
    accent: "#A78BFA",
    glow: "rgba(167,139,250,0.25)",
    deco: (
      <svg width="180" height="220" viewBox="0 0 180 220" fill="none" className="opacity-20">
        <rect x="30" y="40" width="20" height="80" rx="4" fill="#A78BFA" transform="rotate(-8 30 40)"/>
        <rect x="68" y="20" width="25" height="100" rx="4" fill="#7C3AED"/>
        <rect x="108" y="50" width="18" height="70" rx="4" fill="#8B5CF6" transform="rotate(6 108 50)"/>
        <circle cx="40" cy="38" r="8" fill="#C4B5FD" opacity="0.9"/>
        <circle cx="80" cy="18" r="7" fill="#4ECDC4" opacity="0.9"/>
        <circle cx="116" cy="48" r="6" fill="#F472B6" opacity="0.9"/>
      </svg>
    ),
    games: [
      {
        id: "letter-hunt", title: "Letter Hunt",
        icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="4" y="5" width="22" height="20" rx="4" fill="#7B61FF"/><text x="15" y="21" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="serif">A</text></svg>,
      },
      {
        id: "word-builder", title: "Word Builder",
        icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="2" y="9" width="8" height="12" rx="2" fill="#4ECDC4"/><rect x="11" y="9" width="8" height="12" rx="2" fill="#FFD166"/><rect x="20" y="9" width="8" height="12" rx="2" fill="#D498FF"/><text x="6" y="20" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">C</text><text x="15" y="20" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">A</text><text x="24" y="20" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">T</text></svg>,
      },
      {
        id: "rhyme-quest", title: "Rhyme Quest",
        icon: <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M4 22 C4 13 8 6 15 6 C22 6 26 13 26 22" stroke="#FFD166" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M8 22 C8 15 10 10 15 10 C20 10 22 15 22 22" stroke="#4ECDC4" strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="4" cy="22" r="2.5" fill="#FF6B6B"/><circle cx="26" cy="22" r="2.5" fill="#FF6B6B"/></svg>,
      },
    ],
  },
};

function FloatingOrb({ x, y, size, delay, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, backgroundColor: color, opacity: 0.5 }}
      animate={{ y: [0, -14, 0], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 3.5 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

const ORBS = Array.from({ length: 25 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1.5 + Math.random() * 3,
  delay: Math.random() * 4,
  color: ["#FFD166", "#4ECDC4", "#A78BFA", "white"][Math.floor(Math.random() * 4)],
}));

const variantMap = ["primary", "secondary", "accent"] as const;

export default function WorldPage() {
   const { id } = useParams<{ id: string }>();
   const sceneId = Number(id);
   const { data: scene, isLoading } = useGetScene(sceneId, {
     query: { queryKey: getGetSceneQueryKey(sceneId) }
   });

   const worldData = WORLDS[id ?? "1"] ?? WORLDS["1"];
   const { bg, accent, glow, deco, games } = worldData;

   if (isLoading) {
     return (
       <div className="min-h-screen w-full flex items-center justify-center" style={{ background: bg }}>
         <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
           className="w-14 h-14 rounded-full border-4 border-t-transparent" style={{ borderColor: accent, borderTopColor: "transparent", boxShadow: `0 0 20px ${glow}` }}
         />
       </div>
     );
   }

   return (
     <div className="relative min-h-screen w-full overflow-hidden" style={{ background: bg }}>
       {/* Particle stars */}
       <div className="absolute inset-0 pointer-events-none">
         {ORBS.map((o, i) => <FloatingOrb key={i} {...o} />)}
       </div>

       {/* Decorative world art — top right */}
       <div className="absolute top-10 right-0 pointer-events-none select-none">{deco}</div>

       <HUD />

       {/* Vimo speech bubble */}
       <motion.div
         initial={{ scale: 0.8, opacity: 0, x: -20 }}
         animate={{ scale: 1, opacity: 1, x: 0 }}
         transition={{ delay: 0.4, type: "spring", bounce: 0.4 }}
         className="absolute top-[72px] left-4 z-20 max-w-[200px] mt-4"
       >
         <div className="bg-white rounded-[18px] p-3 shadow-2xl relative border-[2.5px]" style={{ borderColor: accent }}>
           <div className="absolute -bottom-3 left-6 w-0 h-0 border-l-[9px] border-l-transparent border-t-[13px] border-t-white border-r-[9px] border-r-transparent" />
           <p className="text-[#1A1A4E] font-bold text-xs leading-snug">
             Welcome to <span style={{ color: accent }}>{scene?.name ?? "this world"}</span>! Let's play!
           </p>
         </div>
       </motion.div>

       {/* Glow blob */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
         style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }} />

       {/* Game panel */}
       <motion.div
         initial={{ y: "100%" }}
         animate={{ y: 0 }}
         transition={{ type: "spring", damping: 22, stiffness: 95, delay: 0.1 }}
         className="absolute bottom-0 w-full rounded-t-[40px] p-6 z-20 pb-10"
         style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.15)" }}
       >
         <div className="w-10 h-1.5 bg-white/25 rounded-full mx-auto mb-5" />
         <h2 className="text-2xl font-black text-white tracking-tight mb-5 text-center drop-shadow">
           Choose a Mini-Game
         </h2>
         <div className="flex flex-col gap-3 max-w-md mx-auto">
           {games.map((game, i) => (
             <Link key={game.id} href={`/play/${id}/${game.id}`}>
               <GameButton
                 variant={variantMap[i]}
                 className="w-full text-left justify-start py-4 px-5"
               >
                 <div className="flex items-center gap-4 w-full">
                   <div className="bg-white/25 rounded-2xl w-11 h-11 flex items-center justify-center shrink-0">
                     {game.icon}
                   </div>
                   <span className="flex-1 text-base font-bold tracking-wide">{game.title}</span>
                   <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                     <path d="M5.5 3.5 L11 8 L5.5 12.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                 </div>
               </GameButton>
             </Link>
           ))}
         </div>
       </motion.div>
     </div>
   );
}
