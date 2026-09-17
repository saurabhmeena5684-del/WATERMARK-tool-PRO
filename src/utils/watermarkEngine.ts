import JSZip from 'jszip';
import {
  GridPosition,
  ImageItem,
  LogoWatermarkConfig,
  TextWatermarkConfig,
  WatermarkMode,
  WatermarkSettingsState,
} from '../types';

export const AVAILABLE_FONTS = [
  { label: 'Poppins (Default)', value: "'Poppins', sans-serif" },
  { label: 'Inter (Modern Clean)', value: "'Inter', sans-serif" },
  { label: 'Montserrat (Bold Clean)', value: "'Montserrat', sans-serif" },
  { label: 'Playfair Display (Luxury Serif)', value: "'Playfair Display', serif" },
  { label: 'Cinzel (Cinematic All-Caps)', value: "'Cinzel', serif" },
  { label: 'Great Vibes (Script/Signature)', value: "'Great Vibes', cursive" },
  { label: 'JetBrains Mono (Tech/Monospace)', value: "'JetBrains Mono', monospace" },
];

/**
 * Calculates (x, y) coordinates based on 9-anchor position or fine slider offsets
 */
export function calculateAnchorPosition(
  position: GridPosition,
  containerWidth: number,
  containerHeight: number,
  itemWidth: number,
  itemHeight: number,
  marginPercent: number,
  hOffset: number,
  vOffset: number
): { x: number; y: number } {
  const mx = (containerWidth * marginPercent) / 100;
  const my = (containerHeight * marginPercent) / 100;

  let baseX = 0;
  let baseY = 0;

  switch (position) {
    case 'top-left':
      baseX = mx;
      baseY = my;
      break;
    case 'top-center':
      baseX = (containerWidth - itemWidth) / 2;
      baseY = my;
      break;
    case 'top-right':
      baseX = containerWidth - itemWidth - mx;
      baseY = my;
      break;
    case 'middle-left':
      baseX = mx;
      baseY = (containerHeight - itemHeight) / 2;
      break;
    case 'center':
      baseX = (containerWidth - itemWidth) / 2;
      baseY = (containerHeight - itemHeight) / 2;
      break;
    case 'middle-right':
      baseX = containerWidth - itemWidth - mx;
      baseY = (containerHeight - itemHeight) / 2;
      break;
    case 'bottom-left':
      baseX = mx;
      baseY = containerHeight - itemHeight - my;
      break;
    case 'bottom-center':
      baseX = (containerWidth - itemWidth) / 2;
      baseY = containerHeight - itemHeight - my;
      break;
    case 'bottom-right':
      baseX = containerWidth - itemWidth - mx;
      baseY = containerHeight - itemHeight - my;
      break;
    case 'custom':
    default: {
      const availW = Math.max(10, containerWidth - itemWidth - 2 * mx);
      const availH = Math.max(10, containerHeight - itemHeight - 2 * my);
      baseX = mx + (availW * hOffset) / 100;
      baseY = my + (availH * vOffset) / 100;
      return {
        x: Math.max(5, Math.min(containerWidth - itemWidth - 5, baseX)),
        y: Math.max(5, Math.min(containerHeight - itemHeight - 5, baseY)),
      };
    }
  }

  // Micro adjustments if slider has moved from default 50%
  const xRange = containerWidth - itemWidth - 2 * mx;
  const yRange = containerHeight - itemHeight - 2 * my;

  if (hOffset !== 50 || vOffset !== 50) {
    const shiftX = ((hOffset - 50) / 50) * (xRange * 0.3);
    const shiftY = ((vOffset - 50) / 50) * (yRange * 0.3);
    baseX += shiftX;
    baseY += shiftY;
  }

  return {
    x: Math.max(5, Math.min(containerWidth - itemWidth - 5, baseX)),
    y: Math.max(5, Math.min(containerHeight - itemHeight - 5, baseY)),
  };
}

/**
 * Draws text watermark on an HTML5 canvas context
 */
export function drawTextWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: TextWatermarkConfig,
  text: string
) {
  if (!text || config.opacity <= 0) return;

  let displayText = text;
  if (config.textCase === 'uppercase') displayText = text.toUpperCase();
  else if (config.textCase === 'lowercase') displayText = text.toLowerCase();
  else if (config.textCase === 'capitalize') {
    displayText = text.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  ctx.save();

  const minDim = Math.min(width, height);
  let fontSize = Math.max(12, Math.round(minDim * (config.fontSizePercent / 100)));

  ctx.font = `600 ${fontSize}px ${config.fontFamily}`;
  ctx.textBaseline = 'top';

  // Auto-fit long text if enabled
  if (config.autoFitLongText) {
    const maxAllowedWidth = width * 0.55;
    let metrics = ctx.measureText(displayText);
    while (metrics.width > maxAllowedWidth && fontSize > 14) {
      fontSize -= 2;
      ctx.font = `600 ${fontSize}px ${config.fontFamily}`;
      metrics = ctx.measureText(displayText);
    }
  }

  const metrics = ctx.measureText(displayText);
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2;

  // Tiled / Repeated pattern across whole image
  if (config.tileRepeat) {
    ctx.globalAlpha = config.opacity / 100;
    const spacing = Math.max(80, config.tileSpacing || 160);
    const rotRad = ((config.rotation || -30) * Math.PI) / 180;

    ctx.fillStyle = config.textColor;
    if (config.outlineWidth > 0) {
      ctx.strokeStyle = config.outlineColor;
      ctx.lineWidth = config.outlineWidth;
    }

    const diag = Math.sqrt(width * width + height * height);
    const cols = Math.ceil(diag / spacing) + 2;
    const rows = Math.ceil(diag / spacing) + 2;

    ctx.translate(width / 2, height / 2);
    ctx.rotate(rotRad);

    const startX = -diag / 2;
    const startY = -diag / 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const tx = startX + i * spacing;
        const ty = startY + j * (spacing * 0.7);
        if (config.outlineWidth > 0) {
          ctx.strokeText(displayText, tx, ty);
        }
        ctx.fillText(displayText, tx, ty);
      }
    }

    ctx.restore();
    return;
  }

  // Single positioning
  const { x, y } = calculateAnchorPosition(
    config.position,
    width,
    height,
    textWidth,
    textHeight,
    config.marginPercent,
    config.horizontalOffset,
    config.verticalOffset
  );

  ctx.globalAlpha = config.opacity / 100;

  const centerX = x + textWidth / 2;
  const centerY = y + textHeight / 2;

  ctx.translate(centerX, centerY);
  if (config.rotation !== 0) {
    ctx.rotate((config.rotation * Math.PI) / 180);
  }

  // Draw optional badge background pill
  if (config.badgeStyle) {
    const pad = 12;
    ctx.fillStyle = config.backgroundColor || 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(
      -textWidth / 2 - pad,
      -textHeight / 2 - pad / 2,
      textWidth + pad * 2,
      textHeight + pad,
      8
    );
    ctx.fill();
  }

  // Glow effect
  if (config.glow) {
    ctx.shadowColor = config.glowColor || 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = config.glowBlur || 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else {
    // Subtle drop shadow for clarity on all photo backgrounds
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
  }

  // Stroke / Outline
  if (config.outlineWidth > 0) {
    ctx.strokeStyle = config.outlineColor;
    ctx.lineWidth = config.outlineWidth * 2;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(displayText, -textWidth / 2, -textHeight / 2);
  }

  // Fill text
  ctx.fillStyle = config.textColor;
  ctx.fillText(displayText, -textWidth / 2, -textHeight / 2);

  ctx.restore();
}

/**
 * Draws logo watermark on canvas
 */
export async function drawLogoWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: LogoWatermarkConfig,
  cachedLogoImg: HTMLImageElement | null
) {
  if (!cachedLogoImg || config.opacity <= 0) return;

  ctx.save();

  const minDim = Math.min(width, height);
  const targetSize = Math.max(20, Math.round(minDim * (config.sizePercent / 100)));

  let logoW = targetSize;
  let logoH = targetSize;

  if (config.keepAspectRatio) {
    const aspect = cachedLogoImg.naturalWidth / cachedLogoImg.naturalHeight;
    if (aspect >= 1) {
      logoW = targetSize;
      logoH = Math.round(targetSize / aspect);
    } else {
      logoH = targetSize;
      logoW = Math.round(targetSize * aspect);
    }
  }

  // Tiled logo repeat
  if (config.tileRepeat) {
    ctx.globalAlpha = config.opacity / 100;
    const spacing = Math.max(100, config.tileSpacing || 200);
    const rotRad = ((config.rotation || -30) * Math.PI) / 180;

    const diag = Math.sqrt(width * width + height * height);
    const cols = Math.ceil(diag / spacing) + 2;
    const rows = Math.ceil(diag / spacing) + 2;

    ctx.translate(width / 2, height / 2);
    ctx.rotate(rotRad);

    const startX = -diag / 2;
    const startY = -diag / 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const tx = startX + i * spacing;
        const ty = startY + j * (spacing * 0.8);
        ctx.drawImage(cachedLogoImg, tx, ty, logoW, logoH);
      }
    }

    ctx.restore();
    return;
  }

  const { x, y } = calculateAnchorPosition(
    config.position,
    width,
    height,
    logoW,
    logoH,
    config.marginPercent,
    config.horizontalOffset,
    config.verticalOffset
  );

  ctx.globalAlpha = config.opacity / 100;

  const centerX = x + logoW / 2;
  const centerY = y + logoH / 2;

  ctx.translate(centerX, centerY);
  if (config.rotation !== 0) {
    ctx.rotate((config.rotation * Math.PI) / 180);
  }

  if (config.glow) {
    ctx.shadowColor = config.glowColor || 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = config.glowBlur || 16;
  }

  if (config.invertColor) {
    ctx.filter = 'invert(1)';
  }

  ctx.drawImage(cachedLogoImg, -logoW / 2, -logoH / 2, logoW, logoH);

  ctx.restore();
}

/**
 * Loads an image from URL or dataURL into HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
}

/**
 * Renders full watermarked image onto a dedicated offscreen canvas and returns Blob
 */
export async function renderFullWatermarkedImage(
  item: ImageItem,
  mode: WatermarkMode,
  settings: WatermarkSettingsState,
  cachedLogoImg: HTMLImageElement | null,
  outputFormat: 'image/jpeg' | 'image/png' = 'image/jpeg',
  quality = 0.95
): Promise<Blob> {
  const img = await loadImage(item.dataUrl);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Draw background image
  ctx.drawImage(img, 0, 0);

  const baseFileName = item.name.replace(/\.[^/.]+$/, '');

  // Filename watermark
  if ((mode === 'filename' || mode === 'multiple') && settings.filename.enabled) {
    drawTextWatermark(ctx, canvas.width, canvas.height, settings.filename, baseFileName);
  }

  // Custom text watermark(s) - Supports multiple custom texts (1, 2, 3...)
  if (mode === 'custom_text' || mode === 'multiple') {
    const textLayers =
      settings.customTexts && settings.customTexts.length > 0
        ? settings.customTexts
        : settings.customText
          ? [settings.customText]
          : [];

    for (const tConfig of textLayers) {
      if (tConfig.enabled && tConfig.text && tConfig.text.trim()) {
        drawTextWatermark(ctx, canvas.width, canvas.height, tConfig, tConfig.text);
      }
    }
  }

  // Logo watermark
  if (
    (mode === 'logo' || mode === 'multiple') &&
    settings.logo.enabled &&
    cachedLogoImg
  ) {
    await drawLogoWatermark(ctx, canvas.width, canvas.height, settings.logo, cachedLogoImg);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to produce image blob'));
      },
      outputFormat,
      quality
    );
  });
}

/**
 * Generates a ZIP file containing all processed images with custom prefix/suffix
 */
export async function generateZipArchive(
  items: ImageItem[],
  mode: WatermarkMode,
  settings: WatermarkSettingsState,
  cachedLogoImg: HTMLImageElement | null,
  onProgress?: (progress: number, currentItemName: string) => void
): Promise<Blob> {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (onProgress) {
      onProgress(Math.round(((i + 1) / items.length) * 100), item.name);
    }

    try {
      const blob = await renderFullWatermarkedImage(item, mode, settings, cachedLogoImg);
      const nameParts = item.name.split('.');
      const ext = nameParts.length > 1 ? nameParts.pop() : 'jpg';
      const base = nameParts.join('.');
      const safeName = `${base}_watermarked.${ext}`;
      zip.file(safeName, blob);
    } catch (err) {
      console.error(`Error processing ${item.name}:`, err);
    }
  }

  return zip.generateAsync({ type: 'blob' });
}
