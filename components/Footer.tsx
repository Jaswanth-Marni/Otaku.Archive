import React, { useEffect, useRef, useState } from 'react';

interface FooterProps {
  onNotFound?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNotFound }) => {
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer 
      ref={footerRef}
      className={`w-full min-h-screen flex flex-col justify-between bg-black text-white relative overflow-hidden z-40 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <style>{`
        @keyframes marquee-arrival {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-arrival {
          animation: marquee-arrival 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, marquee 20s linear infinite 1.5s;
        }
      `}</style>
      
      {/* Top Section: Copyright & Links */}
      <div className="flex-grow px-6 py-12 md:px-12 flex flex-col md:flex-row justify-center md:justify-between items-start md:items-center gap-8">
        
        {/* Left: Copyright */}
        <div className={`flex items-center gap-4 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
           <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Otaku" 
                alt="Avatar" 
                className="w-full h-full object-cover opacity-80"
              />
           </div>
           <div className="flex flex-col">
              <span className="font-condensed font-bold uppercase tracking-widest text-sm">Otaku Archive</span>
              <span className="font-mono text-[10px] text-gray-400">© 2025 ALL RIGHTS RESERVED</span>
           </div>
        </div>

        {/* Center/Right: Navigation */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div className={`flex flex-col gap-2 text-left ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-2">Sitemap</span>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">Showcase</a>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">About</a>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">Projects</a>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">Contact</a>
                <button onClick={onNotFound} className="text-left font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">404 Page</button>
            </div>

            <div className={`flex flex-col gap-2 text-left ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-2">Socials</span>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">Instagram</a>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">Twitter</a>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">LinkedIn</a>
            </div>
        </div>
      </div>

      {/* Bottom: Marquee */}
      <div className={`w-full bg-accent-red text-black overflow-hidden py-4 md:py-8 flex transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
         <div className={`whitespace-nowrap flex-shrink-0 flex items-center ${isVisible ? 'animate-marquee-arrival' : ''}`}>
            <span className="font-display text-[15vw] leading-[0.8] tracking-tighter mx-4">
              OTAKU<span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>.ARCHIVE</span>
            </span>
            <span className="font-display text-[15vw] leading-[0.8] tracking-tighter mx-4">
              OTAKU<span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>.ARCHIVE</span>
            </span>
         </div>
         <div className={`whitespace-nowrap flex-shrink-0 flex items-center ${isVisible ? 'animate-marquee-arrival' : ''}`}>
            <span className="font-display text-[15vw] leading-[0.8] tracking-tighter mx-4">
              OTAKU<span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>.ARCHIVE</span>
            </span>
            <span className="font-display text-[15vw] leading-[0.8] tracking-tighter mx-4">
              OTAKU<span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>.ARCHIVE</span>
            </span>
         </div>
      </div>
    </footer>
  );
};
