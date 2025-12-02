import React from 'react';

export const ContactView: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-base-gray pt-32 flex flex-col items-center overflow-hidden">
      <h1 className="font-display text-[30vw] leading-[0.8] uppercase tracking-tighter text-off-black w-full text-center animate-slide-up">
        Contact
      </h1>
      <div className="mt-12 max-w-2xl mx-auto px-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <p className="font-sans text-sm md:text-base text-off-black/70 mb-8">
          Get in touch with us.
        </p>
        <a href="mailto:hello@otakuarchive.com" className="block font-condensed font-bold text-xl md:text-3xl text-accent-red hover:underline">
          hello@otakuarchive.com
        </a>
      </div>
    </div>
  );
};
