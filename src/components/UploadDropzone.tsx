import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  compact?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesSelected,
  compact = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  if (compact) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`p-3 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/60 dark:bg-slate-900/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          id="compact-file-input"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            if (e.target.files) onFilesSelected(e.target.files);
          }}
          className="hidden"
        />
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
          <UploadCloud className="w-4 h-4 text-indigo-500" />
          <span>+ Add More Images</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all text-center ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 scale-[1.005]'
          : 'border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 hover:border-indigo-400 dark:hover:border-indigo-500'
      } shadow-xs`}
    >
      <input
        ref={inputRef}
        type="file"
        id="bulk-file-input"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files) onFilesSelected(e.target.files);
        }}
        className="hidden"
      />

      <div className="max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-linear-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Drag & drop images here, or browse
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supports high-resolution JPG, PNG, WebP with zero client-side size limits
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            id="browse-files-btn"
            onClick={() => inputRef.current?.click()}
            className="pro-pill-btn px-6 py-2.5 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
          >
            Select Images From Device
          </button>
        </div>
      </div>
    </div>
  );
};
