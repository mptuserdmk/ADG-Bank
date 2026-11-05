import React, { useMemo } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { AccountDTO, TransactionDTO, CardDTO, PayeeDTO } from '../../types/api';
import type { CryptoCoin } from './CryptoTradeModal';
import type { StockItem } from './StockTradeModal';
import {
  Search,
  Wallet,
  CreditCard,
  ArrowRightLeft,
  ArrowRight,
  Send,
  PlusCircle,
  BarChart3,
  X
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  accounts: AccountDTO[];
  cards: CardDTO[];
  transactions: TransactionDTO[];
  payees: PayeeDTO[];
  onSelectAccount: (accountId: number) => void;
  onSelectCard: (card: CardDTO) => void;
  onSelectTransaction: (tx: TransactionDTO) => void;
  onSelectPayee: (payee: PayeeDTO) => void;
  onSelectCrypto: (coin: CryptoCoin) => void;
  onSelectStock: (stock: StockItem) => void;
  onQuickAction: (action: 'transfer' | 'exchange' | 'addMoney' | 'orderCard' | 'openAccount' | 'analytics') => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  accounts,
  cards,
  transactions,
  payees,
  onSelectAccount,
  onSelectCard,
  onSelectTransaction,
  onSelectPayee,
  onSelectCrypto,
  onSelectStock,
  onQuickAction,
}) => {
  const allCoins: CryptoCoin[] = [
    { name: 'Bitcoin', symbol: 'BTC', price: '64,280.00', change: '+3.4%', isPos: true },
    { name: 'Ethereum', symbol: 'ETH', price: '3,450.10', change: '+1.9%', isPos: true },
    { name: 'Solana', symbol: 'SOL', price: '142.30', change: '-2.1%', isPos: false },
    { name: 'Toncoin', symbol: 'TON', price: '5.85', change: '+5.7%', isPos: true },
  ];

  const allStocks: StockItem[] = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: '189.45', change: '+1.84%', isPos: true },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', price: '875.20', change: '+4.20%', isPos: true },
    { ticker: 'TSLA', name: 'Tesla Inc.', price: '172.60', change: '-0.95%', isPos: false },
    { ticker: 'MSFT', name: 'Microsoft', price: '420.55', change: '+0.75%', isPos: true },
  ];

  const q = searchQuery.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) {
      return {
        hasQuery: false,
        accounts: [],
        cards: [],
        transactions: [],
        payees: [],
        crypto: [],
        stocks: [],
        quickActions: [
          { key: 'transfer' as const, label: 'Перевести средства', icon: Send },
          { key: 'exchange' as const, label: 'Обмен валюты', icon: ArrowRightLeft },
          { key: 'addMoney' as const, label: 'Пополнить баланс', icon: PlusCircle },
          { key: 'orderCard' as const, label: 'Выпустить карту', icon: CreditCard },
          { key: 'openAccount' as const, label: 'Открыть новый счёт', icon: Wallet },
          { key: 'analytics' as const, label: 'Аналитика расходов', icon: BarChart3 },
        ],
      };
    }

    const matchedAccounts = accounts.filter(
      (a) => a.accountNumber.toLowerCase().includes(q) || a.currency.toLowerCase().includes(q)
    );

    const matchedCards = cards.filter(
      (c) =>
        c.cardNumber.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.cardHolder && c.cardHolder.toLowerCase().includes(q))
    );

    const matchedTransactions = transactions.filter(
      (tx) =>
        (tx.merchantName && tx.merchantName.toLowerCase().includes(q)) ||
        (tx.description && tx.description.toLowerCase().includes(q)) ||
        (tx.category && tx.category.toLowerCase().includes(q)) ||
        tx.amount.toString().includes(q)
    );

    const matchedPayees = payees.filter(
      (p) => p.name.toLowerCase().includes(q) || p.accountNumber.toLowerCase().includes(q)
    );

    const matchedCrypto = allCoins.filter(
      (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );

    const matchedStocks = allStocks.filter(
      (s) => s.name.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q)
    );

    const allActions = [
      { key: 'transfer' as const, label: 'Перевести средства', icon: Send },
      { key: 'exchange' as const, label: 'Обмен валюты', icon: ArrowRightLeft },
      { key: 'addMoney' as const, label: 'Пополнить баланс', icon: PlusCircle },
      { key: 'orderCard' as const, label: 'Выпустить карту', icon: CreditCard },
      { key: 'openAccount' as const, label: 'Открыть новый счёт', icon: Wallet },
      { key: 'analytics' as const, label: 'Аналитика расходов', icon: BarChart3 },
    ];

    const matchedActions = allActions.filter((a) => a.label.toLowerCase().includes(q));

    return {
      hasQuery: true,
      accounts: matchedAccounts,
      cards: matchedCards,
      transactions: matchedTransactions,
      payees: matchedPayees,
      crypto: matchedCrypto,
      stocks: matchedStocks,
      quickActions: matchedActions,
    };
  }, [q, accounts, cards, transactions, payees]);

  const totalResultsCount =
    results.accounts.length +
    results.cards.length +
    results.transactions.length +
    results.payees.length +
    results.crypto.length +
    results.stocks.length +
    results.quickActions.length;

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Умный поиск">
      <div className="space-y-4">
        {/* Search input with quick clear */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-revolut-muted" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по транзакциям, счетам, картам, контактам..."
            className="w-full h-11 pl-10 pr-9 bg-white/[0.07] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-sm text-white placeholder-revolut-muted focus:outline-none focus:border-revolut-blue focus:ring-1 focus:ring-revolut-blue transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {/* Quick Actions */}
          {results.quickActions.length > 0 && (
            <div>
              <span className="text-[11px] font-bold tracking-wider text-revolut-muted uppercase block mb-1.5 px-1">
                {results.hasQuery ? 'Быстрые действия' : 'Рекомендуемые действия'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {results.quickActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.key}
                      onClick={() => {
                        onQuickAction(act.key);
                        onClose();
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-left transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-revolut-blue/20 text-revolut-blue flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-white leading-tight">
                        {act.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accounts */}
          {results.accounts.length > 0 && (
            <div>
              <span className="text-[11px] font-bold tracking-wider text-revolut-muted uppercase block mb-1.5 px-1">
                Счета ({results.accounts.length})
              </span>
              <div className="space-y-1.5">
                {results.accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      onSelectAccount(acc.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                        <Wallet className="w-4 h-4 text-revolut-platinum" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{acc.currency} Account</p>
                        <p className="text-[10px] text-revolut-muted font-mono">{acc.accountNumber}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white font-sans tabular-nums">
                      {acc.balance.toFixed(2)} {acc.currency}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cards */}
          {results.cards.length > 0 && (
            <div>
              <span className="text-[11px] font-bold tracking-wider text-revolut-muted uppercase block mb-1.5 px-1">
                Карты ({results.cards.length})
              </span>
              <div className="space-y-1.5">
                {results.cards.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCard(c);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ background: c.colorGradient || '#0666EB' }}
                      >
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white font-mono">{c.cardNumber}</p>
                        <p className="text-[10px] text-revolut-muted">{c.type} • {c.cardHolder}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-revolut-blue font-semibold flex items-center gap-1">
                      <span>Настройки</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payees / Contacts */}
          {results.payees.length > 0 && (
            <div>
              <span className="text-[11px] font-bold tracking-wider text-revolut-muted uppercase block mb-1.5 px-1">
                Контакты для перевода ({results.payees.length})
              </span>
              <div className="space-y-1.5">
                {results.payees.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPayee(p);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-revolut-blue/20 text-revolut-blue flex items-center justify-center text-xs font-bold">
                        {p.initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{p.name}</p>
                        <p className="text-[10px] text-revolut-muted font-mono">{p.accountNumber}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-revolut-blue font-semibold flex items-center gap-1">
                      <span>Перевести</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Crypto Assets */}
          {results.crypto.length > 0 && (
            <div>
              <span className="text-[11px] font-bold tracking-wider text-revolut-muted uppercase block mb-1.5 px-1">
                Криптовалюты ({results.crypto.length})
              </span>
              <div className="space-y-1.5">
                {results.crypto.map((c) => (
                  <button
                    key={c.symbol}
                    onClick={() => {
                      onSelectCrypto(c);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                        {c.symbol}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{c.name}</p>
                        <p className="text-[10px] text-revolut-muted font-mono">{c.symbol}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white font-sans tabular-nums">
                      €{c.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stocks */}
          {results.stocks.length > 0 && (
            <div>
              <span className="text-[11px] font-bold tracking-wider text-revolut-muted uppercase block mb-1.5 px-1">
                Акции и компании ({results.stocks.length})
              </span>
              <div className="space-y-1.5">
                {results.stocks.map((s) => (
                  <button
                    key={s.ticker}
                    onClick={() => {
                      onSelectStock(s);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                        {s.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{s.name}</p>
                        <p className="text-[10px] text-revolut-muted font-mono">{s.ticker}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white font-sans tabular-nums">
                      ${s.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          {results.transactions.length > 0 && (
            <div>
              <span className="text-[11px] font-bold tracking-wider text-revolut-muted uppercase block mb-1.5 px-1">
                Транзакции ({results.transactions.length})
              </span>
              <div className="space-y-1.5">
                {results.transactions.slice(0, 6).map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => {
                      onSelectTransaction(tx);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                        <ArrowRightLeft className="w-4 h-4 text-revolut-platinum" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{tx.merchantName || tx.description}</p>
                        <p className="text-[10px] text-revolut-muted">{tx.category || 'Операция'}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold font-sans tabular-nums ${
                      tx.amount < 0 ? 'text-white' : 'text-revolut-green'
                    }`}>
                      {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} {tx.currency}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if query has no matches */}
          {results.hasQuery && totalResultsCount === 0 && (
            <div className="py-8 text-center text-revolut-muted text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-white" />
              <p>Ничего не найдено по запросу «{searchQuery}»</p>
              <p className="text-[11px] mt-1">Попробуйте ввести тикер (BTC, AAPL), имя контакта или сумму</p>
            </div>
          )}
        </div>
      </div>
    </ModalSheet>
  );
};
