import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { triggerHaptic } from '../utils/haptics';

interface AnimeDetailControlsProps {
  animeId: number;
  onLoginRedirect: () => void;
}

export const AnimeDetailControls: React.FC<AnimeDetailControlsProps> = ({ animeId, onLoginRedirect }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      loadUserData();
    }
  }, [animeId]);

  const loadUserData = async () => {
    try {
      const user = await userService.getMe();
      if (user) {
        setIsLiked(user.favorites.includes(animeId));
        const entry = user.watchList.find((item: any) => item.animeId === animeId);
        setStatus(entry ? entry.status : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    triggerHaptic();
    if (!isAuthenticated) {
      onLoginRedirect();
      return;
    }

    // Optimistic update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    try {
      await userService.toggleFavorite(animeId);
    } catch (err) {
      setIsLiked(!newLikedState); // Revert on error
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    triggerHaptic();
    if (!isAuthenticated) {
      onLoginRedirect();
      return;
    }

    const previousStatus = status;
    setStatus(newStatus);
    setIsLoading(true);

    try {
      await userService.updateStatus(animeId, newStatus);
    } catch (err) {
      console.error(err);
      setStatus(previousStatus); // Revert on error
      alert("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Like Button */}
      <button 
        onClick={handleLike}
        className={`
          group flex items-center justify-center w-12 h-12 border-2 transition-all duration-300
          ${isLiked 
            ? 'bg-accent-red border-accent-red text-white' 
            : 'border-off-black dark:border-white text-off-black dark:text-white hover:border-accent-red hover:text-accent-red'
          }
        `}
        title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
      >
        <svg 
          className={`w-6 h-6 transition-transform duration-300 ${isLiked ? 'scale-110 fill-current' : 'scale-100 fill-none stroke-current stroke-2 group-hover:scale-110'}`} 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Status Dropdown */}
      <div className="relative group">
        <select
          value={status || ""}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`
            appearance-none bg-transparent border-2 border-off-black dark:border-white 
            text-off-black dark:text-white font-condensed font-bold uppercase tracking-widest text-sm
            py-3 pl-4 pr-10 cursor-pointer focus:outline-none focus:border-accent-red transition-colors
            w-48
          `}
        >
          <option value="" disabled>Add to List</option>
          <option value="WATCHING">Watching</option>
          <option value="COMPLETED">Completed</option>
          <option value="PLAN_TO_WATCH">Plan to Watch</option>
          <option value="DROPPED">Dropped</option>
        </select>
        
        {/* Custom Arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-off-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-2 border-off-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};
