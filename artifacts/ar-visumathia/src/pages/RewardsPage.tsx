import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useGetRewards, useGetStats } from '@workspace/api-client-react';
import vimoIdle from '@/assets/sprites/vimo_idle.png';
import {
  PaintedSkyMeadow,
  ParchmentPanel,
  WoodSign,
  PaintedBackButton,
  PaintedStar,
  PaintedGem,
  PaintedCoin,
} from '@/components/painted';

const BADGES: { id: string; label: string; color: string; icon: string }[] = [
  { id: 'first_star', label: 'First Star',  color: '#f5b942', icon: '★' },
  { id: 'explorer',   label: 'Explorer',    color: '#4d9bc8', icon: '🧭' },
  { id: 'counter',    label: 'Counter',     color: '#7bb24a', icon: '🔢' },
  { id: 'builder',    label: 'Builder',     color: '#e07b39', icon: '🧱' },
  { id: 'champion',   label: 'Champion',    color: '#a36adb', icon: '🏆' },
  { id: 'vimo_friend', label: "Vimo's BFF", color: '#e15a3b', icon: '❤' },
];

export function RewardsPage() {
  const [, setLocation] = useLocation();
  const { data: rewards } = useGetRewards();
  const { data: stats } = useGetStats();
  const earnedBadges = rewards?.badges ?? [];

  return (
    <div className="fixed inset-0 overflow-auto">
      <div className="absolute inset-0 z-0">
        <PaintedSkyMeadow />
      </div>

      <PaintedBackButton onClick={() => setLocation('/home')} />

      <div className="relative z-10 px-4 pt-4 pb-12 max-w-md mx-auto">
        <div className="flex justify-center mb-3">
          <WoodSign text="Hadiahku" width={260} height={64} />
        </div>

        {/* Vimo portrait with sun-burst */}
        <motion.div
          className="flex justify-center mb-4"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            style={{
              position: 'relative',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 30% 28%, #fff7c4 0%, #fcd34d 55%, #c98a2c 100%)',
              border: '3px solid #2a1809',
              boxShadow: '4px 5px 0 #2a1809, inset 0 2px 0 rgba(255,255,255,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={vimoIdle} alt="Vimo" style={{ width: 92, height: 92, objectFit: 'contain' }} />
          </div>
        </motion.div>

        {/* Currency cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            {
              label: 'Bintang',
              value: rewards?.totalStars ?? 0,
              icon: <PaintedStar size={36} />,
              color: '#fcd34d',
            },
            {
              label: 'Kristal',
              value: rewards?.totalCrystals ?? 0,
              icon: <PaintedGem size={36} />,
              color: '#4d9bc8',
            },
            {
              label: 'Koin',
              value: rewards?.totalCoins ?? 0,
              icon: <PaintedCoin size={36} />,
              color: '#e9b34a',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3 }}
              style={{
                position: 'relative',
                background: '#fffaf0',
                border: '3px solid #2a1809',
                borderRadius: 18,
                boxShadow: '3px 4px 0 #2a1809',
                padding: '12px 8px',
                textAlign: 'center',
              }}
            >
              <div className="flex justify-center mb-1">{item.icon}</div>
              <div
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  color: '#2a1809',
                  fontSize: 22,
                  lineHeight: 1,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 10,
                  color: '#7a4a17',
                  marginTop: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        {stats && (
          <ParchmentPanel width="100%" height={180} className="mb-4">
            <div className="absolute inset-0 p-4">
              <div
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  color: '#2a1809',
                  fontSize: 16,
                  marginBottom: 10,
                }}
              >
                Statistik Petualangan
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Dunia Selesai', value: `${stats.totalScenesCompleted}/10` },
                  { label: 'Penyelesaian', value: `${Math.round(stats.completionPercentage)}%` },
                  { label: 'Rata Bintang', value: stats.averageStarsPerScene.toFixed(1) },
                  { label: 'Lama Bermain', value: `${Math.floor(stats.totalPlayTimeSeconds / 60)}m` },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#f7e7b4',
                      border: '2px solid #2a1809',
                      borderRadius: 12,
                      padding: '6px 8px',
                      textAlign: 'center',
                      boxShadow: '2px 2px 0 #2a1809',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Fredoka One', cursive",
                        color: '#2a1809',
                        fontSize: 16,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 800,
                        fontSize: 10,
                        color: '#7a4a17',
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              {/* progress bar */}
              <div className="mt-3">
                <div
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: 10,
                    color: '#7a4a17',
                    marginBottom: 4,
                  }}
                >
                  Progres Cerita
                </div>
                <div
                  style={{
                    height: 14,
                    background: '#3d2410',
                    border: '2px solid #2a1809',
                    borderRadius: 9999,
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 0 rgba(0,0,0,0.35)',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.completionPercentage}%` }}
                    transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background:
                        'linear-gradient(90deg, #a3d075 0%, #7bb24a 50%, #5b8a35 100%)',
                      borderRight: '2px solid #2a1809',
                    }}
                  />
                </div>
              </div>
            </div>
          </ParchmentPanel>
        )}

        {/* Badges */}
        <div
          style={{
            fontFamily: "'Fredoka One', cursive",
            color: '#2a1809',
            fontSize: 16,
            marginBottom: 10,
            textShadow: '0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          Badge
        </div>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((badge, i) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.05 + i * 0.04, type: 'spring', stiffness: 240 }}
                whileHover={earned ? { y: -4 } : {}}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
              >
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 18,
                    background: earned
                      ? `radial-gradient(circle at 30% 28%, #faecc4, ${badge.color} 60%, ${shade(badge.color, -22)} 100%)`
                      : '#cfc7a8',
                    border: '3px solid #2a1809',
                    boxShadow: earned ? '3px 4px 0 #2a1809' : '2px 3px 0 #2a1809',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 30,
                    color: '#fff7c4',
                    textShadow: '0 2px 0 rgba(0,0,0,0.35)',
                    filter: earned ? 'none' : 'grayscale(0.7) brightness(0.85)',
                  }}
                >
                  {badge.icon}
                </div>
                <div
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: 11,
                    textAlign: 'center',
                    color: earned ? '#2a1809' : '#7a4a17',
                    lineHeight: 1.1,
                  }}
                >
                  {badge.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function shade(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + Math.round((percent / 100) * 255)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round((percent / 100) * 255)));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round((percent / 100) * 255)));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
