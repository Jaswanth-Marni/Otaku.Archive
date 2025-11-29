import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavClick: (mode: 'SHOWCASE' | 'STUDIOS' | 'EXPLORE') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavClick, theme, toggleTheme }) => {
  return (
    <div 
      className={`fixed inset-0 z-40 bg-off-black text-base-gray flex flex-col items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <nav className="flex flex-col gap-8 items-center font-condensed font-bold text-3xl tracking-widest">
        <button 
          onClick={() => { onNavClick('SHOWCASE'); onClose(); }}
          className="hover:text-accent-red transition-colors"
        >
          SHOWCASE
        </button>
        <button 
          onClick={() => { onNavClick('EXPLORE'); onClose(); }}
          className="hover:text-accent-red transition-colors"
        >
          EXPLORE
        </button>
        <button 
          onClick={() => { onNavClick('STUDIOS'); onClose(); }}
          className="hover:text-accent-red transition-colors"
        >
          STUDIOS
        </button>
        <div className="w-8 h-[2px] bg-base-gray/20 my-4"></div>
        <button 
          onClick={toggleTheme}
          className="hover:text-accent-red transition-colors uppercase"
        >
          {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
        </button>
        <button className="hover:text-accent-red transition-colors">LOGIN</button>
      </nav>
    </div>
  );
};
