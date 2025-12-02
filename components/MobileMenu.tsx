import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavClick: (mode: 'SHOWCASE' | 'STUDIOS' | 'EXPLORE' | 'ABOUT' | 'PROJECTS' | 'CONTACT') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavClick, theme, toggleTheme }) => {
  const getLinkStyle = (isOpen: boolean) => `
    hover:text-accent-red transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
    ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
  `;

  return (
    <div 
      className={`fixed inset-0 z-[70] bg-off-black text-base-gray flex flex-col items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <nav className="flex flex-col gap-3 items-center font-condensed font-bold text-3xl tracking-widest">
        <button 
          onClick={() => { onNavClick('SHOWCASE'); onClose(); }}
          className={getLinkStyle(isOpen)}
          style={{ transitionDelay: isOpen ? '200ms' : '0ms' }}
        >
          SHOWCASE
        </button>
        <button 
          onClick={() => { onNavClick('EXPLORE'); onClose(); }}
          className={getLinkStyle(isOpen)}
          style={{ transitionDelay: isOpen ? '250ms' : '0ms' }}
        >
          EXPLORE
        </button>
        <button 
          onClick={() => { onNavClick('STUDIOS'); onClose(); }}
          className={getLinkStyle(isOpen)}
          style={{ transitionDelay: isOpen ? '300ms' : '0ms' }}
        >
          STUDIOS
        </button>
        <button 
          onClick={() => { onNavClick('ABOUT'); onClose(); }}
          className={getLinkStyle(isOpen)}
          style={{ transitionDelay: isOpen ? '350ms' : '0ms' }}
        >
          ABOUT
        </button>
        <button 
          onClick={() => { onNavClick('PROJECTS'); onClose(); }}
          className={getLinkStyle(isOpen)}
          style={{ transitionDelay: isOpen ? '400ms' : '0ms' }}
        >
          PROJECTS
        </button>
        <button 
          onClick={() => { onNavClick('CONTACT'); onClose(); }}
          className={getLinkStyle(isOpen)}
          style={{ transitionDelay: isOpen ? '450ms' : '0ms' }}
        >
          CONTACT
        </button>
        
        <div 
          className={`w-48 h-[2px] bg-accent-red my-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}
          style={{ transitionDelay: isOpen ? '500ms' : '0ms' }}
        ></div>
        <button 
          onClick={toggleTheme}
          className={`${getLinkStyle(isOpen)} uppercase`}
          style={{ transitionDelay: isOpen ? '550ms' : '0ms' }}
        >
          {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
        </button>
        <button 
          className={getLinkStyle(isOpen)}
          style={{ transitionDelay: isOpen ? '600ms' : '0ms' }}
        >
          LOGIN
        </button>
      </nav>
    </div>
  );
};
