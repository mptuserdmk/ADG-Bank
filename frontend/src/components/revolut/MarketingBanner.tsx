import React, { useState } from 'react';
import { Gift, Sparkles, ChevronRight } from 'lucide-react';

interface MarketingBannerProps {
  onBannerClick?: () => void;
}

export const MarketingBanner: React.FC<MarketingBannerProps> = ({ onBannerClick }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'Invite friends, earn €50',
      description: 'Earn €50 for each friend you invite by 26 March. T&C apply.',
      icon: Gift,
      gradient: 'from-[#6b21a8]/40 via-[#3b0764]/20 to-transparent',
      accentColor: 'text-purple-300',
    },
    {
      title: 'Crypto with 0% fee',
      description: 'Trade Bitcoin and 50+ tokens with zero commission this week.',
      icon: Sparkles,
      gradient: 'from-[#1e3a8a]/40 via-[#172554]/20 to-transparent',
      accentColor: 'text-blue-300',
    }
  ];

  const current = slides[activeSlide];
  const Icon = current.icon;

  return (
    <div className="px-4 py-2">
      <div 
        onClick={onBannerClick}
        className={`relative p-4 rounded-card bg-gradient-to-r ${current.gradient} bg-revolut-cardSolid border border-white/[0.08] shadow-glass cursor-pointer overflow-hidden group transition-all`}
      >
        {/* Subtle glow highlight */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-revolut-purple/20 rounded-full blur-2xl" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 pr-3">
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-1.5">
              <span>{current.title}</span>
              <ChevronRight className="w-4 h-4 text-revolut-muted group-hover:translate-x-0.5 transition-transform" />
            </h3>
            <p className="text-xs text-revolut-muted mt-1 leading-relaxed max-w-[240px]">
              {current.description}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white shadow-inner-light flex-shrink-0">
            <Icon className={`w-6 h-6 ${current.accentColor}`} />
          </div>
        </div>

        {/* Carousel indicators dots */}
        <div className="flex items-center gap-1.5 mt-3 relative z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all ${
                activeSlide === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

