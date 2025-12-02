import React from 'react';

export const ProjectsView: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-base-gray pt-32 flex flex-col items-center overflow-hidden">
      <h1 className="font-display text-[26vw] leading-[0.8] uppercase tracking-tighter text-off-black w-full text-center animate-slide-up">
        Projects
      </h1>
      <div className="mt-12 max-w-2xl mx-auto px-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <p className="font-sans text-sm md:text-base text-off-black/70">
          Coming Soon...
        </p>
      </div>
    </div>
  );
};
