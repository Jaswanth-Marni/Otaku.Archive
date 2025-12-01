import React from 'react';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ isOpen, onClick, className = '' }) => {
  return (
    <button 
      onClick={onClick}
      className={`
        group relative w-12 h-12 flex items-center justify-center z-[60] md:hidden pointer-events-auto 
        border-2 border-current 
        shadow-[4px_4px_0px_0px_currentColor] 
        active:shadow-none active:translate-x-[2px] active:translate-y-[2px] 
        transition-all duration-200
        bg-transparent
        ${className}
      `}
      aria-label={isOpen ? "Close Menu" : "Open Menu"}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Horizontal Line -> Rotates to 45deg */}
        <div 
          className={`absolute w-full h-0.5 bg-current transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-45' : 'rotate-0'}`} 
        />
        
        {/* Vertical Line -> Rotates to 135deg */}
        <div 
          className={`absolute w-full h-0.5 bg-current transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-[135deg]' : 'rotate-90'}`} 
        />
      </div>
    </button>
  );
};
