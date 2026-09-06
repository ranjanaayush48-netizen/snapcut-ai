import React from 'react';
import { Link } from 'react-router-dom';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  clickable?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  clickable = true
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const content = (
    <div className="flex items-center gap-2.5 select-none group">
      {/* 3D Ribbon Logo Icon with checkerboard cutout effect */}
      <div className={`relative ${iconSizes[size]} shrink-0 rounded-xl overflow-hidden shadow-glow-sm transition-transform duration-300 group-hover:scale-105`}>
        <img
          src="/logo.png"
          alt="SnapCut AI Logo"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback gradient badge if image is not loaded
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Subtle glowing outline */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-[#00D9FF]/40 pointer-events-none" />
      </div>

      <div className="flex flex-col">
        <div className={`font-extrabold tracking-tight flex items-center gap-1 ${textSizes[size]}`}>
          <span className="text-white font-['Plus_Jakarta_Sans']">SnapCut</span>
          <span className="text-gradient-brand font-black">AI</span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-[#AAB3D0] tracking-wide font-normal -mt-1">
            Remove Backgrounds in One Click
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return <Link to="/" className="inline-block outline-none">{content}</Link>;
  }

  return content;
};
