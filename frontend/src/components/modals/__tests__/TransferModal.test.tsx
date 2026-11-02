import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransferModal } from '../TransferModal';
import type { AccountDTO } from '../../../types/api';

const sampleAccounts: AccountDTO[] = [
  {
    id: 1,
    userId: 1,
    accountNumber: 'ADG0001001',
    balance: 500.00,
    currency: 'EUR',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

describe('TransferModal Component', () => {
  it('renders modal with transfer details when open', () => {
    render(
      <TransferModal
        isOpen={true}
        onClose={vi.fn()}
        accounts={sampleAccounts}
        currentAccountId={1}
        onExecuteTransfer={vi.fn()}
      />
    );

    expect(screen.getByText('Перевод средств')).toBeInTheDocument();
    expect(screen.getByText('Получатель')).toBeInTheDocument();
    expect(screen.getByText('Отправить перевод')).toBeInTheDocument();
    expect(screen.getByText(/Доступно: 500.00/)).toBeInTheDocument();
  });

  it('shows error when user attempts to transfer zero or negative amount', () => {
    const handleExecute = vi.fn();
    render(
      <TransferModal
        isOpen={true}
        onClose={vi.fn()}
        accounts={sampleAccounts}
        currentAccountId={1}
        onExecuteTransfer={handleExecute}
      />
    );

    // Target the number input
    const inputs = screen.getAllByRole('spinbutton');
    const amountInput = inputs[0];

    fireEvent.change(amountInput, { target: { value: '0' } });
    const submitBtn = screen.getByText('Отправить перевод');
    fireEvent.click(submitBtn);

    expect(screen.getByText('Введите корректную сумму')).toBeInTheDocument();
    expect(handleExecute).not.toHaveBeenCalled();
  });

  it('shows error when amount exceeds available balance', () => {
    const handleExecute = vi.fn();
    render(
      <TransferModal
        isOpen={true}
        onClose={vi.fn()}
        accounts={sampleAccounts}
        currentAccountId={1}
        onExecuteTransfer={handleExecute}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    const amountInput = inputs[0];

    // Attempt to transfer 1000 EUR with balance of 500 EUR
    fireEvent.change(amountInput, { target: { value: '1000' } });
    const submitBtn = screen.getByText('Отправить перевод');
    fireEvent.click(submitBtn);

    expect(screen.getByText('Недостаточно средств на счете')).toBeInTheDocument();
    expect(handleExecute).not.toHaveBeenCalled();
  });

  it('calls onExecuteTransfer with correct parameters on valid input', async () => {
    const handleExecute = vi.fn().mockResolvedValue(undefined);
    render(
      <TransferModal
        isOpen={true}
        onClose={vi.fn()}
        accounts={sampleAccounts}
        currentAccountId={1}
        onExecuteTransfer={handleExecute}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    const amountInput = inputs[0];

    fireEvent.change(amountInput, { target: { value: '150.50' } });
    const submitBtn = screen.getByText('Отправить перевод');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleExecute).toHaveBeenCalledTimes(1);
      expect(handleExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceAccountId: 1,
          amount: 150.50,
        })
      );
    });
  });
});
