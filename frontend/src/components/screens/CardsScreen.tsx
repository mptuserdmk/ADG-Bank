import React, { useState } from 'react';
import type { CardDTO } from '../../types/api';
import { CreditCard, Lock, Unlock, Eye, Plus, ShieldCheck } from 'lucide-react';

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
  const currentCard = cards[selectedCardIndex] || cards[0];

  return (
    <div className="px-4 py-3 space-y-5 animate-fadeIn">
      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Cards</h1>
          <p className="text-xs text-revolut-muted">Физические и виртуальные карты ADG-Bank</p>
        </div>
        <button 
          onClick={onOrderCardClick}
          aria-label="Заказать новую карту"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] text-white transition-colors active:scale-95 shadow-inner-light"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 snap-x snap-mandatory">
        {cards.map((c, idx) => {
          const isSelected = selectedCardIndex === idx;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedCardIndex(idx)}
              className={`w-[280px] h-[175px] rounded-2xl p-4 flex flex-col justify-between flex-shrink-0 cursor-pointer transition-all snap-center relative shadow-glass border ${
                isSelected
                  ? 'ring-2 ring-revolut-blue/80 scale-102 border-transparent'
                  : 'opacity-70 hover:opacity-90 border-white/[0.08]'
              }`}
              style={{ background: c.colorGradient || 'linear-gradient(135deg, #1f2429 0%, #0d0f12 100%)' }}
            >
              <div className="flex justify-between items-center text-white">
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                  ADG • {c.type}
                </span>
                <CreditCard className="w-5 h-5 opacity-90" />
              </div>

              {/* font-mono strictly for card number */}
              <div className="text-base font-mono tracking-widest text-white font-semibold">
                {c.cardNumber}
              </div>

              <div className="flex justify-between items-end text-white text-[11px]">
                <div>
                  <span className="text-[9px] opacity-70 block">Держатель</span>
                  <span className="font-semibold tracking-wide">{c.cardHolder}</span>
                </div>
                <div>
                  <span className="text-[9px] opacity-70 block">Срок</span>
                  <span className="font-mono">{c.expiryDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Card Controls */}
      {currentCard && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentCard.isFrozen ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.08] text-white'
              }`}>
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

            <button
              onClick={() => onToggleFreeze(currentCard.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-inner-light ${
                currentCard.isFrozen
                  ? 'bg-revolut-blue text-white hover:bg-revolut-blueHover'
                  : 'bg-white/[0.08] text-white hover:bg-white/[0.14]'
              }`}
            >
              {currentCard.isFrozen ? 'Разблокировать' : 'Заморозить'}
            </button>
          </div>

          {/* Quick Settings Action Row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onOpenCardDetails(currentCard)}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center gap-3 text-left active:scale-95"
            >
              <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                <Eye className="w-4 h-4 text-revolut-platinum" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Реквизиты</span>
                <span className="text-[10px] text-revolut-muted">Показать CVV и PIN</span>
              </div>
            </button>

            <button
              onClick={() => onOpenLimitsClick(currentCard)}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center gap-3 text-left active:scale-95"
            >
              <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-revolut-green" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Лимиты</span>
                <span className="text-[10px] text-revolut-muted font-sans tabular-nums">До €{currentCard.spendingLimit} / мес</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
