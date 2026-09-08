import React, { useState, useRef, useEffect, DragEvent, ChangeEvent, ClipboardEvent } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, ClipboardPaste } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from '../../config/index.js';

export interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const extractImageFromClipboard = (clipboardItems: DataTransferItemList): File | null => {
  for (let i = 0; i < clipboardItems.length; i++) {
    const item = clipboardItems[i];
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        let name = file.name;
        if (!name || name === 'image.png' || !name.includes('.')) {
          const ext = file.type.split('/')[1] || 'png';
          const ts = new Date().toISOString().replace(/[:.]/g, '-');
          name = `pasted-image-${ts}.${ext}`;
        }
        return new File([file], name, { type: file.type });
      }
    }
  }
  return null;
};

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelected,
  selectedFile,
  onClearFile,
  onSubmit,
  isLoading = false,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('Please upload a JPG, PNG, or WEBP image under 10 MB.');
      return;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidMime = ALLOWED_MIME_TYPES.includes(file.type);
    const isValidExt = ALLOWED_EXTENSIONS.includes(extension);

    if (!isValidMime && !isValidExt) {
      setErrorMessage('Please upload a JPG, PNG, or WEBP image under 10 MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelected(file);
  };

  useEffect(() => {
    const handleWindowPaste = (e: globalThis.ClipboardEvent) => {
      if (disabled || isLoading) return;
      if (!e.clipboardData) return;
      const file = extractImageFromClipboard(e.clipboardData.items);
      if (!file) return;
      const target = e.target as HTMLElement;
      const isInForm = !!target?.closest('input, textarea, [contenteditable="true"]');
      if (isInForm) return;
      e.preventDefault();
      validateAndProcessFile(file);
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [disabled, isLoading, selectedFile]);

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    if (disabled || isLoading) return;
    if (!e.clipboardData) return;
    const file = extractImageFromClipboard(e.clipboardData.items);
    if (!file) return;
    e.preventDefault();
    e.stopPropagation();
    validateAndProcessFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClearFile();
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        id="snapcut-file-input"
        disabled={disabled || isLoading}
      />

      {!selectedFile ? (
        <div
          ref={dropzoneRef}
          tabIndex={0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isLoading) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer outline-none border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] ${
            isDragOver
              ? 'border-[#00D9FF] bg-[#00D9FF]/5 shadow-glow-cyan scale-[1.01]'
              : isFocused
              ? 'border-[#00D9FF]/60 bg-[#080B1A]/90 ring-2 ring-[#00D9FF]/20'
              : 'border-[#1C2450] bg-[#080B1A]/80 hover:border-[#2D3B82] hover:bg-[#0B1026]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-[#0B1026] border border-[#1C2450] flex items-center justify-center text-[#00D9FF] mb-4 group-hover:scale-110 group-hover:border-[#00D9FF]/40 transition-transform duration-300 shadow-glow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
            Drop, paste, or click to upload
          </h3>
          <p className="text-xs sm:text-sm text-[#AAB3D0] mb-2">
            Drag & drop • Click to browse • <kbd className="px-1.5 py-0.5 rounded bg-[#1C2450] text-[#E6EBFF] border border-[#2D3B82] font-mono text-[11px] mx-1">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-[#1C2450] text-[#E6EBFF] border border-[#2D3B82] font-mono text-[11px] mx-1">V</kbd> to paste from clipboard
          </p>

          <div className="flex items-center gap-2 text-xs text-[#707B9E] mb-4">
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Screenshot or copied image? Just paste it!</span>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="pointer-events-none"
          >
            Select Image
          </Button>

          <p className="text-[11px] text-[#707B9E] mt-4 tracking-wide uppercase font-medium">
            JPG, PNG, WEBP • Max 10 MB
          </p>
        </div>
      ) : (
        /* Selected Image Preview Area */
        <div className="border border-[#1C2450] rounded-2xl bg-[#080B1A] p-4 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0B1026] border border-[#1C2450] text-[#00D9FF]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="max-w-[200px] sm:max-w-xs truncate">
                <p className="text-sm font-semibold text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[#707B9E]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-[#AAB3D0] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden border border-[#1C2450] bg-[#050816] max-h-72 flex items-center justify-center p-2">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-h-64 max-w-full object-contain rounded-lg"
              />
            </div>
          )}

          {/* Primary Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleRemove}
              disabled={isLoading}
            >
              Change Image
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onSubmit}
              isLoading={isLoading}
            >
              Remove Background
            </Button>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
