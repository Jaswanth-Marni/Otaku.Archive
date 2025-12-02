import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface TrailerPlayerProps {
  videoId: string;
  onClose: () => void;
}

export const TrailerPlayer: React.FC<TrailerPlayerProps> = ({ videoId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Lock scroll when player is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
      {/* Close Button */}
      <div className="w-full md:max-w-5xl flex justify-end mb-4">
        <button 
          onClick={() => {
            triggerHaptic();
            onClose();
          }}
          className="group flex items-center gap-2 text-white hover:text-accent-red transition-colors"
        >
          <span className="font-condensed font-bold uppercase tracking-widest text-sm hidden md:block">Close Player</span>
          <div className="w-10 h-10 border border-white group-hover:border-accent-red flex items-center justify-center transition-colors bg-black/50 backdrop-blur-sm">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
        </button>
      </div>

      {/* Player Container */}
      <div className="relative w-full md:max-w-5xl aspect-video bg-black border-2 border-off-black shadow-[0_0_50px_rgba(208,0,0,0.2)]">
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="font-display text-4xl text-white animate-pulse">LOADING TRAILER...</div>
          </div>
        )}

        {/* YouTube Iframe */}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title="Anime Trailer"
          className="w-full h-full relative z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />

        {/* Decorative Corners */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-accent-red pointer-events-none z-20"></div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-accent-red pointer-events-none z-20"></div>
        
        {/* Tech Overlay */}
        <div className="absolute top-0 left-0 bg-accent-red text-white text-[10px] font-bold px-2 py-1 z-20 font-mono tracking-widest">
           TRAILER_PLAYBACK_MODE
        </div>
      </div>
    </div>
  );
};
