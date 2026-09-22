import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TextWatermarkConfig,
  LogoWatermarkConfig,
  WatermarkMode,
  WatermarkSettingsState,
} from '../types';
import { AVAILABLE_FONTS } from '../utils/watermarkEngine';
import { PositionGridSelector } from './PositionGridSelector';
import { CharacterPushToggle } from './CharacterPushToggle';
import {
  Type,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  UploadCloud,
  FileText,
  Palette,
  Eye,
  Plus,
  Trash2,
  Check,
  Layers,
  Sparkle,
  SlidersHorizontal,
} from 'lucide-react';

interface SidebarWatermarkControlsProps {
  mode: WatermarkMode;
  onModeChange: (mode: WatermarkMode) => void;
  settings: WatermarkSettingsState;
  onUpdateFilename: (cfg: Partial<TextWatermarkConfig>) => void;
  onUpdateCustomText: (cfg: Partial<TextWatermarkConfig>, targetId?: string | 'all') => void;
  onUpdateLogo: (cfg: Partial<LogoWatermarkConfig>) => void;
  onLogoUpload: (file: File) => void;
  onAddCustomText: () => void;
  onRemoveCustomText: (id: string) => void;
  onSelectCustomText: (id: string | 'all') => void;
  onToggleLayerEnabled: (layerId: 'filename' | 'logo' | string, enabled: boolean) => void;
}

export const SidebarWatermarkControls: React.FC<SidebarWatermarkControlsProps> = ({
  mode,
  onModeChange,
  settings,
  onUpdateFilename,
  onUpdateCustomText,
  onUpdateLogo,
  onLogoUpload,
  onAddCustomText,
  onRemoveCustomText,
  onSelectCustomText,
  onToggleLayerEnabled,
}) => {
  // In multi-layer mode, which top-level layer group is currently selected for deep editing
  const [multiActiveGroup, setMultiActiveGroup] = useState<'filename' | 'text' | 'logo'>('text');

  const customTexts = settings.customTexts && settings.customTexts.length > 0
    ? settings.customTexts
    : [settings.customText];

  const selectedTextId = settings.selectedCustomTextId || customTexts[0]?.id || 'text-1';
  const isAllTextsSelected = selectedTextId === 'all';

  // The active custom text object if a specific one is selected
  const activeCustomText =
    customTexts.find((t) => t.id === selectedTextId) || customTexts[0] || settings.customText;

  // For editing text properties
  const handleTextPropertyChange = (cfg: Partial<TextWatermarkConfig>) => {
    onUpdateCustomText(cfg, isAllTextsSelected ? 'all' : activeCustomText.id);
  };

  const isMultiple = mode === 'multiple';

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* 1. Watermark Type Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Watermark Mode</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            id="wm-type-filename"
            onClick={() => onModeChange('filename')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-bold cursor-pointer transition-all ${
              mode === 'filename'
                ? 'pro-pill-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
            <span className="truncate">Image Filename</span>
          </button>

          <button
            type="button"
            id="wm-type-custom-text"
            onClick={() => onModeChange('custom_text')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-bold cursor-pointer transition-all ${
              mode === 'custom_text'
                ? 'pro-pill-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
            <span className="truncate">Custom Text ({customTexts.length})</span>
          </button>

          <button
            type="button"
            id="wm-type-logo"
            onClick={() => onModeChange('logo')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-bold cursor-pointer transition-all ${
              mode === 'logo'
                ? 'pro-pill-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
            <span className="truncate">Logo / Image</span>
          </button>

          <button
            type="button"
            id="wm-type-multiple"
            onClick={() => onModeChange('multiple')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-bold cursor-pointer transition-all relative ${
              mode === 'multiple'
                ? 'pro-pill-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Multi-Layer Studio</span>
          </button>
        </div>
      </div>

      {/* 2. MULTI-LAYER STACK OVERVIEW WITH DIRECT ON/OFF TOGGLE SWITCHES */}
      {isMultiple && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Active Layers (Turn ON/OFF)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900/60 font-semibold text-indigo-800 dark:text-indigo-300">
              Multi-Mode
            </span>
          </div>

          <div className="space-y-2">
            {/* Filename Layer Item */}
            <div
              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                multiActiveGroup === 'filename'
                  ? 'bg-white dark:bg-slate-800/90 border-indigo-400 dark:border-indigo-600 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/70 hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <button
                type="button"
                id="select-group-filename"
                onClick={() => setMultiActiveGroup('filename')}
                className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
              >
                <div className={`p-1.5 rounded-lg ${settings.filename.enabled ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>Filename Layer</span>
                    {multiActiveGroup === 'filename' && (
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.2 rounded">
                        Active Edit
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {settings.filename.enabled ? `Position: ${settings.filename.position}` : 'Disabled'}
                  </div>
                </div>
              </button>

              {/* Direct ON/OFF Toggle Switch with Cute Character Animation */}
              <div className="shrink-0 ml-2">
                <CharacterPushToggle
                  id="toggle-filename-layer"
                  size="sm"
                  checked={settings.filename.enabled}
                  onChange={(checked) => onToggleLayerEnabled('filename', checked)}
                />
              </div>
            </div>

            {/* Custom Text Group Item with Mini Status */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                multiActiveGroup === 'text'
                  ? 'bg-white dark:bg-slate-800/90 border-indigo-400 dark:border-indigo-600 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/70 hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  id="select-group-text"
                  onClick={() => setMultiActiveGroup('text')}
                  className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    <Type className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>Custom Text Layers</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        {customTexts.length}
                      </span>
                      {multiActiveGroup === 'text' && (
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.2 rounded">
                          Active Edit
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {customTexts.filter((t) => t.enabled).length} of {customTexts.length} enabled
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  id="multi-add-text-btn"
                  onClick={onAddCustomText}
                  title="Add Another Custom Text (e.g. Text 2, Text 3)"
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-1 cursor-pointer transition-colors shrink-0 ml-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Text</span>
                </button>
              </div>
            </div>

            {/* Logo Layer Item */}
            <div
              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                multiActiveGroup === 'logo'
                  ? 'bg-white dark:bg-slate-800/90 border-indigo-400 dark:border-indigo-600 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/70 hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <button
                type="button"
                id="select-group-logo"
                onClick={() => setMultiActiveGroup('logo')}
                className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
              >
                <div className={`p-1.5 rounded-lg ${settings.logo.enabled ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>Logo / Image Layer</span>
                    {multiActiveGroup === 'logo' && (
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.2 rounded">
                        Active Edit
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {settings.logo.logoFileName || (settings.logo.logoDataUrl ? 'Custom Image' : 'No image uploaded')}
                  </div>
                </div>
              </button>

              {/* Direct ON/OFF Toggle Switch with Cute Character Animation */}
              <div className="shrink-0 ml-2">
                <CharacterPushToggle
                  id="toggle-logo-layer"
                  size="sm"
                  checked={settings.logo.enabled}
                  onChange={(checked) => onToggleLayerEnabled('logo', checked)}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. CUSTOM TEXT LAYER MANAGER (When mode is custom_text OR multiActiveGroup is 'text') */}
      {(mode === 'custom_text' || (isMultiple && multiActiveGroup === 'text')) && (
        <div className="space-y-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Type className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Select Custom Text Layer
              </span>
            </div>

            <button
              type="button"
              id="add-custom-text-layer-btn"
              onClick={onAddCustomText}
              className="pro-pill-btn px-3 py-1 text-xs font-bold gap-1 text-slate-900 dark:text-white"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Add Text Layer</span>
            </button>
          </div>

          {/* List of Custom Texts with ON/OFF switches and selection */}
          <div className="space-y-2">
            <AnimatePresence>
              {customTexts.map((textItem, idx) => {
                const isSelected = selectedTextId === textItem.id;
                return (
                  <motion.div
                    key={textItem.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Layer Click to Select */}
                    <button
                      type="button"
                      id={`select-custom-text-${textItem.id}`}
                      onClick={() => onSelectCustomText(textItem.id)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {textItem.name || `Custom Text ${idx + 1}`}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-1 rounded shadow-2xs">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                          "{textItem.text || 'Empty text'}" · {textItem.position}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {/* Direct ON/OFF switch for each text layer with Character Push Animation */}
                      <CharacterPushToggle
                        id={`toggle-text-layer-${textItem.id}`}
                        size="sm"
                        checked={textItem.enabled}
                        onChange={(checked) => onToggleLayerEnabled(textItem.id, checked)}
                      />

                      {/* Delete button (if more than 1 text layer) */}
                      {customTexts.length > 1 && (
                        <button
                          type="button"
                          id={`delete-text-${textItem.id}`}
                          onClick={() => onRemoveCustomText(textItem.id)}
                          title={`Delete ${textItem.name || `Custom Text ${idx + 1}`}`}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Quick Tabs & "Select All Texts (Batch Mode)" */}
          <div className="pt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
              Select:
            </span>
            {customTexts.map((textItem, idx) => (
              <button
                key={textItem.id}
                type="button"
                id={`pill-select-text-${textItem.id}`}
                onClick={() => onSelectCustomText(textItem.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedTextId === textItem.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                Text {idx + 1}
              </button>
            ))}

            {/* BATCH ALL TEXTS BUTTON */}
            {customTexts.length > 1 && (
              <button
                type="button"
                id="select-all-texts-batch-btn"
                onClick={() => onSelectCustomText('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  isAllTextsSelected
                    ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-400/50'
                    : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100'
                }`}
              >
                <Sparkle className="w-3 h-3" />
                <span>All Texts (Batch Edit)</span>
              </button>
            )}
          </div>

          {/* Banner explaining active selection scope */}
          {isAllTextsSelected ? (
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-200 text-xs flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <span className="font-bold">Batch Mode Active:</span> Changing size, position, font, opacity or color will update <strong>all {customTexts.length} custom texts simultaneously</strong>.
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="font-semibold">Independent Mode:</span> Editing <strong>{activeCustomText.name || 'Custom Text'}</strong> only.
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. EDITING CONTROLS FOR THE CURRENTLY ACTIVE LAYER */}
      {/* CASE A: LOGO CONTROLS */}
      {((isMultiple && multiActiveGroup === 'logo') || mode === 'logo') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              Logo / Image Settings
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Enabled</span>
              <CharacterPushToggle
                id="logo-enabled-toggle-inner"
                size="sm"
                checked={settings.logo.enabled}
                onChange={(checked) => onUpdateLogo({ enabled: checked })}
              />
            </div>
          </div>

          {/* Logo Uploader */}
          <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-900/40">
            {settings.logo.logoDataUrl ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center p-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-h-24">
                  <img
                    src={settings.logo.logoDataUrl}
                    alt="Logo preview"
                    className="max-h-20 object-contain"
                  />
                </div>
                <div className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                  {settings.logo.logoFileName || 'Custom Logo'}
                </div>
                <label className="inline-block px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 rounded-lg cursor-pointer border border-indigo-200 dark:border-indigo-800/50 shadow-2xs">
                  Replace Logo
                  <input
                    type="file"
                    id="logo-replace-input"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) onLogoUpload(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 mx-auto text-indigo-500 dark:text-indigo-400 mb-2" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Upload Brand Logo / PNG
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Supports transparent PNG, SVG, JPG, WebP
                </div>
                <input
                  type="file"
                  id="logo-upload-input"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) onLogoUpload(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Logo Size & Opacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span className="font-semibold">Logo Size</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {settings.logo.sizePercent}%
                </span>
              </div>
              <input
                type="range"
                id="logo-size-slider"
                min="1"
                max="100"
                value={settings.logo.sizePercent}
                onChange={(e) => onUpdateLogo({ sizePercent: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between gap-1 mt-1.5">
                {[10, 25, 50, 75, 100].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onUpdateLogo({ sizePercent: sz })}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-medium transition-colors ${
                      settings.logo.sizePercent === sz
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    {sz}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span className="font-semibold flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Opacity
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {settings.logo.opacity}%
                </span>
              </div>
              <input
                type="range"
                id="logo-opacity-slider"
                min="5"
                max="100"
                value={settings.logo.opacity}
                onChange={(e) => onUpdateLogo({ opacity: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Logo Options */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Keep Original Aspect Ratio
              </span>
              <CharacterPushToggle
                id="logo-aspect-ratio-checkbox"
                size="sm"
                checked={settings.logo.keepAspectRatio}
                onChange={(checked) => onUpdateLogo({ keepAspectRatio: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Invert Color (Black / White)
              </span>
              <CharacterPushToggle
                id="logo-invert-checkbox"
                size="sm"
                checked={settings.logo.invertColor}
                onChange={(checked) => onUpdateLogo({ invertColor: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Glow Shadow
              </span>
              <CharacterPushToggle
                id="logo-glow-checkbox"
                size="sm"
                checked={settings.logo.glow}
                onChange={(checked) => onUpdateLogo({ glow: checked })}
              />
            </div>
          </div>

          {/* Logo Position Grid */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <PositionGridSelector
              position={settings.logo.position}
              onPositionChange={(pos) => onUpdateLogo({ position: pos })}
              hOffset={settings.logo.horizontalOffset}
              onHOffsetChange={(val) => onUpdateLogo({ horizontalOffset: val })}
              vOffset={settings.logo.verticalOffset}
              onVOffsetChange={(val) => onUpdateLogo({ verticalOffset: val })}
              marginPercent={settings.logo.marginPercent}
              onMarginChange={(val) => onUpdateLogo({ marginPercent: val })}
              rotation={settings.logo.rotation}
              onRotationChange={(val) => onUpdateLogo({ rotation: val })}
              tileRepeat={settings.logo.tileRepeat}
              onTileRepeatChange={(val) => onUpdateLogo({ tileRepeat: val })}
              tileSpacing={settings.logo.tileSpacing}
              onTileSpacingChange={(val) => onUpdateLogo({ tileSpacing: val })}
            />
          </div>
        </div>
      )}

      {/* CASE B: FILENAME CONTROLS */}
      {((isMultiple && multiActiveGroup === 'filename') || mode === 'filename') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Filename Watermark Settings
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Enabled</span>
              <CharacterPushToggle
                id="filename-enabled-toggle-inner"
                size="sm"
                checked={settings.filename.enabled}
                onChange={(checked) => onUpdateFilename({ enabled: checked })}
              />
            </div>
          </div>

          {/* Text Case & Font Family */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Text Case
              </label>
              <select
                id="filename-text-case-select"
                value={settings.filename.textCase}
                onChange={(e) =>
                  onUpdateFilename({ textCase: e.target.value as TextWatermarkConfig['textCase'] })
                }
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="original">Original As-Is</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize Each Word</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Font Family
              </label>
              <select
                id="filename-font-family-select"
                value={settings.filename.fontFamily}
                onChange={(e) => onUpdateFilename({ fontFamily: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                {AVAILABLE_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Size & Opacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span className="font-semibold">Text Size</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {settings.filename.fontSizePercent}%
                </span>
              </div>
              <input
                type="range"
                id="filename-font-size-slider"
                min="1"
                max="100"
                value={settings.filename.fontSizePercent}
                onChange={(e) => onUpdateFilename({ fontSizePercent: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between gap-1 mt-1.5">
                {[8, 25, 50, 75, 100].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onUpdateFilename({ fontSizePercent: sz })}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-medium transition-colors ${
                      settings.filename.fontSizePercent === sz
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    {sz}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span className="font-semibold flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Opacity
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {settings.filename.opacity}%
                </span>
              </div>
              <input
                type="range"
                id="filename-opacity-slider"
                min="5"
                max="100"
                value={settings.filename.opacity}
                onChange={(e) => onUpdateFilename({ opacity: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Colors & Stroke */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  id="filename-text-color-picker"
                  value={settings.filename.textColor}
                  onChange={(e) => onUpdateFilename({ textColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-300 dark:border-slate-600 cursor-pointer p-0"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Text Color</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  id="filename-outline-color-picker"
                  value={settings.filename.outlineColor}
                  onChange={(e) => onUpdateFilename({ outlineColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-300 dark:border-slate-600 cursor-pointer p-0"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Outline</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Outline Stroke</span>
                <span className="font-mono">{settings.filename.outlineWidth}px</span>
              </div>
              <input
                type="range"
                id="filename-outline-width-slider"
                min="0"
                max="12"
                value={settings.filename.outlineWidth}
                onChange={(e) => onUpdateFilename({ outlineWidth: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Position Grid */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <PositionGridSelector
              position={settings.filename.position}
              onPositionChange={(pos) => onUpdateFilename({ position: pos })}
              hOffset={settings.filename.horizontalOffset}
              onHOffsetChange={(val) => onUpdateFilename({ horizontalOffset: val })}
              vOffset={settings.filename.verticalOffset}
              onVOffsetChange={(val) => onUpdateFilename({ verticalOffset: val })}
              marginPercent={settings.filename.marginPercent}
              onMarginChange={(val) => onUpdateFilename({ marginPercent: val })}
              rotation={settings.filename.rotation}
              onRotationChange={(val) => onUpdateFilename({ rotation: val })}
              tileRepeat={settings.filename.tileRepeat}
              onTileRepeatChange={(val) => onUpdateFilename({ tileRepeat: val })}
              tileSpacing={settings.filename.tileSpacing}
              onTileSpacingChange={(val) => onUpdateFilename({ tileSpacing: val })}
            />
          </div>
        </div>
      )}

      {/* CASE C: CUSTOM TEXT CONTROLS (Single or Batch All) */}
      {(mode === 'custom_text' || (isMultiple && multiActiveGroup === 'text')) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              {isAllTextsSelected ? 'Settings: All Custom Texts (Batch)' : `Settings: ${activeCustomText.name || 'Custom Text'}`}
            </span>

            {!isAllTextsSelected && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Enabled</span>
                <CharacterPushToggle
                  id="active-custom-text-enabled-toggle"
                  size="sm"
                  checked={activeCustomText.enabled}
                  onChange={(checked) => handleTextPropertyChange({ enabled: checked })}
                />
              </div>
            )}
          </div>

          {/* Text Input string (If single text selected, show direct edit. If batch, show expandable or individual inputs) */}
          {!isAllTextsSelected ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Watermark Text
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleTextPropertyChange({ text: '© STUDIO WATERMARK' })}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer"
                  >
                    © Copyright
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTextPropertyChange({ text: 'CONFIDENTIAL' })}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer"
                  >
                    Confidential
                  </button>
                </div>
              </div>
              <input
                type="text"
                id="custom-watermark-text-input"
                value={activeCustomText.text}
                onChange={(e) => handleTextPropertyChange({ text: e.target.value })}
                placeholder="e.g. © Studio Photography"
                className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          ) : (
            /* If All Texts is selected, let user quickly edit the text of each custom text */
            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-2">
              <div className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between">
                <span>Text Strings (Edit Each)</span>
                <span className="text-[10px] font-normal text-purple-700 dark:text-purple-300">
                  Styles below apply to ALL
                </span>
              </div>
              {customTexts.map((txt, idx) => (
                <div key={txt.id} className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 w-14 shrink-0">
                    Text {idx + 1}:
                  </span>
                  <input
                    type="text"
                    value={txt.text}
                    onChange={(e) => onUpdateCustomText({ text: e.target.value }, txt.id)}
                    className="flex-1 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Text Case & Font Family */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Text Case
              </label>
              <select
                id="text-case-select"
                value={activeCustomText.textCase}
                onChange={(e) =>
                  handleTextPropertyChange({
                    textCase: e.target.value as TextWatermarkConfig['textCase'],
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="original">Original As-Is</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize Each Word</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Font Family
              </label>
              <select
                id="font-family-select"
                value={activeCustomText.fontFamily}
                onChange={(e) => handleTextPropertyChange({ fontFamily: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                {AVAILABLE_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Size (Independent or Batch!) & Opacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span className="font-semibold">
                  {isAllTextsSelected ? 'All Font Sizes' : 'Text Size'}
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {activeCustomText.fontSizePercent}%
                </span>
              </div>
              <input
                type="range"
                id="font-size-slider"
                min="1"
                max="100"
                value={activeCustomText.fontSizePercent}
                onChange={(e) =>
                  handleTextPropertyChange({ fontSizePercent: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between gap-1 mt-1.5">
                {[8, 25, 50, 75, 100].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleTextPropertyChange({ fontSizePercent: sz })}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-medium transition-colors ${
                      activeCustomText.fontSizePercent === sz
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    {sz}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span className="font-semibold flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Opacity
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {activeCustomText.opacity}%
                </span>
              </div>
              <input
                type="range"
                id="text-opacity-slider"
                min="5"
                max="100"
                value={activeCustomText.opacity}
                onChange={(e) => handleTextPropertyChange({ opacity: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Colors & Stroke Outline */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-500" /> Colors & Stroke
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  id="text-color-picker"
                  value={activeCustomText.textColor}
                  onChange={(e) => handleTextPropertyChange({ textColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-300 dark:border-slate-600 cursor-pointer p-0"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Text Color</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  id="outline-color-picker"
                  value={activeCustomText.outlineColor}
                  onChange={(e) => handleTextPropertyChange({ outlineColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-300 dark:border-slate-600 cursor-pointer p-0"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Outline</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Outline Stroke Thickness</span>
                <span className="font-mono">{activeCustomText.outlineWidth}px</span>
              </div>
              <input
                type="range"
                id="outline-width-slider"
                min="0"
                max="12"
                value={activeCustomText.outlineWidth}
                onChange={(e) =>
                  handleTextPropertyChange({ outlineWidth: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Effects: Glow & Badge */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Glow Aura Effect
              </span>
              <CharacterPushToggle
                id="glow-aura-checkbox"
                size="sm"
                checked={activeCustomText.glow}
                onChange={(checked) => handleTextPropertyChange({ glow: checked })}
              />
            </div>

            {activeCustomText.glow && (
              <div className="pt-2 flex items-center gap-3">
                <input
                  type="color"
                  id="glow-color-picker"
                  value={activeCustomText.glowColor}
                  onChange={(e) => handleTextPropertyChange({ glowColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                />
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>Glow Blur</span>
                    <span>{activeCustomText.glowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    id="glow-blur-slider"
                    min="4"
                    max="30"
                    value={activeCustomText.glowBlur}
                    onChange={(e) =>
                      handleTextPropertyChange({ glowBlur: Number(e.target.value) })
                    }
                    className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded accent-indigo-600"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Pill Badge Background
              </span>
              <CharacterPushToggle
                id="badge-style-checkbox"
                size="sm"
                checked={!!activeCustomText.badgeStyle}
                onChange={(checked) => handleTextPropertyChange({ badgeStyle: checked })}
              />
            </div>
          </div>

          {/* Positioning Controls (Independent for the selected text or broadcast to all!) */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isAllTextsSelected ? 'Position: All Custom Texts' : `Position: ${activeCustomText.name || 'Custom Text'}`}
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                {activeCustomText.position}
              </span>
            </div>

            <PositionGridSelector
              position={activeCustomText.position}
              onPositionChange={(pos) => handleTextPropertyChange({ position: pos })}
              hOffset={activeCustomText.horizontalOffset}
              onHOffsetChange={(val) => handleTextPropertyChange({ horizontalOffset: val })}
              vOffset={activeCustomText.verticalOffset}
              onVOffsetChange={(val) => handleTextPropertyChange({ verticalOffset: val })}
              marginPercent={activeCustomText.marginPercent}
              onMarginChange={(val) => handleTextPropertyChange({ marginPercent: val })}
              rotation={activeCustomText.rotation}
              onRotationChange={(val) => handleTextPropertyChange({ rotation: val })}
              tileRepeat={activeCustomText.tileRepeat}
              onTileRepeatChange={(val) => handleTextPropertyChange({ tileRepeat: val })}
              tileSpacing={activeCustomText.tileSpacing}
              onTileSpacingChange={(val) => handleTextPropertyChange({ tileSpacing: val })}
            />
          </div>
        </div>
      )}
    </div>
  );
};
