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
      className={`relative w-8 h-8 flex items-center justify-center z-[60] md:hidden pointer-events-auto ${className}`}
      aria-label={isOpen ? "Close Menu" : "Open Menu"}
    >
      {/* Horizontal Line -> Rotates to 45deg */}
      <div className={`absolute w-6 h-0.5 bg-current transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
      
      {/* Vertical Line -> Rotates to 135deg */}
      <div className={`absolute w-6 h-0.5 bg-current transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-[135deg]' : 'rotate-90'}`} />
    </button>
  );
};
