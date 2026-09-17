import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: (theme: ThemeMode) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAction, setCurrentAction] = useState<'idle' | 'walking_to_sun' | 'walking_to_moon'>('idle');

  const characterControls = useAnimation();
  const leg1Controls = useAnimation();
  const leg2Controls = useAnimation();

  // Exact distance from Moon center (left) to Sun center (right)
  // Moon center: 19px from left
  // Sun center: 97px from left
  // TRAVEL_X = 97 - 19 = 78px
  const TRAVEL_X = 78;

  const handleToggle = () => {
    if (isAnimating) return;
    const nextTheme: ThemeMode = isDark ? 'light' : 'dark';

    if (nextTheme === 'dark') {
      // User clicked to go DARK:
      // Character hops off the Moon, walks across and covers the Sun completely!
      playCoverSunAnimation();
    } else {
      // User clicked to go LIGHT:
      // Character hops off the Sun, runs across and covers the Moon completely!
      playCoverMoonAnimation();
    }

    onToggle(nextTheme);
  };

  // 1. ANIMATION: Walk to Sun and Cover It (Dark Mode)
  const playCoverSunAnimation = async () => {
    setIsAnimating(true);
    setCurrentAction('walking_to_sun');

    // Anticipation hop
    await characterControls.start({
      y: -4,
      scale: 1.05,
      transition: { duration: 0.12 },
    });

    // Marching legs
    leg1Controls.start({
      rotate: [-26, 30, -26, 30, 0],
      transition: { duration: 0.52, ease: 'linear' },
    });
    leg2Controls.start({
      rotate: [30, -26, 30, -26, 0],
      transition: { duration: 0.52, ease: 'linear' },
    });

    // Character walks across from Moon to Sun
    await characterControls.start({
      x: TRAVEL_X,
      y: [-3, 0, -3, 0],
      scale: 1,
      transition: { duration: 0.52, ease: 'easeInOut' },
    });

    // Snugly settle down directly on top of the Sun, fully covering it!
    await characterControls.start({
      y: [0, -1.5, 0],
      scale: [1, 1.08, 1],
      transition: { duration: 0.2 },
    });

    setIsAnimating(false);
    setCurrentAction('idle');
  };

  // 2. ANIMATION: Walk to Moon and Cover It (Light Mode)
  const playCoverMoonAnimation = async () => {
    setIsAnimating(true);
    setCurrentAction('walking_to_moon');

    // Anticipation hop
    await characterControls.start({
      y: -4,
      scale: 1.05,
      transition: { duration: 0.12 },
    });

    // Running legs
    leg1Controls.start({
      rotate: [30, -30, 30, -30, 0],
      transition: { duration: 0.48, ease: 'linear' },
    });
    leg2Controls.start({
      rotate: [-30, 30, -30, 30, 0],
      transition: { duration: 0.48, ease: 'linear' },
    });

    // Character runs back across from Sun to Moon
    await characterControls.start({
      x: 0,
      y: [-3, 0, -3, 0],
      scale: 1,
      transition: { duration: 0.48, ease: 'easeInOut' },
    });

    // Snugly settle down directly on top of the Moon, fully covering it!
    await characterControls.start({
      y: [0, -1.5, 0],
      scale: [1, 1.08, 1],
      transition: { duration: 0.2 },
    });

    setIsAnimating(false);
    setCurrentAction('idle');
  };

  // Synchronize positions if theme state changes externally
  useEffect(() => {
    if (!isAnimating) {
      if (isDark) {
        // Dark Mode: Character is at Sun (x: TRAVEL_X), fully covering the Sun!
        characterControls.set({ x: TRAVEL_X, y: 0, scale: 1 });
      } else {
        // Light Mode: Character is at Moon (x: 0), fully covering the Moon!
        characterControls.set({ x: 0, y: 0, scale: 1 });
      }
    }
  }, [isDark, isAnimating, TRAVEL_X, characterControls]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        id="interactive-theme-world-toggle"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        title={
          isDark
            ? "Dark Mode: Sun is fully covered & Moon is visible (Click for Light Mode)"
            : "Light Mode: Moon is fully covered & Sun is visible (Click for Dark Mode)"
        }
        onClick={handleToggle}
        className={`relative inline-flex items-center h-9 w-[116px] rounded-full p-1 cursor-pointer transition-all duration-500 overflow-hidden border-2 shadow-inner focus:outline-hidden ${
          isDark
            ? 'bg-gradient-to-r from-slate-950 via-[#0B132B] to-[#1C2541] border-indigo-900/80 shadow-[0_0_14px_rgba(30,41,59,0.6)]'
            : 'bg-gradient-to-r from-sky-100 via-amber-50 to-amber-100/90 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
        }`}
      >
        {/* ================= BACKGROUND ENVIRONMENT ================= */}
        {/* Twinkling Night Stars in Dark Mode */}
        {isDark && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1.5 left-9 w-1 h-1 bg-white/80 rounded-full animate-pulse" />
            <div className="absolute bottom-2 left-14 w-0.75 h-0.75 bg-indigo-200/70 rounded-full" />
            <div className="absolute top-2 left-18 w-0.5 h-0.5 bg-white/90 rounded-full" />
          </div>
        )}

        {/* --- LEFT SIDE: 3D MOON (Chanda Mama) --- */}
        {/* Size: 22px. Covered fully when character is at x: 0 in Light Mode */}
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10"
          title="Moon"
        >
          {/* Soft Lunar Halo Glow */}
          <div
            className={`w-6 h-6 rounded-full absolute transition-all duration-500 ${
              isDark
                ? 'bg-indigo-300/50 blur-[5px] scale-125'
                : 'bg-slate-300/20 blur-[2px] opacity-40'
            }`}
          />

          {/* 3D Realistic Moon Sphere with Craters */}
          <div
            className={`w-5.5 h-5.5 rounded-full relative flex items-center justify-center transition-all duration-500 shadow-md overflow-hidden ${
              isDark
                ? 'bg-gradient-to-tr from-slate-300 via-slate-100 to-white ring-1 ring-indigo-300/70 shadow-[0_0_10px_rgba(199,210,254,0.7)]'
                : 'bg-gradient-to-tr from-slate-400 via-slate-300 to-slate-200 opacity-60'
            }`}
          >
            {/* Lunar Craters */}
            <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-slate-400/35" />
            <div className="absolute bottom-1 right-1.5 w-1.2 h-1.2 rounded-full bg-slate-400/40" />
            <div className="absolute top-2.5 right-1 w-0.8 h-0.8 rounded-full bg-slate-400/30" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-black/15 pointer-events-none" />
          </div>
        </div>

        {/* --- RIGHT SIDE: 3D SUN (Suraj) --- */}
        {/* Size: 22px. Covered fully when character is at x: TRAVEL_X in Dark Mode */}
        <div
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10"
          title="Sun"
        >
          {/* Pulsing Sun Corona (Only visible when uncovered in Light Mode) */}
          <div
            className={`w-7 h-7 rounded-full absolute transition-all duration-500 ${
              isDark
                ? 'opacity-0 scale-50'
                : 'bg-amber-400/50 blur-[5px] scale-125 animate-pulse opacity-100'
            }`}
          />

          {/* Rotating Solar Rays (Hidden when eclipsed in Dark Mode) */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className={`absolute transition-all duration-500 ${
              isDark ? 'opacity-0 scale-50' : 'opacity-90 animate-[spin_12s_linear_infinite] scale-100'
            }`}
          >
            <path
              d="M12 2V4M12 20V22M4 12H2M22 12H20M6.34 6.34L4.93 4.93M19.07 19.07L17.66 17.66M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* 3D Radiant Sun Sphere */}
          <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-100 shadow-[0_0_10px_rgba(245,158,11,0.85)] relative flex items-center justify-center border border-amber-300/60">
            <div className="absolute top-0.5 left-1 w-1.5 h-1.5 rounded-full bg-white/80 blur-[0.4px]" />
          </div>
        </div>

        {/* ================= THE CHARACTER (Acts as the Eclipse Body!) ================= */}
        {/*
            Character Size: 28px diameter.
            Centered perfectly:
            - At x: 0 => Sits right over the 22px Moon, completely covering it!
            - At x: TRAVEL_X (78px) => Sits right over the 22px Sun, completely covering it!
            - NO OBJECT IN HAND!
        */}
        <motion.div
          animate={characterControls}
          initial={{ x: isDark ? TRAVEL_X : 0, y: 0, scale: 1 }}
          className="absolute left-[5px] top-1/2 -translate-y-1/2 z-30 flex items-center justify-center pointer-events-none"
          style={{ width: 28, height: 28 }}
        >
          {/* Character Walking / Marching Legs */}
          <div className="absolute -bottom-2.5 inset-x-0 flex justify-center gap-1.5 pointer-events-none z-10">
            <motion.div
              animate={leg1Controls}
              className="w-1 h-3 bg-slate-900 dark:bg-slate-950 origin-top rounded-full relative"
            >
              <div className="absolute bottom-0 -right-0.5 w-1.5 h-0.75 bg-slate-900 dark:bg-slate-950 rounded-full" />
            </motion.div>
            <motion.div
              animate={leg2Controls}
              className="w-1 h-3 bg-slate-900 dark:bg-slate-950 origin-top rounded-full relative"
            >
              <div className="absolute bottom-0 -right-0.5 w-1.5 h-0.75 bg-slate-900 dark:bg-slate-950 rounded-full" />
            </motion.div>
          </div>

          {/* Character Body: 28px Round Sphere, larger than Sun & Moon to fully cover them! */}
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8B1E0F] via-[#B82B14] to-[#DC3519] ring-2 ring-amber-950/40 shadow-lg relative flex items-center justify-center"
          >
            {/* Top 3D Gloss Highlight Arc */}
            <div className="absolute top-0.5 inset-x-1.5 h-1.5 bg-white/45 rounded-full blur-[0.3px]" />

            {/* Expressive Cute Face */}
            <div className="relative z-20 flex flex-col items-center">
              {/* Eyes */}
              <div className="flex items-center gap-1.5">
                {isDark && currentAction === 'idle' ? (
                  // Cozy sleeping eyes when resting over the Sun in Dark Mode
                  <>
                    <div className="w-1.5 h-0.5 bg-white rounded-full" />
                    <div className="w-1.5 h-0.5 bg-white rounded-full" />
                  </>
                ) : (
                  // Alert cheerful eyes when covering Moon in Light Mode or Walking
                  <>
                    <div className="w-1 h-1 bg-white rounded-full shadow-2xs" />
                    <div className="w-1 h-1 bg-white rounded-full shadow-2xs" />
                  </>
                )}
              </div>

              {/* Mouth */}
              <div className="mt-0.5">
                {isDark && currentAction === 'idle' ? (
                  <div className="w-1.5 h-0.5 bg-white/80 rounded-full" />
                ) : (
                  <svg width="7" height="3.5" viewBox="0 0 6 3" fill="none">
                    <path
                      d="M1 0.5C2 2.5 4 2.5 5 0.5"
                      stroke="white"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Small Subtle Mode Label */}
        <span
          className={`absolute bottom-0.5 text-[8px] font-black uppercase tracking-widest pointer-events-none transition-all ${
            isDark
              ? 'left-8 text-indigo-300/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]'
              : 'right-7 text-slate-700 dark:text-slate-200'
          }`}
        >
          {isDark ? 'DARK' : 'LIGHT'}
        </span>
      </button>
    </div>
  );
};
