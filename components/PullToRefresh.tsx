import React, { useEffect, useRef, useState } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh }) => {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Physics state
  const state = useRef({
    y: 0,
    velocity: 0,
    isDragging: false,
    startY: 0,
    lastTouchY: 0,
    canPull: false
  });

  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on mobile
    if (window.innerWidth >= 768) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pulling if we are at the very top of the page
      if (window.scrollY <= 0 && !isRefreshing) {
        state.current.startY = e.touches[0].clientY;
        state.current.lastTouchY = e.touches[0].clientY;
        state.current.canPull = true;
        state.current.isDragging = false;
      } else {
        state.current.canPull = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!state.current.canPull || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchY - state.current.startY;

      // If we are pulling down
      if (deltaY > 0) {
        // If we haven't started dragging yet, mark as dragging
        if (!state.current.isDragging) {
          state.current.isDragging = true;
        }
        
        // Prevent default scrolling behavior when pulling down from top
        if (e.cancelable) {
            e.preventDefault();
        }

        const diff = touchY - state.current.lastTouchY;
        state.current.lastTouchY = touchY;
        
        // Add resistance (logarithmic-like feel)
        // As y gets larger, the resistance increases
        const resistance = Math.max(0.2, 1 - (state.current.y / 300));
        state.current.y += diff * resistance;
        
        // Cap the visual pull distance
        if (state.current.y > 200) state.current.y = 200;
      }
    };

    const handleTouchEnd = async () => {
      if (state.current.isDragging) {
        state.current.isDragging = false;
        state.current.canPull = false;
        
        // Threshold to trigger refresh
        if (state.current.y > 100) {
          setIsRefreshing(true);
          triggerHaptic();
          
          // Execute refresh
          try {
            await onRefresh();
          } finally {
            setIsRefreshing(false);
          }
        }
      }
    };

    // Physics Loop for "Settle" animation
    const loop = () => {
      // If dragging, we just update the state in touchmove, but we need to sync React state
      if (state.current.isDragging) {
        setPullY(state.current.y);
      } else {
        // Spring physics to return to target position
        // Target is 100 if refreshing, 0 otherwise
        const targetY = isRefreshing ? 100 : 0;
        
        // Spring constants
        const stiffness = 0.15;
        const damping = 0.75;
        
        const force = (targetY - state.current.y) * stiffness;
        state.current.velocity += force;
        state.current.velocity *= damping;
        state.current.y += state.current.velocity;

        // Snap to target if close enough to stop infinite micro-movements
        if (Math.abs(state.current.y - targetY) < 0.5 && Math.abs(state.current.velocity) < 0.5) {
          state.current.y = targetY;
          state.current.velocity = 0;
        }
        
        setPullY(state.current.y);
      }
      
      rafId.current = requestAnimationFrame(loop);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    loop();

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isRefreshing, onRefresh]);

  // Don't render anything if not pulled at all (optimization)
  if (pullY === 0 && !isRefreshing) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full z-[100] flex justify-center pointer-events-none md:hidden"
      style={{ 
        transform: `translateY(${pullY - 80}px)` // Start hidden above (-80px)
      }}
    >
      <div className="bg-white dark:bg-black border-2 border-off-black dark:border-white px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center gap-4">
        
        {/* Three Squares Animation */}
        <div className="flex gap-1.5 h-4 items-center">
            <div 
              className={`w-2.5 h-2.5 bg-accent-red ${isRefreshing ? 'animate-bounce' : ''}`} 
              style={{ animationDelay: '0s' }}
            ></div>
            <div 
              className={`w-2.5 h-2.5 bg-accent-red ${isRefreshing ? 'animate-bounce' : ''}`} 
              style={{ animationDelay: '0.15s' }}
            ></div>
            <div 
              className={`w-2.5 h-2.5 bg-accent-red ${isRefreshing ? 'animate-bounce' : ''}`} 
              style={{ animationDelay: '0.3s' }}
            ></div>
        </div>
      </div>
    </div>
  );
};
