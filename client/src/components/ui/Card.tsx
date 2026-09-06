import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className = '',
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={`bg-[#0B1026] border border-[#1C2450] rounded-2xl p-6 transition-all duration-300 ${
        hoverEffect ? 'hover:border-[#2D3B82] hover:shadow-glow-sm hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
