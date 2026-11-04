import React from 'react';
import { Plus, ArrowUpRight, Info, MoreHorizontal, ChevronDown } from 'lucide-react';
import { NumberTicker } from '../ui/NumberTicker';
import { HomeCardsCarousel } from './HomeCardsCarousel';
import { motion } from 'framer-motion';
import type { CardDTO } from '../../types/api';

interface AccountHeroProps {
  balance: number;
  currency?: string;
  accountName?: string;
  accountsCount?: number;
  cards?: CardDTO[];
  onSelectAccountClick: () => void;
  onAddMoney: () => void;
  onTransfer: () => void;
  onDetails: () => void;
  onMore: () => void;
  onOpenCardDetails?: (card: CardDTO) => void;
  onOrderCard?: () => void;
}

export const AccountHero: React.FC<AccountHeroProps> = ({
  balance,
  currency = 'EUR',
  accountName = 'Main - EUR',
  cards = [],
  onSelectAccountClick,
  onAddMoney,
  onTransfer,
  onDetails,
  onMore,
  onOpenCardDetails,
  onOrderCard,
}) => {
  return (
    <section className="flex flex-col items-center justify-center pt-2 pb-2 px-4 text-center">
      {/* Account pill switcher (Preserved per Rule 3) */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onSelectAccountClick}
        aria-label="Выбрать активный счёт"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-semibold text-revolut-platinum mb-2 transition-all shadow-inner-light"
      >
        <span>Accounts</span>
        <ChevronDown className="w-3.5 h-3.5 text-revolut-muted" />
      </motion.button>

      {/* Main animated balance ticker (Zero-rerender) */}
      <div className="flex items-baseline justify-center gap-1.5 my-0.5">
        <NumberTicker
          value={balance}
          currency={currency}
          className="text-[42px] sm:text-[48px] font-medium tracking-tight text-white leading-none"
          symbolClassName="text-[26px] sm:text-[30px] font-normal text-revolut-platinum ml-1.5"
        />
      </div>

      {/* Account subtitle label */}
      <p className="text-xs font-medium text-revolut-muted mb-2 tracking-wide">
        {accountName}
      </p>

      {/* Interactive Swipeable Card Carousel (Rule 1 & Rule 2) */}
      <HomeCardsCarousel
        cards={cards}
        onCardClick={onOpenCardDetails}
        onOrderCard={onOrderCard}
      />

      {/* 4 Quick Actions in Pill Layout with relative z-10 -mt-6 overlay (Rule 2 & Rule 3) */}
      <div className="relative z-10 -mt-6 sm:-mt-8 grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-sm px-1">
        <ActionButton
          icon={<Plus className="w-5 h-5 text-white" />}
          label="Add money"
          onClick={onAddMoney}
        />
        {/* Changed from Exchange to Transfer as requested */}
        <ActionButton
          icon={<ArrowUpRight className="w-5 h-5 text-white" />}
          label="Transfer"
          onClick={onTransfer}
        />
        <ActionButton
          icon={<Info className="w-5 h-5 text-white" />}
          label="Details"
          onClick={onDetails}
        />
        <ActionButton
          icon={<MoreHorizontal className="w-5 h-5 text-white" />}
          label="More"
          onClick={onMore}
        />
      </div>
    </section>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({
  icon,
  label,
  onClick,
}) => (
  <motion.button
    whileHover={{ scale: 1.06, y: -2 }}
    whileTap={{ scale: 0.93 }}
    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    onClick={onClick}
    className="group flex flex-col items-center gap-1.5 focus:outline-none select-none"
  >
    {/* Dense backdrop-blur-md as specified in Rule 2 */}
    <div className="flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1C1F22]/90 backdrop-blur-md group-hover:bg-[#25292E] border border-white/[0.14] text-white shadow-xl transition-all">
      {icon}
    </div>
    <span className="text-[11px] sm:text-xs font-semibold text-revolut-platinum group-hover:text-white transition-colors">
      {label}
    </span>
  </motion.button>
);
