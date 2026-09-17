import React from 'react';

interface AppleLiquidLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AppleLiquidLogo: React.FC<AppleLiquidLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  const containerSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative shrink-0 flex items-center justify-center group ${className}`}>
      {/* 1. Liquid Glow Ambient Aura (Multi-Color Spectrum inspired by user avatar ring) */}
      <div
        className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-pink-500 opacity-70 blur-md group-hover:opacity-95 group-hover:blur-lg transition-all duration-500 animate-pulse"
        style={{ animationDuration: '3s' }}
        aria-hidden="true"
      />

      {/* 2. Secondary concentrated bottom neon bloom */}
      <div
        className="absolute -bottom-1 inset-x-1 h-3 rounded-full bg-indigo-500/80 blur-sm"
        aria-hidden="true"
      />

      {/* 3. Apple Squircle Liquid Glass Body */}
      <div
        className={`relative ${containerSize} rounded-[13px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-[1.5px] shadow-[0_8px_20px_-3px_rgba(99,102,241,0.5),0_2px_8px_rgba(0,0,0,0.3)] overflow-hidden transition-transform duration-300 group-hover:scale-105`}
      >
        {/* Dynamic Iridescent Liquid Border */}
        <div className="absolute inset-0 rounded-[12px] bg-gradient-to-tr from-cyan-400/80 via-purple-400/60 to-pink-400/80 opacity-90 pointer-events-none" />

        {/* Inner Glass Chamber */}
        <div className="relative w-full h-full rounded-[11px] bg-gradient-to-b from-slate-900/95 via-indigo-950/90 to-slate-950/95 backdrop-blur-md flex items-center justify-center overflow-hidden">
          {/* Specular Apple Glass Top Arc Highlight */}
          <div
            className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-[11px] pointer-events-none"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }}
          />

          {/* Diagonal Glass Sheen Reflection */}
          <div className="absolute -top-6 -left-6 w-12 h-16 bg-white/15 rotate-25 blur-[2px] pointer-events-none" />

          {/* 4. THE "S" GLYPH - Apple Liquid Typography */}
          <span
            className="relative font-black tracking-tighter select-none bg-gradient-to-b from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(99,102,241,0.7)]"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Plus Jakarta Sans", "Poppins", sans-serif',
              fontWeight: 900,
              textShadow: '0 0 14px rgba(129, 140, 248, 0.65)',
            }}
          >
            S
          </span>

          {/* Tiny bottom luminescence dot */}
          <div className="absolute bottom-1 w-2.5 h-0.5 rounded-full bg-cyan-300/70 blur-[0.5px]" />
        </div>
      </div>
    </div>
  );
};
