import { expect, test } from '@playwright/test';
import { mockSummary } from './fixtures';

test.describe('LLM Gateway Web Executive E2E (AC-25-E2E / F-14)', () => {
  test('renders full dashboard, handles period switch, and keyboard chart navigation with zero console errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await page.route('**/admin/summary*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSummary),
      });
    });

    await page.route('**/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          services: { edge: 'ok', budget: 'ok', control: 'ok' },
        }),
      });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/Visão Geral.*LLM Gateway/i);

    await expect(page.locator('text=Gasto no período')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Participação por Modelo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Assinaturas e Eficiência' })).toBeVisible();

    const chartApp = page.getByRole('application', { name: /gráfico interativo/i });
    await expect(chartApp).toBeVisible();
    await chartApp.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('status')).toBeVisible();

    const tab7d = page.getByRole('tab', { name: '7 dias' });
    await tab7d.click();
    await expect(tab7d).toHaveAttribute('aria-selected', 'true');

    // force: true is required for fixed bottom navigation bar links in Playwright mobile viewports
    // because Playwright's scroll-into-view algorithm times out attempting to center fixed position elements.
    const projectsLink = page.locator('a[href="/dashboard/projetos"]');
    await projectsLink.click({ force: true });
    await expect(page).toHaveTitle(/Projetos.*LLM Gateway/i);
    await expect(page.locator('text=Chaves Virtuais e Orçamentos')).toBeVisible();
    await expect(page.locator('text=Bloqueado')).toBeVisible();
    await expect(page.locator('text=Perto do limite')).toBeVisible();
    await expect(page.locator('text=Normal')).toBeVisible();

    const providersLink = page.locator('a[href="/dashboard/provedores"]');
    await providersLink.click({ force: true });
    await expect(page).toHaveTitle(/Provedores.*LLM Gateway/i);
    await expect(page.locator('text=Consumo por Provedor Conectado')).toBeVisible();
    await expect(page.locator('text=Operando')).toBeVisible();
    await expect(page.locator('text=Instável')).toBeVisible();

    const eventsLink = page.locator('a[href="/dashboard/eventos"]');
    await eventsLink.click({ force: true });
    await expect(page).toHaveTitle(/Eventos.*LLM Gateway/i);
    await expect(page.locator('text=Eventos de Auditoria e Sistema')).toBeVisible();
    await expect(page.locator('.hig-status-badge:has-text("Uso")')).toBeVisible();
    await expect(page.locator('.hig-status-badge:has-text("Orçamento")')).toBeVisible();
    await expect(page.locator('.hig-status-badge:has-text("Fallback")')).toBeVisible();
    await expect(page.locator('.hig-status-badge:has-text("Configuração")')).toBeVisible();

    const eventFilter = page.locator('#event-type-filter');
    await eventFilter.selectOption('provider.fallback');
    await expect(page.locator('text=Falha na OpenAI GPT-4o')).toBeVisible();
    await expect(page.locator('text=Inferência completada com sucesso')).not.toBeVisible();

    const settingsLink = page.locator('a[href="/dashboard/ajustes"]');
    await settingsLink.click({ force: true });
    await expect(page).toHaveTitle(/Ajustes.*LLM Gateway/i);
    await expect(page.locator('text=Autenticação Administrativa')).toBeVisible();
    await expect(page.locator('text=Conectividade com o Edge Proxy')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('handles 401 unauthorized response by prompting AuthDialog and unlocking upon valid token', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('401')) {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    let authenticated = false;

    await page.route('**/admin/summary*', async (route) => {
      const headers = route.request().headers();
      const authHeader = headers['authorization'] || headers['Authorization'];
      if (!authenticated && !authHeader) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSummary),
        });
      }
    });

    await page.goto('/dashboard');
    await expect(page.locator('text=Autenticação Administrativa')).toBeVisible();

    authenticated = true;
    const tokenInput = page.locator('#admin-token-input');
    await tokenInput.fill('lgw_valid_test_token_123');
    await page.locator('button[type="submit"]:has-text("Salvar")').click();

    await expect(page.locator('text=Autenticação Administrativa')).not.toBeVisible();
    await expect(page.locator('text=Gasto no período')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('renders ErrorBanner on failure and EmptyState when empty', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('500')) {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    let returnError = true;

    await page.route('**/admin/summary*', async (route) => {
      if (returnError) {
        await route.fulfill({
          status: 500,
          contentType: 'text/plain',
          body: 'Internal Server Error',
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            period_days: 30,
            start_date: '2026-09-17',
            end_date: '2026-10-17',
            spend_micros: 0,
            prev_spend_micros: 0,
            projected_month_micros: 0,
            daily: [],
            by_key: [],
          }),
        });
      }
    });

    await page.goto('/dashboard/projetos');
    await expect(page.locator('role=alert')).toBeVisible();

    returnError = false;
    await page.locator('button:has-text("Tentar de novo")').click();
    await expect(page.locator('text=Nenhum projeto ou chave virtual ativa')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
