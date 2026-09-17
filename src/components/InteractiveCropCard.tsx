import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CropRatioOption, ImageItem } from '../types';
import {
  Download,
  RotateCcw,
  Copy,
  Move,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export interface CropRect {
  // Normalized percentage values 0 to 100
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InteractiveCropCardProps {
  item: ImageItem;
  selectedRatio: CropRatioOption;
  targetRatio: number | null; // e.g. 4/5 for 4:5
  cropRect: CropRect;
  onUpdateCropRect: (rect: CropRect) => void;
  onApplyToAll: (rect: CropRect) => void;
  onResetCrop: () => void;
  onDownloadSingle: (item: ImageItem, rect: CropRect) => void;
  onRemove: () => void;
  onToggleSelect: () => void;
}

export const InteractiveCropCard: React.FC<InteractiveCropCardProps> = ({
  item,
  selectedRatio,
  targetRatio,
  cropRect,
  onUpdateCropRect,
  onApplyToAll,
  onResetCrop,
  onDownloadSingle,
  onRemove,
  onToggleSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageBounds, setImageBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>({ left: 0, top: 0, width: 0, height: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rectStart, setRectStart] = useState<CropRect>(cropRect);
  const [isExporting, setIsExporting] = useState(false);

  // Measure natural rendered image bounds inside the aspect container
  const updateImageBounds = useCallback(() => {
    if (!containerRef.current || !imgRef.current) return;
    const contRect = containerRef.current.getBoundingClientRect();
    const imgEl = imgRef.current;

    const imgNatW = item.width || imgEl.naturalWidth || 1;
    const imgNatH = item.height || imgEl.naturalHeight || 1;
    const contW = contRect.width;
    const contH = contRect.height;

    // object-contain math
    const imgAspect = imgNatW / imgNatH;
    const contAspect = contW / contH;

    let renderedW = contW;
    let renderedH = contH;
    let left = 0;
    let top = 0;

    if (imgAspect > contAspect) {
      renderedW = contW;
      renderedH = contW / imgAspect;
      top = (contH - renderedH) / 2;
    } else {
      renderedH = contH;
      renderedW = contH * imgAspect;
      left = (contW - renderedW) / 2;
    }

    setImageBounds({ left, top, width: renderedW, height: renderedH });
  }, [item.width, item.height]);

  useEffect(() => {
    updateImageBounds();
    window.addEventListener('resize', updateImageBounds);
    return () => window.removeEventListener('resize', updateImageBounds);
  }, [updateImageBounds]);

  // Convert normalized cropRect (0-100%) to pixels relative to container
  const getPixelRect = useCallback(() => {
    const { left, top, width, height } = imageBounds;
    if (width === 0 || height === 0) return { x: 0, y: 0, w: 0, h: 0 };
    return {
      x: left + (cropRect.x / 100) * width,
      y: top + (cropRect.y / 100) * height,
      w: (cropRect.width / 100) * width,
      h: (cropRect.height / 100) * height,
    };
  }, [imageBounds, cropRect]);

  // Handle Dragging Move (Anywhere inside or on border of crop frame)
  const handleMouseDownMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    setRectStart({ ...cropRect });
  };

  // Handle Resize Drag
  const handleMouseDownResize = (
    e: React.MouseEvent | React.TouchEvent,
    handle: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(handle);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    setRectStart({ ...cropRect });
  };

  // Quick Nudge Helper (Buttons on hover or touch)
  const handleNudge = (deltaXPercent: number, deltaYPercent: number) => {
    const newX = Math.max(0, Math.min(100 - cropRect.width, cropRect.x + deltaXPercent));
    const newY = Math.max(0, Math.min(100 - cropRect.height, cropRect.y + deltaYPercent));
    onUpdateCropRect({
      x: newX,
      y: newY,
      width: cropRect.width,
      height: cropRect.height,
    });
  };

  // Quick Zoom (Scale) Helper: Scale up or down while keeping locked ratio and staying centered
  const handleScaleFactor = (factor: number) => {
    const imgAspect = (item.width || 1) / (item.height || 1);
    const ratioMultiplier = targetRatio ? imgAspect / targetRatio : 1;

    let newWidth = cropRect.width * factor;
    let newHeight = newWidth * ratioMultiplier;

    // Boundary constraints
    if (newWidth > 100) {
      newWidth = 100;
      newHeight = newWidth * ratioMultiplier;
    }
    if (newHeight > 100) {
      newHeight = 100;
      newWidth = newHeight / ratioMultiplier;
    }

    if (newWidth < 15) {
      newWidth = 15;
      newHeight = newWidth * ratioMultiplier;
    }

    // Keep centered around current center point
    const currentCenterX = cropRect.x + cropRect.width / 2;
    const currentCenterY = cropRect.y + cropRect.height / 2;

    let newX = currentCenterX - newWidth / 2;
    let newY = currentCenterY - newHeight / 2;

    newX = Math.max(0, Math.min(100 - newWidth, newX));
    newY = Math.max(0, Math.min(100 - newHeight, newY));

    onUpdateCropRect({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  // Global mouse & touch move / up listeners
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging && !isResizing) return;
      if (imageBounds.width === 0 || imageBounds.height === 0) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaPixelX = clientX - dragStart.x;
      const deltaPixelY = clientY - dragStart.y;

      const deltaPercentX = (deltaPixelX / imageBounds.width) * 100;
      const deltaPercentY = (deltaPixelY / imageBounds.height) * 100;

      // 1. FREE 360° MOVEMENT (LEFT, RIGHT, UP, DOWN)
      if (isDragging) {
        let newX = rectStart.x + deltaPercentX;
        let newY = rectStart.y + deltaPercentY;

        // Freely clamp within the image bounds (0 to 100)
        const maxX = Math.max(0, 100 - rectStart.width);
        const maxY = Math.max(0, 100 - rectStart.height);

        newX = Math.max(0, Math.min(maxX, newX));
        newY = Math.max(0, Math.min(maxY, newY));

        onUpdateCropRect({
          x: newX,
          y: newY,
          width: rectStart.width,
          height: rectStart.height,
        });
        return;
      }

      // 2. RESIZING
      if (isResizing) {
        const isCustom = selectedRatio === 'custom';
        const imgAspect = (item.width || 1) / (item.height || 1);
        const ratioMultiplier = targetRatio ? imgAspect / targetRatio : 1;

        let { x, y, width, height } = rectStart;

        if (isCustom || !targetRatio) {
          // Freeform custom resizing (independent W & H)
          if (isResizing.includes('r')) {
            width = Math.max(10, Math.min(100 - rectStart.x, rectStart.width + deltaPercentX));
          }
          if (isResizing.includes('b')) {
            height = Math.max(10, Math.min(100 - rectStart.y, rectStart.height + deltaPercentY));
          }
          if (isResizing.includes('l')) {
            const possibleW = rectStart.width - deltaPercentX;
            if (possibleW >= 10 && rectStart.x + deltaPercentX >= 0) {
              x = rectStart.x + deltaPercentX;
              width = possibleW;
            }
          }
          if (isResizing.includes('t')) {
            const possibleH = rectStart.height - deltaPercentY;
            if (possibleH >= 10 && rectStart.y + deltaPercentY >= 0) {
              y = rectStart.y + deltaPercentY;
              height = possibleH;
            }
          }
        } else {
          // STRICT LOCKED ASPECT RATIO RESIZING
          if (isResizing === 'se' || isResizing === 'e' || isResizing === 's') {
            let newWidth = rectStart.width + deltaPercentX;
            let newHeight = newWidth * ratioMultiplier;

            if (x + newWidth > 100) {
              newWidth = 100 - x;
              newHeight = newWidth * ratioMultiplier;
            }
            if (y + newHeight > 100) {
              newHeight = 100 - y;
              newWidth = newHeight / ratioMultiplier;
            }

            if (newWidth >= 12 && newHeight >= 12) {
              width = newWidth;
              height = newHeight;
            }
          } else if (isResizing === 'nw') {
            let newWidth = rectStart.width - deltaPercentX;
            let newHeight = newWidth * ratioMultiplier;
            let newX = rectStart.x + (rectStart.width - newWidth);
            let newY = rectStart.y + (rectStart.height - newHeight);

            if (newX >= 0 && newY >= 0 && newWidth >= 12 && newHeight >= 12) {
              x = newX;
              y = newY;
              width = newWidth;
              height = newHeight;
            }
          } else if (isResizing === 'ne') {
            let newWidth = rectStart.width + deltaPercentX;
            let newHeight = newWidth * ratioMultiplier;
            let newY = rectStart.y + (rectStart.height - newHeight);

            if (x + newWidth <= 100 && newY >= 0 && newWidth >= 12 && newHeight >= 12) {
              y = newY;
              width = newWidth;
              height = newHeight;
            }
          } else if (isResizing === 'sw') {
            let newWidth = rectStart.width - deltaPercentX;
            let newHeight = newWidth * ratioMultiplier;
            let newX = rectStart.x + (rectStart.width - newWidth);

            if (newX >= 0 && y + newHeight <= 100 && newWidth >= 12 && newHeight >= 12) {
              x = newX;
              width = newWidth;
              height = newHeight;
            }
          }
        }

        onUpdateCropRect({ x, y, width, height });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    rectStart,
    imageBounds,
    selectedRatio,
    targetRatio,
    item.width,
    item.height,
    onUpdateCropRect,
  ]);

  const pix = getPixelRect();

  // Pixel output calculated
  const outputW = Math.round((cropRect.width / 100) * item.width);
  const outputH = Math.round((cropRect.height / 100) * item.height);

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <input
            type="checkbox"
            id={`crop-chk-${item.id}`}
            checked={!!item.selected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span
            className="text-xs font-bold truncate text-slate-800 dark:text-slate-200"
            title={item.name}
          >
            {item.name}
          </span>
        </div>

        <button
          type="button"
          onClick={onRemove}
          title="Remove Image"
          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <span className="sr-only">Delete</span>
          ✕
        </button>
      </div>

      {/* Main Interactive Stage with Darkened Mask and Glowing Crop Frame */}
      <div
        ref={containerRef}
        className="relative aspect-4/3 w-full bg-slate-950 flex items-center justify-center select-none overflow-hidden touch-none"
      >
        <img
          ref={imgRef}
          src={item.dataUrl}
          alt={item.name}
          onLoad={updateImageBounds}
          className="max-h-full max-w-full object-contain pointer-events-none"
        />

        {/* Aspect Ratio Badge */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 flex items-center gap-1.5 shadow-md pointer-events-none z-20">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>{selectedRatio === 'original' ? 'Original' : selectedRatio}</span>
          <span className="text-slate-400 font-normal">
            ({outputW}×{outputH}px)
          </span>
        </div>

        {/* Quick Zoom In/Out Floating Pro Pills */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
          <button
            type="button"
            id={`crop-zoom-in-${item.id}`}
            aria-label="Make crop frame smaller"
            title="Make crop frame smaller (Zoom in on subject)"
            onClick={() => handleScaleFactor(0.88)}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 text-indigo-300" />
          </button>
          <button
            type="button"
            id={`crop-zoom-out-${item.id}`}
            aria-label="Make crop frame larger"
            title="Make crop frame larger (Zoom out / fit more)"
            onClick={() => handleScaleFactor(1.12)}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5 text-indigo-300" />
          </button>
        </div>

        {/* Darkening Masking Shroud outside the crop area */}
        {imageBounds.width > 0 && (
          <>
            {/* Top shroud */}
            <div
              className="absolute bg-black/65 backdrop-blur-[0.5px] pointer-events-none z-10 transition-colors"
              style={{
                left: imageBounds.left,
                top: imageBounds.top,
                width: imageBounds.width,
                height: Math.max(0, pix.y - imageBounds.top),
              }}
            />
            {/* Bottom shroud */}
            <div
              className="absolute bg-black/65 backdrop-blur-[0.5px] pointer-events-none z-10 transition-colors"
              style={{
                left: imageBounds.left,
                top: pix.y + pix.h,
                width: imageBounds.width,
                height: Math.max(0, imageBounds.top + imageBounds.height - (pix.y + pix.h)),
              }}
            />
            {/* Left shroud */}
            <div
              className="absolute bg-black/65 backdrop-blur-[0.5px] pointer-events-none z-10 transition-colors"
              style={{
                left: imageBounds.left,
                top: pix.y,
                width: Math.max(0, pix.x - imageBounds.left),
                height: pix.h,
              }}
            />
            {/* Right shroud */}
            <div
              className="absolute bg-black/65 backdrop-blur-[0.5px] pointer-events-none z-10 transition-colors"
              style={{
                left: pix.x + pix.w,
                top: pix.y,
                width: Math.max(0, imageBounds.left + imageBounds.width - (pix.x + pix.w)),
                height: pix.h,
              }}
            />
          </>
        )}

        {/* 🌟 INTERACTIVE CROP BOX (Draggable in all directions: UP/DOWN/LEFT/RIGHT + Resizable) */}
        {imageBounds.width > 0 && (
          <div
            className={`absolute z-20 cursor-move border-2 ${
              isDragging || isResizing
                ? 'border-indigo-400 shadow-[0_0_24px_rgba(99,102,241,0.8)] ring-2 ring-indigo-400/40'
                : 'border-white/95 shadow-[0_0_15px_rgba(0,0,0,0.6)]'
            } transition-[border-color,box-shadow] touch-none`}
            style={{
              left: pix.x,
              top: pix.y,
              width: pix.w,
              height: pix.h,
            }}
            onMouseDown={handleMouseDownMove}
            onTouchStart={handleMouseDownMove}
          >
            {/* Rule of thirds grid lines */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-40">
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div />
            </div>

            {/* Center crosshair / move hint */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
              <div className="p-1 rounded-full bg-slate-900/40 backdrop-blur-xs">
                <Move className="w-5 h-5 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]" />
              </div>
            </div>

            {/* Corner Resize Handles */}
            {/* Top-Left */}
            <div
              className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              onMouseDown={(e) => handleMouseDownResize(e, 'nw')}
              onTouchStart={(e) => handleMouseDownResize(e, 'nw')}
            />
            {/* Top-Right */}
            <div
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              onMouseDown={(e) => handleMouseDownResize(e, 'ne')}
              onTouchStart={(e) => handleMouseDownResize(e, 'ne')}
            />
            {/* Bottom-Left */}
            <div
              className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              onMouseDown={(e) => handleMouseDownResize(e, 'sw')}
              onTouchStart={(e) => handleMouseDownResize(e, 'sw')}
            />
            {/* Bottom-Right (Primary handle with bright neon ring) */}
            <div
              className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-indigo-500 border-2 border-white cursor-nwse-resize shadow-lg hover:scale-125 transition-transform flex items-center justify-center ring-2 ring-indigo-400"
              onMouseDown={(e) => handleMouseDownResize(e, 'se')}
              onTouchStart={(e) => handleMouseDownResize(e, 'se')}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            {/* Extra edge handles for Freeform Custom Mode ONLY */}
            {selectedRatio === 'custom' && (
              <>
                <div
                  className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-6 rounded-full bg-white border-2 border-indigo-600 cursor-ew-resize shadow-sm"
                  onMouseDown={(e) => handleMouseDownResize(e, 'l')}
                  onTouchStart={(e) => handleMouseDownResize(e, 'l')}
                />
                <div
                  className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-6 rounded-full bg-white border-2 border-indigo-600 cursor-ew-resize shadow-sm"
                  onMouseDown={(e) => handleMouseDownResize(e, 'r')}
                  onTouchStart={(e) => handleMouseDownResize(e, 'r')}
                />
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3.5 rounded-full bg-white border-2 border-indigo-600 cursor-ns-resize shadow-sm"
                  onMouseDown={(e) => handleMouseDownResize(e, 't')}
                  onTouchStart={(e) => handleMouseDownResize(e, 't')}
                />
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-3.5 rounded-full bg-white border-2 border-indigo-600 cursor-ns-resize shadow-sm"
                  onMouseDown={(e) => handleMouseDownResize(e, 'b')}
                  onTouchStart={(e) => handleMouseDownResize(e, 'b')}
                />
              </>
            )}
          </div>
        )}

        {/* Bottom-Right Single Download Pro Button */}
        <button
          type="button"
          id={`crop-save-${item.id}`}
          onClick={async () => {
            setIsExporting(true);
            try {
              await onDownloadSingle(item, cropRect);
            } finally {
              setIsExporting(false);
            }
          }}
          disabled={isExporting}
          title="Download this single cropped image"
          className="pro-pill-btn absolute bottom-2 right-2 px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 z-30 shadow-lg"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </button>
      </div>

      {/* Footer Controls: Nudge D-Pad (Up, Down, Left, Right), Reset & Apply To All Button */}
      <div className="px-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {/* Directional Nudge Buttons for fine micro-adjustments in ANY direction */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            id={`crop-nudge-left-${item.id}`}
            aria-label="Nudge Left"
            onClick={() => handleNudge(-6, 0)}
            title="Nudge Left"
            className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            id={`crop-nudge-up-${item.id}`}
            aria-label="Nudge Up"
            onClick={() => handleNudge(0, -6)}
            title="Nudge Up"
            className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            id={`crop-nudge-down-${item.id}`}
            aria-label="Nudge Down"
            onClick={() => handleNudge(0, 6)}
            title="Nudge Down"
            className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            id={`crop-nudge-right-${item.id}`}
            aria-label="Nudge Right"
            onClick={() => handleNudge(6, 0)}
            title="Nudge Right"
            className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id={`crop-reset-${item.id}`}
            onClick={onResetCrop}
            title="Reset crop to center"
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            id={`crop-apply-all-${item.id}`}
            onClick={() => onApplyToAll(cropRect)}
            title="Apply this exact crop position & size to all images"
            className="pro-pill-btn px-2.5 py-1 text-[11px] font-bold gap-1 text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            <Copy className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Apply to All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
