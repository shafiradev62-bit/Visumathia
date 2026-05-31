import { motion, AnimatePresence } from 'framer-motion';

interface RewardExplosionProps {
  active: boolean;
  starsEarned?: number;
}

const COLORS = ['#5BC5F2', '#FFD93D', '#FF6B6B', '#6BCB77', '#A66CFF', '#FF9F45', '#45D4A8', '#FF6B9D'];

export function RewardExplosion({ active, starsEarned = 3 }: RewardExplosionProps) {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    angle: (i / 20) * 360,
    distance: 70 + Math.random() * 60,
    color: COLORS[i % COLORS.length],
    size: 10 + Math.random() * 10,
    delay: Math.random() * 0.15,
    isCircle: i % 3 !== 0,
  }));

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {/* Confetti particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                scale: [0, 1.2, 0],
                opacity: [1, 1, 0],
                rotate: [0, 180 + Math.random() * 180],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                borderRadius: p.isCircle ? '50%' : '3px',
                backgroundColor: p.color,
              }}
            />
          ))}

          {/* Center content */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
            className="absolute flex flex-col items-center gap-3"
          >
            {/* SVG Stars */}
            <div className="flex gap-1">
              {Array.from({ length: starsEarned }).map((_, i) => (
                <motion.svg
                  key={i}
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  initial={{ rotate: -30, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
                  style={{ filter: 'drop-shadow(0 3px 8px rgba(255,217,61,0.5))' }}
                >
                  <polygon
                    points="24,4 30,18 45,19 34,28 37,43 24,35 11,43 14,28 3,19 18,18"
                    fill="#FFD93D"
                    stroke="#F5C518"
                    strokeWidth="1"
                  />
                </motion.svg>
              ))}
            </div>

            {/* Text badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-full px-6 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              <span className="font-display font-bold text-lg" style={{ color: '#FF6B9D' }}>
                PERFECT!
              </span>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
