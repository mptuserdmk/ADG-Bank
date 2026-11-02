import { test, expect } from '@playwright/test';

test.describe('ADG-Bank Revolut UI E2E User Journey', () => {
  test('should render dashboard, navigate tabs, and execute transfer flow', async ({ page }) => {
    // 1. Visit root page
    await page.goto('/');

    // Check header search input and account pill
    await expect(page.locator('input[placeholder="Поиск по счетам..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Accounts")')).toBeVisible();

    // Check quick action buttons
    await expect(page.locator('button:has-text("Add money")')).toBeVisible();
    await expect(page.locator('button:has-text("Exchange")')).toBeVisible();

    // Check recent payees section
    await expect(page.locator('text=Recent payees')).toBeVisible();

    // 2. Open Transfer Modal via Recent Payee "Mario"
    const marioPayee = page.locator('button:has-text("Mario")').first();
    await expect(marioPayee).toBeVisible();
    await marioPayee.click();

    // Verify modal opened with title "Перевод средств"
    const modalTitle = page.locator('text=Перевод средств');
    await expect(modalTitle).toBeVisible();

    // Enter transfer amount
    const amountInput = page.locator('input[type="number"]');
    await expect(amountInput).toBeVisible();
    await amountInput.fill('25');

    // Submit transfer
    const submitBtn = page.locator('button:has-text("Отправить перевод")');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify transfer success confirmation appears
    await expect(page.locator('text=Перевод успешно отправлен')).toBeVisible({ timeout: 5000 });

    // Wait for modal to auto-close
    await expect(modalTitle).not.toBeVisible({ timeout: 5000 });

    // 3. Tab Navigation: switch to Crypto screen
    const cryptoTab = page.locator('button:has-text("Crypto")');
    await expect(cryptoTab).toBeVisible();
    await cryptoTab.click();

    // Verify Crypto screen header using getByRole heading
    await expect(page.getByRole('heading', { name: 'Crypto' })).toBeVisible();

    // Switch back to Home screen
    const homeTab = page.locator('button:has-text("Home")');
    await expect(homeTab).toBeVisible();
    await homeTab.click();

    // Confirm home dashboard is active
    await expect(page.locator('button:has-text("Accounts")')).toBeVisible();
  });
});
