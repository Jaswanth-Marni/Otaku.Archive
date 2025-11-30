import React, { useState, useEffect } from 'react';

interface NotFoundViewProps {
  onBack: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onBack }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden">
      <style>{`
        @keyframes fall-1 {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(10deg); }
          100% { transform: rotate(-75deg) translateY(10px); }
        }
        @keyframes fall-2 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(15deg) translateY(5px); }
        }
        @keyframes fall-3 {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(-5deg); }
          100% { transform: rotate(80deg) translateY(15px); }
        }
        .animate-fall-1 {
          animation: fall-1 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom left;
        }
        .animate-fall-2 {
          animation: fall-2 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom center;
        }
        .animate-fall-3 {
          animation: fall-3 1.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom right;
        }
        .text-outline-shadow {
           -webkit-text-stroke: 2px white;
           text-shadow: 4px 4px 0px #D00000;
        }
        @media (min-width: 768px) {
           .text-outline-shadow {
             -webkit-text-stroke: 4px white;
             text-shadow: 8px 8px 0px #D00000;
           }
        }
      `}</style>
      
      {/* 404 Container */}
      <div className="relative flex items-center justify-center">
        {/* First 4 */}
        <span className="font-display text-[35vw] leading-[0.8] text-accent-red tracking-tighter select-none animate-fall-1 text-outline-shadow">
          4
        </span>
        
        {/* Middle 0 */}
        <div className="relative animate-fall-2 z-10">
            <span className="font-display text-[35vw] leading-[0.8] text-accent-red tracking-tighter select-none text-outline-shadow">
              0
            </span>
            {/* The Scribble */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25vw] h-[25vw] pointer-events-none">
               <svg viewBox="0 0 200 200" className="w-full h-full text-white animate-subtle-tilt" fill="none" stroke="currentColor" strokeWidth="4">
                  {/* Messy circular scribble */}
                  <path 
                    d="M60,100 C50,60 80,30 120,40 C160,50 170,100 150,140 C130,180 70,170 50,130 C40,90 80,50 120,60 C150,70 160,110 140,140 C120,170 70,150 60,110" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="opacity-90"
                  />
                  {/* Cross scribble */}
                  <path 
                    d="M50,150 L150,50 M50,50 L150,150" 
                    strokeWidth="3"
                    className="opacity-80"
                  />
               </svg>
            </div>
        </div>

        {/* Last 4 */}
        <span className="font-display text-[35vw] leading-[0.8] text-accent-red tracking-tighter select-none animate-fall-3 text-outline-shadow">
          4
        </span>
      </div>

      {/* Message & Button */}
      <div className={`flex flex-col items-center gap-8 z-10 -mt-[5vw] transition-all duration-1000 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <h2 className="font-condensed font-bold text-2xl md:text-4xl uppercase tracking-widest text-center max-w-md px-4 leading-tight">
          Sorry, we could not<br/>find the page
        </h2>
        
        <button 
          onClick={onBack}
          className="bg-white text-black font-condensed font-bold uppercase tracking-widest hover:text-accent-red transition-colors px-10 py-4 text-sm md:text-base border border-white shadow-[4px_4px_0px_0px_#D00000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          BACK HOME
        </button>
      </div>
    </div>
  );
};
