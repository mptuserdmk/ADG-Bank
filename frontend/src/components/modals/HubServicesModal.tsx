import React from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import { FileText, CreditCard, Shield, PieChart, Users, HelpCircle, ChevronRight } from 'lucide-react';

interface HubServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStatements: () => void;
  onOpenCards: () => void;
  onOpenAnalytics: () => void;
  onOpenSupport: () => void;
}

export const HubServicesModal: React.FC<HubServicesModalProps> = ({
  isOpen,
  onClose,
  onOpenStatements,
  onOpenCards,
  onOpenAnalytics,
  onOpenSupport,
}) => {
  const items = [
    {
      title: 'Выписки и справки',
      desc: 'Официальные PDF выписки для посольств и налоговой',
      icon: FileText,
      color: 'text-blue-400',
      action: onOpenStatements,
    },
    {
      title: 'Управление картами',
      desc: 'Выпуск виртуальных карт, смена PIN, заморозка',
      icon: CreditCard,
      color: 'text-pink-400',
      action: onOpenCards,
    },
    {
      title: 'Аналитика и бюджет',
      desc: 'Категории трат, лимиты и статистика за месяц',
      icon: PieChart,
      color: 'text-orange-400',
      action: onOpenAnalytics,
    },
    {
      title: 'Безопасность счёта',
      desc: 'Биометрия, двухфакторная аутентификация',
      icon: Shield,
      color: 'text-green-400',
      action: () => alert('Безопасность: 2FA и FaceID активированы'),
    },
    {
      title: 'Совместные расходы',
      desc: 'Разделить счёт за ужин или аренду с друзьями',
      icon: Users,
      color: 'text-purple-400',
      action: onOpenStatements,
    },
    {
      title: 'Чат с поддержкой 24/7',
      desc: 'Круглосуточная помощь финансового эксперта',
      icon: HelpCircle,
      color: 'text-cyan-400',
      action: onOpenSupport,
    },
  ];

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Сервисы ADG-Bank">
      <div className="space-y-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => {
                onClose();
                item.action();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center text-white shadow-inner-light group-hover:scale-105 transition-transform">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-[11px] text-revolut-muted mt-0.5">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-revolut-muted group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>
    </ModalSheet>
  );
};

