import React from 'react';
import type { PayeeDTO } from '../../types/api';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecentPayeesProps {
  payees: PayeeDTO[];
  onSelectPayee: (payee: PayeeDTO) => void;
  onNewPayee: () => void;
}

const getPayeeAvatar = (name: string): string | null => {
  const lower = name.toLowerCase();
  if (lower.includes('mario')) return '/assets/avatars/mario.png';
  if (lower.includes('dylan')) return '/assets/avatars/dylan.svg';
  if (lower.includes('louis')) return '/assets/avatars/louis.svg';
  if (lower.includes('sarah')) return '/assets/avatars/sarah.svg';
  if (lower.includes('alex')) return '/assets/avatars/alex.svg';
  if (lower.includes('john')) return '/assets/avatars/john.svg';
  return null;
};

export const RecentPayees: React.FC<RecentPayeesProps> = ({
  payees,
  onSelectPayee,
  onNewPayee,
}) => {
  return (
    <section className="px-4 py-3">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">Recent payees</h2>
      </div>

      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
        {/* New payee button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={onNewPayee}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
        >
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/[0.06] group-hover:bg-white/[0.12] border border-dashed border-white/20 flex items-center justify-center text-revolut-platinum transition-all shadow-inner-light">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-revolut-muted group-hover:text-white transition-colors">
            New
          </span>
        </motion.button>

        {/* Existing payees */}
        {payees.map((p) => {
          const avatarSrc = p.avatarUrl || getPayeeAvatar(p.name);
          return (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onSelectPayee(p)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-revolut-cardSolid to-white/[0.15] border border-white/[0.1] overflow-hidden flex items-center justify-center text-white font-semibold text-sm shadow-inner-light transition-all">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{p.initials}</span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-revolut-platinum group-hover:text-white transition-colors max-w-[56px] truncate">
                {p.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
