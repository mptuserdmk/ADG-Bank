import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Lock, Plus } from 'lucide-react';
import type { CardDTO } from '../../types/api';

interface HomeCardsCarouselProps {
  cards: CardDTO[];
  onCardClick?: (card: CardDTO) => void;
  onOrderCard?: () => void;
}

export const HomeCardsCarousel: React.FC<HomeCardsCarouselProps> = ({
  cards,
  onCardClick,
  onOrderCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const isDraggingRef = useRef(false);

  // Fallback if cards array is empty
  const safeCards = cards && cards.length > 0 ? cards : [];
  const currentCard = safeCards[currentIndex] || safeCards[0];

  const handleNext = () => {
    if (safeCards.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % safeCards.length);
  };

  const handlePrev = () => {
    if (safeCards.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + safeCards.length) % safeCards.length);
  };

  if (safeCards.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto px-4 py-4 text-center">
        <button
          onClick={onOrderCard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-white border border-white/10"
        >
          <Plus className="w-4 h-4" />
          <span>Выпустить карту</span>
        </button>
      </div>
    );
  }

  const isMetal = currentCard.type === 'PHYSICAL' || (currentCard.type as string) === 'METAL';

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center select-none">
      {/* Dots pagination indicator (as seen above balance on screenshot 1) */}
      <div className="flex items-center gap-1.5 mb-2.5">
        {safeCards.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Перейти к карте ${idx + 1}`}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? 'w-4 bg-white shadow-sm'
                : 'w-1.5 bg-white/25 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Swipeable Card Container with Framer Motion drag="x" */}
      <div className="relative w-full h-[150px] sm:h-[165px] flex justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentCard.id}
            custom={direction}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
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
              // Rule 1: Reset isDraggingRef after 50ms timeout to avoid false clicks
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 50);
            }}
            onClick={() => {
              // Rule 1: Ignore click if user was swiping
              if (isDraggingRef.current) return;
              onCardClick?.(currentCard);
            }}
            initial={{
              x: direction > 0 ? 120 : direction < 0 ? -120 : 0,
              opacity: 0,
              scale: 0.92,
            }}
            animate={{
              x: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              x: direction > 0 ? -120 : 120,
              opacity: 0,
              scale: 0.92,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 26,
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: currentCard.colorGradient || (
                isMetal
                  ? 'linear-gradient(135deg, #1C1F22 0%, #2A2E33 50%, #121417 100%)'
                  : currentCard.type === 'DISPOSABLE'
                  ? 'linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%)'
                  : 'linear-gradient(135deg, #4f56f1 0%, #984cff 100%)'
              ),
            }}
            className="w-[92%] sm:w-[94%] h-[180px] sm:h-[195px] rounded-t-[22px] rounded-b-[16px] p-4 flex flex-col justify-start relative shadow-2xl cursor-grab active:cursor-grabbing border border-white/20 overflow-hidden"
          >
            {/* Subtle card glow overlay */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top row: Brand & Contactless & Freeze Badge */}
            <div className="relative z-10 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-xs sm:text-sm drop-shadow">
                  ADG-Bank
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 backdrop-blur-sm text-white/90 font-medium">
                  {isMetal ? 'Metal' : currentCard.type === 'DISPOSABLE' ? 'Disposable' : 'Virtual'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {currentCard.isFrozen && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                    <Lock className="w-2.5 h-2.5" /> Заморожена
                  </span>
                )}
                <Wifi className="w-4 h-4 text-white/80 rotate-90" />
              </div>
            </div>

            {/* Middle row: EMV Chip & Card Number (kept in top/middle per Rule 2) */}
            <div className="relative z-10 flex items-center justify-between mt-1">
              {/* EMV Chip */}
              <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/40 shadow-inner flex items-center justify-center opacity-90">
                <div className="w-5 h-3.5 border border-amber-800/40 rounded-sm" />
              </div>

              {/* Card Number & Expiry */}
              <div className="text-right">
                <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white drop-shadow">
                  {currentCard.cardNumber}
                </span>
                <div className="text-[10px] text-white/70 font-mono">
                  {currentCard.expiryDate}
                </div>
              </div>
            </div>

            {/* Rule 2: Soft gradient mask at the bottom to blend under buttons */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#191C1F] via-[#191C1F]/75 to-transparent pointer-events-none z-10" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

