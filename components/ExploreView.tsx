import React, { useState, useEffect, useRef } from 'react';
import { AnimeData, StudioData, fetchTrendingAnime, fetchPopularAnime, fetchAllTimeFavorites, searchAnime, fetchGenresWithImages, fetchAnimeByGenre } from '../services/anilistService';
import { triggerHaptic } from '../utils/haptics';

interface ExploreViewProps {
  isVisible: boolean;
  onAnimeSelect: (animeId: number) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ isVisible, onAnimeSelect }) => {
  const [trending, setTrending] = useState<AnimeData[]>([]);
  const [popular, setPopular] = useState<AnimeData[]>([]);
  const [favorites, setFavorites] = useState<AnimeData[]>([]);
  const [genres, setGenres] = useState<{ name: string; image: string }[]>([]);
  const [searchResults, setSearchResults] = useState<AnimeData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'TRENDING' | 'POPULAR' | 'FAVORITES' | null>(null);
  const ignoreSearchEffect = useRef(false);

  // Handle History for Explore View
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state?.view === 'EXPLORE') {
         if (state.section) {
            setExpandedSection(state.section);
            setSearchQuery('');
            setShowGenres(false);
         } else if (state.query) {
            setSearchQuery(state.query);
            setExpandedSection(null);
         } else {
            setExpandedSection(null);
            setSearchQuery('');
            setShowGenres(false);
         }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const loadData = async () => {
        const [t, p, f, g] = await Promise.all([
          fetchTrendingAnime(1, 20),
          fetchPopularAnime(1, 20),
          fetchAllTimeFavorites(1, 20),
          fetchGenresWithImages()
        ]);
        setTrending(t);
        setPopular(p);
        setFavorites(f);
        setGenres(g);
      };
      loadData();
    }
  }, [isVisible]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (ignoreSearchEffect.current) {
        ignoreSearchEffect.current = false;
        return;
      }

      if (searchQuery.trim()) {
        setIsSearching(true);
        const results = await searchAnime(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowGenres(false); // Hide genres when searching
        setExpandedSection(null);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleGenreClick = async (genre: string) => {
    triggerHaptic();
    window.history.pushState({ view: 'EXPLORE', query: genre }, '', `?view=explore&q=${genre}`);
    ignoreSearchEffect.current = true;
    setSearchQuery(genre); // Show genre in search bar
    setIsSearching(true);
    const results = await fetchAnimeByGenre(genre, 1, 20);
    setSearchResults(results);
    setIsSearching(false);
    setShowGenres(false);
    setExpandedSection(null);
  };

  if (!isVisible) return null;

  // Expanded Section View
  if (expandedSection && !searchQuery) {
    let data: AnimeData[] = [];
    let title = "";
    
    switch (expandedSection) {
      case 'TRENDING':
        data = trending;
        title = "Trending Now";
        break;
      case 'POPULAR':
        data = popular;
        title = "Most Popular";
        break;
      case 'FAVORITES':
        data = favorites;
        title = "Fan Favorites";
        break;
    }

    return (
      <div className="w-full min-h-screen pt-24 pb-20 bg-base-gray text-off-black animate-slide-up">
         <div className="max-w-7xl mx-auto px-4 md:px-12 mb-12">
            <button 
              onClick={() => { triggerHaptic(); window.history.back(); }}
              className="mb-8 px-6 py-2 bg-white border-2 border-off-black text-off-black font-condensed font-bold uppercase hover:text-accent-red transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              ← Back to Explore
            </button>
            <h2 className="font-display text-4xl md:text-6xl uppercase mb-8">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {data.map(anime => (
                 <AnimeCard key={anime.id} anime={anime} onClick={() => onAnimeSelect(anime.id)} />
               ))}
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-24 pb-20 bg-base-gray text-off-black animate-slide-up">
      
      {/* Search Component */}
      <div className="sticky top-24 z-30 w-full flex flex-col items-center px-4 mb-12 pointer-events-none">
        <div className="relative w-full max-w-2xl pointer-events-auto group">
          <input
            type="text"
            placeholder="SEARCH ANIME..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-black border-2 border-off-black py-4 px-6 font-condensed font-bold text-xl tracking-widest uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[8px_8px_0px_0px_#D00000] transition-all duration-300 text-off-black allow-select"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
             {isSearching ? (
               <div className="w-4 h-4 border-2 border-off-black border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <svg className="w-6 h-6 text-off-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             )}
          </div>
        </div>
        
        {/* Browse Genres Button */}
        {!searchQuery && (
          <button 
            onClick={() => { triggerHaptic(); setShowGenres(!showGenres); }}
            className="mt-4 pointer-events-auto px-6 py-2 bg-off-black text-base-gray font-condensed font-bold uppercase tracking-widest hover:bg-accent-red transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
          >
            {showGenres ? 'Close Genres' : 'Browse Genres'}
          </button>
        )}
      </div>

      {/* Genres Grid Overlay */}
      {showGenres && !searchQuery && (
        <div className="max-w-7xl mx-auto px-4 md:px-12 mb-12 animate-slide-up">
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
             {genres.map((genre) => (
               <div 
                 key={genre.name}
                 onClick={() => handleGenreClick(genre.name)}
                 className="group h-40 cursor-pointer perspective-1000"
                 style={{ perspective: '1000px' }}
               >
                 <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180" style={{ transformStyle: 'preserve-3d' }}>
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white dark:bg-black border-2 border-off-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                       <span className="font-display text-2xl uppercase text-off-black">{genre.name}</span>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-black border-2 border-off-black overflow-hidden" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                       <img src={genre.image} alt={genre.name} className="w-full h-full object-cover opacity-60" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-display text-2xl uppercase text-white drop-shadow-md">{genre.name}</span>
                       </div>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Search Results Overlay */}
      {searchQuery && (
        <div className="max-w-7xl mx-auto px-4 md:px-12 mb-12">
           <button 
             onClick={() => { 
               triggerHaptic(); 
               if (window.history.state?.query === searchQuery) {
                 window.history.back();
               } else {
                 setSearchQuery('');
                 setShowGenres(false);
               }
             }}
             className="mb-6 px-6 py-2 bg-white border-2 border-off-black text-off-black font-condensed font-bold uppercase hover:text-accent-red transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
           >
             ← Back to Explore
           </button>
           <h2 className="font-display text-4xl uppercase mb-6">
             {isSearching ? 'Searching...' : `Results for "${searchQuery}"`}
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
             {searchResults.map(anime => (
               <AnimeCard key={anime.id} anime={anime} onClick={() => onAnimeSelect(anime.id)} />
             ))}
             {searchResults.length === 0 && !isSearching && (
               <div className="col-span-full text-center font-mono text-gray-500">NO RESULTS FOUND</div>
             )}
           </div>
        </div>
      )}

      {!searchQuery && !showGenres && (
        <div className="space-y-20">
          {/* Present Season Trending */}
          <Section 
            title="Trending Now" 
            subtitle="This Season"
            onViewAll={() => {
               triggerHaptic();
               window.history.pushState({ view: 'EXPLORE', section: 'TRENDING' }, '', '?view=explore&section=trending');
               setExpandedSection('TRENDING');
            }}
          >
            <HorizontalScroll>
              {trending.map(anime => (
                <AnimeCard key={anime.id} anime={anime} onClick={() => onAnimeSelect(anime.id)} />
              ))}
            </HorizontalScroll>
          </Section>

          {/* Most Popular */}
          <Section 
            title="Most Popular" 
            subtitle="All Time"
            onViewAll={() => {
               triggerHaptic();
               window.history.pushState({ view: 'EXPLORE', section: 'POPULAR' }, '', '?view=explore&section=popular');
               setExpandedSection('POPULAR');
            }}
          >
            <HorizontalScroll>
              {popular.map(anime => (
                <AnimeCard key={anime.id} anime={anime} onClick={() => onAnimeSelect(anime.id)} />
              ))}
            </HorizontalScroll>
          </Section>

          {/* All Time Favorites */}
          <Section 
            title="Fan Favorites" 
            subtitle="Highest Rated"
            onViewAll={() => {
               triggerHaptic();
               window.history.pushState({ view: 'EXPLORE', section: 'FAVORITES' }, '', '?view=explore&section=favorites');
               setExpandedSection('FAVORITES');
            }}
          >
            <HorizontalScroll>
              {favorites.map(anime => (
                <AnimeCard key={anime.id} anime={anime} onClick={() => onAnimeSelect(anime.id)} />
              ))}
            </HorizontalScroll>
          </Section>
        </div>
      )}

    </div>
  );
};

const Section: React.FC<{ title: string; subtitle: string; onViewAll: () => void; children: React.ReactNode }> = ({ title, subtitle, onViewAll, children }) => (
  <div className="w-full">
    <div className="max-w-7xl mx-auto px-4 md:px-12 mb-8 flex items-end justify-between">
       <div className="flex items-end gap-4">
         <h2 className="font-display text-4xl md:text-6xl uppercase leading-none text-off-black">{title}</h2>
         <span className="font-mono text-xs md:text-sm mb-1 md:mb-2 text-gray-500 uppercase tracking-widest">{subtitle}</span>
       </div>
       <button 
         onClick={onViewAll}
         className="mb-2 font-condensed font-bold text-sm md:text-base uppercase tracking-widest hover:text-accent-red transition-colors flex items-center gap-2 group"
       >
         View All <span className="group-hover:translate-x-1 transition-transform">→</span>
       </button>
    </div>
    {children}
  </div>
);

const HorizontalScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full overflow-x-auto pb-8 hide-scrollbar px-4 md:px-12">
    <div className="flex gap-6 w-max">
      {children}
    </div>
  </div>
);

const AnimeCard: React.FC<{ anime: AnimeData; onClick: () => void }> = ({ anime, onClick }) => (
  <div 
    onClick={onClick}
    className="group relative w-[160px] md:w-[220px] flex-shrink-0 cursor-pointer"
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
    <h3 className="font-condensed font-bold text-lg leading-tight uppercase line-clamp-2 group-hover:text-accent-red transition-colors text-off-black">
      {anime.title.english || anime.title.romaji}
    </h3>
    <p className="text-[10px] font-mono text-gray-500 mt-1 truncate">
      {anime.genres.slice(0, 2).join(', ')}
    </p>
  </div>
);

