import React from 'react';
import { X, CheckCircle, Sun, Grid3X3, Layers, Sparkles, Sliders } from 'lucide-react';
import { AppleLiquidLogo } from './AppleLiquidLogo';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <AppleLiquidLogo size="sm" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Improvements & Features Guide
            </h2>
          </div>
          <button
            type="button"
            id="close-help-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-600 dark:text-slate-300">
          {/* Section 1: Daylight / Dark Theme */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200 mb-1">
              <Sun className="w-4 h-4 text-amber-500" />
              1. Day / Light Mode & Dark Theme
            </div>
            <p className="text-xs text-amber-950/80 dark:text-amber-200/80 leading-relaxed">
              In your original Streamlit code, the theme was hardcoded to dark gradients which made reading labels outdoors or during daylight very difficult.
              Now, you can easily toggle between <strong>Light Theme (Daylight high contrast)</strong> and <strong>Dark Studio Theme</strong> from the top navbar at any time!
            </p>
          </div>

          {/* Section 2: Custom Watermark Positioning */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
              <Grid3X3 className="w-4 h-4 text-indigo-500" />
              2. Pro Custom Positioning Options
            </div>
            <ul className="text-xs space-y-1.5 text-indigo-950/80 dark:text-indigo-200/80 list-disc list-inside">
              <li><strong>9-Point Anchor Grid:</strong> Instantly snap watermarks to Top-Left, Top-Center, Top-Right, Center, Bottom-Right, etc.</li>
              <li><strong>Click-to-Position on Canvas:</strong> Click the move icon on any photo card and click directly on the image to set the watermark location!</li>
              <li><strong>Rotation Control:</strong> Freely rotate text or logos (-180° to 180°, with quick angle buttons).</li>
              <li><strong>Tiled / Full Repeat Mode:</strong> Protect photographs with diagonal repeated watermarks across the entire surface.</li>
            </ul>
          </div>

          {/* Section 3: Layout Columns */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2 font-semibold text-cyan-900 dark:text-cyan-200 mb-1">
              <Sliders className="w-4 h-4 text-cyan-500" />
              3. Flexible Responsive Layout Columns
            </div>
            <p className="text-xs text-cyan-950/80 dark:text-cyan-200/80 leading-relaxed">
              Switch smoothly between <strong>2, 3, 4, or 6 columns</strong> depending on your display size. Also includes a full-screen zoom inspector and instant Before/After original comparison.
            </p>
          </div>

          {/* Section 4: Performance */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              4. Client-Side Speed & No Server Limits
            </div>
            <p className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed">
              Unlike the Python Streamlit server which reloads on every slider change, this web studio computes canvas watermarks instantly in real-time, supports infinite high-res images, and packages your ZIP download directly on your device.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="pro-pill-btn px-5 py-2 text-xs font-bold"
          >
            Got it, Let's Start
          </button>
        </div>
      </div>
    </div>
  );
};
