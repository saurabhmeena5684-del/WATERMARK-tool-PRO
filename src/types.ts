export type AppTool = 'watermark' | 'crop';

export type WatermarkMode = 'filename' | 'custom_text' | 'logo' | 'multiple';

export type GridPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'custom';

export interface TextWatermarkConfig {
  id: string;
  name: string;
  enabled: boolean;
  text: string;
  fontFamily: string;
  fontSizePercent: number; // 1 to 20% of image min dimension
  textColor: string;
  outlineColor: string;
  outlineWidth: number; // 0 to 12px
  opacity: number; // 0 to 100
  position: GridPosition;
  horizontalOffset: number; // 0 to 100%
  verticalOffset: number; // 0 to 100%
  marginPercent: number; // 1 to 20%
  rotation: number; // -180 to 180 degrees
  glow: boolean;
  glowColor: string;
  glowBlur: number;
  autoFitLongText: boolean;
  textCase: 'original' | 'uppercase' | 'lowercase' | 'capitalize';
  tileRepeat: boolean;
  tileSpacing: number; // 50 to 300px
  backgroundColor?: string;
  backgroundPadding?: number;
  badgeStyle?: boolean;
}

export interface LogoWatermarkConfig {
  enabled: boolean;
  logoDataUrl: string | null;
  logoFileName: string | null;
  sizePercent: number; // 5 to 60% of image dimension
  opacity: number; // 0 to 100
  position: GridPosition;
  horizontalOffset: number; // 0 to 100%
  verticalOffset: number; // 0 to 100%
  marginPercent: number; // 1 to 20%
  rotation: number; // -180 to 180 degrees
  keepAspectRatio: boolean;
  glow: boolean;
  glowColor: string;
  glowBlur: number;
  tileRepeat: boolean;
  tileSpacing: number;
  invertColor: boolean;
}

export interface WatermarkSettingsState {
  filename: TextWatermarkConfig;
  customTexts: TextWatermarkConfig[];
  selectedCustomTextId: string | 'all';
  logo: LogoWatermarkConfig;
  // Legacy convenience accessor
  customText: TextWatermarkConfig;
}

export type CropRatioOption =
  | 'original'
  | '1:1'
  | '4:5'
  | '9:16'
  | '16:9'
  | '3:4'
  | '2:3'
  | 'custom';

export interface CropSettings {
  ratio: CropRatioOption;
  customWidth: number;
  customHeight: number;
}

export interface ImageItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  width: number;
  height: number;
  selected?: boolean;
  // Per-image crop override if any
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type PreviewColumns = 1 | 2 | 3 | 4 | 6;
