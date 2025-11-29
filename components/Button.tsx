import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'solid', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-8 py-3 rounded-full font-condensed font-bold tracking-wider uppercase transition-all duration-300 transform hover:scale-105 active:scale-95";
  const variants = {
    solid: "bg-off-black text-white hover:bg-accent-red border border-transparent",
    outline: "bg-transparent text-off-black border border-off-black hover:bg-off-black hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
