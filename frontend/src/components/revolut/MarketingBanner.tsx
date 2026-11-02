import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketingBannerProps {
  onBannerClick?: () => void;
}

export const MarketingBanner: React.FC<MarketingBannerProps> = ({ onBannerClick }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'Invite friends, earn €50',
      description: 'Earn €50 for each friend you invite by 26 March. T&C apply.',
      image: '/assets/3d/gift-box-3d.png',
      gradient: 'from-[#6b21a8]/40 via-[#3b0764]/20 to-transparent',
    },
    {
      title: 'Crypto with 0% fee',
      description: 'Trade Bitcoin and 50+ tokens with zero commission this week.',
      image: '/assets/3d/crypto-coin-3d.png',
      gradient: 'from-[#1e3a8a]/40 via-[#172554]/20 to-transparent',
    },
    {
      title: 'Invest from €1',
      description: 'Buy US & EU stocks with zero commission and instant execution.',
      image: '/assets/3d/invest-growth-3d.png',
      gradient: 'from-[#065f46]/40 via-[#022c22]/20 to-transparent',
    },
  ];

  const current = slides[activeSlide];

  return (
    <div className="px-4 py-2">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBannerClick}
        className={`relative p-4 rounded-card bg-gradient-to-r ${current.gradient} bg-revolut-cardSolid border border-white/[0.08] shadow-glass cursor-pointer overflow-hidden group transition-all`}
      >
        {/* Subtle glow highlight */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-revolut-purple/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1 pr-3">
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-1.5">
              <span>{current.title}</span>
              <ChevronRight className="w-4 h-4 text-revolut-muted group-hover:translate-x-0.5 transition-transform" />
            </h3>
            <p className="text-xs text-revolut-muted mt-1 leading-relaxed max-w-[220px]">
              {current.description}
            </p>
          </div>

          {/* 3D Illustration with floating animation */}
          <div className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0 relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={current.image}
                src={current.image}
                alt="Feature"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -4, 0],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  y: {
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  },
                  opacity: { duration: 0.2 },
                }}
                className="w-full h-full object-contain drop-shadow-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel indicators dots */}
        <div className="flex items-center gap-1.5 mt-2 relative z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
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
      </motion.div>
    </div>
  );
};
