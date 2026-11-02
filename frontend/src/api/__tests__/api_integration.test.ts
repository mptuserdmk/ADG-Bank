import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BankAPI, apiClient } from '../client';
import type { AccountDTO, TransactionDTO } from '../../types/api';

describe('Frontend API Client Integration & Fallback Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchAccounts returns live data when backend responds with 200 OK', async () => {
    const mockLiveAccounts: AccountDTO[] = [
      {
        id: 99,
        userId: 1,
        accountNumber: 'ADG9999999',
        balance: 9999.99,
        currency: 'EUR',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      status: 200,
      data: mockLiveAccounts,
    });

    const accounts = await BankAPI.getAccounts(1);
    expect(accounts).toEqual(mockLiveAccounts);
    expect(accounts[0].balance).toBe(9999.99);
  });

  it('fetchAccounts gracefully falls back to mock store when backend is unreachable', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network Error: Connection Refused'));

    const accounts = await BankAPI.getAccounts(1);
    expect(accounts).toBeDefined();
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0]).toHaveProperty('accountNumber');
    expect(accounts[0]).toHaveProperty('balance');
  });

  it('transfer propagates backend 4xx validation errors directly to caller', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: {
          status: 400,
          error: 'Bad Request',
          message: 'Insufficient funds on account ADG0001001',
        },
      },
    };

    vi.spyOn(apiClient, 'post').mockRejectedValueOnce(errorResponse);

    await expect(
      BankAPI.transfer({
        sourceAccountId: 1,
        targetAccountId: 2,
        amount: 50000,
        description: 'Large transfer',
      })
    ).rejects.toThrow('Insufficient funds on account ADG0001001');
  });

  it('transfer executes mock ledger fallback when server is completely offline', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce(new Error('ETIMEDOUT'));

    const initialAccounts = await BankAPI.getAccounts(1);
    const initialSourceBalance = initialAccounts.find((a) => a.id === 1)?.balance || 0;

    const result: TransactionDTO = await BankAPI.transfer({
      sourceAccountId: 1,
      targetAccountId: 2,
      amount: 10,
      description: 'Offline test transfer',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('COMPLETED');
    expect(result.amount).toBe(-10);
    expect(result.idempotencyKey).toBeDefined();

    // Verify balance was reduced
    const updatedAccounts = await BankAPI.getAccounts(1);
    const updatedSource = updatedAccounts.find((a) => a.id === 1);
    expect(updatedSource?.balance).toBe(Math.max(0, initialSourceBalance - 10));
  });

  it('toggleFreezeCard toggles card frozen state', async () => {
    const card = await BankAPI.toggleFreezeCard('card-1');
    const firstState = card.isFrozen;

    const toggled = await BankAPI.toggleFreezeCard('card-1');
    expect(toggled.isFrozen).toBe(!firstState);
  });
});
