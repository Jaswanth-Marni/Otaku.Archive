import React from 'react';

interface DesktopMenuTriggerProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const DesktopMenuTrigger: React.FC<DesktopMenuTriggerProps> = ({ isOpen, onClick, className = '' }) => {
  return (
    <button 
      onClick={onClick}
      className={`hidden md:flex items-center gap-4 group cursor-pointer ${className}`}
      aria-label={isOpen ? "Close Menu" : "Open Menu"}
    >
      {/* Left Line */}
      <div className={`h-[1px] w-12 bg-current transition-all duration-300 ${isOpen ? 'w-24' : 'w-12 group-hover:w-16'}`} />
      
      {/* Flower Icon (SVG) */}
      <div className={`
        relative w-6 h-6 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]
        ${isOpen ? 'rotate-180' : 'rotate-0'}
      `}>
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-full h-full"
        >
           <path d="M12 2.5c1.1 2.2 2.8 3.2 4.8 2.7 2.2-.5 4.2 1.2 3.8 3.4-.4 2.2-2.2 3.4-3.8 3.4 1.6 0 3.4 1.2 3.8 3.4.4 2.2-1.6 3.9-3.8 3.4-2-.5-3.7.5-4.8 2.7-1.1-2.2-2.8-3.2-4.8-2.7-2.2.5-4.2-1.2-3.8-3.4.4-2.2 2.2-3.4 3.8-3.4-1.6 0-3.4-1.2-3.8-3.4-.4-2.2 1.6-3.9 3.8-3.4 2 .5 3.7-.5 4.8-2.7z" />
           <circle cx="12" cy="12" r="2" />
        </svg>
      </div>

      {/* Right Line */}
      <div className={`h-[1px] w-12 bg-current transition-all duration-300 ${isOpen ? 'w-24' : 'w-12 group-hover:w-16'}`} />
    </button>
  );
};
