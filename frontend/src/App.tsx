import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DesktopShell } from './components/revolut/DesktopShell';
import { TopNavBar } from './components/revolut/TopNavBar';
import { AccountHero } from './components/revolut/AccountHero';
import { MarketingBanner } from './components/revolut/MarketingBanner';
import { TransactionsSection } from './components/revolut/TransactionsSection';
import { WidgetsGrid } from './components/revolut/WidgetsGrid';
import { RecentPayees } from './components/revolut/RecentPayees';
import { BottomTabBar } from './components/revolut/BottomTabBar';
import type { TabKey } from './components/revolut/BottomTabBar';

import { Toast } from './components/ui/Toast';
import type { ToastMessage } from './components/ui/Toast';
import confetti from 'canvas-confetti';

import { TransferModal } from './components/modals/TransferModal';
import { AddMoneyModal } from './components/modals/AddMoneyModal';
import { ExchangeModal } from './components/modals/ExchangeModal';
import { AccountDetailsModal } from './components/modals/AccountDetailsModal';
import { HubServicesModal } from './components/modals/HubServicesModal';
import { AnalyticsModal } from './components/modals/AnalyticsModal';
import { QRReceiveModal } from './components/modals/QRReceiveModal';
import { ReferralModal } from './components/modals/ReferralModal';
import { StatementModal } from './components/modals/StatementModal';
import { NewPayeeModal } from './components/modals/NewPayeeModal';
import { OrderCardModal } from './components/modals/OrderCardModal';
import { CardLimitsModal } from './components/modals/CardLimitsModal';
import { CardDetailsModal } from './components/modals/CardDetailsModal';
import { TransactionDetailsModal } from './components/modals/TransactionDetailsModal';
import { AccountSwitcherModal } from './components/modals/AccountSwitcherModal';

import { StockTradeModal } from './components/modals/StockTradeModal';
import type { StockItem } from './components/modals/StockTradeModal';

import { CryptoTradeModal } from './components/modals/CryptoTradeModal';
import type { CryptoCoin } from './components/modals/CryptoTradeModal';

import { PerkModal } from './components/modals/PerkModal';
import type { PerkItem } from './components/modals/PerkModal';

import { CardsScreen } from './components/screens/CardsScreen';
import { InvestScreen } from './components/screens/InvestScreen';
import { CryptoScreen } from './components/screens/CryptoScreen';
import { LifestyleScreen } from './components/screens/LifestyleScreen';

import { BankAPI, mockCards, mockPayees } from './api/client';
import type { AccountDTO, TransactionDTO, PayeeDTO, CardDTO } from './types/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

export const RevolutBankApp: React.FC = () => {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey | 'cards'>('home');
  const [selectedAccountId, setSelectedAccountId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: Date.now().toString(), title, description, type });
  };

  // Modals state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState(false);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isNewPayeeOpen, setIsNewPayeeOpen] = useState(false);
  const [isOrderCardOpen, setIsOrderCardOpen] = useState(false);
  const [cardForLimits, setCardForLimits] = useState<CardDTO | null>(null);
  const [selectedPayeeForTransfer, setSelectedPayeeForTransfer] = useState<PayeeDTO | null>(null);
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<TransactionDTO | null>(null);
  const [selectedCardForDetails, setSelectedCardForDetails] = useState<CardDTO | null>(null);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);

  // Trade modals state
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<PerkItem | null>(null);

  // Cards and Payees state
  const [cards, setCards] = useState<CardDTO[]>(mockCards);
  const [payees, setPayees] = useState<PayeeDTO[]>(mockPayees);

  const defaultAccount: AccountDTO = {
    id: 1,
    userId: 1,
    accountNumber: 'ADG0001001',
    balance: 1250.50,
    currency: 'EUR',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  // Fetch Accounts Query with resilient initialData
  const { data: accounts = [defaultAccount] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => BankAPI.getAccounts(1),
    initialData: [defaultAccount],
  });

  // Current active account
  const currentAccount: AccountDTO = accounts.find((a) => a.id === selectedAccountId) || accounts[0] || defaultAccount;

  // Fetch Transactions Query
  const { data: transactions = [], isLoading: isTxLoading } = useQuery({
    queryKey: ['transactions', currentAccount?.id],
    queryFn: () => BankAPI.getTransactions(currentAccount?.id),
    enabled: !!currentAccount?.id,
  });

  // Transfer Mutation
  const transferMutation = useMutation({
    mutationFn: BankAPI.transfer,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#0666EB', '#984CFF', '#00D09C', '#FFFFFF'],
        disableForReducedMotion: true,
      });
      showToast('Перевод успешно выполнен', `${data.merchantName}: ${Math.abs(data.amount)} ${data.currency}`);
    },
    onError: (err: any) => {
      showToast('Ошибка перевода', err.message, 'error');
    }
  });

  // Add Money Mutation
  const addMoneyMutation = useMutation({
    mutationFn: ({ accountId, amount }: { accountId: number; amount: number }) =>
      BankAPI.addMoney(accountId, amount),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.75 },
        colors: ['#00D09C', '#0666EB', '#FFD700', '#FFFFFF'],
        disableForReducedMotion: true,
      });
      showToast('Баланс пополнен', `+ ${vars.amount} ${currentAccount?.currency} зачислено на счёт`);
    },
    onError: (err: any) => {
      showToast('Ошибка пополнения', err.message, 'error');
    }
  });

  const handleToggleFreeze = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          const nextState = !c.isFrozen;
          showToast(
            nextState ? 'Карта заморожена' : 'Карта разблокирована',
            nextState ? 'Операции временно заблокированы' : 'Платежи снова активны'
          );
          return { ...c, isFrozen: nextState };
        }
        return c;
      })
    );
    if (selectedCardForDetails?.id === cardId) {
      setSelectedCardForDetails((prev) => (prev ? { ...prev, isFrozen: !prev.isFrozen } : null));
    }
  };

  const handleExecuteExchange = async (fromId: number, toId: number, fromAmt: number, toAmt: number) => {
    const fromA = accounts.find((a) => a.id === fromId);
    const toA = accounts.find((a) => a.id === toId);
    if (fromA) fromA.balance -= fromAmt;
    if (toA) toA.balance += toAmt;
    qc.invalidateQueries({ queryKey: ['accounts'] });
    showToast('Обмен валюты завершён', `${fromAmt} ${fromA?.currency} ➔ ${toAmt} ${toA?.currency}`);
  };

  const handleSaveCardLimits = (cardId: string, newLimit: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, spendingLimit: newLimit } : c))
    );
    showToast('Лимиты обновлены', `Новый месячный лимит расходов: €${newLimit}`);
  };

  const handleAddPayee = (newPayee: PayeeDTO) => {
    setPayees((prev) => [newPayee, ...prev]);
    showToast('Контакт сохранён', `${newPayee.name} добавлен в список получателей`);
  };

  const handleOrderCardSuccess = (newCard: CardDTO) => {
    setCards((prev) => [newCard, ...prev]);
    showToast('Карта выпущена', `Новая ${newCard.type} карта готова к использованию`);
  };

  return (
    <DesktopShell>
      {/* Floating Toast notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Search Navigation Bar */}
      <TopNavBar
        userInitials="DE"
        searchQuery={searchQuery}
        isBackendConnected={BankAPI.isBackendConnected()}
        onSearch={setSearchQuery}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
        onProfileClick={() => setIsAccountSwitcherOpen(true)}
      />

      {/* Main Tab Views */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-1 animate-fadeIn">
            {/* Account Hero with Formatted Balance & 4 Pill Actions */}
            <AccountHero
              balance={currentAccount?.balance || 0}
              currency={currentAccount?.currency || 'EUR'}
              accountName={`${currentAccount?.currency} Account`}
              accountsCount={accounts.length}
              onSelectAccountClick={() => setIsAccountSwitcherOpen(true)}
              onAddMoney={() => setIsAddMoneyOpen(true)}
              onExchange={() => setIsExchangeOpen(true)}
              onDetails={() => setIsAccountDetailsOpen(true)}
              onMore={() => setIsHubOpen(true)}
            />

            {/* Revolut Marketing Promo Banner */}
            <MarketingBanner onBannerClick={() => setIsReferralOpen(true)} />

            {/* Transactions Section */}
            <TransactionsSection
              transactions={transactions}
              isLoading={isTxLoading}
              searchFilter={searchQuery}
              onSelectTransaction={(tx) => setSelectedTxForDetails(tx)}
              onSeeAllClick={() => setIsStatementOpen(true)}
            />

            {/* Interactive 2x2 Widgets Grid & Wealth Breakdown */}
            <WidgetsGrid
              onCardClick={() => {
                setActiveTab('cards');
              }}
              onAnalyticsClick={() => setIsAnalyticsOpen(true)}
              onInvestClick={() => setActiveTab('invest')}
              onCryptoClick={() => setActiveTab('crypto')}
            />

            {/* Horizontal Payees Quick Transfer */}
            <RecentPayees
              payees={payees}
              onSelectPayee={(payee) => {
                setSelectedPayeeForTransfer(payee);
                setIsTransferOpen(true);
              }}
              onNewPayee={() => setIsNewPayeeOpen(true)}
            />
          </div>
        )}

        {activeTab === 'cards' && (
          <CardsScreen
            cards={cards}
            onToggleFreeze={handleToggleFreeze}
            onOpenCardDetails={(c) => setSelectedCardForDetails(c)}
            onOrderCardClick={() => setIsOrderCardOpen(true)}
            onOpenLimitsClick={(c) => setCardForLimits(c)}
          />
        )}

        {activeTab === 'invest' && (
          <InvestScreen
            onSelectStock={(s) => setSelectedStock(s)}
            onExploreClick={() => showToast('Акции ADG-Bank', 'Каталог из более чем 2,000 мировых акций и ETF')}
          />
        )}

        {activeTab === 'transfers' && (
          <div className="px-4 py-3 space-y-4 animate-fadeIn">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Transfers</h1>
              <p className="text-xs text-revolut-muted">Мгновенные переводы клиентам ADG-Bank и по IBAN</p>
            </div>
            <RecentPayees
              payees={payees}
              onSelectPayee={(payee) => {
                setSelectedPayeeForTransfer(payee);
                setIsTransferOpen(true);
              }}
              onNewPayee={() => setIsNewPayeeOpen(true)}
            />
            <TransactionsSection
              transactions={transactions}
              isLoading={isTxLoading}
              onSelectTransaction={(tx) => setSelectedTxForDetails(tx)}
              onSeeAllClick={() => setIsStatementOpen(true)}
            />
          </div>
        )}

        {activeTab === 'crypto' && (
          <CryptoScreen
            onSelectCoin={(c) => setSelectedCoin(c)}
            onExploreClick={() => showToast('Криптоактивы', 'Мгновенный обмен без комиссии для ADG Premium')}
          />
        )}

        {activeTab === 'lifestyle' && (
          <LifestyleScreen onSelectPerk={(p) => setSelectedPerk(p)} />
        )}
      </main>

      {/* Floating Bottom Dock Tab Bar */}
      <BottomTabBar activeTab={activeTab === 'cards' ? 'home' : activeTab} onSelectTab={setActiveTab} />

      {/* 1. Transfer Modal Sheet */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        accounts={accounts.length > 0 ? accounts : [currentAccount]}
        currentAccountId={currentAccount?.id || 1}
        preselectedPayee={selectedPayeeForTransfer}
        onExecuteTransfer={async (req) => {
          await transferMutation.mutateAsync(req);
        }}
      />

      {/* 2. Add Money Modal Sheet */}
      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        account={currentAccount}
        onConfirmAddMoney={async (amt) => {
          await addMoneyMutation.mutateAsync({ accountId: currentAccount.id, amount: amt });
        }}
      />

      {/* 3. Exchange Modal Sheet */}
      <ExchangeModal
        isOpen={isExchangeOpen}
        onClose={() => setIsExchangeOpen(false)}
        accounts={accounts}
        onExecuteExchange={handleExecuteExchange}
      />

      {/* 4. Account Details Modal Sheet */}
      <AccountDetailsModal
        isOpen={isAccountDetailsOpen}
        onClose={() => setIsAccountDetailsOpen(false)}
        account={currentAccount}
        onCopySuccess={(msg) => showToast('Скопировано в буфер', msg)}
      />

      {/* 5. Hub Services Modal Sheet */}
      <HubServicesModal
        isOpen={isHubOpen}
        onClose={() => setIsHubOpen(false)}
        onOpenStatements={() => setIsStatementOpen(true)}
        onOpenCards={() => setActiveTab('cards')}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenSupport={() => showToast('Поддержка 24/7', 'Финансовый консультант ответит в течение 2 минут', 'info')}
      />

      {/* 6. Analytics Modal Sheet */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* 7. QR Receive Modal Sheet */}
      <QRReceiveModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        onCopySuccess={(msg) => showToast('Ссылка скопирована', msg)}
      />

      {/* 8. Referral Modal Sheet */}
      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        onCopySuccess={(msg) => showToast('Промокод скопирован', msg)}
      />

      {/* 9. Statement & History Modal Sheet */}
      <StatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        transactions={transactions}
        onSelectTx={(tx) => setSelectedTxForDetails(tx)}
        onExportSuccess={(msg) => showToast('Файл сформирован', msg)}
      />

      {/* 10. New Payee Modal Sheet */}
      <NewPayeeModal
        isOpen={isNewPayeeOpen}
        onClose={() => setIsNewPayeeOpen(false)}
        onAddPayee={handleAddPayee}
      />

      {/* 11. Order Card Modal Sheet */}
      <OrderCardModal
        isOpen={isOrderCardOpen}
        onClose={() => setIsOrderCardOpen(false)}
        onOrderSuccess={handleOrderCardSuccess}
      />

      {/* 12. Card Limits Modal Sheet */}
      <CardLimitsModal
        isOpen={!!cardForLimits}
        onClose={() => setCardForLimits(null)}
        card={cardForLimits}
        onSaveLimits={handleSaveCardLimits}
      />

      {/* 13. Transaction Details Modal Sheet */}
      <TransactionDetailsModal
        isOpen={!!selectedTxForDetails}
        onClose={() => setSelectedTxForDetails(null)}
        transaction={selectedTxForDetails}
      />

      {/* 14. Card Details Modal Sheet */}
      <CardDetailsModal
        isOpen={!!selectedCardForDetails}
        onClose={() => setSelectedCardForDetails(null)}
        card={selectedCardForDetails}
        onToggleFreeze={handleToggleFreeze}
      />

      {/* 15. Account Switcher Modal Sheet */}
      <AccountSwitcherModal
        isOpen={isAccountSwitcherOpen}
        onClose={() => setIsAccountSwitcherOpen(false)}
        accounts={accounts}
        currentAccountId={currentAccount?.id || 1}
        onSelectAccount={(accId) => setSelectedAccountId(accId)}
        onAddNewAccount={() => {
          showToast('Новый счёт', 'Заявка на мультивалютный счёт в USD принята');
        }}
      />

      {/* 16. Stock Trade Modal Sheet */}
      <StockTradeModal
        isOpen={!!selectedStock}
        onClose={() => setSelectedStock(null)}
        stock={selectedStock}
        onBuySuccess={(msg) => showToast('Ордер исполнен', msg)}
      />

      {/* 17. Crypto Trade Modal Sheet */}
      <CryptoTradeModal
        isOpen={!!selectedCoin}
        onClose={() => setSelectedCoin(null)}
        coin={selectedCoin}
        onTradeSuccess={(msg) => showToast('Криптовалюта зачислена', msg)}
      />

      {/* 18. Perk Modal Sheet */}
      <PerkModal
        isOpen={!!selectedPerk}
        onClose={() => setSelectedPerk(null)}
        perk={selectedPerk}
        onActivateSuccess={(msg) => showToast('Привилегия активна', msg)}
      />
    </DesktopShell>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RevolutBankApp />
    </QueryClientProvider>
  );
}
