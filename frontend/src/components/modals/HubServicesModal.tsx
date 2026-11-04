import React from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import { FileText, CreditCard, Shield, PieChart, Users, ArrowLeftRight, ChevronRight } from 'lucide-react';

interface HubServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExchange?: () => void;
  onOpenStatements: () => void;
  onOpenCards: () => void;
  onOpenAnalytics: () => void;
  onOpenSupport: () => void;
}

export const HubServicesModal: React.FC<HubServicesModalProps> = ({
  isOpen,
  onClose,
  onOpenExchange,
  onOpenStatements,
  onOpenCards,
  onOpenAnalytics,
  onOpenSupport,
}) => {
  const items = [
    ...(onOpenExchange
      ? [
          {
            title: 'Обмен валют',
            desc: 'Моментальная конвертация EUR, USD, RUB, GBP по межбанковскому курсу',
            icon: ArrowLeftRight,
            color: 'text-emerald-400',
            action: () => {
              onClose();
              onOpenExchange();
            },
          },
        ]
      : []),
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
      icon: Users,
      color: 'text-cyan-400',
      action: onOpenSupport,
    },
  ];

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Услуги и сервис">
      <div className="space-y-2">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="w-full p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-between transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-revolut-blue transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-revolut-muted leading-tight mt-0.5">
                    {item.desc}
                  </div>
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
