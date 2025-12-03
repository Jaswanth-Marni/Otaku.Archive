import React from 'react';

export const SettingsView: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-base-gray pt-24 px-6 md:px-12 pb-12 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter text-off-black dark:text-white mb-8 border-b-2 border-off-black pb-4">
          SYSTEM SETTINGS
        </h1>

        <div className="space-y-8">
          {/* System Status */}
          <div className="bg-white dark:bg-black border-2 border-off-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-condensed font-bold text-2xl uppercase tracking-widest text-off-black dark:text-white mb-4">
              System Status
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
                <span className="font-mono text-sm text-off-black dark:text-white">NEURAL LINK (AI)</span>
                <span className="font-mono text-xs text-green-500 font-bold animate-pulse">ONLINE</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
                <span className="font-mono text-sm text-off-black dark:text-white">DATABASE CONNECTION</span>
                <span className="font-mono text-xs text-green-500 font-bold">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="font-mono text-sm text-off-black dark:text-white">VERSION</span>
                <span className="font-mono text-xs text-gray-500">v2.0.4 (BETA)</span>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-black border-2 border-off-black p-8 opacity-50 pointer-events-none grayscale">
            <h2 className="font-condensed font-bold text-2xl uppercase tracking-widest text-off-black dark:text-white mb-4">
              Account Management
            </h2>
            <p className="font-mono text-xs text-accent-red mb-4">
              [FEATURE LOCKED: COMING SOON]
            </p>
            <div className="space-y-4">
              <div className="h-10 bg-base-gray w-full border border-gray-300"></div>
              <div className="h-10 bg-base-gray w-2/3 border border-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
