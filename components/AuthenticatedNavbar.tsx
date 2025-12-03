import React from 'react';
import { Button } from './Button';
import { MenuButton } from './MenuButton';

interface AuthenticatedNavbarProps {
  onNavClick: (mode: any) => void;
  currentView: string;
  onLogout: () => void;
  isScrolled: boolean;
  isDetailView: boolean;
  isMenuOpen: boolean;
  onMenuClick: () => void;
  isFooterVisible: boolean;
}

export const AuthenticatedNavbar: React.FC<AuthenticatedNavbarProps> = ({ 
  onNavClick, 
  currentView, 
  onLogout,
  isScrolled,
  isDetailView,
  isMenuOpen,
  onMenuClick,
  isFooterVisible
}) => {
  const navItems = [
    { label: 'DASHBOARD', mode: 'DASHBOARD' },
    { label: 'EXPLORE', mode: 'EXPLORE' },
    { label: 'STUDIOS', mode: 'STUDIOS' },
    { label: 'SETTINGS', mode: 'SETTINGS' },
  ];

  return (
    <nav 
      className={`
        fixed transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] flex items-center justify-between left-1/2 -translate-x-1/2
        ${isMenuOpen ? 'z-[80]' : 'z-[60]'}
        ${isDetailView || (isFooterVisible && !isMenuOpen) ? 'opacity-0 -translate-y-[200%] pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}
        ${!isScrolled 
          ? 'top-0 w-full px-6 py-4 md:px-12 bg-transparent border-b-0 border-transparent shadow-none' 
          : `top-4 w-[92%] md:w-[95%] md:max-w-7xl px-6 py-2 ${isMenuOpen ? 'bg-transparent border-transparent shadow-none' : 'bg-white dark:bg-black border-2 border-off-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'}`
        }
      `}
    >
      {/* Logo */}
      <div 
        onClick={() => onNavClick('DASHBOARD')}
        className={`font-display text-2xl tracking-tighter cursor-pointer hover:opacity-70 transition-opacity ${isMenuOpen ? 'text-base-gray' : 'text-off-black dark:text-white'}`}
      >
        OTAKU<span className="text-accent-red">.ARCHIVE</span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => onNavClick(item.mode)}
            className={`
              font-condensed font-bold tracking-widest text-sm uppercase transition-colors
              ${currentView === item.mode 
                ? 'text-accent-red underline underline-offset-4 decoration-2' 
                : 'text-off-black dark:text-white hover:text-accent-red'
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Logout Button (Desktop) */}
      <Button 
        variant="outline" 
        onClick={onLogout}
        className="hidden md:block text-xs py-2 px-6 border-off-black text-off-black hover:bg-off-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
      >
        LOGOUT
      </Button>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <MenuButton 
          isOpen={isMenuOpen} 
          onClick={onMenuClick} 
          className={isMenuOpen ? 'text-base-gray' : 'text-off-black dark:text-white'}
        />
      </div>
    </nav>
  );
};
