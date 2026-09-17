import React, { useState, useCallback } from 'react';
import { CropRatioOption, ImageItem } from '../types';
import JSZip from 'jszip';
import {
  Crop,
  Download,
  RotateCcw,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Loader2,
  Copy,
  Info,
} from 'lucide-react';
import { loadImage } from '../utils/watermarkEngine';
import { InteractiveCropCard, CropRect } from './InteractiveCropCard';

interface CropStudioProps {
  images: ImageItem[];
  onUpdateImages: (imgs: ImageItem[]) => void;
  onRemoveImage: (id: string) => void;
}

const RATIO_PRESETS: {
  label: string;
  value: CropRatioOption;
  desc: string;
  ratioVal: number | null;
}[] = [
  { label: 'Original', value: 'original', desc: 'No crop / Full image', ratioVal: null },
  { label: '1:1 Square', value: '1:1', desc: '1080×1080 (Insta/Profile)', ratioVal: 1 },
  { label: '4:5 Portrait', value: '4:5', desc: '1080×1350 (Insta Feed)', ratioVal: 4 / 5 },
  { label: '9:16 Story', value: '9:16', desc: '1080×1920 (Reels/TikTok/Story)', ratioVal: 9 / 16 },
  { label: '16:9 Banner', value: '16:9', desc: '1920×1080 (YouTube/Web)', ratioVal: 16 / 9 },
  { label: '3:4 Classic', value: '3:4', desc: '2160×2880 (Print/Portraits)', ratioVal: 3 / 4 },
  { label: '2:3 Photo', value: '2:3', desc: '3:2 / 2:3 Standard DSLRs', ratioVal: 2 / 3 },
  { label: 'Custom', value: 'custom', desc: 'Freeform or Custom W×H', ratioVal: null },
];

export const CropStudio: React.FC<CropStudioProps> = ({
  images,
  onUpdateImages,
  onRemoveImage,
}) => {
  const [selectedRatio, setSelectedRatio] = useState<CropRatioOption>('4:5');
  const [customW, setCustomW] = useState(1080);
  const [customH, setCustomH] = useState(1350);
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Helper: calculate initial centered cropRect for a given image & ratio
  const getDefaultCropRectForImage = useCallback(
    (
      imgW: number,
      imgH: number,
      ratioOpt: CropRatioOption,
      cW: number,
      cH: number
    ): CropRect => {
      if (ratioOpt === 'original') {
        return { x: 0, y: 0, width: 100, height: 100 };
      }

      let effRatio: number | null = null;
      if (ratioOpt === 'custom') {
        effRatio = cW > 0 && cH > 0 ? cW / cH : null;
      } else {
        const found = RATIO_PRESETS.find((p) => p.value === ratioOpt);
        effRatio = found ? found.ratioVal : null;
      }

      if (!effRatio || imgW <= 0 || imgH <= 0) {
        return { x: 0, y: 0, width: 100, height: 100 };
      }

      const imgAspect = imgW / imgH;

      // Give 85% initial scale so the user immediately has room to move both Left-Right and Up-Down
      const initialScale = 0.85;

      if (imgAspect > effRatio) {
        // Image is wider than target ratio: crop width
        const widthPercent = (effRatio / imgAspect) * 100 * initialScale;
        const heightPercent = 100 * initialScale;
        const xPercent = (100 - widthPercent) / 2;
        const yPercent = (100 - heightPercent) / 2;
        return {
          x: Math.max(0, xPercent),
          y: Math.max(0, yPercent),
          width: Math.min(100, widthPercent),
          height: Math.min(100, heightPercent),
        };
      } else {
        // Image is taller than target ratio: crop height
        const widthPercent = 100 * initialScale;
        const heightPercent = (imgAspect / effRatio) * 100 * initialScale;
        const xPercent = (100 - widthPercent) / 2;
        const yPercent = (100 - heightPercent) / 2;
        return {
          x: Math.max(0, xPercent),
          y: Math.max(0, yPercent),
          width: Math.min(100, widthPercent),
          height: Math.min(100, heightPercent),
        };
      }
    },
    []
  );

  // Compute effective numeric aspect ratio
  let targetRatio: number | null = null;
  if (selectedRatio === 'custom') {
    targetRatio = customW > 0 && customH > 0 ? customW / customH : null;
  } else {
    const found = RATIO_PRESETS.find((p) => p.value === selectedRatio);
    targetRatio = found ? found.ratioVal : null;
  }

  // When user clicks a new ratio preset, recalculate default frames for all images
  const handleSelectRatio = (newRatio: CropRatioOption) => {
    setSelectedRatio(newRatio);
    onUpdateImages(
      images.map((img) => {
        const defaultRect = getDefaultCropRectForImage(
          img.width,
          img.height,
          newRatio,
          customW,
          customH
        );
        return {
          ...img,
          cropArea: {
            x: defaultRect.x,
            y: defaultRect.y,
            width: defaultRect.width,
            height: defaultRect.height,
          },
        };
      })
    );
  };

  // Update crop area for a single specific image
  const handleUpdateCropRect = (id: string, rect: CropRect) => {
    onUpdateImages(
      images.map((img) =>
        img.id === id
          ? {
              ...img,
              cropArea: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              },
            }
          : img
      )
    );
  };

  // "Apply to All" - copies current crop frame dimensions & position to all images
  const handleApplyToAll = (sourceRect: CropRect) => {
    onUpdateImages(
      images.map((img) => ({
        ...img,
        cropArea: {
          x: sourceRect.x,
          y: sourceRect.y,
          width: sourceRect.width,
          height: sourceRect.height,
        },
      }))
    );
  };

  // Reset single image crop
  const handleResetCrop = (item: ImageItem) => {
    const defaultRect = getDefaultCropRectForImage(
      item.width,
      item.height,
      selectedRatio,
      customW,
      customH
    );
    handleUpdateCropRect(item.id, defaultRect);
  };

  // Reset ALL images crop
  const handleResetAll = () => {
    onUpdateImages(
      images.map((img) => {
        const defaultRect = getDefaultCropRectForImage(
          img.width,
          img.height,
          selectedRatio,
          customW,
          customH
        );
        return {
          ...img,
          cropArea: {
            x: defaultRect.x,
            y: defaultRect.y,
            width: defaultRect.width,
            height: defaultRect.height,
          },
        };
      })
    );
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    onUpdateImages(
      images.map((img) => (img.id === id ? { ...img, selected: !img.selected } : img))
    );
  };

  const handleSelectAll = (select: boolean) => {
    onUpdateImages(images.map((img) => ({ ...img, selected: select })));
  };

  const handleDeleteSelected = () => {
    const remaining = images.filter((img) => !img.selected);
    onUpdateImages(remaining);
  };

  // Renders the exact cropped canvas using the item's custom cropArea
  const cropImageCanvas = async (item: ImageItem, rectOverride?: CropRect): Promise<Blob> => {
    const img = await loadImage(item.dataUrl);
    const canvas = document.createElement('canvas');

    const origW = img.naturalWidth;
    const origH = img.naturalHeight;

    const crop =
      rectOverride ||
      (item.cropArea
        ? {
            x: item.cropArea.x,
            y: item.cropArea.y,
            width: item.cropArea.width,
            height: item.cropArea.height,
          }
        : getDefaultCropRectForImage(
            origW,
            origH,
            selectedRatio,
            customW,
            customH
          ));

    // Convert percentage to actual source pixel coordinates
    const sourceX = Math.max(0, Math.round((crop.x / 100) * origW));
    const sourceY = Math.max(0, Math.round((crop.y / 100) * origH));
    const sourceW = Math.min(origW - sourceX, Math.round((crop.width / 100) * origW));
    const sourceH = Math.min(origH - sourceY, Math.round((crop.height / 100) * origH));

    // If in custom ratio mode with explicit dimensions, scale canvas to exact target
    if (selectedRatio === 'custom' && customW > 0 && customH > 0) {
      canvas.width = customW;
      canvas.height = customH;
    } else {
      canvas.width = Math.max(1, sourceW);
      canvas.height = Math.max(1, sourceH);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context error');

    // High quality bicubic interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceW,
      sourceH,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Cropping error'));
        },
        'image/jpeg',
        0.98
      );
    });
  };

  // Download Single Cropped
  const handleDownloadSingleCropped = async (item: ImageItem, rect: CropRect) => {
    try {
      const blob = await cropImageCanvas(item, rect);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const nameParts = item.name.split('.');
      const ext = nameParts.length > 1 ? nameParts.pop() : 'jpg';
      const base = nameParts.join('.');
      a.download = `${base}_${selectedRatio.replace(':', 'x')}_cropped.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Single crop failed:', err);
    }
  };

  // Download all cropped images as ZIP
  const handleDownloadCroppedZip = async () => {
    if (images.length === 0) return;
    setIsProcessingZip(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setZipProgress(Math.round(((i + 1) / images.length) * 100));
        const blob = await cropImageCanvas(item);
        const nameParts = item.name.split('.');
        const ext = nameParts.length > 1 ? nameParts.pop() : 'jpg';
        const base = nameParts.join('.');
        zip.file(`${base}_${selectedRatio.replace(':', 'x')}_cropped.${ext}`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk_cropped_${selectedRatio.replace(':', 'x')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate crop zip:', err);
    } finally {
      setIsProcessingZip(false);
      setZipProgress(0);
    }
  };

  const selectedCount = images.filter((img) => img.selected).length;

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        {/* Ratio Preset Selector */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Crop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Select Target Aspect Ratio (Locked Aspect Frame)</span>
            </label>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              <span>Drag frame to move • Drag corners to resize (locked ratio)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {RATIO_PRESETS.map((preset) => {
              const isActive = selectedRatio === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  id={`crop-preset-${preset.value}`}
                  onClick={() => handleSelectRatio(preset.value)}
                  className={`p-2.5 rounded-2xl text-left border cursor-pointer transition-all ${
                    isActive
                      ? 'pro-pill-btn bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-100 shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                  }`}
                >
                  <div className="font-bold text-xs">{preset.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {preset.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom dimensions inputs if Custom selected */}
        {selectedRatio === 'custom' && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/50">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Width (px):
                </span>
                <input
                  type="number"
                  id="crop-custom-w"
                  min="50"
                  max="10000"
                  value={customW}
                  onChange={(e) => setCustomW(Number(e.target.value))}
                  className="w-24 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Height (px):
                </span>
                <input
                  type="number"
                  id="crop-custom-h"
                  min="50"
                  max="10000"
                  value={customH}
                  onChange={(e) => setCustomH(Number(e.target.value))}
                  className="w-24 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                = {(customW / (customH || 1)).toFixed(2)}:1 Freeform Ratio
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetAll}
              className="pro-pill-btn px-3 py-1.5 text-xs font-bold gap-1 text-slate-800 dark:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Update Frames to Custom W×H</span>
            </button>
          </div>
        )}

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="crop-select-all"
              onClick={() => handleSelectAll(selectedCount < images.length)}
              className="pro-pill-btn px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
            >
              {selectedCount === images.length ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Deselect All
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" /> Select All ({selectedCount})
                </>
              )}
            </button>

            {selectedCount > 0 && (
              <button
                type="button"
                id="crop-delete-selected"
                onClick={handleDeleteSelected}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedCount})
              </button>
            )}

            <button
              type="button"
              onClick={handleResetAll}
              title="Reset all frames to default center position"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All to Center</span>
            </button>
          </div>

          <button
            type="button"
            id="crop-download-zip"
            onClick={handleDownloadCroppedZip}
            disabled={isProcessingZip || images.length === 0}
            className="pro-pill-btn px-5 py-2 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessingZip ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" /> Processing ({zipProgress}%)
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Download All Cropped ZIP ({images.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Interactive Croppable Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {images.map((item) => {
          const currentRect =
            item.cropArea ||
            getDefaultCropRectForImage(
              item.width,
              item.height,
              selectedRatio,
              customW,
              customH
            );

          return (
            <InteractiveCropCard
              key={item.id}
              item={item}
              selectedRatio={selectedRatio}
              targetRatio={targetRatio}
              cropRect={currentRect}
              onUpdateCropRect={(rect) => handleUpdateCropRect(item.id, rect)}
              onApplyToAll={handleApplyToAll}
              onResetCrop={() => handleResetCrop(item)}
              onDownloadSingle={handleDownloadSingleCropped}
              onRemove={() => onRemoveImage(item.id)}
              onToggleSelect={() => handleToggleSelect(item.id)}
            />
          );
        })}
      </div>
    </div>
  );
};
