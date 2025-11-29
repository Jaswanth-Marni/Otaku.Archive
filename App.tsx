import React, { useState, useEffect, useRef } from 'react';
import { Button } from './components/Button';
import { fetchTrendingAnime, AnimeData } from './services/anilistService';
import { StudiosView } from './components/StudiosView';

type ViewMode = 'SHOWCASE' | 'STUDIOS';

export default function App() {
  const [animeList, setAnimeList] = useState<AnimeData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailView, setIsDetailView] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('SHOWCASE');
  
  // Refs for FLIP animations
  const posterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [posterRect, setPosterRect] = useState<DOMRect | null>(null);
  const [titleRect, setTitleRect] = useState<DOMRect | null>(null);

  // Fetch Data on Mount
  useEffect(() => {
    const loadAnime = async () => {
      const data = await fetchTrendingAnime(1, 10);
      setAnimeList(data);
      setIsLoading(false);
    };
    loadAnime();
  }, []);

  // Parallax Logic - Only active in Showcase mode
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDetailView || viewMode !== 'SHOWCASE') return;
      
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDetailView, viewMode]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % animeList.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + animeList.length) % animeList.length);
  };

  const toggleDetailView = () => {
    // 1. FIRST (Capture current positions)
    if (posterRef.current) setPosterRect(posterRef.current.getBoundingClientRect());
    if (titleRef.current) setTitleRect(titleRef.current.getBoundingClientRect());

    // 2. STATE CHANGE
    setIsDetailView(!isDetailView);

    if (!isDetailView) {
      setMousePos({ x: 0, y: 0 });
    }
  };

  const handleLogoClick = () => {
    // Smoothly fade out the app wrapper before reloading
    const appWrapper = document.getElementById('app-wrapper');
    if (appWrapper) {
      appWrapper.style.transition = 'opacity 0.6s ease-in-out';
      appWrapper.style.opacity = '0';
    }
    
    // Reload after transition matches
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleNavClick = (mode: ViewMode) => {
    if (mode === viewMode) return;
    setIsDetailView(false); // Close detail view if open
    setViewMode(mode);
  };

  // 3. FLIP ANIMATION EFFECT
  useEffect(() => {
    if (!posterRect || !posterRef.current || viewMode !== 'SHOWCASE') return;

    // LAST (Capture new positions after render)
    const newPosterRect = posterRef.current.getBoundingClientRect();
    
    // INVERT
    const deltaX = posterRect.left - newPosterRect.left;
    const deltaY = posterRect.top - newPosterRect.top;
    const deltaW = posterRect.width / newPosterRect.width;
    const deltaH = posterRect.height / newPosterRect.height;

    // PLAY (Animate from Old to New)
    const posterAnim = posterRef.current.animate([
      {
        transformOrigin: 'top left',
        transform: `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`
      },
      {
        transformOrigin: 'top left',
        transform: 'none'
      }
    ], {
      duration: 700,
      easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
      fill: 'both'
    });

    // IMPORTANT: Release animation lock so React state can take over (for parallax)
    posterAnim.onfinish = () => posterAnim.cancel();

    // Animate Title if it exists
    if (titleRef.current && titleRect) {
       const newTitleRect = titleRef.current.getBoundingClientRect();
       const tDeltaX = titleRect.left - newTitleRect.left;
       const tDeltaY = titleRect.top - newTitleRect.top;
       
       const titleAnim = titleRef.current.animate([
         { transform: `translate(${tDeltaX}px, ${tDeltaY}px)` },
         { transform: 'none' }
       ], {
          duration: 700,
          easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
          fill: 'both'
       });
       
       // Release animation lock for parallax
       titleAnim.onfinish = () => titleAnim.cancel();
    }

  }, [isDetailView]); // Runs when view toggles

  if (isLoading || animeList.length === 0) {
    return (
      <div className="h-screen w-full bg-base-gray flex items-center justify-center">
        <div className="font-display text-4xl animate-pulse">LOADING ARCHIVE...</div>
      </div>
    );
  }

  const currentAnime = animeList[currentIndex];
  const displayTitle = currentAnime.title.english || currentAnime.title.romaji;
  
  // Helper to determine optimal font size
  const getDynamicTitleClass = (text: string, detailMode: boolean) => {
    const len = text.length;

    // Landing Page (Showcase Mode)
    if (!detailMode) {
      if (len < 15) return 'text-[15vw] md:text-[min(15vw,25vh)] text-center leading-[0.9]'; 
      if (len < 30) return 'text-[12vw] md:text-[min(12vw,20vh)] text-center leading-[0.9]';
      return 'text-[10vw] md:text-[min(10vw,12vh)] text-center leading-[0.9]';
    }
    
    // Detail View Mode - Boxed
    return 'text-4xl md:text-6xl lg:text-7xl leading-none text-left';
  };

  const titleClass = getDynamicTitleClass(displayTitle, isDetailView);

  // Determine if we should lock scroll (Only lock on Showcase Landing Page)
  const isLandingPage = viewMode === 'SHOWCASE' && !isDetailView;
  const shouldEnableScroll = !isLandingPage;

  return (
    <div id="app-wrapper" className={`min-h-screen bg-base-gray text-off-black selection:bg-black selection:text-white relative font-sans transition-colors duration-700 ${shouldEnableScroll ? 'overflow-y-auto' : 'overflow-hidden h-screen'}`}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12 mix-blend-darken pointer-events-none transition-all duration-500 ${isDetailView ? 'opacity-0 -translate-y-full' : 'opacity-100'}`}>
        <div className="flex items-center gap-2 pointer-events-auto">
           <div 
             onClick={handleLogoClick}
             className="font-display text-2xl tracking-tighter cursor-pointer hover:opacity-70 transition-opacity"
             title="Reload System"
           >
             OTAKU<span className="text-accent-red">.ARCHIVE</span>
           </div>
        </div>

        <div className="hidden md:flex gap-8 font-condensed font-bold tracking-widest text-sm pointer-events-auto">
          <button 
            onClick={() => handleNavClick('SHOWCASE')} 
            className={`hover:text-accent-red transition-colors ${viewMode === 'SHOWCASE' ? 'text-accent-red' : ''}`}
          >
            SHOWCASE
          </button>
          <button className="hover:text-accent-red transition-colors opacity-50 cursor-not-allowed">TOP RATED</button>
          <button className="hover:text-accent-red transition-colors opacity-50 cursor-not-allowed">GENRES</button>
          <button 
             onClick={() => handleNavClick('STUDIOS')}
             className={`hover:text-accent-red transition-colors ${viewMode === 'STUDIOS' ? 'text-accent-red' : ''}`}
          >
             STUDIOS
          </button>
        </div>

        <div className="flex items-center gap-6 pointer-events-auto">
          <Button variant="outline" className="hidden md:block text-xs py-2 px-6">LOGIN</Button>
        </div>
      </nav>

      {/* Back Button for Detail View */}
      {isDetailView && viewMode === 'SHOWCASE' && (
        <button 
          onClick={() => setIsDetailView(false)}
          className="fixed top-6 right-6 z-[60] text-off-black font-condensed font-bold uppercase tracking-widest hover:text-accent-red transition-colors animate-slide-up bg-white px-4 py-2 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          Close Detail [ESC]
        </button>
      )}

      {/* Main Content Area */}
      <main className={`relative w-full transition-all duration-700 ${isLandingPage ? 'h-screen flex flex-col justify-center' : 'min-h-screen'} ${isDetailView ? 'pt-12 pb-12' : ''}`}>
        
        {/* VIEW: STUDIOS */}
        <StudiosView isVisible={viewMode === 'STUDIOS'} />

        {/* VIEW: SHOWCASE (Landing & Detail) */}
        {viewMode === 'SHOWCASE' && (
          <div className={`
            relative mx-auto transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]
            ${isDetailView 
              ? 'w-full max-w-[95%] md:max-w-[90%] lg:max-w-7xl grid grid-cols-1 md:grid-cols-12 border-2 border-off-black bg-white shadow-2xl mt-12 mb-12' 
              : 'w-full max-w-full h-full flex items-center justify-center'
            }
          `}>

            {/* === HEADER STRIP (Desktop Detail Only) === */}
            {isDetailView && (
               <>
                 {/* Top Left: Clients/Studio etc branding */}
                 <div className="hidden md:flex col-span-12 border-b-2 border-off-black h-24 items-center justify-between px-8 bg-base-gray">
                     <div className="font-condensed font-bold tracking-widest text-xs uppercase flex gap-8">
                        <div className="flex flex-col">
                          <span className="text-gray-500 mb-1">STUDIO</span>
                          <span className="text-lg text-off-black">{currentAnime.studios.nodes[0]?.name || "N/A"}</span>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-400"></div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 mb-1">FORMAT</span>
                          <span className="text-lg text-off-black">TV SERIES</span>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-400"></div>
                        <div className="flex flex-col">
                           <span className="text-gray-500 mb-1">RATING</span>
                           <span className="text-lg text-accent-red font-bold">{currentAnime.averageScore}%</span>
                        </div>
                     </div>
                     <div className="font-mono text-xs text-gray-400 tracking-widest">
                        SYS.ID_{currentAnime.id}
                     </div>
                 </div>
               </>
            )}

            {/* === LEFT COLUMN: POSTER === */}
            {/* Landing: Centered | Detail: Left Column (Col 1-5) */}
            <div className={`
               relative z-20 transition-all duration-700
               ${isDetailView 
                  ? 'col-span-1 md:col-span-6 lg:col-span-5 border-b-2 md:border-b-0 md:border-r-2 border-off-black p-8 md:p-12 flex items-center justify-center bg-base-gray' 
                  : 'w-full h-full flex items-center justify-center absolute inset-0 pointer-events-none'
               }
            `}>
               <div 
                 ref={posterRef}
                 onClick={!isDetailView ? toggleDetailView : undefined}
                 className={`
                   relative shadow-2xl bg-black overflow-hidden
                   ${isDetailView 
                     ? 'w-full aspect-[2/3] rotate-0 pointer-events-auto max-w-md shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]' 
                     : 'w-[min(70vw,50vh)] md:w-[26vw] aspect-[2/3] cursor-pointer group pointer-events-auto'
                   }
                 `}
                 style={{ 
                   transform: !isDetailView ? `
                     translate(${mousePos.x * 25}px, ${mousePos.y * 25}px) 
                     rotateY(${mousePos.x * 12}deg) 
                     rotateX(${-mousePos.y * 12}deg)
                   ` : 'none',
                   perspective: '1000px'
                 }}
               >
                  <div className={`w-full h-full transition-all duration-300 ${!isDetailView ? 'group-hover:scale-105' : ''}`}>
                     <div className="w-full h-full transition-all duration-300">
                        <img 
                          src={currentAnime.coverImage.extraLarge} 
                          alt={displayTitle} 
                          className={`w-full h-full object-cover transition-all duration-700 ${
                            isDetailView ? 'grayscale-0' : 'filter grayscale-[20%] group-hover:grayscale-0 contrast-110'
                          }`}
                        />
                     </div>
                  </div>

                   {/* Tech Overlays - Hide in Detail View */}
                   <div className={`absolute top-0 left-0 p-4 w-full flex justify-between items-start transition-opacity duration-500 ${isDetailView ? 'opacity-0' : 'opacity-100'}`}>
                     <span className="bg-white text-black text-[10px] font-bold font-mono px-2 py-1">#{currentAnime.id}</span>
                   </div>
               </div>
            </div>

            {/* === RIGHT COLUMN: CONTENT === */}
            {/* Landing: Full Screen Background | Detail: Right Column (Col 6-12) */}
            <div className={`
               transition-all duration-700
               ${isDetailView 
                 ? 'col-span-1 md:col-span-6 lg:col-span-7 flex flex-col' 
                 : 'absolute inset-0 z-0 flex items-center justify-center pointer-events-none'
               }
            `}>
              
              {/* --- TITLE SECTION --- */}
              <div 
                ref={titleRef}
                className={`
                  transition-all duration-700 flex flex-col justify-center
                  ${isDetailView 
                    ? 'p-8 md:p-12 border-b-2 border-off-black bg-white min-h-[300px]' 
                    : 'w-full h-full items-center text-center'
                  }
                `}
                style={{ 
                   transform: !isDetailView ? `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` : 'none'
                }}
              >
                 {/* Native Title */}
                 <div className={`font-black select-none text-off-black transition-all duration-700 ${
                   isDetailView 
                    ? 'text-sm opacity-60 mb-2 font-mono tracking-widest' 
                    : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[min(5vw,10vh)] opacity-[0.04] w-full text-center px-4'
                 }`}>
                    {currentAnime.title.native || "アニメ"}
                 </div>

                 {/* Main Title */}
                 <div className={`${isDetailView ? 'relative' : 'px-4 max-w-[90vw]'}`}>
                   {/* Mobile Detail: Solid Font */}
                   <h1 
                     className={`md:hidden font-sans font-black tracking-tighter uppercase text-off-black break-words transition-all duration-700 ${titleClass} ${!isDetailView ? 'hidden' : 'block'}`}
                   >
                     {displayTitle}
                   </h1>

                   {/* Desktop / Showcase: Outline Font (Anton) */}
                   <h1 
                     className={`font-display tracking-tighter uppercase break-words transition-all duration-700 ${titleClass} ${isDetailView ? 'hidden md:block text-off-black' : 'block landing-title'}`}
                   >
                     {displayTitle}
                   </h1>
                 </div>
              </div>

              {/* --- SYNOPSIS SECTION (Detail Only) --- */}
              {isDetailView && (
                <div className="flex-1 p-8 md:p-12 bg-gray-50 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center">
                         <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="font-condensed font-bold text-xl uppercase tracking-widest">Mission Briefing</h3>
                    </div>

                    <div 
                      className="font-sans text-off-black font-light leading-relaxed text-lg text-justify opacity-80"
                      dangerouslySetInnerHTML={{ __html: currentAnime.description }}
                    />

                    {/* Footer Stats for Mobile (since header strip is hidden on mobile) */}
                    <div className="md:hidden mt-8 pt-8 border-t border-gray-300 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Studio</span>
                          <span className="font-condensed font-bold text-lg">{currentAnime.studios.nodes[0]?.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Rating</span>
                          <span className="font-condensed font-bold text-lg text-accent-red">{currentAnime.averageScore}%</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex flex-wrap gap-2">
                      {currentAnime.genres.map(g => (
                        <span key={g} className="border border-black px-3 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors cursor-default">
                          {g}
                        </span>
                      ))}
                    </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Floating Controls for Landing Page */}
        {!isDetailView && viewMode === 'SHOWCASE' && (
          <div className="absolute bottom-12 right-6 md:right-12 z-30 flex gap-4 items-center">
             <div className="font-display text-4xl text-outline text-transparent stroke-black hidden md:block" style={{ WebkitTextStroke: '1px black' }}>
               {(currentIndex + 1).toString().padStart(2, '0')} / {animeList.length.toString().padStart(2, '0')}
             </div>
             <div className="flex gap-2">
               <button onClick={handlePrev} className="w-14 h-14 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-95">
                 ←
               </button>
               <button onClick={handleNext} className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-accent-red transition-all active:scale-95 shadow-lg">
                 →
               </button>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}