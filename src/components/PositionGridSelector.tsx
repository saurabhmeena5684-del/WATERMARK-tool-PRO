import React from 'react';
import { GridPosition } from '../types';
import { RotateCw, Move, Grid3X3, Layers } from 'lucide-react';
import { CharacterPushToggle } from './CharacterPushToggle';

interface PositionGridSelectorProps {
  position: GridPosition;
  onPositionChange: (pos: GridPosition) => void;
  hOffset: number;
  onHOffsetChange: (val: number) => void;
  vOffset: number;
  onVOffsetChange: (val: number) => void;
  marginPercent: number;
  onMarginChange: (val: number) => void;
  rotation: number;
  onRotationChange: (val: number) => void;
  tileRepeat: boolean;
  onTileRepeatChange: (val: boolean) => void;
  tileSpacing?: number;
  onTileSpacingChange?: (val: number) => void;
}

const GRID_CELLS: { pos: GridPosition; label: string }[] = [
  { pos: 'top-left', label: 'Top L' },
  { pos: 'top-center', label: 'Top C' },
  { pos: 'top-right', label: 'Top R' },
  { pos: 'middle-left', label: 'Mid L' },
  { pos: 'center', label: 'Center' },
  { pos: 'middle-right', label: 'Mid R' },
  { pos: 'bottom-left', label: 'Btm L' },
  { pos: 'bottom-center', label: 'Btm C' },
  { pos: 'bottom-right', label: 'Btm R' },
];

export const PositionGridSelector: React.FC<PositionGridSelectorProps> = ({
  position,
  onPositionChange,
  hOffset,
  onHOffsetChange,
  vOffset,
  onVOffsetChange,
  marginPercent,
  onMarginChange,
  rotation,
  onRotationChange,
  tileRepeat,
  onTileRepeatChange,
  tileSpacing = 160,
  onTileSpacingChange,
}) => {
  return (
    <div className="space-y-4 pt-1">
      {/* Pattern repeat or 9-Anchor Position */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Tiled / Full Repeat
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Cover entire photo with repeated marks
            </div>
          </div>
        </div>
        <CharacterPushToggle
          id="tiled-repeat-toggle"
          size="sm"
          checked={tileRepeat}
          onChange={(checked) => onTileRepeatChange(checked)}
        />
      </div>

      {!tileRepeat ? (
        <>
          {/* 9-Anchor Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Grid3X3 className="w-3.5 h-3.5 text-indigo-500" />
                9-Point Anchor Position
              </label>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                {position.replace('-', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800">
              {GRID_CELLS.map((cell) => {
                const isSelected = position === cell.pos;
                return (
                  <button
                    key={cell.pos}
                    type="button"
                    id={`pos-btn-${cell.pos}`}
                    onClick={() => onPositionChange(cell.pos)}
                    className={`h-9 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-[1.02]'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}
                  >
                    {cell.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Micro Adjustment Sliders */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <Move className="w-3 h-3" /> Horizontal Coordinate
                </span>
                <span className="font-mono">{hOffset}%</span>
              </div>
              <input
                type="range"
                id="horizontal-offset-range"
                min="0"
                max="100"
                value={hOffset}
                onChange={(e) => onHOffsetChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <Move className="w-3 h-3 rotate-90" /> Vertical Coordinate
                </span>
                <span className="font-mono">{vOffset}%</span>
              </div>
              <input
                type="range"
                id="vertical-offset-range"
                min="0"
                max="100"
                value={vOffset}
                onChange={(e) => onVOffsetChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span className="font-medium">Margin from Edge</span>
                <span className="font-mono">{marginPercent}%</span>
              </div>
              <input
                type="range"
                id="margin-percent-range"
                min="0"
                max="25"
                value={marginPercent}
                onChange={(e) => onMarginChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </>
      ) : (
        /* Tiled Spacing Slider */
        <div>
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span className="font-medium">Pattern Spacing</span>
            <span className="font-mono">{tileSpacing}px</span>
          </div>
          <input
            type="range"
            id="tile-spacing-range"
            min="60"
            max="300"
            value={tileSpacing}
            onChange={(e) => onTileSpacingChange && onTileSpacingChange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      )}

      {/* Rotation Angle */}
      <div className="pt-1">
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
          <span className="flex items-center gap-1 font-medium">
            <RotateCw className="w-3 h-3 text-indigo-500" />
            Rotation Angle
          </span>
          <span className="font-mono">{rotation}°</span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {[-45, -30, 0, 45, 90].map((deg) => (
            <button
              key={deg}
              type="button"
              id={`rot-btn-${deg}`}
              onClick={() => onRotationChange(deg)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors border ${
                rotation === deg
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>

        <input
          type="range"
          id="rotation-range"
          min="-180"
          max="180"
          value={rotation}
          onChange={(e) => onRotationChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
};
