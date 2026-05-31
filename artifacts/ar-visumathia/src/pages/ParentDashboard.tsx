import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useProgressStore } from '@/lib/progressStore';
import { useI18n, CURRICULUM_MAP } from '@/lib/i18n';
import { StarIcon } from '@/components/ui/GameIcons';
import { playSfx } from '@/lib/audio';

/**
 * Parent Dashboard — shows child's progress, curriculum alignment, and stats.
 * Designed for UK/US parents and teachers to see learning outcomes.
 */
export function ParentDashboard() {
  const [, setLocation] = useLocation();
  const { locale, setLocale } = useI18n();
  const { scenes, totalStars, totalScore, totalPlayTime, sessionsPlayed, currentStreak, playerName, achievements, difficulty, setDifficulty } = useProgressStore();

  const completedCount = Object.values(scenes).filter(s => s.completed).length;
  const totalMinutes = Math.floor(totalPlayTime / 60);

  return (
    <div className="fixed inset-0 bg-[#f0f2f5] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <motion.button
          onClick={() => { playSfx('click'); setLocation('/home'); }}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <h1 className="font-display font-bold text-foreground text-sm flex-1">
          {locale === 'en' ? 'Parent Dashboard' : 'Dashboard Orang Tua'}
        </h1>
        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
          className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold text-muted-foreground"
        >
          {locale === 'en' ? '🇮🇩 ID' : '🇬🇧 EN'}
        </button>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Player card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-display font-bold text-primary text-sm">{playerName?.[0] || '?'}</span>
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">{playerName || 'Player'}</p>
              <p className="text-muted-foreground text-[10px]">{currentStreak} day streak</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <StarIcon size={18} />
              <span className="font-bold text-foreground text-sm">{totalStars}/30</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center bg-gray-50 rounded-xl p-2">
              <p className="font-bold text-foreground text-sm">{completedCount}</p>
              <p className="text-muted-foreground text-[9px]">Scenes</p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-2">
              <p className="font-bold text-foreground text-sm">{totalScore}</p>
              <p className="text-muted-foreground text-[9px]">Score</p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-2">
              <p className="font-bold text-foreground text-sm">{totalMinutes}m</p>
              <p className="text-muted-foreground text-[9px]">Play Time</p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-2">
              <p className="font-bold text-foreground text-sm">{sessionsPlayed}</p>
              <p className="text-muted-foreground text-[9px]">Sessions</p>
            </div>
          </div>
        </div>

        {/* Difficulty setting */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-foreground text-xs mb-2">{locale === 'en' ? 'Difficulty' : 'Kesulitan'}</p>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-full text-[10px] font-bold transition-all ${
                  difficulty === d ? 'bg-primary text-white' : 'bg-gray-100 text-muted-foreground'
                }`}
              >
                {d === 'easy' ? (locale === 'en' ? 'Easy' : 'Mudah') :
                 d === 'medium' ? (locale === 'en' ? 'Medium' : 'Sedang') :
                 (locale === 'en' ? 'Hard' : 'Sulit')}
              </button>
            ))}
          </div>
        </div>

        {/* Curriculum alignment */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-foreground text-xs mb-2">
            {locale === 'en' ? 'Curriculum Alignment' : 'Keselarasan Kurikulum'}
          </p>
          <p className="text-muted-foreground text-[10px] mb-3">
            {locale === 'en'
              ? 'Aligned with UK EYFS and US Common Core K standards'
              : 'Selaras dengan UK EYFS dan US Common Core K'}
          </p>
          <div className="space-y-2">
            {Object.entries(CURRICULUM_MAP).slice(0, 5).map(([id, curr]) => {
              const sceneProgress = scenes[Number(id)];
              return (
                <div key={id} className="flex items-center gap-2 text-[10px]">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    sceneProgress?.completed ? 'bg-[#6BCB77] text-white' : 'bg-gray-100 text-muted-foreground'
                  }`}>{id}</div>
                  <div className="flex-1">
                    <p className="text-foreground font-semibold">{curr.eyfs[0]}</p>
                    <p className="text-muted-foreground">{curr.commonCore[0]}</p>
                  </div>
                  {sceneProgress?.completed && <span className="text-[#6BCB77] font-bold">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-foreground text-xs mb-2">
            {locale === 'en' ? 'Achievements' : 'Pencapaian'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {achievements.slice(0, 6).map(a => (
              <div key={a.id} className={`text-center p-2 rounded-xl ${a.unlocked ? 'bg-[#FFD93D]/10' : 'bg-gray-50'}`}>
                <div className={`text-lg mb-0.5 ${a.unlocked ? '' : 'grayscale opacity-40'}`}>
                  {a.id.includes('star') ? '⭐' : a.id.includes('complete') ? '🏆' : a.id.includes('streak') ? '🔥' : '🎯'}
                </div>
                <p className={`text-[8px] font-bold ${a.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {locale === 'en' ? a.name : a.nameId}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
