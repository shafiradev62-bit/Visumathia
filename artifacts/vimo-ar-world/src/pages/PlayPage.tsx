import { useParams, Link, useLocation } from "wouter";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompleteScene, useClaimReward } from "@workspace/api-client-react";

const GAME_ID_TO_SCENE: Record<string, number> = {
  "count-fireflies": 2,
  "sort-leaves": 3,
  "mushroom-patterns": 4,
  "star-math": 6,
  "shape-planets": 7,
  "rocket-sequence": 8,
  "letter-hunt": 9,
  "word-builder": 10,
  "rhyme-quest": 10,
};

function StarSVG({ filled, size = 36 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <path
        d="M18 3 L21.5 13 L33 13 L24 19.5 L27.5 30 L18 23.5 L8.5 30 L12 19.5 L3 13 L14.5 13 Z"
        fill={filled ? "#FFD166" : "rgba(255,255,255,0.15)"}
        stroke={filled ? "#D4930A" : "rgba(255,255,255,0.1)"}
        strokeWidth="1"
      />
    </svg>
  );
}

function Sparkle({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
      animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0], x: (Math.random() - 0.5) * 80, y: -60 - Math.random() * 40 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2 L11.5 8 L18 10 L11.5 12 L10 18 L8.5 12 L2 10 L8.5 8 Z" fill={color}/>
      </svg>
    </motion.div>
  );
}

function VimoBubble({ message, expression }: { message: string; expression: "happy" | "thinking" | "excited" | "sad" }) {
  const colors: Record<string, string> = { happy: "#FFD166", thinking: "#4ECDC4", excited: "#FF6B6B", sad: "#A78BFA" };
  return (
    <motion.div
      key={message}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="absolute bottom-full left-0 mb-2 z-30"
    >
      <div className="bg-white rounded-[18px] p-3 shadow-xl border-[2.5px] relative max-w-[160px]"
        style={{ borderColor: colors[expression] }}>
        <div className="absolute -bottom-3 left-5 w-0 h-0 border-l-[8px] border-l-transparent border-t-[12px] border-t-white border-r-[8px] border-r-transparent" />
        <p className="text-[#1A1A4E] font-bold text-xs leading-snug">{message}</p>
      </div>
    </motion.div>
  );
}

function VimoCharacter({ expression }: { expression: "happy" | "thinking" | "excited" | "sad" }) {
  const eyeColors: Record<string, string> = { happy: "#FFD166", thinking: "#4ECDC4", excited: "#FF6B6B", sad: "#A78BFA" };
  const color = eyeColors[expression];
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      className="w-20 h-24"
    >
      <svg width="80" height="96" viewBox="0 0 80 96" fill="none">
        <rect x="22" y="44" width="36" height="38" rx="10" fill="#4ECDC4"/>
        <rect x="22" y="44" width="36" height="10" rx="5" fill="#6BE5DE" opacity="0.5"/>
        <rect x="28" y="50" width="24" height="2" rx="1" fill="#2B9B93" opacity="0.4"/>
        <rect x="28" y="55" width="18" height="2" rx="1" fill="#2B9B93" opacity="0.3"/>
        <rect x="16" y="52" width="10" height="22" rx="5" fill="#FFF8ED" transform="rotate(-8 16 52)"/>
        <rect x="54" y="52" width="10" height="22" rx="5" fill="#FFF8ED" transform="rotate(8 54 52)"/>
        <rect x="14" y="72" width="14" height="10" rx="5" fill="#FFF8ED"/>
        <rect x="52" y="72" width="14" height="10" rx="5" fill="#FFF8ED"/>
        <rect x="18" y="82" width="10" height="14" rx="5" fill="#4ECDC4"/>
        <rect x="52" y="82" width="10" height="14" rx="5" fill="#4ECDC4"/>
        <rect x="16" y="16" width="48" height="32" rx="14" fill="#FFF8ED"/>
        <rect x="22" y="20" width="36" height="20" rx="8" fill="#1A1A4E"/>
        {expression === "happy" && (
          <>
            <ellipse cx="32" cy="30" rx="5" ry="6" fill={color}/>
            <ellipse cx="48" cy="30" rx="5" ry="6" fill={color}/>
            <circle cx="32" cy="30" r="2" fill="white" opacity="0.6"/>
            <circle cx="48" cy="30" r="2" fill="white" opacity="0.6"/>
          </>
        )}
        {expression === "thinking" && (
          <>
            <ellipse cx="32" cy="31" rx="5" ry="4" fill={color}/>
            <ellipse cx="48" cy="30" rx="5" ry="6" fill={color}/>
            <circle cx="32" cy="31" r="1.8" fill="white" opacity="0.5"/>
            <circle cx="48" cy="30" r="2" fill="white" opacity="0.5"/>
          </>
        )}
        {expression === "excited" && (
          <>
            <ellipse cx="32" cy="29" rx="6" ry="7" fill={color}/>
            <ellipse cx="48" cy="29" rx="6" ry="7" fill={color}/>
            <circle cx="32" cy="29" r="2.5" fill="white" opacity="0.7"/>
            <circle cx="48" cy="29" r="2.5" fill="white" opacity="0.7"/>
          </>
        )}
        {expression === "sad" && (
          <>
            <ellipse cx="32" cy="31" rx="5" ry="4" fill={color} opacity="0.7"/>
            <ellipse cx="48" cy="31" rx="5" ry="4" fill={color} opacity="0.7"/>
          </>
        )}
        <rect x="36" y="5" width="8" height="12" rx="4" fill="#999"/>
        <circle cx="40" cy="4" r="5" fill={color}/>
        <circle cx="40" cy="4" r="3" fill="white" opacity="0.4"/>
        <rect x="24" y="14" width="10" height="5" rx="2.5" fill="#E0E0E0"/>
        <rect x="46" y="14" width="10" height="5" rx="2.5" fill="#E0E0E0"/>
      </svg>
    </motion.div>
  );
}

function CountFirefliesGame({ onComplete }: { onComplete: (stars: number, score: number) => void }) {
  const target = Math.floor(Math.random() * 6) + 3;
  const [visible, setVisible] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 10 + Math.random() * 70,
      active: i < target,
      caught: false,
    }))
  );
  const [caught, setCaught] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [guess, setGuess] = useState<number | null>(null);
  const catchCount = visible.filter((f) => f.caught).length;
  const activeCount = visible.filter((f) => f.active).length;

  const catchFirefly = (id: number) => {
    setVisible((v) => v.map((f) => (f.id === id && f.active && !f.caught ? { ...f, caught: true } : f)));
    setCaught((c) => c + 1);
  };

  const options = Array.from(new Set([target, target - 1 < 1 ? target + 2 : target - 1, target + 1, target + 2]))
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  useEffect(() => {
    if (catchCount === activeCount && !answered && catchCount > 0) {
      setTimeout(() => setAnswered(true), 400);
    }
  }, [catchCount, activeCount, answered]);

  const handleGuess = (n: number) => {
    setGuess(n);
    const correct = n === target;
    setTimeout(() => onComplete(correct ? 3 : 1, correct ? 100 : 30), 800);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-black text-white drop-shadow-md">
          {!answered ? "Tap all the fireflies!" : `You caught ${catchCount}! How many were there?`}
        </h2>
      </div>

      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden mb-5 border-2 border-[#FFD166]/30"
        style={{ background: "linear-gradient(160deg, #0D2B1A, #1B4332)" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-[#2ECC71]/10"
            style={{ width: 3 + Math.random() * 8, height: 3 + Math.random() * 8, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />
        ))}
        {visible.filter((f) => f.active).map((f) => (
          <motion.button
            key={f.id}
            className="absolute"
            style={{ left: `${f.x}%`, top: `${f.y}%`, transform: "translate(-50%,-50%)" }}
            onClick={() => !f.caught && catchFirefly(f.id)}
            animate={f.caught ? { scale: 0, opacity: 0 } : { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
            transition={f.caught ? { duration: 0.3 } : { duration: 1.2 + Math.random(), repeat: Infinity }}
            disabled={f.caught}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <ellipse cx="16" cy="20" rx="6" ry="4" fill="#A8E063"/>
              <circle cx="16" cy="12" r="6" fill="#556B2F"/>
              <circle cx="14" cy="11" r="1.5" fill="#FFD166"/>
              <circle cx="18" cy="11" r="1.5" fill="#FFD166"/>
              <circle cx="16" cy="17" r="4" fill="#C8FF64" opacity="0.6"/>
              <ellipse cx="16" cy="17" rx="4" ry="4" fill="#FFD166" opacity="0.25"/>
            </svg>
          </motion.button>
        ))}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="text-[#FFD166] font-bold text-sm">{catchCount} / {activeCount} caught</span>
        </div>
      </div>

      <AnimatePresence>
        {answered && !guess && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-2 gap-3">
            {options.map((n) => (
              <motion.button
                key={n}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGuess(n)}
                className="py-5 rounded-3xl text-4xl font-black text-white relative overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #4ECDC4, #2B9B93)",
                  boxShadow: "0 6px 0 #1A6A66, 0 8px 20px rgba(0,0,0,0.3)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-3xl" />
                <span className="relative z-10 drop-shadow-md">{n}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
        {guess !== null && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`text-center py-4 rounded-3xl font-black text-2xl ${guess === target ? "bg-[#2ECC71]/20 text-[#52E090] border-2 border-[#2ECC71]/40" : "bg-[#FF6B6B]/20 text-[#FF6B6B] border-2 border-[#FF6B6B]/40"}`}>
            {guess === target ? "Correct! Amazing!" : `The answer was ${target}!`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortLeavesGame({ onComplete }: { onComplete: (stars: number, score: number) => void }) {
  type LeafColor = "red" | "yellow" | "green";
  const leafColors: LeafColor[] = ["red", "yellow", "green"];
  const [leaves] = useState(() =>
    Array.from({ length: 9 }, (_, i) => ({ id: i, color: leafColors[i % 3] as LeafColor, sorted: false })).sort(() => Math.random() - 0.5)
  );
  const [sorted, setSorted] = useState<Record<LeafColor, number[]>>({ red: [], yellow: [], green: [] });
  const [current, setCurrent] = useState(0);
  const [wrong, setWrong] = useState(0);

  const totalSorted = Object.values(sorted).flat().length;
  const leaf = leaves[current];

  const bucketColors: Record<LeafColor, { fill: string; label: string; border: string }> = {
    red: { fill: "#E53935", label: "Red Leaves", border: "#B71C1C" },
    yellow: { fill: "#FFD166", label: "Yellow Leaves", border: "#D4930A" },
    green: { fill: "#4CAF50", label: "Green Leaves", border: "#2E7D32" },
  };

  const leafFills: Record<LeafColor, [string, string]> = {
    red: ["#E53935", "#EF9A9A"],
    yellow: ["#FFD166", "#FFF176"],
    green: ["#4CAF50", "#A5D6A7"],
  };

  const handleSort = (target: LeafColor) => {
    if (target === leaf.color) {
      setSorted((s) => ({ ...s, [target]: [...s[target], leaf.id] }));
      if (current + 1 >= leaves.length) {
        const stars = wrong === 0 ? 3 : wrong <= 2 ? 2 : 1;
        setTimeout(() => onComplete(stars, Math.max(10, 100 - wrong * 15)), 600);
      } else {
        setCurrent((c) => c + 1);
      }
    } else {
      setWrong((w) => w + 1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-black text-white drop-shadow-md text-center mb-4">Sort the leaves!</h2>
      <div className="flex justify-center mb-6">
        {leaf && (
          <motion.div
            key={leaf.id}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0, y: [0, -8, 0] }}
            transition={{ type: "spring", bounce: 0.5, y: { duration: 2, repeat: Infinity } }}
          >
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <path d="M50 80 C30 65 10 50 20 30 C35 10 65 10 80 30 C90 50 70 65 50 80Z"
                fill={leafFills[leaf.color][0]}/>
              <path d="M50 80 C50 65 44 50 38 35" stroke={leafFills[leaf.color][1]} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M38 35 C44 42 56 46 62 50" stroke={leafFills[leaf.color][1]} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M38 35 C42 55 48 68 50 80" stroke={leafFills[leaf.color][1]} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
            </svg>
          </motion.div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {leafColors.map((color) => {
          const theme = bucketColors[color];
          return (
            <motion.button
              key={color}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSort(color)}
              className="py-5 rounded-[24px] flex flex-col items-center gap-2 relative overflow-hidden"
              style={{ background: `linear-gradient(160deg, ${theme.fill}CC, ${theme.border}AA)`, border: `2.5px solid ${theme.fill}`, boxShadow: `0 6px 0 ${theme.border}, 0 8px 20px ${theme.fill}30` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-[22px]" />
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="relative z-10">
                <path d="M16 26 C8 20 2 13 6 7 C10 2 22 2 26 7 C30 13 24 20 16 26Z" fill={theme.fill}/>
                <path d="M16 26 C16 20 14 12 12 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
              </svg>
              <span className="text-white font-black text-xs relative z-10">{sorted[color].length}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="text-center mt-4">
        <span className="text-white/50 font-medium text-sm">{totalSorted} / {leaves.length} sorted</span>
      </div>
    </div>
  );
}

function MushroomPatternsGame({ onComplete }: { onComplete: (stars: number, score: number) => void }) {
  const patterns = [
    { seq: ["red", "white", "red", "white", "?"], answer: "red", options: ["red", "white", "blue"] },
    { seq: ["big", "small", "big", "small", "?"], answer: "big", options: ["small", "big", "medium"] },
    { seq: ["spotted", "plain", "spotted", "?"], answer: "plain", options: ["spotted", "plain", "striped"] },
  ];
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const pattern = patterns[idx];

  const colorMap: Record<string, { cap: string; dots: string }> = {
    red: { cap: "#E53935", dots: "#FFCDD2" },
    white: { cap: "#EEEEEE", dots: "#BDBDBD" },
    blue: { cap: "#1976D2", dots: "#BBDEFB" },
    spotted: { cap: "#E53935", dots: "white" },
    plain: { cap: "#4CAF50", dots: "transparent" },
    striped: { cap: "#FF9800", dots: "#FFF3E0" },
    big: { cap: "#8D6E63", dots: "#D7CCC8" },
    small: { cap: "#A1887F", dots: "#EFEBE9" },
    medium: { cap: "#795548", dots: "#D7CCC8" },
  };

  const MushroomSVG = ({ type, isQuestion }: { type: string; isQuestion?: boolean }) => {
    const theme = colorMap[type] || { cap: "#9E9E9E", dots: "#E0E0E0" };
    const scale = type === "big" ? 1.3 : type === "small" ? 0.7 : 1;
    return (
      <svg width={44 * scale} height={52 * scale} viewBox="0 0 44 52" fill="none">
        {isQuestion ? (
          <>
            <path d="M4 22 C4 8 40 8 40 22 Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 3"/>
            <text x="22" y="26" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white" fontFamily="sans-serif">?</text>
          </>
        ) : (
          <>
            <path d="M4 22 C4 8 40 8 40 22 Z" fill={theme.cap}/>
            <circle cx="15" cy="16" r="3.5" fill={theme.dots} opacity="0.85"/>
            <circle cx="25" cy="12" r="2.5" fill={theme.dots} opacity="0.85"/>
            <circle cx="32" cy="17" r="2" fill={theme.dots} opacity="0.85"/>
          </>
        )}
        <rect x="18" y="22" width="8" height="18" rx="4" fill="#FFCC80"/>
      </svg>
    );
  };

  const handleAnswer = (opt: string) => {
    if (feedback) return;
    const isCorrect = opt === pattern.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setCorrect((c) => c + 1);
    setTimeout(() => {
      setFeedback(null);
      if (idx + 1 >= patterns.length) {
        const stars = correct + (isCorrect ? 1 : 0) === patterns.length ? 3 : correct + (isCorrect ? 1 : 0) >= 2 ? 2 : 1;
        onComplete(stars, Math.round(((correct + (isCorrect ? 1 : 0)) / patterns.length) * 100));
      } else {
        setIdx((i) => i + 1);
      }
    }, 700);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-black text-white drop-shadow-md text-center mb-6">
        What comes next?
      </h2>
      <div className="flex items-end justify-center gap-3 mb-8 p-5 rounded-3xl bg-black/20 border border-white/10">
        {pattern.seq.map((item, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-1"
          >
            <MushroomSVG type={item} isQuestion={item === "?"} />
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {pattern.options.map((opt) => {
          const theme = colorMap[opt] || { cap: "#9E9E9E", dots: "#E0E0E0" };
          return (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAnswer(opt)}
              className="py-4 rounded-[24px] flex flex-col items-center gap-2 relative overflow-hidden"
              style={{
                background: feedback === "correct" && opt === pattern.answer
                  ? "linear-gradient(160deg, #2ECC71, #1B8B47)"
                  : feedback === "wrong" && opt !== pattern.answer
                  ? "linear-gradient(160deg, #616161, #424242)"
                  : `linear-gradient(160deg, ${theme.cap}CC, ${theme.cap}88)`,
                border: `2.5px solid ${theme.cap}`,
                boxShadow: `0 5px 0 ${theme.cap}88, 0 7px 16px rgba(0,0,0,0.3)`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-[22px]" />
              <MushroomSVG type={opt} />
              <span className="text-white font-bold text-xs capitalize relative z-10">{opt}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="text-center mt-4">
        <span className="text-white/40 text-sm font-medium">{idx + 1} / {patterns.length}</span>
      </div>
    </div>
  );
}

function StarMathGame({ onComplete }: { onComplete: (stars: number, score: number) => void }) {
  const generateQ = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const isAdd = Math.random() > 0.4;
    if (isAdd) return { a, b, op: "+", answer: a + b };
    const big = Math.max(a, b), small = Math.min(a, b);
    return { a: big, b: small, op: "-", answer: big - small };
  };
  const [q, setQ] = useState(generateQ);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const options = Array.from(new Set([q.answer, q.answer + 1, q.answer - 1 > 0 ? q.answer - 1 : q.answer + 2, q.answer + 3]))
    .sort(() => Math.random() - 0.5).slice(0, 4);

  const handleAnswer = (n: number) => {
    if (feedback) return;
    const ok = n === q.answer;
    setFeedback(ok ? "correct" : "wrong");
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= 5) {
        const newScore = score + (ok ? 1 : 0);
        onComplete(newScore >= 5 ? 3 : newScore >= 3 ? 2 : 1, newScore * 20);
      } else {
        setRound((r) => r + 1);
        setQ(generateQ());
      }
    }, 700);
  };

  const gradients = [
    ["#FFD166", "#F5A623", "#D4930A"],
    ["#4ECDC4", "#2B9B93", "#1A6A66"],
    ["#A78BFA", "#7C3AED", "#5B21B6"],
    ["#F472B6", "#DB2777", "#9D174D"],
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-2">
        <div className="flex justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => <StarSVG key={i} filled={i < score} size={24} />)}
        </div>
        <p className="text-white/50 text-sm font-medium">Round {round + 1} of 5</p>
      </div>

      <motion.div
        key={q.a + q.op + q.b}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8 px-4 rounded-[32px] mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A1A5E, #2D2D8E)", border: "2px solid rgba(255,255,255,0.15)" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white/5"
              style={{ width: 4 + i * 3, height: 4 + i * 3, left: `${10 + i * 11}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <p className="text-6xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
            {q.a} <span className="text-[#FFD166]">{q.op}</span> {q.b} <span className="text-white/40">=</span> <span className="text-[#4ECDC4]">?</span>
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((n, i) => {
          const [from, to, shadow] = gradients[i % gradients.length];
          const isAnswer = n === q.answer;
          return (
            <motion.button
              key={n}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(n)}
              className="py-6 rounded-[28px] text-4xl font-black text-white relative overflow-hidden"
              style={{
                background: feedback === "correct" && isAnswer
                  ? "linear-gradient(160deg, #2ECC71, #1B8B47)"
                  : feedback === "wrong" && isAnswer
                  ? "linear-gradient(160deg, #FF6B6B, #C0392B)"
                  : `linear-gradient(160deg, ${from}, ${to})`,
                boxShadow: `0 6px 0 ${shadow}, 0 8px 20px rgba(0,0,0,0.3)`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-[26px]" />
              <span className="relative z-10 drop-shadow-md">{n}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ShapePlanetsGame({ onComplete }: { onComplete: (stars: number, score: number) => void }) {
  const shapes = [
    { name: "Circle", icon: <circle cx="22" cy="22" r="16" fill="#4ECDC4" stroke="#2B9B93" strokeWidth="2"/> },
    { name: "Triangle", icon: <polygon points="22,6 38,38 6,38" fill="#FFD166" stroke="#D4930A" strokeWidth="2"/> },
    { name: "Square", icon: <rect x="7" y="7" width="30" height="30" fill="#A78BFA" stroke="#6D28D9" strokeWidth="2"/> },
    { name: "Diamond", icon: <polygon points="22,4 40,22 22,40 4,22" fill="#F472B6" stroke="#9D174D" strokeWidth="2"/> },
  ];
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const target = shapes[round % shapes.length];
  const options = [...shapes].sort(() => Math.random() - 0.5);

  const handleAnswer = (name: string) => {
    if (feedback) return;
    const ok = name === target.name;
    setFeedback(ok ? "correct" : "wrong");
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= 4) {
        const newScore = score + (ok ? 1 : 0);
        onComplete(newScore >= 4 ? 3 : newScore >= 2 ? 2 : 1, newScore * 25);
      } else {
        setRound((r) => r + 1);
      }
    }, 700);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-black text-white drop-shadow-md text-center mb-5">
        Find the <span className="text-[#FFD166]">{target.name}</span>!
      </h2>

      <div className="flex justify-center mb-6">
        <motion.div
          key={round}
          initial={{ scale: 0.7, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1, y: [0, -8, 0] }}
          transition={{ type: "spring", y: { duration: 2.5, repeat: Infinity } }}
          className="w-28 h-28 rounded-3xl flex items-center justify-center"
          style={{ background: "linear-gradient(160deg, #1A1A5E, #2D2D8E)", border: "2px solid rgba(255,255,255,0.15)" }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">{target.icon}</svg>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((shape) => (
          <motion.button
            key={shape.name}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(shape.name)}
            className="py-5 rounded-[28px] flex flex-col items-center gap-2 relative overflow-hidden"
            style={{
              background: feedback === "correct" && shape.name === target.name
                ? "linear-gradient(160deg, #2ECC71, #1B8B47)"
                : "linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
              border: "2px solid rgba(255,255,255,0.15)",
              boxShadow: "0 4px 0 rgba(0,0,0,0.3)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/10 rounded-t-[26px]" />
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="relative z-10">{shape.icon}</svg>
            <span className="text-white font-bold text-sm relative z-10">{shape.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function LetterHuntGame({ onComplete }: { onComplete: (stars: number, score: number) => void }) {
  const targets = ["A", "B", "C", "D", "E"];
  const [targetIdx, setTargetIdx] = useState(0);
  const [found, setFound] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const decoys = Array.from({ length: 11 }, () => letters[Math.floor(Math.random() * 26)]);
  const allLetters = [...decoys, targets[targetIdx]].sort(() => Math.random() - 0.5);

  const handleTap = (letter: string) => {
    if (feedback) return;
    const ok = letter === targets[targetIdx];
    setFeedback(ok ? "correct" : "wrong");
    if (ok) setFound((f) => f + 1);
    setTimeout(() => {
      setFeedback(null);
      if (targetIdx + 1 >= targets.length) {
        const f2 = found + (ok ? 1 : 0);
        onComplete(f2 >= 5 ? 3 : f2 >= 3 ? 2 : 1, f2 * 20);
      } else {
        setTargetIdx((i) => i + 1);
      }
    }, 700);
  };

  const colors = ["#4ECDC4", "#FFD166", "#A78BFA", "#F472B6", "#52E090", "#FF8C42", "#6BE5DE", "#D498FF"];

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-black text-white drop-shadow-md text-center mb-2">
        Find the letter <span className="text-[#FFD166] text-4xl">{targets[targetIdx]}</span>!
      </h2>
      <p className="text-white/40 text-sm text-center mb-5">{targetIdx + 1} / {targets.length}</p>

      <div className="grid grid-cols-4 gap-2.5">
        {allLetters.map((letter, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.08, rotate: [-2, 2, 0] }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTap(letter)}
            className="aspect-square rounded-2xl flex items-center justify-center text-3xl font-black text-white relative overflow-hidden"
            style={{
              background: `linear-gradient(160deg, ${colors[i % colors.length]}BB, ${colors[i % colors.length]}77)`,
              border: `2px solid ${colors[i % colors.length]}`,
              boxShadow: `0 4px 0 ${colors[i % colors.length]}55, 0 6px 12px rgba(0,0,0,0.3)`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-xl" />
            <span className="relative z-10 drop-shadow-md">{letter}</span>
          </motion.button>
        ))}
      </div>

      {feedback && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-center mt-4 py-3 rounded-2xl font-black text-lg ${feedback === "correct" ? "bg-[#2ECC71]/20 text-[#52E090]" : "bg-[#FF6B6B]/20 text-[#FF6B6B]"}`}
        >
          {feedback === "correct" ? "Found it!" : "Not that one!"}
        </motion.div>
      )}
    </div>
  );
}

function WordBuilderGame({ onComplete }: { onComplete: (stars: number, score: number) => void }) {
  const words = [
    { word: "CAT", letters: ["C", "A", "T", "D", "B"], hint: "A furry pet that meows" },
    { word: "SUN", letters: ["S", "U", "N", "M", "T"], hint: "Shines bright in the sky" },
    { word: "DOG", letters: ["D", "O", "G", "A", "C"], hint: "A loyal pet that barks" },
  ];
  const [wordIdx, setWordIdx] = useState(0);
  const [built, setBuilt] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [shaking, setShaking] = useState(false);
  const w = words[wordIdx];

  const addLetter = (l: string, idx: number) => {
    if (built.length >= w.word.length) return;
    const next = [...built, l];
    setBuilt(next);
    if (next.length === w.word.length) {
      const formed = next.join("");
      if (formed === w.word) {
        setScore((s) => s + 1);
        setTimeout(() => {
          setBuilt([]);
          if (wordIdx + 1 >= words.length) {
            const s2 = score + 1;
            onComplete(s2 >= 3 ? 3 : s2 >= 2 ? 2 : 1, s2 * 33);
          } else {
            setWordIdx((i) => i + 1);
          }
        }, 800);
      } else {
        setShaking(true);
        setTimeout(() => { setBuilt([]); setShaking(false); }, 600);
      }
    }
  };

  const letterColors = ["#4ECDC4", "#FFD166", "#A78BFA", "#F472B6", "#52E090"];

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-black text-white drop-shadow-md text-center mb-1">
        Build the word!
      </h2>
      <p className="text-white/50 text-sm text-center mb-5 italic">"{w.hint}"</p>

      <motion.div
        animate={shaking ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-3 justify-center mb-6"
      >
        {Array.from({ length: w.word.length }).map((_, i) => (
          <div
            key={i}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white relative overflow-hidden"
            style={{
              background: built[i] ? `linear-gradient(160deg, ${letterColors[i]}BB, ${letterColors[i]}77)` : "rgba(255,255,255,0.1)",
              border: `2.5px solid ${built[i] ? letterColors[i] : "rgba(255,255,255,0.15)"}`,
              boxShadow: built[i] ? `0 4px 0 ${letterColors[i]}55` : "0 4px 0 rgba(0,0,0,0.2)",
            }}
          >
            {built[i] && <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-xl" />}
            <span className="relative z-10">{built[i] || ""}</span>
          </div>
        ))}
      </motion.div>

      <div className="flex gap-3 justify-center flex-wrap">
        {w.letters.map((letter, i) => {
          const used = built.filter((b) => b === letter).length >= w.word.split("").filter((c) => c === letter).length;
          return (
            <motion.button
              key={i}
              whileHover={!used ? { scale: 1.1, y: -3 } : {}}
              whileTap={!used ? { scale: 0.9 } : {}}
              onClick={() => !used && addLetter(letter, i)}
              disabled={used}
              className="w-14 h-14 rounded-2xl text-2xl font-black relative overflow-hidden"
              style={{
                background: used ? "rgba(255,255,255,0.06)" : `linear-gradient(160deg, ${letterColors[i % letterColors.length]}CC, ${letterColors[i % letterColors.length]}88)`,
                border: `2.5px solid ${used ? "rgba(255,255,255,0.1)" : letterColors[i % letterColors.length]}`,
                color: used ? "rgba(255,255,255,0.2)" : "white",
                boxShadow: used ? "none" : `0 5px 0 ${letterColors[i % letterColors.length]}55`,
              }}
            >
              {!used && <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-xl" />}
              <span className="relative z-10">{letter}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="text-center mt-4">
        <span className="text-white/40 text-sm">{wordIdx + 1} / {words.length}</span>
      </div>
    </div>
  );
}

function GenericMiniGame({ title, onComplete }: { title: string; onComplete: (stars: number, score: number) => void }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const total = 5;
  const correctIdx = Math.floor(Math.random() * 4);
  const optionColors = ["#FFD166", "#4ECDC4", "#A78BFA", "#F472B6"];

  const handleTap = (idx: number) => {
    if (feedback) return;
    const ok = idx === correctIdx;
    setFeedback(ok ? "correct" : "wrong");
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= total) {
        const s2 = score + (ok ? 1 : 0);
        onComplete(s2 >= total ? 3 : s2 >= 3 ? 2 : 1, s2 * 20);
      } else {
        setRound((r) => r + 1);
      }
    }, 700);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-black text-white text-center mb-3">{title}</h2>
      <div className="flex justify-center gap-1 mb-6">
        {[...Array(total)].map((_, i) => <StarSVG key={i} filled={i < score} size={24} />)}
      </div>
      <div className="text-center py-6 mb-6 rounded-3xl bg-black/20 border border-white/10">
        <p className="text-white/50 text-sm mb-2">Tap the correct answer!</p>
        <p className="text-5xl font-black text-white">Round {round + 1}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {optionColors.map((color, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTap(i)}
            className="py-8 rounded-[28px] text-3xl font-black text-white relative overflow-hidden"
            style={{
              background: feedback === "correct" && i === correctIdx ? "linear-gradient(160deg, #2ECC71, #1B8B47)"
                : feedback === "wrong" && i === correctIdx ? "linear-gradient(160deg, #FF6B6B, #C0392B)"
                : `linear-gradient(160deg, ${color}CC, ${color}88)`,
              border: `2.5px solid ${color}`,
              boxShadow: `0 6px 0 ${color}66`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-[26px]" />
            <span className="relative z-10">{i + 1}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

const VIMO_MESSAGES = {
  start: ["Let's go!", "You can do it!", "Adventure time!"],
  correct: ["Amazing!", "You got it!", "Super smart!", "Wow, brilliant!"],
  wrong: ["Try again!", "Almost there!", "You've got this!"],
  complete: ["You're a star!", "Incredible!", "What a champion!"],
};

export default function PlayPage() {
  const { worldId, gameId } = useParams<{ worldId: string; gameId: string }>();
  const [, setLocation] = useLocation();
  const [gameOver, setGameOver] = useState(false);
  const [finalStars, setFinalStars] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; color: string }[]>();
  const [vimoMsg, setVimoMsg] = useState(VIMO_MESSAGES.start[0]);
  const [vimoExpr, setVimoExpr] = useState<"happy" | "thinking" | "excited" | "sad">("happy");
  const sparkleId = useRef(0);

  const completeScene = useCompleteScene();
  const claimReward = useClaimReward();

  useEffect(() => {
    const msgs = VIMO_MESSAGES.start;
    setVimoMsg(msgs[Math.floor(Math.random() * msgs.length)]);
  }, []);

  const addSparkles = useCallback((x: number, y: number) => {
    const colors = ["#FFD166", "#4ECDC4", "#A78BFA", "#F472B6", "#52E090", "white"];
    const newOnes = Array.from({ length: 6 }, (_, i) => ({
      id: sparkleId.current++,
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 40,
      color: colors[i % colors.length],
    }));
    setSparkles((s) => [...(s ?? []), ...newOnes]);
    setTimeout(() => setSparkles((s) => s?.filter((sp) => !newOnes.find((n) => n.id === sp.id))), 1000);
  }, []);

  const handleComplete = useCallback((stars: number, score: number) => {
    setFinalStars(stars);
    setFinalScore(score);
    setGameOver(true);
    setVimoExpr("excited");
    const msgs = VIMO_MESSAGES.complete;
    setVimoMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    addSparkles(window.innerWidth / 2, window.innerHeight / 2);

    const sceneId = GAME_ID_TO_SCENE[gameId ?? ""] ?? Number(worldId);
    completeScene.mutate({ sceneId, data: { starsEarned: stars, score, playTimeSeconds: 45 } });
    claimReward.mutate({ data: { stars, crystals: stars * 3, coins: score, badge: stars === 3 ? "Gold Star" : null } });
  }, [gameId, worldId, completeScene, claimReward, addSparkles]);

  const renderGame = () => {
    switch (gameId) {
      case "count-fireflies": return <CountFirefliesGame onComplete={handleComplete} />;
      case "sort-leaves": return <SortLeavesGame onComplete={handleComplete} />;
      case "mushroom-patterns": return <MushroomPatternsGame onComplete={handleComplete} />;
      case "star-math": return <StarMathGame onComplete={handleComplete} />;
      case "shape-planets": return <ShapePlanetsGame onComplete={handleComplete} />;
      case "letter-hunt": return <LetterHuntGame onComplete={handleComplete} />;
      case "word-builder": return <WordBuilderGame onComplete={handleComplete} />;
      default:
        return <GenericMiniGame title={gameId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Mini Game"} onComplete={handleComplete} />;
    }
  };

  const bgColors: Record<string, string> = { "1": "#0D2B1A", "2": "#0D0D2E", "3": "#1A0A2E" };
  const bg = bgColors[worldId ?? "1"] ?? "#0D0D2E";

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col" style={{ backgroundColor: bg }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white"
            style={{ width: 1 + Math.random() * 2.5, height: 1 + Math.random() * 2.5, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.1 + Math.random() * 0.3 }}
            animate={{ opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {sparkles?.map((s) => <Sparkle key={s.id} x={s.x} y={s.y} color={s.color} />)}

      <div className="relative z-20 flex items-center justify-between p-4 pt-5">
        <Link href={`/world/${worldId}`}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full glass-strong border-2 border-white/25 flex items-center justify-center backdrop-blur-sm cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4 L7 10 L13 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </Link>

        <div className="glass-strong backdrop-blur-sm rounded-full px-5 py-2 border-2 border-white/20">
          <span className="text-white font-black text-sm capitalize text-glow">
            {gameId?.replace(/-/g, " ")}
          </span>
        </div>

        <div className="w-12 h-12" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <AnimatePresence mode="wait">
          {!gameOver ? (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {renderGame()}
            </motion.div>
          ) : (
<motion.div
               key="complete"
               initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
               animate={{ scale: 1, opacity: 1, rotate: 0 }}
               transition={{ type: "spring", bounce: 0.5, duration: 0.7 }}
               className="w-full max-w-sm mx-auto"
             >
               <div className="relative rounded-[44px] p-8 text-center overflow-hidden glass-strong border-2 border-[#FFD166]/50"
                 style={{ boxShadow: "0 24px 70px rgba(245,166,35,0.4)" }}>
                 <div className="absolute top-0 left-0 right-0 h-1/4 bg-white/35 rounded-t-[40px]" />
                 <div className="relative z-10">
                   <div className="mb-4">
                     <h2 className="text-4xl font-black text-white mb-2 leading-tight text-glow">
                       Level Complete!
                     </h2>
                   </div>
                   <div className="flex justify-center gap-3 mb-5">
                     {[0, 1, 2].map((i) => (
                       <motion.div
                         key={i}
                         initial={{ scale: 0, rotate: -180 }}
                         animate={{ scale: 1, rotate: 0 }}
                         transition={{ delay: 0.2 + i * 0.1, type: "spring", bounce: 0.7 }}
                         className={i < finalStars ? "game-glow" : ""}
                       >
                         <StarSVG filled={i < finalStars} size={48} />
                       </motion.div>
                     ))}
                   </div>
                   <div className="flex gap-3 justify-center mb-6">
                     <div className="bg-[#FFD166]/25 border-2 border-[#FFD166] rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-lg">
                       <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="game-glow">
                         <path d="M10 2 L12.5 7 L18 7 L13.5 11 L15.5 17 L10 13.5 L4.5 17 L6.5 11 L2 7 L7.5 7 Z" fill="#D4930A"/>
                       </svg>
                       <span className="font-black text-white text-lg">+{finalStars}</span>
                     </div>
                     <div className="bg-[#4ECDC4]/25 border-2 border-[#4ECDC4] rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-lg teal-glow">
                       <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                         <path d="M10 2 L15 8 L15 14 L10 18 L5 14 L5 8 Z" fill="#4ECDC4" stroke="#2B9B93" strokeWidth="1"/>
                       </svg>
                       <span className="font-black text-white text-lg">+{finalStars * 3}</span>
                     </div>
                   </div>
                   <motion.button
                     whileHover={{ scale: 1.05, y: -3 }}
                     whileTap={{ scale: 0.96 }}
                     onClick={() => setLocation(`/world/${worldId}`)}
                     className="w-full py-4 rounded-[26px] text-xl font-black text-white relative overflow-hidden shine"
                     style={{ background: "linear-gradient(160deg, #FFD166, #F5A623)", boxShadow: "0 8px 0 #D4930A, 0 14px 30px rgba(245,166,35,0.4)" }}
                   >
                     <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/25 rounded-t-[24px]" />
                     <span className="relative z-10 text-glow">Continue Adventure</span>
                   </motion.button>
                 </div>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-4 z-30 relative">
        <VimoBubble message={vimoMsg} expression={vimoExpr} />
        <VimoCharacter expression={vimoExpr} />
      </div>
    </div>
  );
}
