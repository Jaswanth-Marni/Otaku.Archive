import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavClick: (mode: any) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  onNavClick, 
  theme, 
  toggleTheme,
  isAuthenticated = false,
  onLogout
}) => {
  const getLinkStyle = (isOpen: boolean) => `
    hover:text-accent-red transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
    ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
  `;

  const publicLinks = [
    { label: 'SHOWCASE', mode: 'SHOWCASE' },
    { label: 'EXPLORE', mode: 'EXPLORE' },
    { label: 'STUDIOS', mode: 'STUDIOS' },
    { label: 'ABOUT', mode: 'ABOUT' },
    { label: 'PROJECTS', mode: 'PROJECTS' },
    { label: 'CONTACT', mode: 'CONTACT' },
  ];

  const authenticatedLinks = [
    { label: 'DASHBOARD', mode: 'DASHBOARD' },
    { label: 'EXPLORE', mode: 'EXPLORE' },
    { label: 'STUDIOS', mode: 'STUDIOS' },
    { label: 'SETTINGS', mode: 'SETTINGS' },
  ];

  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <div 
      className={`fixed inset-0 z-[70] bg-off-black text-base-gray flex flex-col items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <nav className="flex flex-col gap-3 items-center font-condensed font-bold text-3xl tracking-widest">
        {links.map((link, index) => (
          <button 
            key={link.label}
            onClick={() => { onNavClick(link.mode); onClose(); }}
            className={getLinkStyle(isOpen)}
            style={{ transitionDelay: isOpen ? `${200 + (index * 50)}ms` : '0ms' }}
          >
            {link.label}
          </button>
        ))}
        
        <div 
          className={`w-48 h-[2px] bg-accent-red my-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}
          style={{ transitionDelay: isOpen ? `${200 + (links.length * 50)}ms` : '0ms' }}
        ></div>
        
        <button 
          onClick={toggleTheme}
          className={`${getLinkStyle(isOpen)} uppercase`}
          style={{ transitionDelay: isOpen ? `${250 + (links.length * 50)}ms` : '0ms' }}
        >
          {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
        </button>

        {isAuthenticated ? (
          <button 
            onClick={() => { if(onLogout) onLogout(); onClose(); }}
            className={getLinkStyle(isOpen)}
            style={{ transitionDelay: isOpen ? `${300 + (links.length * 50)}ms` : '0ms' }}
          >
            LOGOUT
          </button>
        ) : (
          <button 
            onClick={() => { onNavClick('LOGIN'); onClose(); }}
            className={getLinkStyle(isOpen)}
            style={{ transitionDelay: isOpen ? `${300 + (links.length * 50)}ms` : '0ms' }}
          >
            LOGIN
          </button>
        )}
      </nav>
    </div>
  );
};
