import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button.js';

export interface ProcessingStatusProps {
  originalImagePreview?: string;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const STATUS_STEPS = [
  'Uploading image...',
  'Preparing image...',
  'AI is removing the background...',
  'Finalizing result...',
  'Almost done...'
];

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  originalImagePreview,
  errorMessage,
  onRetry
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (errorMessage) return;

    // Advance steps realistically through the pipeline
    const interval = setInterval(() => {
      setStepIndex(prev => {
        if (prev < STATUS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [errorMessage]);

  if (errorMessage) {
    return (
      <div className="border border-rose-500/40 bg-[#160B18] rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white mb-1">
            Processing Error
          </h3>
          <p className="text-xs text-[#AAB3D0] leading-relaxed">
            {errorMessage}
          </p>
        </div>
        {onRetry && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border border-[#1C2450] bg-[#080B1A] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background neon radiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-brand opacity-15 blur-3xl pointer-events-none rounded-full" />

      {/* Thumbnail + Animated Glowing Ring */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        {/* Continuous gradient rotating border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-brand animate-spin [animation-duration:4s] blur-[2px] opacity-80" />
        <div className="absolute inset-1 rounded-2xl bg-[#080B1A] flex items-center justify-center overflow-hidden">
          {originalImagePreview ? (
            <img
              src={originalImagePreview}
              alt="Processing input"
              className="w-full h-full object-cover opacity-70"
            />
          ) : (
            <Sparkles className="w-8 h-8 text-[#00D9FF] animate-pulse" />
          )}
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00D9FF]">
          <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-ping" />
          AI Working
        </div>
        <h3 className="text-lg font-bold text-white transition-all duration-300">
          {STATUS_STEPS[stepIndex]}
        </h3>
        <p className="text-xs text-[#707B9E]">
          Extracting subject contours and rendering transparent alpha channel...
        </p>
      </div>

      {/* Subtle Step Bar */}
      <div className="flex items-center justify-center gap-1.5 pt-2">
        {STATUS_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= stepIndex
                ? 'w-6 bg-gradient-brand shadow-glow-sm'
                : 'w-2 bg-[#1C2450]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
