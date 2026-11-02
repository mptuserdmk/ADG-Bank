import React from 'react';

interface DesktopShellProps {
  children: React.ReactNode;
}

export const DesktopShell: React.FC<DesktopShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#121417] flex justify-center items-start sm:py-6 selection:bg-revolut-blue selection:text-white">
      {/* Smartphone Mockup Container for Desktop / 100% on Mobile */}
      <div className="w-full sm:max-w-[420px] min-h-screen bg-revolut-canvas text-white relative sm:shadow-2xl sm:rounded-[36px] sm:border border-white/[0.08] flex flex-col overflow-x-hidden sm:ring-1 sm:ring-white/[0.05]">
        {/* Top speaker notch decoration for desktop presentation */}
        <div className="hidden sm:flex justify-center pt-2 pb-1 bg-transparent">
          <div className="w-24 h-4 bg-black/40 rounded-full flex items-center justify-center">
            <div className="w-8 h-1 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col pb-24">
          {children}
        </div>
      </div>
    </div>
  );
};

