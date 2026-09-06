import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
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

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelected,
  selectedFile,
  onClearFile,
  onSubmit,
  isLoading = false,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // 1. File size validation (<= 10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('Please upload a JPG, PNG, or WEBP image under 10 MB.');
      return;
    }

    // 2. MIME type & Extension validation
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidMime = ALLOWED_MIME_TYPES.includes(file.type);
    const isValidExt = ALLOWED_EXTENSIONS.includes(extension);

    if (!isValidMime && !isValidExt) {
      setErrorMessage('Please upload a JPG, PNG, or WEBP image under 10 MB.');
      return;
    }

    // Generate local object URL for instant preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelected(file);
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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] ${
            isDragOver
              ? 'border-[#00D9FF] bg-[#00D9FF]/5 shadow-glow-cyan scale-[1.01]'
              : 'border-[#1C2450] bg-[#080B1A]/80 hover:border-[#2D3B82] hover:bg-[#0B1026]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {/* Subtle decorative background ambient glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-[#0B1026] border border-[#1C2450] flex items-center justify-center text-[#00D9FF] mb-4 group-hover:scale-110 group-hover:border-[#00D9FF]/40 transition-transform duration-300 shadow-glow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
            Drop your image here
          </h3>
          <p className="text-xs sm:text-sm text-[#AAB3D0] mb-4">
            or click to browse from your device
          </p>

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
