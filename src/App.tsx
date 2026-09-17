import React, { useEffect, useState } from 'react';
import {
  AppTool,
  GridPosition,
  ImageItem,
  LogoWatermarkConfig,
  PreviewColumns,
  TextWatermarkConfig,
  ThemeMode,
  WatermarkMode,
  WatermarkSettingsState,
} from './types';
import { Navbar } from './components/Navbar';
import { SidebarWatermarkControls } from './components/SidebarWatermarkControls';
import { WatermarkCanvasPreview } from './components/WatermarkCanvasPreview';
import { CropStudio } from './components/CropStudio';
import { UploadDropzone } from './components/UploadDropzone';
import { HelpModal } from './components/HelpModal';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import { generateZipArchive, loadImage } from './utils/watermarkEngine';
import {
  Sparkles,
  Crop,
  Layers,
  Trash2,
  CheckSquare,
  Square,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const DEFAULT_TEXT_1: TextWatermarkConfig = {
  id: 'text-1',
  name: 'Custom Text 1',
  enabled: true,
  text: '© STUDIO WATERMARK',
  fontFamily: "'Poppins', sans-serif",
  fontSizePercent: 8,
  textColor: '#ffffff',
  outlineColor: '#000000',
  outlineWidth: 3,
  opacity: 90,
  position: 'bottom-right',
  horizontalOffset: 50,
  verticalOffset: 50,
  marginPercent: 4,
  rotation: 0,
  glow: false,
  glowColor: '#6366f1',
  glowBlur: 16,
  autoFitLongText: false,
  textCase: 'uppercase',
  tileRepeat: false,
  tileSpacing: 180,
  badgeStyle: false,
};

const DEFAULT_SETTINGS: WatermarkSettingsState = {
  filename: {
    id: 'filename-layer',
    name: 'Image Filename',
    enabled: true,
    text: '',
    fontFamily: "'Poppins', sans-serif",
    fontSizePercent: 7,
    textColor: '#ffffff',
    outlineColor: '#000000',
    outlineWidth: 3,
    opacity: 95,
    position: 'top-right',
    horizontalOffset: 50,
    verticalOffset: 50,
    marginPercent: 4,
    rotation: 0,
    glow: false,
    glowColor: '#ffffff',
    glowBlur: 14,
    autoFitLongText: true,
    textCase: 'original',
    tileRepeat: false,
    tileSpacing: 160,
    badgeStyle: false,
  },
  customTexts: [DEFAULT_TEXT_1],
  selectedCustomTextId: 'text-1',
  customText: DEFAULT_TEXT_1,
  logo: {
    enabled: true,
    logoDataUrl: null,
    logoFileName: null,
    sizePercent: 20,
    opacity: 90,
    position: 'bottom-left',
    horizontalOffset: 50,
    verticalOffset: 50,
    marginPercent: 4,
    rotation: 0,
    keepAspectRatio: true,
    glow: false,
    glowColor: '#ffffff',
    glowBlur: 16,
    tileRepeat: false,
    tileSpacing: 200,
    invertColor: false,
  },
};

export default function App() {
  const [tool, setTool] = useState<AppTool>('watermark');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('wm_theme');
    return (saved as ThemeMode) || 'light';
  });
  const [columns, setColumns] = useState<PreviewColumns>(3);
  const [mode, setMode] = useState<WatermarkMode>('custom_text');
  const [settings, setSettings] = useState<WatermarkSettingsState>(DEFAULT_SETTINGS);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [cachedLogoImg, setCachedLogoImg] = useState<HTMLImageElement | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Sync theme with HTML root class and body
  useEffect(() => {
    try {
      localStorage.setItem('wm_theme', theme);
    } catch {
      // ignore storage quota errors
    }
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Load sample photos automatically on first mount if empty
  useEffect(() => {
    handleLoadSamples();
  }, []);

  // Update logo image element whenever logoDataUrl changes
  useEffect(() => {
    if (settings.logo.logoDataUrl) {
      loadImage(settings.logo.logoDataUrl)
        .then((img) => setCachedLogoImg(img))
        .catch((err) => console.error('Logo preload error:', err));
    } else {
      setCachedLogoImg(null);
    }
  }, [settings.logo.logoDataUrl]);

  // Handle image files selection
  const handleFilesSelected = async (fileList: FileList | File[]) => {
    const newItems: ImageItem[] = [];
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await readFileAsDataUrl(file);
      const dimensions = await getImageDimensions(dataUrl);

      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        width: dimensions.width,
        height: dimensions.height,
        selected: false,
      });
    }

    setImages((prev) => [...prev, ...newItems]);
  };

  // Helper: Read file to base64 DataURL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper: Get natural image dimensions
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 1200, height: 800 });
      img.src = url;
    });
  };

  // Handle Logo Upload
  const handleLogoUpload = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    setSettings((prev) => ({
      ...prev,
      logo: {
        ...prev.logo,
        logoDataUrl: dataUrl,
        logoFileName: file.name,
        enabled: true,
      },
    }));
  };

  // Load sample photos for instant preview
  const handleLoadSamples = () => {
    const samples: ImageItem[] = SAMPLE_IMAGES.map((s, idx) => ({
      ...s,
      id: `sample-${idx}-${Date.now()}`,
      selected: false,
    }));
    setImages(samples);
  };

  // Remove single image
  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Toggle selection
  const handleSelectToggle = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, selected: !img.selected } : img))
    );
  };

  // Select all or Deselect all
  const handleSelectAll = (select: boolean) => {
    setImages((prev) => prev.map((img) => ({ ...img, selected: select })));
  };

  // Delete selected images
  const handleDeleteSelected = () => {
    setImages((prev) => prev.filter((img) => !img.selected));
  };

  // Interactive Click-to-Position on Canvas: updates active watermark's horizontal and vertical coordinates
  const handleCustomPositionClick = (hPercent: number, vPercent: number) => {
    if (mode === 'filename') {
      setSettings((prev) => ({
        ...prev,
        filename: {
          ...prev.filename,
          position: 'custom',
          horizontalOffset: hPercent,
          verticalOffset: vPercent,
        },
      }));
    } else if (mode === 'logo') {
      setSettings((prev) => ({
        ...prev,
        logo: {
          ...prev.logo,
          position: 'custom',
          horizontalOffset: hPercent,
          verticalOffset: vPercent,
        },
      }));
    } else {
      // Custom text: update selected text or all texts if batch mode
      setSettings((prev) => {
        const currentList =
          prev.customTexts && prev.customTexts.length > 0
            ? prev.customTexts
            : [prev.customText];
        const activeTarget = prev.selectedCustomTextId || 'text-1';

        if (activeTarget === 'all') {
          const updated = currentList.map((t) => ({
            ...t,
            position: 'custom' as GridPosition,
            horizontalOffset: hPercent,
            verticalOffset: vPercent,
          }));
          return {
            ...prev,
            customTexts: updated,
            customText: updated[0],
          };
        }

        const updated = currentList.map((t) =>
          t.id === activeTarget
            ? {
                ...t,
                position: 'custom' as GridPosition,
                horizontalOffset: hPercent,
                verticalOffset: vPercent,
              }
            : t
        );
        return {
          ...prev,
          customTexts: updated,
          customText: updated[0],
        };
      });
    }
  };

  // Add a new custom text layer
  const handleAddCustomText = () => {
    setSettings((prev) => {
      const currentList = prev.customTexts || [];
      const nextIdx = currentList.length + 1;
      const newId = `text-${Date.now()}`;
      const defaultPositions: GridPosition[] = [
        'bottom-left',
        'top-left',
        'center',
        'middle-right',
        'top-center',
        'bottom-center',
      ];
      const newPos = defaultPositions[(nextIdx - 2) % defaultPositions.length] || 'bottom-left';
      const newTextItem: TextWatermarkConfig = {
        id: newId,
        name: `Custom Text ${nextIdx}`,
        enabled: true,
        text:
          nextIdx === 2
            ? 'PHOTOGRAPHY 2026'
            : nextIdx === 3
              ? 'CONFIDENTIAL'
              : `Watermark ${nextIdx}`,
        fontFamily: "'Poppins', sans-serif",
        fontSizePercent: 7,
        textColor: '#ffffff',
        outlineColor: '#000000',
        outlineWidth: 3,
        opacity: 90,
        position: newPos,
        horizontalOffset: 50,
        verticalOffset: 50,
        marginPercent: 4,
        rotation: 0,
        glow: false,
        glowColor: '#6366f1',
        glowBlur: 16,
        autoFitLongText: false,
        textCase: 'uppercase',
        tileRepeat: false,
        tileSpacing: 180,
        badgeStyle: false,
      };

      const updatedTexts = [...currentList, newTextItem];
      return {
        ...prev,
        customTexts: updatedTexts,
        selectedCustomTextId: newId,
        customText: updatedTexts[0],
      };
    });
  };

  // Remove a custom text layer
  const handleRemoveCustomText = (id: string) => {
    setSettings((prev) => {
      const currentList = prev.customTexts || [];
      if (currentList.length <= 1) return prev;
      const updatedTexts = currentList.filter((t) => t.id !== id);
      const newSelected =
        prev.selectedCustomTextId === id
          ? updatedTexts[0].id
          : prev.selectedCustomTextId;

      return {
        ...prev,
        customTexts: updatedTexts,
        selectedCustomTextId: newSelected,
        customText: updatedTexts[0],
      };
    });
  };

  // Select custom text layer (or 'all' for batch edit)
  const handleSelectCustomText = (id: string | 'all') => {
    setSettings((prev) => ({
      ...prev,
      selectedCustomTextId: id,
    }));
  };

  // Toggle enable/disable for any layer (Filename, Logo, or specific Custom Text)
  const handleToggleLayerEnabled = (
    layerId: 'filename' | 'logo' | string,
    enabled: boolean
  ) => {
    if (layerId === 'filename') {
      setSettings((prev) => ({
        ...prev,
        filename: { ...prev.filename, enabled },
      }));
    } else if (layerId === 'logo') {
      setSettings((prev) => ({
        ...prev,
        logo: { ...prev.logo, enabled },
      }));
    } else {
      // Custom text layer
      setSettings((prev) => {
        const updated = (prev.customTexts || []).map((t) =>
          t.id === layerId ? { ...t, enabled } : t
        );
        return {
          ...prev,
          customTexts: updated,
          customText: updated[0] || prev.customText,
        };
      });
    }
  };

  // Export all as ZIP
  const handleExportAllZip = async () => {
    if (images.length === 0) return;
    setIsExportingZip(true);
    setExportProgress(0);

    try {
      const itemsToExport = images.some((img) => img.selected)
        ? images.filter((img) => img.selected)
        : images;

      const zipBlob = await generateZipArchive(
        itemsToExport,
        mode,
        settings,
        cachedLogoImg,
        (progress) => setExportProgress(progress)
      );

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watermarked_batch_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Batch export error:', err);
    } finally {
      setIsExportingZip(false);
      setExportProgress(0);
    }
  };

  // Partial settings updates
  const handleUpdateFilename = (cfg: Partial<TextWatermarkConfig>) => {
    setSettings((prev) => ({
      ...prev,
      filename: { ...prev.filename, ...cfg },
    }));
  };

  const handleUpdateCustomText = (
    cfg: Partial<TextWatermarkConfig>,
    targetId?: string | 'all'
  ) => {
    setSettings((prev) => {
      const currentList =
        prev.customTexts && prev.customTexts.length > 0
          ? prev.customTexts
          : [prev.customText];

      const activeTarget = targetId || prev.selectedCustomTextId || 'text-1';

      if (activeTarget === 'all') {
        const { id: _ignoreId, name: _ignoreName, ...restCfg } = cfg;
        const updated = currentList.map((t) => ({
          ...t,
          ...restCfg,
        }));
        return {
          ...prev,
          customTexts: updated,
          customText: updated[0],
        };
      }

      const updated = currentList.map((t) =>
        t.id === activeTarget ? { ...t, ...cfg } : t
      );
      return {
        ...prev,
        customTexts: updated,
        customText: updated[0] || prev.customText,
      };
    });
  };

  const handleUpdateLogo = (cfg: Partial<LogoWatermarkConfig>) => {
    setSettings((prev) => ({
      ...prev,
      logo: { ...prev.logo, ...cfg },
    }));
  };

  const selectedCount = images.filter((img) => img.selected).length;

  // Compute CSS grid class based on preview columns
  const getGridColsClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={`h-screen max-h-screen w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Top Sticky Navigation */}
      <Navbar
        tool={tool}
        onToolChange={setTool}
        theme={theme}
        onThemeChange={setTheme}
        columns={columns}
        onColumnsChange={setColumns}
        imagesCount={images.length}
        onLoadSamples={handleLoadSamples}
        onExportAllZip={handleExportAllZip}
        isExportingZip={isExportingZip}
        exportProgress={exportProgress}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Settings Sidebar (for Watermark Tool) */}
        {tool === 'watermark' && (
          <aside
            className={`transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md flex flex-col shrink-0 h-full max-h-full overflow-hidden ${
              isSidebarOpen ? 'w-80 sm:w-96' : 'w-0 overflow-hidden'
            }`}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Watermark Controls</span>
              </div>
              <button
                type="button"
                id="collapse-sidebar-btn"
                onClick={() => setIsSidebarOpen(false)}
                title="Collapse Sidebar"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div
              className="p-4 overflow-y-auto flex-1 space-y-6 overscroll-contain scroll-isolated"
              style={{ overscrollBehavior: 'contain' }}
              onWheel={(e) => e.stopPropagation()}
            >
              <SidebarWatermarkControls
                mode={mode}
                onModeChange={setMode}
                settings={settings}
                onUpdateFilename={handleUpdateFilename}
                onUpdateCustomText={handleUpdateCustomText}
                onUpdateLogo={handleUpdateLogo}
                onLogoUpload={handleLogoUpload}
                onAddCustomText={handleAddCustomText}
                onRemoveCustomText={handleRemoveCustomText}
                onSelectCustomText={handleSelectCustomText}
                onToggleLayerEnabled={handleToggleLayerEnabled}
              />
            </div>
          </aside>
        )}

        {/* Center / Right Content Canvas Area */}
        <main
          className="flex-1 flex flex-col min-w-0 h-full max-h-full overflow-y-auto overscroll-contain scroll-isolated"
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Collapsed sidebar expander trigger */}
          {tool === 'watermark' && !isSidebarOpen && (
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center">
              <button
                type="button"
                id="expand-sidebar-btn"
                onClick={() => setIsSidebarOpen(true)}
                className="pro-pill-btn flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Open Watermark Controls</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
            {/* If Bulk Crop Tool Selected */}
            {tool === 'crop' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Crop className="w-5 h-5 text-indigo-500" />
                      Bulk Crop Studio
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Batch crop photos with popular social media aspect ratios or custom pixel dimensions
                    </p>
                  </div>
                </div>

                {images.length === 0 ? (
                  <UploadDropzone
                    onFilesSelected={handleFilesSelected}
                    onLoadSamples={handleLoadSamples}
                  />
                ) : (
                  <>
                    <UploadDropzone
                      onFilesSelected={handleFilesSelected}
                      onLoadSamples={handleLoadSamples}
                      compact
                    />
                    <CropStudio
                      images={images}
                      onUpdateImages={setImages}
                      onRemoveImage={handleRemoveImage}
                    />
                  </>
                )}
              </div>
            ) : (
              /* Watermark Tool View */
              <div className="space-y-6">
                {/* Header Status & Batch Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      Image Canvas Preview ({images.length})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time interactive preview. Click on any photo to place watermark directly.
                    </p>
                  </div>

                  {images.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="select-all-btn"
                        onClick={() => handleSelectAll(selectedCount < images.length)}
                        className="pro-pill-btn px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
                      >
                        {selectedCount === images.length ? (
                          <>
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Deselect All
                          </>
                        ) : (
                          <>
                            <Square className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Select All ({selectedCount})
                          </>
                        )}
                      </button>

                      {selectedCount > 0 && (
                        <button
                          type="button"
                          id="delete-selected-btn"
                          onClick={handleDeleteSelected}
                          className="px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900 shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedCount})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Upload or Dropzone */}
                {images.length === 0 ? (
                  <UploadDropzone
                    onFilesSelected={handleFilesSelected}
                    onLoadSamples={handleLoadSamples}
                  />
                ) : (
                  <>
                    <UploadDropzone
                      onFilesSelected={handleFilesSelected}
                      onLoadSamples={handleLoadSamples}
                      compact
                    />

                    {/* Dynamic Grid of Watermark Canvas Previews */}
                    <div className={`grid ${getGridColsClass()} gap-4`}>
                      {images.map((item) => (
                        <WatermarkCanvasPreview
                          key={item.id}
                          item={item}
                          mode={mode}
                          settings={settings}
                          cachedLogoImg={cachedLogoImg}
                          onRemove={handleRemoveImage}
                          onSelectToggle={handleSelectToggle}
                          onCustomPositionClick={handleCustomPositionClick}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
