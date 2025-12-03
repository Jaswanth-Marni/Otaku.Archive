import React, { useEffect, useState } from 'react';
import { fetchTrendingAnime, fetchAnimeByIds, fetchRecommendations, AnimeData } from '../services/anilistService';
import { userService } from '../services/userService';

interface DashboardViewProps {
  onAnimeSelect: (id: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onAnimeSelect }) => {
  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<AnimeData[]>([]);
  const [favorites, setFavorites] = useState<AnimeData[]>([]);
  const [watchList, setWatchList] = useState<{ [key: string]: AnimeData[] }>({
    WATCHING: [],
    COMPLETED: [],
    PLAN_TO_WATCH: [],
    DROPPED: []
  });
  const [genreStats, setGenreStats] = useState<{ genre: string; score: number; percentage: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<{ title: string; items: AnimeData[] } | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (expandedSection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [expandedSection]);

  const loadDashboardData = async () => {
    try {
      // 1. Get User Data from Backend (Fresh)
      const userData = await userService.getMe();
      
      // Local variables to hold data for immediate calculation
      let currentFavorites: AnimeData[] = [];
      let currentWatchList: { [key: string]: AnimeData[] } = {
        WATCHING: [],
        COMPLETED: [],
        PLAN_TO_WATCH: [],
        DROPPED: []
      };

      if (userData) {
        setUser(userData);
        
        // 2. Fetch Favorites
        if (userData.favorites && userData.favorites.length > 0) {
          const favs = await fetchAnimeByIds(userData.favorites);
          setFavorites(favs);
          currentFavorites = favs;
        }

        // 3. Fetch WatchList
        if (userData.watchList && userData.watchList.length > 0) {
          const ids = userData.watchList.map((item: any) => item.animeId);
          const animeData = await fetchAnimeByIds(ids);
          
          // Group by status
          const grouped: any = { WATCHING: [], COMPLETED: [], PLAN_TO_WATCH: [], DROPPED: [] };
          
          userData.watchList.forEach((item: any) => {
            const anime = animeData.find(a => a.id === item.animeId);
            if (anime && grouped[item.status]) {
              grouped[item.status].push(anime);
            }
          });
          
          setWatchList(grouped);
          currentWatchList = grouped;
        }
      }

      // 4. Fetch Recommendations
      // Calculate preferences
      const genreScores: { [key: string]: number } = {};
      const seenIds = new Set<number>();

      // Helper to process anime list
      const processAnime = (list: AnimeData[], weight: number) => {
        list.forEach(anime => {
          seenIds.add(anime.id);
          anime.genres?.forEach(genre => {
            genreScores[genre] = (genreScores[genre] || 0) + weight;
          });
        });
      };

      // Process Favorites (High Weight)
      if (currentFavorites.length > 0) processAnime(currentFavorites, 3);

      // Process WatchList
      if (currentWatchList.WATCHING) processAnime(currentWatchList.WATCHING, 2);
      if (currentWatchList.COMPLETED) processAnime(currentWatchList.COMPLETED, 1);
      
      // Process Dropped (Negative Weight)
      if (currentWatchList.DROPPED) {
        currentWatchList.DROPPED.forEach(anime => {
          seenIds.add(anime.id);
          anime.genres?.forEach(genre => {
            genreScores[genre] = (genreScores[genre] || 0) - 2;
          });
        });
      }

      // Get Top Genres
      const sortedGenres = Object.entries(genreScores)
        .sort(([, a], [, b]) => b - a);

      // Calculate Stats for UI
      if (sortedGenres.length > 0) {
        const maxScore = sortedGenres[0][1];
        const stats = sortedGenres.slice(0, 5).map(([genre, score]) => ({
          genre,
          score,
          percentage: Math.max(0, (score / maxScore) * 100)
        }));
        setGenreStats(stats);
      }

      const topGenres = sortedGenres.slice(0, 3).map(([genre]) => genre);

      if (topGenres.length > 0) {
        const recs = await fetchRecommendations(topGenres, 1, 20);
        // Filter out seen anime
        const filteredRecs = recs.filter(anime => !seenIds.has(anime.id)).slice(0, 5);
        setRecommendations(filteredRecs);
      } else {
        // Fallback to trending if no data
        const trending = await fetchTrendingAnime(1, 5);
        setRecommendations(trending);
      }
      
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const AnimeCard = ({ anime }: { anime: AnimeData }) => (
    <div 
      onClick={() => onAnimeSelect(anime.id)}
      className="group relative w-full cursor-pointer"
    >
      <div className="w-full aspect-[2/3] overflow-hidden border-2 border-off-black bg-black relative mb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] group-hover:shadow-[8px_8px_0px_0px_#D00000] group-hover:-translate-y-1 transition-all duration-300">
        <img 
          src={anime.coverImage.extraLarge} 
          alt={anime.title.english} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute top-2 right-2 bg-accent-red text-white text-[10px] font-bold px-2 py-1 font-mono">
          {anime.averageScore}%
        </div>
      </div>
      <h3 className="font-condensed font-bold text-lg leading-tight uppercase line-clamp-2 group-hover:text-accent-red transition-colors text-off-black dark:text-white">
        {anime.title.english || anime.title.romaji}
      </h3>
      <p className="text-[10px] font-mono text-gray-500 mt-1 truncate">
        {anime.genres.slice(0, 2).join(', ')}
      </p>
    </div>
  );

  const Section = ({ title, items, onViewAll }: { title: string, items: AnimeData[], onViewAll: () => void }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-12 animate-slide-up">
        <div className="flex items-end justify-between mb-6 border-b-2 border-off-black pb-2">
          <h2 className="font-condensed font-bold text-2xl uppercase tracking-widest text-off-black dark:text-white">
            {title} <span className="text-accent-red">({items.length})</span>
          </h2>
          <button 
             onClick={onViewAll}
             className="mb-1 font-condensed font-bold text-sm uppercase tracking-widest hover:text-accent-red transition-colors flex items-center gap-2 group text-off-black dark:text-white"
           >
             View All <span className="group-hover:translate-x-1 transition-transform">→</span>
           </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
          {items.slice(0, 5).map(anime => <AnimeCard key={anime.id} anime={anime} />)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-base-gray flex items-center justify-center">
        <div className="font-display text-2xl animate-pulse text-off-black dark:text-white">SYNCING DATA...</div>
      </div>
    );
  }

  if (expandedSection) {
    return (
      <div className="w-full min-h-screen bg-base-gray pt-24 px-6 md:px-12 pb-12">
        <div className="mb-8 animate-slide-up">
          <button 
            onClick={() => setExpandedSection(null)}
            className="mb-8 px-6 py-2 bg-white dark:bg-black border-2 border-off-black text-off-black dark:text-white font-condensed font-bold uppercase hover:text-accent-red transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            ← Back to Dashboard
          </button>
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tighter text-off-black dark:text-white leading-none">
            {expandedSection.title} <span className="text-accent-red">({expandedSection.items.length})</span>
          </h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {expandedSection.items.map(anime => <AnimeCard key={anime.id} anime={anime} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-base-gray pt-24 px-6 md:px-12 pb-12">
      {/* Welcome Header */}
      <div className="mb-12 animate-slide-up">
        <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tighter text-off-black dark:text-white leading-none">
          WELCOME BACK, <br />
          <span className="text-accent-red">{user?.username || 'USER'}</span>
        </h1>
        <p className="font-mono text-sm text-gray-500 mt-4 tracking-widest uppercase">
          SYSTEM STATUS: ONLINE // SYNC RATE: 100%
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: 'WATCHLIST', value: user?.watchList?.length || '0', desc: 'Items tracked' },
          { label: 'FAVORITES', value: user?.favorites?.length || '0', desc: 'Top picks' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-black border-2 border-off-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-default">
            <h3 className="font-condensed font-bold text-xl text-gray-400 uppercase tracking-widest mb-2">{stat.label}</h3>
            <div className="font-display text-6xl text-off-black dark:text-white">{stat.value}</div>
            <p className="font-mono text-xs text-accent-red mt-2">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Taste Profile Section */}
      {genreStats.length > 0 && (
        <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6 border-b-2 border-off-black pb-2">
            <h2 className="font-condensed font-bold text-2xl uppercase tracking-widest text-off-black dark:text-white">
              YOUR TASTE PROFILE
            </h2>
          </div>
          <div className="bg-white dark:bg-black border-2 border-off-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <div className="space-y-4">
              {genreStats.map((stat, idx) => (
                <div key={stat.genre} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="font-condensed font-bold text-sm uppercase text-off-black dark:text-white tracking-widest">
                      {stat.genre}
                    </span>
                    <span className="font-mono text-xs text-accent-red">
                      {stat.score > 0 ? '+' : ''}{stat.score} PTS
                    </span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 border border-off-black overflow-hidden">
                    <div 
                      className="h-full bg-accent-red transition-all duration-1000 ease-out"
                      style={{ width: `${stat.percentage}%`, transitionDelay: `${idx * 100}ms` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Favorites Section */}
      <Section 
        title="Favorites" 
        items={favorites} 
        onViewAll={() => setExpandedSection({ title: "Favorites", items: favorites })}
      />

      {/* Watch List Sections */}
      <Section 
        title="Currently Watching" 
        items={watchList.WATCHING} 
        onViewAll={() => setExpandedSection({ title: "Currently Watching", items: watchList.WATCHING })}
      />
      <Section 
        title="Plan to Watch" 
        items={watchList.PLAN_TO_WATCH} 
        onViewAll={() => setExpandedSection({ title: "Plan to Watch", items: watchList.PLAN_TO_WATCH })}
      />
      <Section 
        title="Completed" 
        items={watchList.COMPLETED} 
        onViewAll={() => setExpandedSection({ title: "Completed", items: watchList.COMPLETED })}
      />
      <Section 
        title="Dropped" 
        items={watchList.DROPPED} 
        onViewAll={() => setExpandedSection({ title: "Dropped", items: watchList.DROPPED })}
      />

      {/* Quick Recommendations */}
      <Section 
        title="Recommended For You" 
        items={recommendations} 
        onViewAll={() => setExpandedSection({ title: "Recommended For You", items: recommendations })}
      />
    </div>
  );
};
