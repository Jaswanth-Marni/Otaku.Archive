import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { fetchTrendingAnime, AnimeData } from './services/anilistService';

export default function App() {
  const [animeList, setAnimeList] = useState<AnimeData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailView, setIsDetailView] = useState(false);

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
      if (isDetailView) return;
      
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDetailView]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % animeList.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + animeList.length) % animeList.length);
  };

  const toggleDetailView = () => {
    setIsDetailView(!isDetailView);
    // Reset mouse pos on enter detail view so it settles nicely
    if (!isDetailView) {
      setMousePos({ x: 0, y: 0 });
    }
  };

  if (isLoading || animeList.length === 0) {
    return (
      <div className="h-screen w-full bg-base-gray flex items-center justify-center">
        <div className="font-display text-4xl animate-pulse">LOADING ARCHIVE...</div>
      </div>
    );
  }

  const currentAnime = animeList[currentIndex];
  const displayTitle = currentAnime.title.english || currentAnime.title.romaji;
  const titleLength = displayTitle.length;
  
  // Helper to determine optimal font size based on character count
  const getDynamicTitleClass = (text: string, detailMode: boolean) => {
    const len = text.length;

    // Landing Page (Showcase Mode)
    // Uses min(vw, vh) to ensure text fits within the screen regardless of aspect ratio
    if (!detailMode) {
      if (len < 15) return 'text-[15vw] md:text-[min(15vw,25vh)] text-center leading-[0.9]'; 
      if (len < 30) return 'text-[12vw] md:text-[min(12vw,20vh)] text-center leading-[0.9]';
      return 'text-[10vw] md:text-[min(10vw,12vh)] text-center leading-[0.9]';
    }
    
    // Detail View Mode
    if (len < 10) return 'text-5xl md:text-9xl leading-[0.8]'; 
    if (len < 20) return 'text-4xl md:text-8xl leading-[0.85]'; 
    if (len < 35) return 'text-3xl md:text-7xl leading-[0.9]'; 
    return 'text-2xl md:text-5xl leading-tight';
  };

  const titleClass = getDynamicTitleClass(displayTitle, isDetailView);

  // Dynamic Styles for Transitions
  const parallaxTransition = isDetailView 
    ? 'all 0.7s cubic-bezier(0.76,0,0.24,1)' 
    : 'top 0.7s cubic-bezier(0.76,0,0.24,1), left 0.7s cubic-bezier(0.76,0,0.24,1), width 0.7s cubic-bezier(0.76,0,0.24,1), transform 0.1s ease-out';

  // Calculate dynamic top margin for DESKTOP content based on title length
  // Returns md: prefixed classes to only affect desktop layout
  const getDesktopContentMargin = () => {
     if (!isDetailView) return '';
     
     // Values align with desktop font sizes
     if (titleLength < 10) return 'md:mt-[220px]'; 
     if (titleLength < 25) return 'md:mt-[280px]';
     if (titleLength < 50) return 'md:mt-[340px]';
     return 'md:mt-[380px]';
  };

  const desktopContentMargin = getDesktopContentMargin();

  return (
    <div className={`min-h-screen bg-base-gray text-off-black selection:bg-black selection:text-white relative font-sans transition-colors duration-700 ${isDetailView ? 'overflow-y-auto' : 'overflow-hidden h-screen'}`}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12 mix-blend-darken pointer-events-none transition-all duration-500 ${isDetailView ? 'opacity-0 -translate-y-full' : 'opacity-100'}`}>
        <div className="flex items-center gap-2 pointer-events-auto">
           <div className="font-display text-2xl tracking-tighter">OTAKU<span className="text-accent-red">.ARCHIVE</span></div>
        </div>

        <div className="hidden md:flex gap-8 font-condensed font-bold tracking-widest text-sm pointer-events-auto">
          {['SEASONAL', 'TOP RATED', 'GENRES', 'STUDIOS'].map(link => (
            <a key={link} href="#" className="hover:text-accent-red transition-colors">{link}</a>
          ))}
        </div>

        <div className="flex items-center gap-6 pointer-events-auto">
          <Button variant="outline" className="hidden md:block text-xs py-2 px-6">LOGIN</Button>
        </div>
      </nav>

      {/* Back Button for Detail View */}
      {isDetailView && (
        <button 
          onClick={() => setIsDetailView(false)}
          className="fixed top-6 right-6 z-[60] text-off-black font-condensed font-bold uppercase tracking-widest hover:text-accent-red transition-colors animate-slide-up"
        >
          Close Detail [ESC]
        </button>
      )}

      {/* Main Showcase / Header Area */}
      <main className={`relative w-full flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isDetailView ? 'h-0 pointer-events-none' : 'h-screen justify-center'}`}>
        
        {/* Layout Constraint Wrapper: Centers content in Detail view, Full width in Showcase */}
        <div className={`relative w-full h-full transition-all duration-700 ${isDetailView ? 'max-w-7xl mx-auto' : 'max-w-full'}`}>
          
          {/* --- DEPTH LAYER 1: TEXT --- */}
          <div 
            className={`absolute z-0 pointer-events-none transition-all duration-700 ${
              isDetailView 
                ? 'top-20 md:top-16 left-[164px] md:left-[300px] flex items-start right-4 md:right-6' 
                : 'inset-0 flex items-center justify-center'
            }`}
            style={{ 
              transform: !isDetailView ? `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` : 'none',
              transition: parallaxTransition
            }}
          >
            <div className={`relative flex flex-col ${isDetailView ? 'items-start text-left w-full' : 'items-center text-center w-full'}`}>
               {/* Japanese decorative text */}
               <div className={`font-black leading-none select-none z-0 transition-all duration-700 text-off-black hover:text-accent-red hover:opacity-100 ${
                 isDetailView 
                  ? 'block text-[10px] md:text-sm opacity-60 mb-1 translate-x-1 whitespace-normal break-words w-full font-sans tracking-widest' 
                  : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[min(5vw,10vh)] opacity-[0.04] w-full text-center whitespace-normal break-words px-4'
               }`}>
                  {currentAnime.title.native || "アニメ"}
               </div>

               {/* Main English Title */}
               <div className={`relative z-10 ${isDetailView ? 'w-full' : 'px-4 max-w-[90vw]'}`}>
                 {/* Mobile Detail View: Solid Font */}
                 <h1 
                   className={`md:hidden font-sans font-black tracking-tighter uppercase text-off-black break-words transition-all duration-700 ${titleClass} ${!isDetailView ? 'hidden' : 'block'}`}
                 >
                   {displayTitle}
                 </h1>

                 {/* Desktop / Showcase: Outline Font (Anton) */}
                 <h1 
                   className={`font-display tracking-tighter uppercase text-transparent break-words transition-all duration-700 ${titleClass} ${isDetailView ? 'hidden md:block' : 'block'}`}
                   style={{ WebkitTextStroke: '2px #0F0F0F' }}
                 >
                   {displayTitle}
                 </h1>
               </div>
            </div>
          </div>

          {/* --- DEPTH LAYER 2: POSTER (Click Trigger) --- */}
          <div 
            onClick={toggleDetailView}
            className={`absolute z-20 cursor-pointer group ${
              isDetailView 
                ? 'top-24 md:top-16 left-4 md:left-12 w-[130px] md:w-[220px] aspect-[2/3] rotate-0 pointer-events-auto' 
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(70vw,50vh)] md:w-[26vw] aspect-[2/3]'
            }`}
            style={{ 
              transform: !isDetailView ? `
                translate(calc(-50% + ${mousePos.x * 25}px), calc(-50% + ${mousePos.y * 25}px)) 
                rotateY(${mousePos.x * 12}deg) 
                rotateX(${-mousePos.y * 12}deg)
              ` : 'translate(0, 0)', 
              perspective: '1000px',
              transition: parallaxTransition
            }}
          >
             {/* Card Container */}
             <div className={`w-full h-full relative shadow-2xl bg-black overflow-hidden ${!isDetailView ? 'group-hover:scale-105 animate-gyroscope md:animate-none' : ''} transition-transform duration-700`}>
               <img 
                 key={currentAnime.id} 
                 src={currentAnime.coverImage.extraLarge} 
                 alt={displayTitle} 
                 className={`w-full h-full object-cover transition-all duration-700 ${
                   isDetailView ? 'grayscale-0' : 'filter grayscale-[20%] group-hover:grayscale-0 contrast-110'
                 }`}
               />
               
               {/* Tech Overlays - Hide in Detail View */}
               <div className={`absolute top-0 left-0 p-4 w-full flex justify-between items-start transition-opacity duration-500 ${isDetailView ? 'opacity-0' : 'opacity-100'}`}>
                 <span className="bg-white text-black text-[10px] font-bold font-mono px-2 py-1">#{currentAnime.id}</span>
                 <span className="text-white text-[10px] font-mono tracking-widest bg-accent-red px-2 py-1">{currentAnime.averageScore}%</span>
               </div>
             </div>
          </div>

          {/* --- LAYER 3: FLOATING INFO (FOREGROUND) --- */}
          {/* Only visible in Showcase Mode */}
          <div className={`absolute bottom-12 left-6 md:left-12 z-20 max-w-sm hidden md:block pointer-events-none transition-all duration-500 ${isDetailView ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
            <div className="bg-off-black text-white p-6 shadow-[8px_8px_0px_0px_#D00000]">
              <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                 <h3 className="font-condensed text-xl font-bold uppercase text-accent-red tracking-wider">
                   {currentAnime.studios.nodes[0]?.name || "UNKNOWN"}
                 </h3>
              </div>
              
              <p className="font-mono text-xs leading-relaxed text-gray-300 mb-4 line-clamp-3">
                <span dangerouslySetInnerHTML={{ __html: currentAnime.description?.replace(/<[^>]*>?/gm, '') || "No description available." }} />
              </p>

              <div className="flex flex-wrap gap-2">
                {currentAnime.genres.slice(0, 3).map(genre => (
                  <span key={genre} className="px-2 py-1 border border-white/30 text-[9px] font-bold tracking-widest uppercase text-white hover:bg-white hover:text-black transition-colors">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-2 text-[10px] font-mono font-bold text-off-black bg-white inline-block px-2 py-1">
               [ CLICK POSTER TO INITIALIZE ]
            </div>
          </div>

          {/* Controls */}
          <div className={`absolute bottom-12 right-6 md:right-12 z-30 flex gap-4 items-center transition-all duration-500 ${isDetailView ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
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

        </div>

      </main>

      {/* --- SCROLLABLE CONTENT SECTION --- */}
      {isDetailView && (
        <section className="relative z-10 px-6 md:px-12 w-full max-w-7xl mx-auto pb-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-12">
            
            {/* Left Col: Stats 
                Mobile: Grid layout to save vertical space, Top margin clears the poster.
                Desktop: Vertical stack, Top margin aligns with Poster bottom.
            */}
            <div className={`
                md:col-span-5 lg:col-span-3 font-mono text-sm transition-all duration-1000 delay-500 
                ${isDetailView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} 
                mt-[290px] md:mt-[400px] 
                grid grid-cols-2 md:grid-cols-1 gap-6 md:gap-y-2 md:gap-x-0
            `}>
               <div className="group">
                 <h4 className="font-bold text-gray-400 mb-1 text-xs tracking-widest uppercase">Studio</h4>
                 <div className="text-lg font-bold border-l-2 border-accent-red pl-3 group-hover:pl-4 transition-all">{currentAnime.studios.nodes[0]?.name || "N/A"}</div>
               </div>
               
               <div className="group">
                 <h4 className="font-bold text-gray-400 mb-1 text-xs tracking-widest uppercase">Rating</h4>
                 <div className="text-4xl font-display text-accent-red border-l-2 border-black pl-3 group-hover:pl-4 transition-all">{currentAnime.averageScore}%</div>
               </div>

               <div className="col-span-2 md:col-span-1">
                 <h4 className="font-bold text-gray-400 mb-2 text-xs tracking-widest uppercase">Database Tags</h4>
                 <div className="flex flex-wrap gap-2">
                    {currentAnime.genres.map(g => (
                      <span key={g} className="bg-black text-white px-2 py-1 text-xs font-bold hover:bg-accent-red transition-colors cursor-default">{g}</span>
                    ))}
                 </div>
               </div>
            </div>

            {/* Right Col: Description & Lore 
                Mobile: Margin top 8 (standard block spacing)
                Desktop: Dynamic margin top to clear the floating Title
            */}
            <div className={`
              md:col-span-7 lg:col-span-9 space-y-6 transition-all duration-1000 delay-300 
              ${isDetailView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} 
              mt-8 md:mt-10 ${desktopContentMargin}
            `}>
              <div>
                <h3 className="font-condensed text-3xl font-bold mb-4 uppercase tracking-tight flex items-center gap-4">
                  Synopsis <span className="h-1 flex-1 bg-black/10"></span>
                </h3>
                
                <div 
                  className="text-lg md:text-xl leading-8 md:leading-9 text-off-black font-sans font-light tracking-wide text-justify"
                  dangerouslySetInnerHTML={{ __html: currentAnime.description }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pb-12">
                 <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(208,0,0,1)] transition-all group cursor-pointer">
                    <h4 className="font-condensed font-bold text-lg mb-2 flex justify-between">
                      TRAILER LINK <span className="text-accent-red">►</span>
                    </h4>
                    <div className="w-full aspect-video bg-off-black flex items-center justify-center text-gray-500 text-xs font-mono group-hover:text-white transition-colors">
                      [ ENCRYPTED STREAM ]
                    </div>
                 </div>
                 <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(208,0,0,1)] transition-all cursor-pointer">
                    <h4 className="font-condensed font-bold text-lg mb-2">VOICE DATA</h4>
                    <div className="space-y-3 pt-2">
                       <div className="h-2 bg-gray-200 w-3/4"></div>
                       <div className="h-2 bg-gray-200 w-1/2"></div>
                       <div className="h-2 bg-gray-200 w-2/3"></div>
                    </div>
                 </div>
              </div>
            </div>

          </div>

        </section>
      )}
      
    </div>
  );
}