import React, { useEffect, useRef, useState } from 'react';
import {
  ImageItem,
  WatermarkMode,
  WatermarkSettingsState,
} from '../types';
import {
  drawLogoWatermark,
  drawTextWatermark,
  loadImage,
  renderFullWatermarkedImage,
} from '../utils/watermarkEngine';
import {
  Download,
  Trash2,
  Maximize2,
  Check,
  Eye,
  EyeOff,
  Move,
  X,
} from 'lucide-react';

interface WatermarkCanvasPreviewProps {
  item: ImageItem;
  mode: WatermarkMode;
  settings: WatermarkSettingsState;
  cachedLogoImg: HTMLImageElement | null;
  onRemove: (id: string) => void;
  onSelectToggle: (id: string) => void;
  onCustomPositionClick?: (hPercent: number, vPercent: number) => void;
}

export const WatermarkCanvasPreview: React.FC<WatermarkCanvasPreviewProps> = ({
  item,
  mode,
  settings,
  cachedLogoImg,
  onRemove,
  onSelectToggle,
  onCustomPositionClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportingSingle, setIsExportingSingle] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number } | null>(null);

  // Render on canvas whenever settings or image changes
  useEffect(() => {
    let isCancelled = false;

    async function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        const img = await loadImage(item.dataUrl);
        if (isCancelled) return;

        // Maintain aspect ratio with display width
        const displayWidth = Math.min(img.naturalWidth, 1200);
        const scale = displayWidth / img.naturalWidth;
        const displayHeight = Math.round(img.naturalHeight * scale);

        canvas.width = displayWidth;
        canvas.height = displayHeight;

        // Draw image
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

        // If not showing original, draw watermark overlays
        if (!showOriginal) {
          const baseFileName = item.name.replace(/\.[^/.]+$/, '');

          // Filename
          if ((mode === 'filename' || mode === 'multiple') && settings.filename.enabled) {
            drawTextWatermark(ctx, displayWidth, displayHeight, settings.filename, baseFileName);
          }

          // Custom text(s) - renders all enabled custom text layers
          if (mode === 'custom_text' || mode === 'multiple') {
            const textLayers =
              settings.customTexts && settings.customTexts.length > 0
                ? settings.customTexts
                : settings.customText
                  ? [settings.customText]
                  : [];

            for (const tConfig of textLayers) {
              if (tConfig.enabled && tConfig.text && tConfig.text.trim()) {
                drawTextWatermark(
                  ctx,
                  displayWidth,
                  displayHeight,
                  tConfig,
                  tConfig.text
                );
              }
            }
          }

          // Logo
          if (
            (mode === 'logo' || mode === 'multiple') &&
            settings.logo.enabled &&
            cachedLogoImg
          ) {
            await drawLogoWatermark(
              ctx,
              displayWidth,
              displayHeight,
              settings.logo,
              cachedLogoImg
            );
          }
        }
      } catch (err) {
        console.error('Failed to draw canvas preview:', err);
      }
    }

    draw();

    return () => {
      isCancelled = true;
    };
  }, [item, mode, settings, cachedLogoImg, showOriginal]);

  // Click on canvas to position watermark directly
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactiveMode || !onCustomPositionClick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setClickRipple({ x: clickX, y: clickY });
    setTimeout(() => setClickRipple(null), 700);

    const hPercent = Math.round(Math.max(0, Math.min(100, (clickX / rect.width) * 100)));
    const vPercent = Math.round(Math.max(0, Math.min(100, (clickY / rect.height) * 100)));

    onCustomPositionClick(hPercent, vPercent);
  };

  // Download individual image at full resolution
  const handleDownloadSingle = async () => {
    try {
      setIsExportingSingle(true);
      const blob = await renderFullWatermarkedImage(item, mode, settings, cachedLogoImg);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsExportingSingle(false);
    }
  };

  return (
    <>
      <div
        className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Header with Select & File Details */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              id={`select-img-${item.id}`}
              onClick={() => onSelectToggle(item.id)}
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                item.selected
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-indigo-500'
              }`}
            >
              {item.selected && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <span
              className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
              title={item.name}
            >
              {item.name}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Toggle show original preview */}
            <button
              type="button"
              id={`toggle-orig-${item.id}`}
              onClick={() => setShowOriginal(!showOriginal)}
              title={showOriginal ? 'Showing Original (Click for Watermarked)' : 'Showing Watermarked (Click for Original)'}
              className={`p-1 rounded-md text-xs transition-colors ${
                showOriginal
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {showOriginal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            {/* Click to position toggle */}
            {onCustomPositionClick && (
              <button
                type="button"
                id={`interactive-pos-${item.id}`}
                onClick={() => setInteractiveMode(!interactiveMode)}
                title={interactiveMode ? 'Interactive Click-to-Position Active (Click anywhere on photo)' : 'Enable Click-to-Position on Canvas'}
                className={`p-1 rounded-md text-xs transition-colors ${
                  interactiveMode
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Move className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete button */}
            <button
              type="button"
              id={`remove-img-${item.id}`}
              onClick={() => onRemove(item.id)}
              title="Remove Image"
              className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Canvas Display Area */}
        <div className="relative aspect-4/3 sm:aspect-16/10 flex items-center justify-center bg-slate-100 dark:bg-slate-950 overflow-hidden">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={`max-h-full max-w-full object-contain ${
              interactiveMode ? 'cursor-crosshair' : 'cursor-default'
            }`}
          />

          {/* Visual click ripple on placement */}
          {clickRipple && (
            <div
              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-indigo-500 bg-indigo-500/20 animate-ping pointer-events-none"
              style={{ left: clickRipple.x, top: clickRipple.y }}
            />
          )}

          {/* Interactive positioning badge */}
          {interactiveMode && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-indigo-600/90 text-white text-[10px] font-medium shadow-sm backdrop-blur-xs flex items-center gap-1 pointer-events-none">
              <Move className="w-2.5 h-2.5" /> Click anywhere to set position
            </div>
          )}

          {/* Quick Action Overlay on hover */}
          <div
            className={`absolute bottom-2 right-2 flex items-center gap-1.5 transition-opacity duration-150 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              type="button"
              id={`modal-zoom-${item.id}`}
              onClick={() => setIsModalOpen(true)}
              title="Full Screen Preview"
              className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white backdrop-blur-xs shadow-md"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id={`download-single-${item.id}`}
              onClick={handleDownloadSingle}
              disabled={isExportingSingle}
              title="Download Watermarked Image"
              className="pro-pill-btn px-2.5 py-1 text-xs font-bold flex items-center gap-1 shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Resolution details footer */}
        <div className="px-3 py-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 flex justify-between border-t border-slate-100 dark:border-slate-800/80">
          <span>
            {item.width} × {item.height} px
          </span>
          <span className="capitalize">{item.type.replace('image/', '')}</span>
        </div>
      </div>

      {/* Fullscreen Inspector Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
              <div className="text-white font-medium text-sm truncate">{item.name}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id={`modal-export-${item.id}`}
                  onClick={handleDownloadSingle}
                  disabled={isExportingSingle}
                  className="pro-pill-btn px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Save Image
                </button>
                <button
                  type="button"
                  id={`modal-close-${item.id}`}
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-center overflow-auto max-h-[calc(90vh-60px)]">
              <img
                src={canvasRef.current?.toDataURL('image/jpeg', 0.95)}
                alt={item.name}
                className="max-h-[75vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
