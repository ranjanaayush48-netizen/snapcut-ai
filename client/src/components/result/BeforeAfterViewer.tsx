import React, { useState, useRef, MouseEvent, TouchEvent } from 'react';
import { Sliders } from 'lucide-react';

export interface BeforeAfterViewerProps {
  originalUrl: string;
  processedUrl: string;
  originalFilename?: string;
}

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({
  originalUrl,
  processedUrl,
  originalFilename = 'image.png'
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Desktop / Tablet Interactive Slider Comparison */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between mb-2 text-xs font-semibold uppercase tracking-wider text-[#AAB3D0]">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#00D9FF]" />
            Drag slider to inspect cut precision
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[#AAB3D0]">Original</span>
            <span className="text-[#00D9FF]">Transparent Result</span>
          </div>
        </div>

        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-[#1C2450] select-none cursor-ew-resize bg-[#080B1A] shadow-2xl"
        >
          {/* Layer 1: Background Transparent Output on Checkerboard */}
          <div className="absolute inset-0 checkerboard-pattern flex items-center justify-center p-4">
            <img
              src={processedUrl}
              alt="Background removed result"
              className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-md"
            />
            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-[#0B1026]/90 border border-[#00D9FF]/40 text-[#00D9FF]">
              Background Removed
            </span>
          </div>

          {/* Layer 2: Original Image overlay clipped by slider percentage */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none bg-[#080B1A]"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="w-full h-full flex items-center justify-center p-4" style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}>
              <img
                src={originalUrl}
                alt="Original image"
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
            </div>
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-[#0B1026]/90 border border-[#1C2450] text-white">
              Original
            </span>
          </div>

          {/* Draggable Divider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize pointer-events-none shadow-[0_0_10px_rgba(0,217,255,0.8)]"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-[#050816] flex items-center justify-center shadow-lg pointer-events-auto cursor-ew-resize">
              <span className="text-xs font-black">↔</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stacked View */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {/* Original */}
        <div className="border border-[#1C2450] bg-[#080B1A] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#AAB3D0] font-semibold">
            <span>ORIGINAL</span>
          </div>
          <div className="h-60 rounded-lg bg-[#050816] flex items-center justify-center p-2 overflow-hidden">
            <img
              src={originalUrl}
              alt="Original preview"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>

        {/* Processed on Checkerboard */}
        <div className="border border-[#00D9FF]/40 bg-[#080B1A] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#00D9FF] font-semibold">
            <span>BACKGROUND REMOVED</span>
          </div>
          <div className="h-60 rounded-lg checkerboard-pattern flex items-center justify-center p-2 overflow-hidden">
            <img
              src={processedUrl}
              alt="Transparent PNG result"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
