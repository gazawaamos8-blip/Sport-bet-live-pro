import React from 'react';

const BrandIcon: React.FC<{ size?: number, className?: string }> = ({ size = 80, className = "" }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-brand-accent/20 rounded-full blur-xl animate-pulse"></div>
      
      {/* Main Circle */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-accent to-emerald-600 rounded-full shadow-2xl border-4 border-brand-900 overflow-hidden">
        {/* Inner Patterns */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)]"></div>
        
        {/* Ball Pattern (Simplified Soccer Ball) */}
        <svg 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full text-brand-900/40"
          fill="currentColor"
        >
          <path d="M50 0 L65 35 L100 35 L75 60 L85 100 L50 75 L15 100 L25 60 L0 35 L35 35 Z" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Center Symbol */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="text-brand-900 font-black italic text-2xl tracking-tighter leading-none">SB</span>
        <div className="w-8 h-1 bg-brand-900/30 rounded-full mt-0.5"></div>
      </div>

      {/* Floating Accents */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-brand-900 shadow-lg animate-bounce"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full border-2 border-brand-900 shadow-lg animate-pulse"></div>
    </div>
  );
};

export default BrandIcon;
