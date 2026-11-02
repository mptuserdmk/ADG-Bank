import React from 'react';
import { Plus, ArrowLeftRight, Info, MoreHorizontal, ChevronDown } from 'lucide-react';
import { NumberTicker } from '../ui/NumberTicker';
import { motion } from 'framer-motion';

interface AccountHeroProps {
  balance: number;
  currency?: string;
  accountName?: string;
  accountsCount?: number;
  onSelectAccountClick: () => void;
  onAddMoney: () => void;
  onExchange: () => void;
  onDetails: () => void;
  onMore: () => void;
}

export const AccountHero: React.FC<AccountHeroProps> = ({
  balance,
  currency = 'EUR',
  accountName = 'Main - EUR',
  onSelectAccountClick,
  onAddMoney,
  onExchange,
  onDetails,
  onMore,
}) => {
  return (
    <section className="flex flex-col items-center justify-center pt-3 pb-5 px-4 text-center">
      {/* Account pill switcher */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onSelectAccountClick}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-semibold text-revolut-platinum mb-2 transition-all shadow-inner-light"
      >
        <span>Accounts</span>
        <ChevronDown className="w-3.5 h-3.5 text-revolut-muted" />
      </motion.button>

      {/* Main animated balance ticker (Zero-rerender) */}
      <div className="flex items-baseline justify-center gap-1.5 my-1">
        <NumberTicker
          value={balance}
          currency={currency}
          className="text-[44px] sm:text-[50px] font-medium tracking-tight text-white leading-none"
          symbolClassName="text-[28px] sm:text-[32px] font-normal text-revolut-platinum ml-1.5"
        />
      </div>

      {/* Account subtitle label */}
      <p className="text-xs font-medium text-revolut-muted mb-6 tracking-wide">
        {accountName}
      </p>

      {/* 4 Quick Actions in Pill Layout with spring tactile feedback */}
      <div className="grid grid-cols-4 gap-3 sm:gap-5 w-full max-w-sm">
        <ActionButton icon={<Plus className="w-5 h-5" />} label="Add money" onClick={onAddMoney} />
        <ActionButton icon={<ArrowLeftRight className="w-5 h-5" />} label="Exchange" onClick={onExchange} />
        <ActionButton icon={<Info className="w-5 h-5" />} label="Details" onClick={onDetails} />
        <ActionButton icon={<MoreHorizontal className="w-5 h-5" />} label="More" onClick={onMore} />
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
    className="group flex flex-col items-center gap-2 focus:outline-none"
  >
    <div className="flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/[0.08] group-hover:bg-white/[0.14] border border-white/[0.08] text-white shadow-inner-light transition-colors">
      {icon}
    </div>
    <span className="text-[11px] sm:text-xs font-semibold text-revolut-platinum group-hover:text-white transition-colors">
      {label}
    </span>
  </motion.button>
);
