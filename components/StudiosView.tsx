
import React, { useState, useEffect, useRef } from 'react';
import { StudioData, fetchStudios } from '../services/anilistService';
import { geminiService } from '../services/geminiService';

interface StudiosViewProps {
  isVisible: boolean;
}

export const StudiosView: React.FC<StudiosViewProps> = ({ isVisible }) => {
  const [studios, setStudios] = useState<StudioData[]>([]);
  const [selectedStudio, setSelectedStudio] = useState<StudioData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Bio State
  const [studioBio, setStudioBio] = useState<string>("");
  const [isBioLoading, setIsBioLoading] = useState(false);

  // FLIP Animation Refs
  const nameRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const detailNameRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchStudios();
      setStudios(data);
      setIsLoading(false);
    };
    if (isVisible && studios.length === 0) {
      loadData();
    }
  }, [isVisible]);

  // Fetch Bio when Studio Selected
  useEffect(() => {
    if (selectedStudio) {
      const fetchBio = async () => {
        setIsBioLoading(true);
        const prompt = `Write a short, high-impact description (max 40 words) for the anime studio '${selectedStudio.name}' known for works like '${selectedStudio.media.nodes[0]?.title.english || "Anime"}'. Focus on their visual style and industry reputation. Do not use markdown.`;
        const bio = await geminiService.sendMessage(prompt);
        setStudioBio(bio);
        setIsBioLoading(false);
      };
      fetchBio();
    } else {
      setStudioBio("");
    }
  }, [selectedStudio]);

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible || selectedStudio) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isVisible, selectedStudio]);

  const handleStudioClick = (studio: StudioData) => {
    const startEl = nameRefs.current.get(studio.id);
    const startRect = startEl?.getBoundingClientRect();

    setSelectedStudio(studio);

    if (startRect) {
       (window as any).__flipStartRect = startRect;
    }
  };

  const handleBack = () => {
    setSelectedStudio(null);
  };

  useEffect(() => {
    if (selectedStudio && detailNameRef.current && (window as any).__flipStartRect) {
      const endEl = detailNameRef.current;
      const startRect = (window as any).__flipStartRect;
      const endRect = endEl.getBoundingClientRect();

      const deltaX = startRect.left - endRect.left;
      const deltaY = startRect.top - endRect.top;
      const scale = startRect.width / endRect.width;

      endEl.animate([
        { transform: `translate(${deltaX}px, ${deltaY}px) scale(${scale})`, transformOrigin: 'top left' },
        { transform: 'none' }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
      });

      (window as any).__flipStartRect = null;
    }
  }, [selectedStudio]);

  if (!isVisible) return null;

  if (isLoading && studios.length === 0) {
    return (
       <div className="w-full h-full pt-32 flex items-center justify-center font-display text-2xl md:text-4xl animate-pulse text-off-black">
         ESTABLISHING UPLINK TO STUDIO DB...
       </div>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedStudio) {
    // Robust Image Selection for Banner
    const bannerSrc = selectedStudio.media.nodes[0]?.bannerImage || selectedStudio.media.nodes[0]?.coverImage.extraLarge;

    return (
      <div className="w-full min-h-screen pt-24 px-4 md:px-12 pb-12 bg-base-gray animate-slide-up">
        <button 
          onClick={handleBack}
          className="fixed top-24 right-4 md:right-12 z-50 px-6 py-2 bg-white border-2 border-off-black font-condensed font-bold uppercase hover:bg-off-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          Close Dossier
        </button>

        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="border-b-2 border-off-black pb-8 mb-12">
            <h1 
              ref={detailNameRef}
              className="font-display text-6xl md:text-8xl lg:text-9xl uppercase text-off-black leading-[0.85] break-all"
            >
              {selectedStudio.name}
            </h1>
            
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs md:text-sm tracking-widest text-gray-600">
               <span>EST. UNKNOWN</span>
               <span>//</span>
               <span>FAVOURITES: {selectedStudio.favourites.toLocaleString()}</span>
               <span>//</span>
               <span>CATALOG: {selectedStudio.media.nodes.length}+ TOP RATED</span>
               {selectedStudio.siteUrl && (
                 <>
                   <span>//</span>
                   <a href={selectedStudio.siteUrl} target="_blank" rel="noreferrer" className="text-accent-red hover:underline">OFFICIAL LINK ↗</a>
                 </>
               )}
            </div>

            {/* AI Generated Bio */}
            <div className="mt-8 max-w-2xl">
               <h3 className="font-condensed font-bold text-accent-red uppercase tracking-widest mb-2 text-sm">/// INTELLIGENCE REPORT</h3>
               <p className="font-sans text-lg md:text-xl font-light leading-relaxed text-off-black min-h-[60px]">
                 {isBioLoading ? (
                   <span className="animate-pulse bg-gray-300 text-transparent rounded">Loading intelligence data from Archive-X...</span>
                 ) : (
                   studioBio || `A renowned animation studio responsible for producing high-quality works such as ${selectedStudio.media.nodes[0]?.title.english}.`
                 )}
               </p>
            </div>
          </div>

          {/* Featured Banner */}
          {bannerSrc && (
             <div className="w-full aspect-[16/9] md:aspect-[21/9] mb-12 bg-black overflow-hidden border-2 border-off-black relative group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <img 
                  src={bannerSrc} 
                  alt="Banner" 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute bottom-0 left-0 p-4 md:p-6 bg-white text-off-black border-t-2 border-r-2 border-off-black max-w-[80%]">
                  <span className="font-condensed text-[10px] tracking-widest block mb-1 text-gray-500">FEATURED PRODUCTION</span>
                  <span className="font-display text-xl md:text-3xl uppercase leading-none">
                    {selectedStudio.media.nodes[0]?.title.english || selectedStudio.media.nodes[0]?.title.romaji}
                  </span>
                </div>
             </div>
          )}

          {/* Grid of Works */}
          <h2 className="font-condensed font-bold text-2xl uppercase mb-6 tracking-widest border-l-4 border-accent-red pl-4 text-off-black">Known Productions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedStudio.media.nodes.map((anime) => (
               <div key={anime.id} className="border-2 border-off-black bg-white group hover:shadow-[8px_8px_0px_0px_#D00000] transition-all duration-300 cursor-default">
                  <div className="aspect-video overflow-hidden border-b-2 border-off-black relative bg-black">
                    <img 
                      src={anime.bannerImage || anime.coverImage.extraLarge} 
                      alt={anime.title.english}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = anime.coverImage.extraLarge; // Fallback to vertical cover if banner fails
                      }}
                    />
                  </div>
                  <div className="p-4 flex flex-col h-32 justify-between">
                     <h3 className="font-display text-2xl uppercase leading-none line-clamp-2 group-hover:text-accent-red transition-colors text-off-black">
                       {anime.title.english || anime.title.romaji}
                     </h3>
                     <div className="flex justify-between items-end border-t border-gray-200 pt-2 mt-2">
                        <span className="font-mono text-xs text-gray-400">SYS_ID.{anime.id}</span>
                        <span className="font-condensed font-bold text-lg">{anime.averageScore}%</span>
                     </div>
                  </div>
               </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- MASONRY GRID VIEW ---
  return (
    <div className="w-full min-h-screen pt-32 px-4 md:px-12 pb-12 bg-base-gray">
       {/* Masonry Layout using Columns */}
      <div className="max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 pb-12">
        {studios.map((studio) => (
          <div 
            key={studio.id}
            onClick={() => handleStudioClick(studio)}
            className="group break-inside-avoid relative cursor-pointer"
            style={{ perspective: '1000px' }}
          >
            <div 
               className="w-full bg-white border-2 border-off-black p-6 transition-transform duration-100 ease-out shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[12px_12px_0px_0px_#D00000] group-hover:-translate-y-2 group-active:translate-y-0 group-active:shadow-none mb-8"
               style={{ 
                  transform: `
                    rotateY(${mousePos.x * 2}deg) 
                    rotateX(${-mousePos.y * 2}deg)
                  `,
                  transformStyle: 'preserve-3d'
               }}
            >
               {/* "Logo" Header */}
               <div className="flex justify-between items-start mb-6 border-b-2 border-off-black pb-4">
                  <div className="flex flex-col">
                     <span className="font-condensed text-[10px] uppercase tracking-widest text-gray-500">STUDIO_ID</span>
                     <span className="font-mono text-xs font-bold text-off-black">#{studio.id}</span>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center border border-black rounded-full group-hover:bg-off-black group-hover:text-white transition-colors">
                     <span className="font-display text-lg pt-1">↗</span>
                  </div>
               </div>

               {/* Studio Name (The Logo) */}
               <div ref={el => { if (el) nameRefs.current.set(studio.id, el) }} className="mb-6">
                  <h2 className="font-display text-5xl uppercase text-off-black leading-[0.85] break-words group-hover:text-accent-red transition-colors">
                     {studio.name}
                  </h2>
               </div>

               {/* Featured Media Snippet */}
               {studio.media.nodes[0] && (
                  <div className="relative w-full aspect-[3/2] border border-off-black overflow-hidden mb-4 bg-black">
                     <img 
                        src={studio.media.nodes[0].coverImage.extraLarge} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 object-top"
                        alt="Featured"
                     />
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
               )}

               {/* Footer Info */}
               <div className="flex justify-between items-end font-mono text-[10px] text-gray-500 uppercase">
                  <span>Likes: {(studio.favourites / 1000).toFixed(1)}K</span>
                  <span className="border-b border-transparent group-hover:border-accent-red group-hover:text-accent-red transition-all">View Dossier</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
