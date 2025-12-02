import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Button } from './components/Button';
import { MenuButton } from './components/MenuButton';
import { MobileMenu } from './components/MobileMenu';
import { DesktopMenu } from './components/DesktopMenu';
import { DesktopMenuTrigger } from './components/DesktopMenuTrigger';
import { ThemeToggle } from './components/ThemeToggle';
import { fetchTrendingAnime, fetchAnimeDetails, AnimeData } from './services/anilistService';
import { StudiosView } from './components/StudiosView';
import { ExploreView } from './components/ExploreView';
import { AboutView } from './components/AboutView';
import { ProjectsView } from './components/ProjectsView';
import { ContactView } from './components/ContactView';
import { Footer } from './components/Footer';
import { NotFoundView } from './components/NotFoundView';
import { PullToRefresh } from './components/PullToRefresh';
import { TrailerPlayer } from './components/TrailerPlayer';
import { triggerHaptic } from './utils/haptics';

type ViewMode = 'SHOWCASE' | 'STUDIOS' | 'EXPLORE' | 'ABOUT' | 'PROJECTS' | 'CONTACT' | 'NOT_FOUND';

export default function App() {
  const [animeList, setAnimeList] = useState<AnimeData[]>([]);
  const [trendingList, setTrendingList] = useState<AnimeData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailView, setIsDetailView] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('SHOWCASE');
  const [isScrolled, setIsScrolled] = useState(false);
  const [previousView, setPreviousView] = useState<ViewMode | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  
  // Refs for FLIP animations
  const posterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [posterRect, setPosterRect] = useState<DOMRect | null>(null);
  const [titleRect, setTitleRect] = useState<DOMRect | null>(null);

  // Handle Browser Back Button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (!state) {
        // Default to initial state if no state exists
        setViewMode('SHOWCASE');
        setIsDetailView(false);
        setAnimeList(trendingList);
        return;
      }

      // Handle View Mode
      if (state.view) {
        setViewMode(state.view);
      }

      // Handle Detail View
      if (state.animeId) {
        setIsDetailView(true);
        setIsTransitioning(true);
        fetchAnimeDetails(state.animeId).then(anime => {
          if (anime) {
            setAnimeList([anime]);
            setCurrentIndex(0);
          } else {
            setViewMode('NOT_FOUND');
          }
          setIsTransitioning(false);
        });
      } else {
        // Closing Detail View - Capture positions if we are currently in detail view
        // Note: We can't rely on isDetailView state here because of closure staleness
        // But we can check if the poster element exists and is in "detail mode" (large)
        if (posterRef.current && posterRef.current.getBoundingClientRect().width > 300) {
           setPosterRect(posterRef.current.getBoundingClientRect());
        }
        if (titleRef.current) {
           setTitleRect(titleRef.current.getBoundingClientRect());
        }

        setIsDetailView(false);
        // Restore trending list if returning to showcase main
        if (state.view === 'SHOWCASE' && trendingList.length > 0) {
           setAnimeList(trendingList);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial state
    window.history.replaceState({ view: 'SHOWCASE' }, '', window.location.pathname);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [trendingList]);

  // Fetch Data on Mount
  useEffect(() => {
    const loadAnime = async () => {
      const data = await fetchTrendingAnime(1, 10);
      setAnimeList(data);
      setTrendingList(data);
      setIsLoading(false);
    };
    loadAnime();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Lock Scroll when Menu is Open
  useEffect(() => {
    if (isMenuOpen || isDesktopMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isDesktopMenuOpen]);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force scroll to top when switching views or toggling detail
  useLayoutEffect(() => {
    if (viewMode === 'SHOWCASE') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isDetailView, viewMode]);

  // Parallax Logic - Only active in Showcase mode
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDetailView || viewMode !== 'SHOWCASE') return;
      
      // Disable parallax on mobile
      if (window.innerWidth < 768) return;

      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDetailView, viewMode]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    setCurrentIndex((prev: number) => (prev + 1) % animeList.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    setCurrentIndex((prev: number) => (prev - 1 + animeList.length) % animeList.length);
  };

  const toggleDetailView = () => {
    triggerHaptic();
    // 1. FIRST (Capture current positions)
    if (posterRef.current) setPosterRect(posterRef.current.getBoundingClientRect());
    if (titleRef.current) setTitleRect(titleRef.current.getBoundingClientRect());

    // 2. STATE CHANGE
    if (!isDetailView) {
       // Opening Detail View -> Push State
       const animeId = animeList[currentIndex].id;
       window.history.pushState({ view: 'SHOWCASE', animeId }, '', `?anime=${animeId}`);
       setIsDetailView(true);
       setMousePos({ x: 0, y: 0 });
    } else {
       // Closing Detail View -> Go Back
       window.history.back();
    }
  };

  const handleCloseDetail = () => {
    triggerHaptic();
    // Capture current positions for FLIP animation (Exit Transition)
    if (posterRef.current) setPosterRect(posterRef.current.getBoundingClientRect());
    if (titleRef.current) setTitleRect(titleRef.current.getBoundingClientRect());
    window.history.back();
  };

  const handleLogoClick = () => {
    triggerHaptic();
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
    triggerHaptic();
    if (mode === viewMode) return;
    
    window.history.pushState({ view: mode }, '', `?view=${mode.toLowerCase()}`);

    if (mode === 'SHOWCASE') {
        // Ensure we restore the trending list if we were inspecting something else
        if (animeList !== trendingList) {
            setAnimeList(trendingList);
            setCurrentIndex(0);
        }
        setPreviousView(null);
    }

    setIsDetailView(false); // Close detail view if open
    setViewMode(mode);
  };

  const toggleTheme = () => {
    triggerHaptic();
    setTheme((prev: 'light' | 'dark') => prev === 'light' ? 'dark' : 'light');
  };

  const handleAnimeSelect = async (animeId: number) => {
    triggerHaptic();
    setIsTransitioning(true);
    // Capture the current view mode before switching
    setPreviousView(viewMode);
    
    const anime = await fetchAnimeDetails(animeId);
    if (anime) {
      // Push state so back button works correctly (returns to previous view)
      window.history.pushState({ view: 'SHOWCASE', animeId }, '', `?anime=${animeId}`);
      
      setAnimeList([anime]);
      setCurrentIndex(0);
      setViewMode('SHOWCASE');
      setIsDetailView(true);
      // Reset scroll
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      setViewMode('NOT_FOUND');
    }
    // End transition
    setIsTransitioning(false);
  };

  const handleRefresh = async () => {
    // Simulate a delay for the refresh animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    window.location.reload();
  };

  // Auto-scroll Effect
  useEffect(() => {
    if (viewMode !== 'SHOWCASE' || isDetailView || animeList.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev: number) => (prev + 1) % animeList.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [viewMode, isDetailView, animeList.length]);

  // 3. FLIP ANIMATION EFFECT
  useLayoutEffect(() => {
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
        <div className="font-display text-4xl animate-pulse">LOADING...</div>
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

  return (
    <div id="app-wrapper" className="min-h-screen relative font-sans">
        
        <PullToRefresh onRefresh={handleRefresh} />

        {/* Navigation */}
        <nav 
          className={`
            fixed transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] flex items-center justify-between left-1/2 -translate-x-1/2
            ${isMenuOpen || isDesktopMenuOpen ? 'z-[80]' : 'z-[60]'}
            ${isDetailView || (isFooterVisible && !isMenuOpen && !isDesktopMenuOpen) ? 'opacity-0 -translate-y-[200%] pointer-events-none' : ''}
            ${!isScrolled 
              ? `top-0 w-full px-6 py-6 md:px-12 bg-transparent pointer-events-none ${theme === 'light' && !isMenuOpen && !isDesktopMenuOpen ? 'mix-blend-darken' : ''}`
              : `
                 top-4
                 w-[92%] md:w-[95%] md:max-w-7xl
                 px-4 md:px-6 py-2
                 ${isMenuOpen || isDesktopMenuOpen ? 'bg-transparent border-transparent shadow-none' : 'bg-white dark:bg-black border-2 border-off-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'}
                 ${isDetailView || (isFooterVisible && !isMenuOpen && !isDesktopMenuOpen) ? '' : 'opacity-100 translate-y-0 pointer-events-auto'}
                `
            }
          `}
        >
          <div className="flex items-center gap-2 pointer-events-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
             <div 
               onClick={handleLogoClick}
               className={`font-display text-2xl tracking-tighter cursor-pointer hover:opacity-70 transition-opacity ${isMenuOpen || isDesktopMenuOpen ? 'text-base-gray' : (isScrolled ? 'text-off-black dark:text-white' : '')}`}
               title="Reload"
             >
               OTAKU<span className="text-accent-red">.ARCHIVE</span>
             </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className={`hidden md:flex gap-8 font-condensed font-bold tracking-widest text-sm ${isScrolled || isDesktopMenuOpen ? 'text-off-black dark:text-white' : 'dark:text-white'}`}>
              <DesktopMenuTrigger 
                isOpen={isDesktopMenuOpen} 
                onClick={() => {
                  triggerHaptic();
                  setIsDesktopMenuOpen(!isDesktopMenuOpen);
                }}
                className={isDesktopMenuOpen ? 'text-base-gray' : (isScrolled ? 'text-off-black dark:text-white' : 'text-off-black dark:text-white')}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pointer-events-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button variant="outline" className={`hidden md:block text-xs py-2 px-6 ${isScrolled && !isDesktopMenuOpen ? 'border-off-black text-off-black hover:bg-off-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black' : (isDesktopMenuOpen ? '!border-base-gray !text-base-gray !hover:bg-base-gray !hover:text-off-black' : '')}`}>LOGIN</Button>
            <div className="md:hidden">
              <MenuButton 
                isOpen={isMenuOpen} 
                onClick={() => {
                  triggerHaptic();
                  setIsMenuOpen(!isMenuOpen);
                }} 
                className={isMenuOpen ? 'text-base-gray' : 'text-off-black dark:text-white'}
              />
            </div>
          </div>
        </nav>

        <MobileMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          onNavClick={handleNavClick} 
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <DesktopMenu 
          isOpen={isDesktopMenuOpen} 
          onClose={() => setIsDesktopMenuOpen(false)} 
          onNavClick={handleNavClick} 
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* Transition Loader Overlay */}
        {isTransitioning && (
          <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center backdrop-blur-sm">
             <div className="font-display text-4xl text-white animate-pulse">LOADING...</div>
          </div>
        )}

        {/* Back Button for Detail View */}
        {isDetailView && viewMode === 'SHOWCASE' && (
          <button 
            onClick={handleCloseDetail}
            className="fixed top-6 right-6 z-[60] text-off-black dark:text-black font-condensed font-bold uppercase tracking-widest hover:text-accent-red transition-colors animate-slide-up bg-white px-4 py-2 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Close Detail [ESC]
          </button>
        )}
      
      {/* Main Content Wrapper */}
      <div 
        className="relative z-10 bg-base-gray text-off-black selection:bg-black selection:text-white transition-colors duration-700 shadow-2xl"
      >
        {/* Main Content Area */}
        <main className={`relative w-full ${isLandingPage ? 'h-screen flex flex-col justify-center' : 'min-h-screen'} ${isDetailView ? 'pt-12 pb-12' : ''}`}>
          
          {/* VIEW: NOT FOUND */}
          {viewMode === 'NOT_FOUND' && (
             <NotFoundView onBack={() => {
                triggerHaptic();
                setViewMode('SHOWCASE');
                setAnimeList(trendingList);
                window.history.pushState({ view: 'SHOWCASE' }, '', '/');
             }} />
          )}

          {/* VIEW: EXPLORE */}
          <ExploreView isVisible={viewMode === 'EXPLORE'} onAnimeSelect={handleAnimeSelect} />

          {/* VIEW: STUDIOS */}
          <StudiosView isVisible={viewMode === 'STUDIOS'} onAnimeSelect={handleAnimeSelect} />

          {/* VIEW: ABOUT */}
          {viewMode === 'ABOUT' && <AboutView />}

          {/* VIEW: PROJECTS */}
          {viewMode === 'PROJECTS' && <ProjectsView />}

          {/* VIEW: CONTACT */}
          {viewMode === 'CONTACT' && <ContactView />}

          {/* VIEW: SHOWCASE (Landing & Detail) */}
          {viewMode === 'SHOWCASE' && (
            <div className={`
              relative mx-auto transition-colors duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]
              ${isDetailView 
                ? 'w-full max-w-[95%] md:max-w-[90%] lg:max-w-7xl grid grid-cols-1 md:grid-cols-12 border-2 border-off-black bg-white dark:bg-black shadow-2xl mt-12 mb-12' 
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
                            <span className="text-gray-500 dark:text-gray-400 mb-1">STUDIO</span>
                            <span className="text-lg text-off-black">{currentAnime.studios.nodes[0]?.name || "N/A"}</span>
                          </div>
                          <div className="w-[1px] h-8 bg-gray-400"></div>
                          <div className="flex flex-col">
                            <span className="text-gray-500 dark:text-gray-400 mb-1">FORMAT</span>
                            <span className="text-lg text-off-black">TV SERIES</span>
                          </div>
                          <div className="w-[1px] h-8 bg-gray-400"></div>
                          <div className="flex flex-col">
                             <span className="text-gray-500 dark:text-gray-400 mb-1">RATING</span>
                             <span className="text-lg text-accent-red font-bold">{currentAnime.averageScore}%</span>
                          </div>
                       </div>
                       <div className="font-mono text-xs text-gray-400 tracking-widest">
                          #{currentAnime.id}
                       </div>
                   </div>
                 </>
              )}

              {/* === LEFT COLUMN: POSTER === */}
              {/* Landing: Centered | Detail: Left Column (Col 1-5) */}
              <div className={`
                 relative z-20
                 ${isDetailView 
                    ? 'col-span-1 md:col-span-6 lg:col-span-5 border-b-2 md:border-b-0 md:border-r-2 border-off-black p-8 md:p-12 flex items-center justify-center bg-base-gray' 
                    : 'w-full h-full flex flex-col items-center justify-center pb-12 md:pb-0 absolute inset-0 pointer-events-none'
                 }
              `}>
                 <div 
                   ref={posterRef}
                   onClick={!isDetailView ? toggleDetailView : undefined}
                   className={`
                     relative shadow-2xl bg-black overflow-hidden
                     ${isDetailView 
                       ? 'w-full aspect-[2/3] rotate-0 pointer-events-auto max-w-md shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)]' 
                       : 'w-[min(70vw,50vh)] md:w-[26vw] aspect-[2/3] cursor-pointer group pointer-events-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]'
                     }
                   `}
                   style={{ 
                     transform: !isDetailView ? `
                       translate(${mousePos.x * 25}px, ${mousePos.y * 25}px) 
                       rotateY(${mousePos.x * 12}deg) 
                       rotateX(${-mousePos.y * 12}deg)
                     ` : 'none',
                     perspective: '1000px',
                     animationDelay: '0.2s'
                   }}
                 >
                    <div className={`w-full h-full transition-all duration-300 ${!isDetailView ? 'group-hover:scale-105' : ''} animate-scale-up`}>
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

                 {/* Mobile Landing Page Title */}
                 {!isDetailView && (
                   <div 
                     className="md:hidden mt-6 text-center px-4 pointer-events-auto"
                   >
                      <h1 
                        ref={isMobile ? titleRef : undefined}
                        className="font-display text-3xl uppercase tracking-tighter text-off-black leading-none"
                      >
                        {displayTitle}
                      </h1>
                      <div className="mt-3 animate-pulse">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 border border-gray-500 px-3 py-1 rounded-full">Tap Poster</span>
                      </div>
                   </div>
                 )}
              </div>

              {/* === RIGHT COLUMN: CONTENT === */}
              {/* Landing: Full Screen Background | Detail: Right Column (Col 6-12) */}
              <div className={`
                 
                 ${isDetailView 
                   ? 'col-span-1 md:col-span-6 lg:col-span-7 flex flex-col' 
                   : 'absolute inset-0 z-0 flex items-center justify-center pointer-events-none'
                 }
              `}>
                
                {/* --- TITLE SECTION --- */}
                <div 
                  className={`
                    flex flex-col justify-center
                    ${isDetailView 
                      ? 'p-8 md:p-12 border-b-2 border-off-black bg-white dark:bg-black min-h-[300px]' 
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
                      : 'hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[min(5vw,10vh)] opacity-[0.04] w-full text-center px-4'
                   }`}>
                      {currentAnime.title.native || "アニメ"}
                   </div>

                   {/* Main Title */}
                   <div 
                     ref={!isMobile ? titleRef : undefined}
                     className={`${isDetailView ? 'relative w-fit' : 'px-4 max-w-[90vw] w-fit mx-auto'}`}
                   >
                     {/* Mobile Detail: Solid Font */}
                     <h1 
                       ref={(isMobile && isDetailView) ? titleRef : undefined}
                       className={`md:hidden font-display tracking-tighter uppercase text-off-black break-words transition-colors duration-700 ${titleClass} ${!isDetailView ? 'hidden' : 'block'}`}
                     >
                       {displayTitle}
                     </h1>

                     {/* Desktop / Showcase: Outline Font (Anton) */}
                     <h1 
                       className={`font-display tracking-tighter uppercase break-words transition-colors duration-700 ${titleClass} ${isDetailView ? 'hidden md:block text-off-black' : 'hidden md:block landing-title animate-slide-up'}`}
                       style={{ animationDelay: '0.4s' }}
                     >
                       {displayTitle}
                     </h1>
                   </div>
                </div>

                {/* --- SYNOPSIS SECTION (Detail Only) --- */}
                {isDetailView && (
                  <div className="flex-1 p-8 md:p-12 bg-gray-50 dark:bg-[#1a1a1a] animate-slide-up" style={{ animationDelay: '0.4s' }}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-8 h-8 rounded-full border border-black dark:border-white flex items-center justify-center">
                           <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="font-condensed font-bold text-xl uppercase tracking-widest text-off-black">Synopsis</h3>
                      </div>

                      <div 
                        className="font-sans text-off-black font-light leading-relaxed text-lg text-justify opacity-80 allow-select"
                        dangerouslySetInnerHTML={{ __html: currentAnime.description }}
                      />

                      {/* Footer Stats for Mobile (since header strip is hidden on mobile) */}
                      <div className="md:hidden mt-8 pt-8 border-t border-gray-300 dark:border-gray-700 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Studio</span>
                            <span className="font-condensed font-bold text-lg text-off-black">{currentAnime.studios.nodes[0]?.name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Rating</span>
                            <span className="font-condensed font-bold text-lg text-accent-red">{currentAnime.averageScore}%</span>
                          </div>
                      </div>
                      
                      <div className="mt-8 flex flex-wrap gap-2">
                        {currentAnime.genres.map(g => (
                          <span key={g} className="border border-black dark:border-white px-3 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-default text-off-black">
                            {g}
                          </span>
                        ))}
                      </div>

                      {/* TRAILER SECTION */}
                      {currentAnime.trailer?.site === 'youtube' && currentAnime.trailer?.id && (
                        <div className="mt-12 pt-12 border-t border-gray-300 dark:border-gray-700">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-8 h-8 rounded-full border border-black dark:border-white flex items-center justify-center">
                                   <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse"></div>
                                </div>
                                <h3 className="font-condensed font-bold text-xl uppercase tracking-widest text-off-black">Trailer</h3>
                            </div>
                            
                            <div 
                                onClick={() => {
                                  triggerHaptic();
                                  setShowTrailer(true);
                                }}
                                className="relative w-full aspect-video cursor-pointer group overflow-hidden border-2 border-off-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                            >
                                <img 
                                    src={currentAnime.trailer.thumbnail || `https://img.youtube.com/vi/${currentAnime.trailer.id}/maxresdefault.jpg`} 
                                    alt="Trailer Thumbnail" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentAnime.trailer.id}/hqdefault.jpg`;
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                                    <div className="group-hover:scale-110 transition-transform">
                                        <svg className="w-20 h-20 text-accent-red drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                      )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Floating Controls for Landing Page */}
          {!isDetailView && viewMode === 'SHOWCASE' && (
            <>
              {/* Desktop Info Card (Bottom Left) */}
              <div className="hidden md:block absolute bottom-12 left-12 z-30 w-80 bg-white dark:bg-black border-2 border-off-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] animate-slide-up" style={{ animationDelay: '0.6s' }}>
                 <div className="flex items-center justify-between mb-3 border-b-2 border-off-black pb-2">
                    <span className="font-condensed font-bold text-accent-red uppercase tracking-widest text-sm">
                      {currentAnime.studios.nodes[0]?.name || "STUDIO"}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">#{currentAnime.id}</span>
                 </div>
                 
                 <div 
                   className="font-sans text-xs font-medium leading-relaxed text-off-black line-clamp-3 mb-4 opacity-70 allow-select"
                   dangerouslySetInnerHTML={{ __html: currentAnime.description }}
                 />

                 <div className="flex flex-wrap gap-2">
                   {currentAnime.genres.slice(0, 3).map(genre => (
                     <span key={genre} className="text-[10px] font-bold uppercase border border-off-black px-2 py-1 hover:bg-off-black hover:text-base-gray transition-colors cursor-default text-off-black">
                       {genre}
                     </span>
                   ))}
                 </div>
              </div>

              {/* Desktop Click Indicator (Bottom Center) */}
              <div className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-2 pointer-events-none animate-fade-in" style={{ animationDelay: '0.8s' }}>
                 <div className="animate-float flex flex-col items-center gap-2 opacity-50">
                    <svg className="w-5 h-5 text-off-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                    <span className="font-condensed font-bold text-[10px] tracking-[0.3em] uppercase text-off-black">Click Poster</span>
                 </div>
              </div>

              {/* Mobile Index (Bottom Left) */}
              <div className="absolute bottom-12 left-6 z-30 md:hidden pointer-events-none">
                 <div className="font-display text-4xl flex items-baseline">
                   <span 
                     className="text-transparent transition-colors duration-300"
                     style={{ 
                       WebkitTextStroke: (currentIndex + 1) === 10 ? '1px #D00000' : '1px var(--color-off-black)' 
                     }}
                   >
                     {(currentIndex + 1).toString().padStart(2, '0')}
                   </span>
                   <span className="text-xl text-off-black opacity-50 ml-1">
                     / {animeList.length.toString().padStart(2, '0')}
                   </span>
                 </div>
              </div>

              <div className="absolute bottom-12 right-6 md:right-12 z-30 flex gap-4 items-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
                 <div className="font-display text-4xl text-outline text-transparent stroke-black hidden md:block" style={{ WebkitTextStroke: '1px var(--color-off-black)' }}>
                   {(currentIndex + 1).toString().padStart(2, '0')} / {animeList.length.toString().padStart(2, '0')}
                 </div>
                 <div className="flex gap-2">
                   <button onClick={handlePrev} className="group w-14 h-14 border-2 border-off-black dark:border-white text-off-black dark:text-white flex items-center justify-center md:hover:bg-off-black md:hover:text-base-gray md:dark:hover:bg-white md:dark:hover:text-black transition-all active:scale-95 active:bg-off-black active:text-base-gray dark:active:bg-white dark:active:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] md:hover:shadow-none md:hover:translate-x-[2px] md:hover:translate-y-[2px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                     <img src="/arrow.png" alt="Previous" className="w-6 h-6 object-contain rotate-180 dark:invert md:group-hover:invert group-active:invert md:dark:group-hover:invert-0 dark:group-active:invert-0 transition-all" />
                   </button>
                   <button onClick={handleNext} className="group w-14 h-14 bg-off-black dark:bg-white text-base-gray dark:text-black flex items-center justify-center md:hover:bg-accent-red md:dark:hover:bg-accent-red md:dark:hover:text-white transition-all active:scale-95 active:bg-accent-red dark:active:bg-accent-red dark:active:text-white shadow-[4px_4px_0px_0px_#D00000] dark:shadow-[4px_4px_0px_0px_#D00000] md:hover:shadow-none md:hover:translate-x-[2px] md:hover:translate-y-[2px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                     <img src="/arrow.png" alt="Next" className="w-6 h-6 object-contain invert dark:invert-0 md:group-hover:invert-0 group-active:invert-0 md:dark:group-hover:invert-0 dark:group-active:invert-0 transition-all" />
                   </button>
                 </div>
              </div>
            </>
          )}

        </main>

        <Footer 
          onVisibilityChange={setIsFooterVisible}
          onNotFound={() => {
            triggerHaptic();
            setViewMode('NOT_FOUND');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }} 
        />
      </div>

      {/* Trailer Player Overlay */}
      {showTrailer && currentAnime.trailer?.id && (
        <TrailerPlayer 
          videoId={currentAnime.trailer.id} 
          onClose={() => setShowTrailer(false)} 
        />
      )}
    </div>
  );
}
