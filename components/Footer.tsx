import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface FooterProps {
  onNotFound?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
}

interface PhysicsLetterProps {
  letter: string;
  index: number;
  onImpact: (index: number, force: number) => void;
}

export interface PhysicsLetterRef {
  applyImpulse: (force: { x: number; y: number }) => void;
  getRect: () => DOMRect | null;
}

const PhysicsLetter = forwardRef<PhysicsLetterRef, PhysicsLetterProps>(({ letter, index, onImpact }, ref) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [weightClass, setWeightClass] = useState('font-thin');
  const [isHovered, setIsHovered] = useState(false);
  
  // Physics state
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });
  const returning = useRef(false);
  const dragPointerId = useRef<number | null>(null);
  
  // Idle animation state
  const idleOffset = useRef({ x: 0, y: 0, r: 0 });

  useImperativeHandle(ref, () => ({
    applyImpulse: (force: { x: number; y: number }) => {
      vel.current.x += force.x;
      vel.current.y += force.y;
      returning.current = false;
    },
    getRect: () => elementRef.current?.getBoundingClientRect() ?? null
  }));

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const weights = ['font-thin', 'font-light', 'font-normal', 'font-medium', 'font-bold'];
    
    const startAnimation = () => {
        intervalId = setInterval(() => {
            const randomWeight = weights[Math.floor(Math.random() * weights.length)];
            setWeightClass(randomWeight);
            
            idleOffset.current = {
                x: (Math.random() * 10 - 5),
                y: (Math.random() * 10 - 5),
                r: (Math.random() * 10 - 5)
            };
        }, 1500 + Math.random() * 2000);
    };

    const timeoutId = setTimeout(startAnimation, Math.random() * 2000);

    return () => {
        clearTimeout(timeoutId);
        if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    
    const loop = () => {
        if (!isDragging.current) {
            const k = 0.08;
            const d = 0.8;

            const ax = -k * pos.current.x;
            const ay = -k * pos.current.y;

            vel.current.x += ax;
            vel.current.y += ay;
            vel.current.x *= d;
            vel.current.y *= d;

            pos.current.x += vel.current.x;
            pos.current.y += vel.current.y;
            
            if (returning.current) {
                const dist = Math.sqrt(pos.current.x ** 2 + pos.current.y ** 2);
                const speed = Math.sqrt(vel.current.x ** 2 + vel.current.y ** 2);
                if (dist < 10 && speed > 2) {
                    returning.current = false;
                    onImpact(index, speed);
                }
            }
        }

        if (elementRef.current) {
            const x = pos.current.x + idleOffset.current.x;
            const y = pos.current.y + idleOffset.current.y;
            const hoverY = isHovered ? -10 : 0;
            const hoverR = isHovered ? (index % 2 === 0 ? 15 : -15) : 0;
            
            const finalX = x;
            const finalY = y + hoverY;
            const finalR = (vel.current.x * 0.3) + idleOffset.current.r + hoverR;

            elementRef.current.style.transform = `translate(${finalX}px, ${finalY}px) rotate(${finalR}deg) scale(1)`;
        }
        
        animationFrameId = requestAnimationFrame(loop);
    };
    
    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [index, isHovered, onImpact]);

  return (
    <span 
      ref={elementRef}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
          e.stopPropagation();
          if (dragPointerId.current !== null) return;

          dragPointerId.current = e.pointerId;
          isDragging.current = true;
          returning.current = false;
          dragStart.current = { x: e.clientX, y: e.clientY };
          initialPos.current = { ...pos.current };
          (e.target as Element).setPointerCapture(e.pointerId);
          setIsHovered(true);
      }}
      onPointerMove={(e) => {
          if (isDragging.current && e.pointerId === dragPointerId.current) {
              e.stopPropagation();
              const dx = e.clientX - dragStart.current.x;
              const dy = e.clientY - dragStart.current.y;
              pos.current = { x: initialPos.current.x + dx, y: initialPos.current.y + dy };
              vel.current = { x: dx * 0.2, y: dy * 0.2 };
          }
      }}
      onPointerUp={(e) => {
          if (e.pointerId === dragPointerId.current) {
              e.stopPropagation();
              isDragging.current = false;
              returning.current = true;
              dragPointerId.current = null;
              (e.target as Element).releasePointerCapture(e.pointerId);
              if (e.pointerType === 'touch') {
                  setIsHovered(false);
              }
          }
      }}
      onPointerCancel={(e) => {
          if (e.pointerId === dragPointerId.current) {
              e.stopPropagation();
              isDragging.current = false;
              returning.current = true;
              dragPointerId.current = null;
              (e.target as Element).releasePointerCapture(e.pointerId);
              setIsHovered(false);
          }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging.current && setIsHovered(false)}
      className={`
        inline-block transition-colors duration-700 ease-in-out
        ${isHovered ? 'font-black' : weightClass}
        cursor-grab active:cursor-grabbing select-none
        relative
      `}
      style={{
        textShadow: '4px 4px 0px #D00000',
        zIndex: isDragging.current || isHovered ? 9999 : 10,
        touchAction: 'none'
      }}
    >
      {letter}
    </span>
  );
});

const Scribbles = () => (
  <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-visible z-0">
    {/* Top Left Sparkle */}
    <svg className="absolute top-[-10%] left-[2%] md:top-[0%] md:left-[5%] w-[12vw] h-[12vw] text-accent-red animate-pulse opacity-80" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>

    {/* Top Right Circle */}
    <div className="absolute top-[5%] right-[5%] md:top-[5%] md:right-[5%] w-[8vw] h-[8vw] border-[4px] border-white rounded-full opacity-40"></div>

    {/* Bottom Left Crosses */}
    <div className="absolute bottom-[5%] left-[2%] md:bottom-[15%] md:left-[20%] flex gap-2 opacity-60">
       <svg className="w-[6vw] h-[6vw] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 0V24M0 12H24"/></svg>
       <svg className="w-[6vw] h-[6vw] text-accent-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 0V24M0 12H24"/></svg>
    </div>

    {/* Bottom Right Zigzag */}
    <svg className="absolute bottom-[10%] right-[2%] md:bottom-[10%] md:right-[20%] w-[20vw] h-[8vw] text-accent-red opacity-80" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
       <path d="M2,15 L15,2 L30,28 L45,2 L60,28 L75,2 L98,15" />
    </svg>
    
    {/* Floating Triangle */}
    <svg className="absolute top-[30%] left-[5%] md:top-[40%] md:left-[2%] md:right-auto w-[5vw] h-[5vw] text-white opacity-30 rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L22 22H2L12 2Z" />
    </svg>
  </div>
);

export const Footer: React.FC<FooterProps> = ({ onNotFound, onVisibilityChange }) => {
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const letterRefs = useRef<(PhysicsLetterRef | null)[]>([]);

  const handleImpact = (index: number, force: number) => {
      const originRef = letterRefs.current[index];
      if (!originRef) return;
      
      const originRect = originRef.getRect();
      if (!originRect) return;
      
      const centerX = originRect.left + originRect.width / 2;
      const centerY = originRect.top + originRect.height / 2;

      letterRefs.current.forEach((ref, i) => {
          if (i === index || !ref) return;
          
          const rect = ref.getRect();
          if (!rect) return;
          
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;
          
          const dx = targetX - centerX;
          const dy = targetY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Impact radius - roughly 2 letters width/height
          if (dist < 250) { 
              const strength = (1 - dist / 250) * Math.min(force * 2, 20); // Reduced force
              const angle = Math.atan2(dy, dx);
              
              ref.applyImpulse({
                  x: Math.cos(angle) * strength,
                  y: Math.sin(angle) * strength
              });
          }
      });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
        onVisibilityChange?.(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, [onVisibilityChange]);

  return (
    <footer 
      ref={footerRef}
      className={`w-full min-h-screen flex flex-col justify-between bg-black text-white relative z-40 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <style>{`
        @keyframes slide-up-fade {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up-fade {
          animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes marquee-arrival {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-arrival {
          animation: marquee-arrival 1.5s cubic-bezier(0.16, 1, 0.3, 1) 1.8s forwards, marquee 20s linear infinite 3.3s;
        }
      `}</style>

      {/* Anime Life Physics Text */}
      <div className="flex-grow flex items-center justify-center w-full translate-y-8 md:translate-y-12 relative">
        <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <Scribbles />
        </div>
        <div className="flex flex-wrap justify-center w-full px-4 relative z-10">
          {"ANIME LIFE".split("").map((char, i) => (
            char === " " ? <span key={i} className="basis-full h-4 md:basis-auto md:w-[6vw] md:h-auto"></span> :
            <div 
                key={i} 
                className={`text-[35vw] md:text-[18vw] leading-[0.8] font-condensed tracking-tighter ${isVisible ? 'animate-slide-up-fade' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 0.1}s` }}
            >
               <PhysicsLetter 
                 ref={(el) => letterRefs.current[i] = el}
                 letter={char} 
                 index={i} 
                 onImpact={handleImpact}
               />
            </div>
          ))}
        </div>
      </div>
      {/* Top Section: Copyright & Links */}
      <div className="flex-grow px-6 py-12 md:px-12 flex flex-col md:flex-row justify-end md:justify-between items-start md:items-end gap-8">
        
        {/* Left: Copyright */}
        <div className={`flex items-center gap-4 ${isVisible ? 'animate-slide-up-fade' : 'opacity-0'}`} style={{ animationDelay: '1.0s' }}>
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
        <div className="flex flex-row w-full md:w-auto justify-start gap-8 md:gap-16">
            <div className={`flex flex-col gap-2 text-left ${isVisible ? 'animate-slide-up-fade' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-2">Sitemap</span>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">Showcase</a>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">About</a>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">Projects</a>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">Contact</a>
                <button onClick={onNotFound} className="text-left font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">404 Page</button>
            </div>

            <div className={`flex flex-col gap-2 text-left ${isVisible ? 'animate-slide-up-fade' : 'opacity-0'}`} style={{ animationDelay: '1.4s' }}>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-2">Socials</span>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">Instagram</a>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">Twitter</a>
                <a href="#" className="font-condensed font-bold uppercase tracking-widest text-sm hover:text-accent-red transition-colors">LinkedIn</a>
            </div>
        </div>
      </div>

      {/* Bottom: Marquee */}
      <div className={`w-full bg-accent-red text-black overflow-hidden py-4 md:py-8 flex transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '1.8s' }}>
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
