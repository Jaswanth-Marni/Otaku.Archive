import React from 'react';

interface DesktopMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavClick: (mode: 'SHOWCASE' | 'STUDIOS' | 'EXPLORE' | 'ABOUT' | 'PROJECTS' | 'CONTACT') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const DesktopMenu: React.FC<DesktopMenuProps> = ({ isOpen, onClose, onNavClick, theme, toggleTheme }) => {
  const getLinkStyle = (isOpen: boolean) => `
    group relative
    transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
    ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
  `;

  const textStyle = "transition-colors duration-200 group-hover:text-accent-red";

  return (
    <div 
      className={`
        fixed inset-0 z-[55] bg-off-black text-base-gray 
        flex flex-col items-center justify-center 
        transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="flex w-full max-w-[95vw] items-stretch justify-center mb-8">
        {/* Left Column */}
        <nav className="flex-1 flex flex-col gap-2 md:gap-6 items-end text-right font-condensed font-bold text-5xl md:text-7xl lg:text-8xl tracking-widest">
          <button 
            onClick={() => { onNavClick('SHOWCASE'); onClose(); }}
            className={getLinkStyle(isOpen)}
            style={{ transitionDelay: isOpen ? '200ms' : '0ms' }}
          >
            <span className={textStyle}>SHOWCASE</span>
          </button>
          <button 
            onClick={() => { onNavClick('EXPLORE'); onClose(); }}
            className={getLinkStyle(isOpen)}
            style={{ transitionDelay: isOpen ? '250ms' : '0ms' }}
          >
            <span className={textStyle}>EXPLORE</span>
          </button>
          <button 
            onClick={() => { onNavClick('STUDIOS'); onClose(); }}
            className={getLinkStyle(isOpen)}
            style={{ transitionDelay: isOpen ? '300ms' : '0ms' }}
          >
            <span className={textStyle}>STUDIOS</span>
          </button>
        </nav>

        {/* Vertical Line */}
        <div 
          className={`w-[2px] bg-accent-red mx-8 md:mx-16 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}
          style={{ transitionDelay: isOpen ? '400ms' : '0ms', transformOrigin: 'center' }}
        ></div>

        {/* Right Column */}
        <nav className="flex-1 flex flex-col gap-2 md:gap-6 items-start text-left font-condensed font-bold text-5xl md:text-7xl lg:text-8xl tracking-widest">
          <button 
            onClick={() => { onNavClick('ABOUT'); onClose(); }}
            className={getLinkStyle(isOpen)}
            style={{ transitionDelay: isOpen ? '225ms' : '0ms' }}
          >
            <span className={textStyle}>ABOUT</span>
          </button>
          <button 
            onClick={() => { onNavClick('PROJECTS'); onClose(); }}
            className={getLinkStyle(isOpen)}
            style={{ transitionDelay: isOpen ? '275ms' : '0ms' }}
          >
            <span className={textStyle}>PROJECTS</span>
          </button>
          <button 
            onClick={() => { onNavClick('CONTACT'); onClose(); }}
            className={getLinkStyle(isOpen)}
            style={{ transitionDelay: isOpen ? '325ms' : '0ms' }}
          >
            <span className={textStyle}>CONTACT</span>
          </button>
        </nav>
      </div>
      
      <div 
        className={`w-24 h-[2px] bg-base-gray/20 my-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}
        style={{ transitionDelay: isOpen ? '400ms' : '0ms' }}
      ></div>

      <button 
        onClick={toggleTheme}
        className={`text-xl md:text-2xl font-condensed font-bold tracking-widest ${getLinkStyle(isOpen)} uppercase`}
        style={{ transitionDelay: isOpen ? '450ms' : '0ms' }}
      >
        <span className={textStyle}>{theme === 'light' ? 'SWITCH TO DARK MODE' : 'SWITCH TO LIGHT MODE'}</span>
      </button>
    </div>
  );
};
