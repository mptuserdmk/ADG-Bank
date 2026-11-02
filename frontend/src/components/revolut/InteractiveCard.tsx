import React from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import type { CardDTO } from '../../types/api';
import { Wifi } from 'lucide-react';

interface InteractiveCardProps {
  card: CardDTO;
  isFlipped: boolean;
  onFlip?: () => void;
  onCardClick?: () => void;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  card,
  isFlipped,
  onFlip,
  onCardClick,
}) => {
  // Motion values for smooth cursor tilt - ZERO useState on pointer move!
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glareOpacity = useMotionValue(0);

  const springConfig = { stiffness: 320, damping: 28 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);
  const glareOpacitySpring = useSpring(glareOpacity, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-14deg', '14deg']);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['15%', '85%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['15%', '85%']);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
    glareOpacity.set(0.45);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
    glareOpacity.set(0);
  };

  const isMetal = card.type === 'PHYSICAL' || (card.type as string) === 'METAL';

  return (
    <div className="w-full flex justify-center py-2">
      {/* Outer container: Tilt physics following pointer */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1000,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={onCardClick}
        className="relative w-full max-w-[360px] aspect-[1.586/1] select-none cursor-pointer"
      >
        {/* Inner container: 180° Flip animation isolated from Tilt */}
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full relative"
        >
          {/* ================= FRONT SIDE ================= */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className={`absolute inset-0 w-full h-full rounded-[22px] overflow-hidden p-6 flex flex-col justify-between border border-white/10 shadow-2xl ${
              isMetal
                ? 'bg-gradient-to-br from-[#1C1F22] via-[#2A2E33] to-[#121417]'
                : 'bg-gradient-to-br from-[#984CFF] via-[#0666EB] to-[#191C1F]'
            }`}
          >
            {/* Background Texture */}
            {isMetal ? (
              <img
                src="/assets/cards/card-metal.png"
                alt="Metal Card Skin"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <img
                src="/assets/cards/card-gradient.jpg"
                alt="Cyber Card Skin"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}

            {/* Dynamic Glare Overlay */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
              style={{
                background: useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.7) 0%, transparent 60%)`,
                opacity: glareOpacitySpring,
              }}
            />

            {/* Top row: Revolut R + Contactless */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/cards/revolut-r.svg"
                  alt="Revolut"
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="font-bold tracking-tight text-white text-base">ADG-Bank</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Wifi className="w-5 h-5 rotate-90" />
              </div>
            </div>

            {/* Middle row: EMV Chip */}
            <div className="relative z-10 my-auto">
              <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/40 shadow-inner flex items-center justify-center opacity-90">
                <div className="w-6 h-4 border border-amber-800/40 rounded-sm" />
              </div>
            </div>

            {/* Bottom row: Card Number, Expiry, Name & Brand */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-lg font-medium tracking-widest text-white drop-shadow">
                  {card.cardNumber || '•••• •••• •••• 9169'}
                </span>
                <span className="font-mono text-xs text-white/70">
                  {card.expiryDate || '12/28'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white/80 tracking-wider uppercase">
                  {card.cardHolder || 'DYLAN E.'}
                </span>
                <img
                  src="/assets/cards/mastercard.svg"
                  alt="Mastercard"
                  className="w-10 h-6 object-contain drop-shadow"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Frozen banner if inactive */}
            {card.isFrozen && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold text-xs border border-cyan-500/40">
                  Заморожена
                </span>
              </div>
            )}
          </div>

          {/* ================= BACK SIDE (180° Flip) ================= */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 w-full h-full rounded-[22px] overflow-hidden flex flex-col justify-between border border-white/10 shadow-2xl bg-[#141619] text-white"
          >
            {/* Magnetic Stripe */}
            <div className="w-full h-11 bg-black/90 mt-5 border-y border-white/5" />

            {/* Signature Strip + CVV */}
            <div className="px-6 my-auto">
              <div className="flex items-center justify-between gap-3 bg-white/95 text-black px-4 py-2 rounded-md shadow-inner">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider select-none">
                  Authorized Signature
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-900">
                  <span className="text-[10px] text-zinc-400">CVV</span>
                  <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                    {card.cvv || '842'}
                  </span>
                </div>
              </div>
            </div>

            {/* Regulatory and Security info */}
            <div className="px-6 pb-5 flex items-center justify-between text-[9px] text-white/50">
              <p className="max-w-[200px] leading-tight">
                ADG-Bank Ltd. Authorized financial institution. For 24/7 support call +44 20 3322 8352.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlip?.();
                }}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-medium transition-colors"
              >
                Лицевая ↺
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
