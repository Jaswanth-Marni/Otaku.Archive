import React from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme, className = '' }) => {
  return (
    <button 
      onClick={toggleTheme}
      className={`font-condensed font-bold uppercase tracking-widest hover:text-accent-red transition-colors ${className}`}
    >
      {theme === 'light' ? 'DARK' : 'LIGHT'}
    </button>
  );
};
