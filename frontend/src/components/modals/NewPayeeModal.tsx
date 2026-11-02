import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { PayeeDTO } from '../../types/api';
import { UserPlus } from 'lucide-react';

interface NewPayeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayee: (payee: PayeeDTO) => void;
}

export const NewPayeeModal: React.FC<NewPayeeModalProps> = ({ isOpen, onClose, onAddPayee }) => {
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('ADG000100');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newPayee: PayeeDTO = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      initials: initials || 'US',
      accountNumber: accountNumber.trim() || `ADG${Math.floor(1000000 + Math.random() * 9000000)}`,
      accountId: Math.floor(10 + Math.random() * 90),
    };

    onAddPayee(newPayee);
    setName('');
    onClose();
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Новый контакт">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-revolut-muted block mb-1">
            Имя получателя
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Александр Смирнов"
            className="w-full h-11 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white placeholder-revolut-muted focus:outline-none focus:border-revolut-blue"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-revolut-muted block mb-1">
            Номер счёта или IBAN
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="ADG0001009 или EE89..."
            className="w-full h-11 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white font-mono placeholder-revolut-muted focus:outline-none focus:border-revolut-blue"
          />
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 shadow-inner-light mt-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Сохранить контакт</span>
        </button>
      </form>
    </ModalSheet>
  );
};
