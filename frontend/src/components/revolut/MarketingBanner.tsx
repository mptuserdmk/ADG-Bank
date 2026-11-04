import React, { useState, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketingBannerProps {
  onBannerClick?: () => void;
}

export const MarketingBanner: React.FC<MarketingBannerProps> = ({ onBannerClick }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const isDraggingRef = useRef(false);

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

  const handleNext = () => {
    setDirection(1);
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[activeSlide];

  return (
    <div className="px-4 py-2 select-none">
      <div className="relative overflow-hidden rounded-card">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeSlide}
            custom={direction}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragStart={() => {
              isDraggingRef.current = true;
            }}
            onDragEnd={(_, info) => {
              const offset = info.offset.x;
              const velocity = info.velocity.x;
              if (offset < -40 || velocity < -250) {
                handleNext();
              } else if (offset > 40 || velocity > 250) {
                handlePrev();
              }
              // Rule 1: Reset isDraggingRef after 50ms timeout to prevent false click
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 50);
            }}
            onClick={() => {
              // Rule 1: Ignore click if user was swiping
              if (isDraggingRef.current) return;
              onBannerClick?.();
            }}
            initial={{
              x: direction > 0 ? 160 : direction < 0 ? -160 : 0,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            exit={{
              x: direction > 0 ? -160 : 160,
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 28,
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-4 rounded-card bg-gradient-to-r ${current.gradient} bg-revolut-cardSolid border border-white/[0.08] shadow-glass cursor-grab active:cursor-grabbing overflow-hidden group transition-all`}
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

              {/* 3D Illustration with smooth floating */}
              <div className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0 relative">
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-full object-contain drop-shadow-xl pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Carousel indicators dots */}
            <div className="flex items-center gap-1.5 mt-2.5 relative z-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Перейти к слайду ${idx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(idx > activeSlide ? 1 : -1);
                    setActiveSlide(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeSlide === idx ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
