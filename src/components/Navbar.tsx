import React from 'react';
import { AppTool, PreviewColumns, ThemeMode } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { AppleLiquidLogo } from './AppleLiquidLogo';
import {
  Sparkles,
  Crop,
  Download,
  Grid2X2,
  Grid3X3,
  Columns,
  Image as ImageIcon,
  Loader2,
  HelpCircle,
} from 'lucide-react';

interface NavbarProps {
  tool: AppTool;
  onToolChange: (t: AppTool) => void;
  theme: ThemeMode;
  onThemeChange: (t: ThemeMode) => void;
  columns: PreviewColumns;
  onColumnsChange: (cols: PreviewColumns) => void;
  imagesCount: number;
  onLoadSamples: () => void;
  onExportAllZip: () => void;
  isExportingZip: boolean;
  exportProgress: number;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  tool,
  onToolChange,
  theme,
  onThemeChange,
  columns,
  onColumnsChange,
  imagesCount,
  onLoadSamples,
  onExportAllZip,
  isExportingZip,
  exportProgress,
  onOpenHelp,
}) => {
  return (
    <header className="shrink-0 h-16 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand with Apple Liquid Glow 'S' Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <AppleLiquidLogo size="md" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                Watermark Tool
              </h1>
              {/* Exact Pro Pill Badge from User Reference */}
              <span className="pro-badge-exact px-3 py-0.5 text-xs tracking-tight font-bold">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden md:block">
              High-Precision Bulk Watermark & Aspect Crop
            </p>
          </div>
        </div>

        {/* Center: Tool Mode Switcher (Capsule Pill Design) */}
        <div className="hidden sm:flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <button
            type="button"
            id="nav-tool-watermark"
            onClick={() => onToolChange('watermark')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              tool === 'watermark'
                ? 'pro-pill-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${tool === 'watermark' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
            <span>Watermark Tool</span>
          </button>

          <button
            type="button"
            id="nav-tool-crop"
            onClick={() => onToolChange('crop')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              tool === 'crop'
                ? 'pro-pill-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Crop className={`w-3.5 h-3.5 ${tool === 'crop' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
            <span>Bulk Crop Tool</span>
          </button>
        </div>

        {/* Right Actions: Column Selector, Theme Toggle & Bulk Export */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Column Layout Selector */}
          {tool === 'watermark' && (
            <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Cols:</span>
              {([2, 3, 4, 6] as PreviewColumns[]).map((col) => (
                <button
                  key={col}
                  type="button"
                  id={`grid-col-btn-${col}`}
                  onClick={() => onColumnsChange(col)}
                  className={`w-6 h-6 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                    columns === col
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          )}

          {/* Load Sample Images - Pro Pill Style */}
          {imagesCount === 0 && (
            <button
              type="button"
              id="load-samples-btn"
              onClick={onLoadSamples}
              className="pro-pill-btn hidden sm:inline-flex px-3.5 py-1.5 text-xs font-bold gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Load Samples</span>
            </button>
          )}

          {/* Theme Toggle (Daylight / Studio Dark) */}
          <ThemeToggle theme={theme} onToggle={onThemeChange} />

          {/* Help button */}
          <button
            type="button"
            id="help-guide-btn"
            onClick={onOpenHelp}
            title="What's improved & How to use"
            className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Download All ZIP Button - EXACT PRO PILL DESIGN WITH LIQUID GLOW */}
          {tool === 'watermark' && imagesCount > 0 && (
            <button
              type="button"
              id="export-all-zip-btn"
              onClick={onExportAllZip}
              disabled={isExportingZip}
              className="pro-pill-btn px-4 py-2 text-xs font-bold gap-2 disabled:opacity-50"
            >
              {isExportingZip ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>Zipping {exportProgress}%</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Download ZIP ({imagesCount})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tool Selector */}
      <div className="sm:hidden flex items-center border-t border-slate-200 dark:border-slate-800 px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
        <button
          type="button"
          onClick={() => onToolChange('watermark')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-full transition-all ${
            tool === 'watermark'
              ? 'pro-pill-btn'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Watermark Tool
        </button>
        <button
          type="button"
          onClick={() => onToolChange('crop')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-full transition-all ${
            tool === 'crop'
              ? 'pro-pill-btn'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Bulk Crop Tool
        </button>
      </div>
    </header>
  );
};
