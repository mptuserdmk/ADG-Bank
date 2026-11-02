import React from 'react';
import { Home, LineChart, ArrowLeftRight, Bitcoin, Compass } from 'lucide-react';

export type TabKey = 'home' | 'invest' | 'transfers' | 'crypto' | 'lifestyle';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'invest', label: 'Invest', icon: LineChart },
    { key: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
    { key: 'crypto', label: 'Crypto', icon: Bitcoin },
    { key: 'lifestyle', label: 'Lifestyle', icon: Compass },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-safe">
      <div className="w-full max-w-[420px] px-4 pb-3 sm:pb-4 pointer-events-auto">
        <div className="flex items-center justify-around h-16 rounded-full bg-revolut-cardSolid/90 backdrop-blur-revolut border border-white/[0.08] shadow-float px-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onSelectTab(t.key)}
                className={`flex flex-col items-center justify-center flex-1 h-full rounded-full transition-all active:scale-95 ${
                  isActive ? 'text-white' : 'text-revolut-muted hover:text-revolut-platinum'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-white' : ''}`} />
                <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-white' : 'text-revolut-muted'}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

