import React, { useState } from 'react';
import type { CardDTO } from '../../types/api';
import { InteractiveCard } from '../revolut/InteractiveCard';
import { Lock, Unlock, Eye, Plus, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CardsScreenProps {
  cards: CardDTO[];
  onToggleFreeze: (cardId: string) => void;
  onOpenCardDetails: (card: CardDTO) => void;
  onOrderCardClick: () => void;
  onOpenLimitsClick: (card: CardDTO) => void;
}

export const CardsScreen: React.FC<CardsScreenProps> = ({
  cards,
  onToggleFreeze,
  onOpenCardDetails,
  onOrderCardClick,
  onOpenLimitsClick,
}) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const currentCard = cards[selectedCardIndex] || cards[0];

  return (
    <div className="px-4 py-3 space-y-4 animate-fadeIn">
      {/* Screen Title & Order Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Cards</h1>
          <p className="text-xs text-revolut-muted">Физические и виртуальные карты ADG-Bank</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOrderCardClick}
          aria-label="Заказать новую карту"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] text-white transition-colors shadow-inner-light"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Featured 3D Interactive Card (Tilt + Flip with Glare) */}
      {currentCard && (
        <div className="space-y-2">
          <InteractiveCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
            onCardClick={() => onOpenCardDetails(currentCard)}
          />

          {/* Interactive Flip Hint */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-revolut-muted text-[11px] transition-colors"
            >
              <RefreshCw className={`w-3 h-3 transition-transform duration-300 ${isFlipped ? 'rotate-180' : ''}`} />
              <span>{isFlipped ? 'Показать лицевую сторону' : 'Перевернуть (CVV код)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Card Selector Pills if multiple cards */}
      {cards.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {cards.map((c, idx) => {
            const isSelected = selectedCardIndex === idx;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCardIndex(idx);
                  setIsFlipped(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-revolut-blue/20 text-white border-revolut-blue/50'
                    : 'bg-white/[0.04] text-white/60 border-white/[0.06] hover:text-white'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: c.colorGradient || '#0666EB' }}
                />
                <span className="font-mono">{c.cardNumber.slice(-4)}</span>
                <span className="text-[10px] opacity-70">
                  {c.type === 'PHYSICAL' ? 'Metal' : c.type === 'DISPOSABLE' ? 'Cyber' : 'Virtual'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Card Controls */}
      {currentCard && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentCard.isFrozen ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.08] text-white'
                }`}
              >
                {currentCard.isFrozen ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {currentCard.isFrozen ? 'Карта заморожена' : 'Карта активна'}
                </p>
                <p className="text-xs text-revolut-muted">
                  {currentCard.isFrozen ? 'Операции отклоняются' : 'Все платежи разрешены'}
                </p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleFreeze(currentCard.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-inner-light ${
                currentCard.isFrozen
                  ? 'bg-revolut-blue text-white hover:bg-revolut-blueHover'
                  : 'bg-white/[0.08] text-white hover:bg-white/[0.14]'
              }`}
            >
              {currentCard.isFrozen ? 'Разблокировать' : 'Заморозить'}
            </motion.button>
          </div>

          {/* Quick Settings Action Row */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenCardDetails(currentCard)}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center gap-3 text-left"
            >
              <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                <Eye className="w-4 h-4 text-revolut-platinum" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Реквизиты</span>
                <span className="text-[10px] text-revolut-muted">Показать CVV и PIN</span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenLimitsClick(currentCard)}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center gap-3 text-left"
            >
              <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-revolut-green" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Лимиты</span>
                <span className="text-[10px] text-revolut-muted font-sans tabular-nums">
                  До €{currentCard.spendingLimit} / мес
                </span>
              </div>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};
