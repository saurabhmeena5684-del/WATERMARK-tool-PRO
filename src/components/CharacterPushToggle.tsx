import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';

interface CharacterPushToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  disabled?: boolean;
}

export const CharacterPushToggle: React.FC<CharacterPushToggleProps> = ({
  id,
  checked,
  onChange,
  size = 'md',
  label,
  disabled = false,
}) => {
  const dims = size === 'sm'
    ? { w: 56, h: 26, ball: 20, travel: 30 }
    : { w: 70, h: 32, ball: 26, travel: 38 };

  const [isAnimating, setIsAnimating] = useState(false);
  const [animPhase, setAnimPhase] = useState<'idle' | 'pushing_on' | 'running_off'>('idle');

  const charControls = useAnimation();
  const cursorControls = useAnimation();
  const leg1Controls = useAnimation();
  const leg2Controls = useAnimation();

  // Playful animation matching user's exact story:
  // When ON: Character doesn't want to go! Digs feet forward to stop/resist, but cursor aggressively shoves it, causing it to slide/skid unwillingly across to ON!
  // When OFF: Character happily sprints back by itself!
  const handleToggle = () => {
    if (disabled) return;
    const nextState = !checked;

    if (nextState) {
      playSkidResistPushAnimation();
    } else {
      playRunOffAnimation();
    }

    onChange(nextState);
  };

  const playSkidResistPushAnimation = async () => {
    setIsAnimating(true);
    setAnimPhase('pushing_on');

    // 1. Cursor swoops in and makes contact from the left
    cursorControls.set({ opacity: 0, x: -22, y: 0, scale: 0.8 });
    await cursorControls.start({
      opacity: 1,
      x: -4,
      y: 0,
      scale: 1,
      transition: { duration: 0.15, ease: 'easeOut' },
    });

    // 2. RESISTANCE & SKID:
    // Character leans backwards (-24 deg) bracing against the shove!
    // Stretches both legs forward (45 deg) with heels digging down, trying to stop!
    leg1Controls.start({
      rotate: 42,
      scaleY: 1.15,
      transition: { duration: 0.12 },
    });
    leg2Controls.start({
      rotate: 36,
      scaleY: 1.12,
      transition: { duration: 0.12 },
    });

    // Character body braces backward & quivers from friction while sliding
    charControls.start({
      rotate: [-18, -26, -20, -24, -18, 0],
      transition: { duration: 0.65, ease: 'easeOut' },
    });

    // Both cursor & character skid forward together with friction decelerating
    cursorControls.start({
      x: dims.travel - 4,
      transition: { duration: 0.65, ease: [0.15, 0.85, 0.35, 1] },
    });

    await charControls.start({
      x: dims.travel,
      transition: { duration: 0.65, ease: [0.15, 0.85, 0.35, 1] },
    });

    // 3. Legs relax back to standing once stopped at ON position
    leg1Controls.start({
      rotate: 0,
      scaleY: 1,
      transition: { duration: 0.15 },
    });
    leg2Controls.start({
      rotate: 0,
      scaleY: 1,
      transition: { duration: 0.15 },
    });

    // 4. Cursor finishes nudge and gently fades away
    await cursorControls.start({
      opacity: 0,
      x: dims.travel - 10,
      scale: 0.8,
      transition: { duration: 0.2 },
    });

    setIsAnimating(false);
    setAnimPhase('idle');
  };

  const playRunOffAnimation = async () => {
    setIsAnimating(true);
    setAnimPhase('running_off');

    // Quick anticipatory hop to left
    await charControls.start({
      y: -3,
      rotate: -12,
      transition: { duration: 0.1 },
    });

    // Rapid running legs kicking while running back to 0
    leg1Controls.start({
      rotate: [30, -35, 30, -35, 30, 0],
      transition: { duration: 0.38 },
    });
    leg2Controls.start({
      rotate: [-35, 30, -35, 30, -35, 0],
      transition: { duration: 0.38 },
    });

    await charControls.start({
      x: 0,
      y: [-3, -5, 0, -3, 0],
      rotate: [-14, -8, -12, 0],
      transition: { duration: 0.38, ease: 'easeInOut' },
    });

    setIsAnimating(false);
    setAnimPhase('idle');
  };

  // Sync position if controlled externally without click
  useEffect(() => {
    if (!isAnimating) {
      charControls.set({ x: checked ? dims.travel : 0, y: 0, rotate: 0 });
      cursorControls.set({ opacity: 0, x: -22 });
      leg1Controls.set({ rotate: 0, scaleY: 1 });
      leg2Controls.set({ rotate: 0, scaleY: 1 });
    }
  }, [checked, isAnimating, dims.travel, charControls, cursorControls, leg1Controls, leg2Controls]);

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-hidden ${
          checked
            ? 'bg-emerald-500/20 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'bg-amber-100/60 dark:bg-slate-800/80 border-amber-300/80 dark:border-slate-700/80'
        } border-2`}
        style={{
          width: dims.w,
          height: dims.h,
        }}
      >
        {/* Track interior highlight indicator */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div
            className={`w-full h-full transition-opacity duration-300 ${
              checked ? 'bg-emerald-500/15' : 'bg-transparent'
            }`}
          />
        </div>

        {/* 🌟 LITTLE CURSOR ARROW (Pushes character while character resists and skids) */}
        <motion.div
          animate={cursorControls}
          initial={{ opacity: 0, x: -22, y: 0 }}
          className="absolute z-30 pointer-events-none"
          style={{
            left: 2,
            top: (dims.h - 18) / 2 - 1,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
          >
            <path
              d="M4 3L11 20L14.5 13.5L21 11L4 3Z"
              fill="#52796F"
              stroke="#2F3E46"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* 🌟 CUTE ROUND CHARACTER WITH LEGS & RESISTING/SURPRISED/HAPPY FACE */}
        <motion.div
          animate={charControls}
          initial={{ x: checked ? dims.travel : 0, y: 0 }}
          className="relative z-20 flex items-center justify-center shrink-0"
          style={{
            width: dims.ball,
            height: dims.ball,
          }}
        >
          {/* Running / Skidding Legs */}
          <div className="absolute -bottom-2 inset-x-0 flex justify-center gap-1.5 pointer-events-none z-10">
            {/* Front Leg (Reaches forward to brace & dig heels into track) */}
            <motion.div
              animate={leg1Controls}
              className="w-1 h-3 bg-slate-900 dark:bg-slate-950 origin-top rounded-full relative"
            >
              {/* Pointed Foot / Heel digging into floor */}
              <div className="absolute bottom-0 -right-1.5 w-2 h-1 bg-slate-900 dark:bg-slate-950 rounded-full" />
            </motion.div>

            {/* Back Leg */}
            <motion.div
              animate={leg2Controls}
              className="w-1 h-3 bg-slate-900 dark:bg-slate-950 origin-top rounded-full relative"
            >
              {/* Foot */}
              <div className="absolute bottom-0 -right-1.5 w-2 h-1 bg-slate-900 dark:bg-slate-950 rounded-full" />
            </motion.div>
          </div>

          {/* Cute Round Red Body (From User Reference Photo) */}
          <div
            className={`w-full h-full rounded-full transition-colors duration-200 relative flex items-center justify-center shadow-md ${
              checked
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-2 ring-emerald-300/60'
                : 'bg-gradient-to-tr from-[#8B1E0F] via-[#A82810] to-[#C93B1F] ring-1 ring-amber-900/40'
            }`}
          >
            {/* Gloss light reflection arc on top */}
            <div className="absolute top-1 inset-x-2 h-1.5 bg-white/35 rounded-full blur-[0.4px]" />

            {/* Cute Face Features */}
            <div className="relative z-20 flex flex-col items-center">
              {/* Eyes */}
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-white rounded-full shadow-2xs" />
                <div className="w-1 h-1 bg-white rounded-full shadow-2xs" />
              </div>

              {/* Mouth:
                  - During pushing_on: Resisting / surprised open mouth (○ / o) "whoaaaa!"
                  - When checked: Happy smile
                  - When unchecked idle: Cute smile
              */}
              <div className="mt-0.5">
                {animPhase === 'pushing_on' ? (
                  <div className="w-1.5 h-1.5 rounded-full border border-white bg-white/30" />
                ) : checked ? (
                  <svg width="8" height="4" viewBox="0 0 8 4" fill="none">
                    <path
                      d="M1 1C2.5 3.5 5.5 3.5 7 1"
                      stroke="white"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="6" height="3" viewBox="0 0 6 3" fill="none">
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

        {/* Small Status Text inside track (OFF / ON) */}
        <span
          className={`absolute text-[9px] font-black uppercase tracking-wider transition-opacity duration-200 pointer-events-none ${
            checked
              ? 'left-2 text-emerald-600 dark:text-emerald-400 opacity-100'
              : 'right-2 text-slate-400 dark:text-slate-500 opacity-80'
          }`}
        >
          {checked ? 'ON' : 'OFF'}
        </span>
      </button>

      {label && (
        <label
          htmlFor={id}
          onClick={handleToggle}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
};
