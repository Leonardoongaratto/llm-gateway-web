import fs from 'node:fs';
import path from 'node:path';
import { test, expect, Page } from '@playwright/test';
import { getShowcaseSummary } from './showcase.fixture';

async function mockShowcaseApi(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('LGW_ADMIN_TOKEN', 'showcase-token');
  });

  await page.route('**/admin/summary*', async (route) => {
    const url = new URL(route.request().url());
    const daysParam = url.searchParams.get('days');
    const days = daysParam === '7' || daysParam === '90' ? Number(daysParam) : 30;
    const summary = getShowcaseSummary(days as 7 | 30 | 90);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(summary),
    });
  });

  await page.route('**/health', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ok',
        services: {
          budget: 'ok',
          control: 'ok',
          'gateway-1': 'ok',
          'gateway-2': 'ok',
          usage: 'ok',
        },
      }),
    });
  });
}

async function verifyNoHeaderOverlap(page: Page) {
  const header = page.locator('header').first();
  const phrase = page.getByRole('region', { name: 'Resumo executivo do período' });

  await expect(header).toBeVisible();
  await expect(phrase).toBeVisible();

  const headerBox = await header.boundingBox();
  const phraseBox = await phrase.boundingBox();

  expect(headerBox).not.toBeNull();
  expect(phraseBox).not.toBeNull();

  expect(phraseBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);
}

async function captureOverviewWhenReady(page: Page, outputPath: string) {
  await expect(page.locator('text=Você gastou')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: 'Consumo Diário por Provedor' })).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByRole('application', { name: /gráfico interativo/i })).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur?.());
  await page.evaluate(() => document.fonts.ready);

  await verifyNoHeaderOverlap(page);

  await page.screenshot({ path: outputPath });
}

test.describe('Showcase Screenshots Generator (AC-SHOW-02, AC-SHOW-04)', () => {
  test('confirms overlap detector catches header covering summary phrase when scrolled', async ({ page }) => {
    await mockShowcaseApi(page);
    await page.goto('/dashboard');
    await expect(page.locator('text=Você gastou')).toBeVisible({ timeout: 10000 });

    await page.evaluate(() => window.scrollTo(0, 250));
    const header = page.locator('header').first();
    const phrase = page.getByRole('region', { name: 'Resumo executivo do período' });
    const headerBox = await header.boundingBox();
    const phraseBox = await phrase.boundingBox();

    expect(headerBox).not.toBeNull();
    expect(phraseBox).not.toBeNull();
    expect(phraseBox!.y).toBeLessThan(headerBox!.y + headerBox!.height);
  });

  test('captures README showcase overview screenshot across all project viewports and themes', async ({
    page,
  }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await mockShowcaseApi(page);
    await page.goto('/dashboard');
    const screenshotPath = `docs/screenshots/${testInfo.project.name}-overview.png`;
    await captureOverviewWhenReady(page, screenshotPath);

    const cards = page.locator('.metric-cards-grid > *');
    if (testInfo.project.name.startsWith('desktop')) {
      const b0 = await cards.nth(0).boundingBox();
      const b1 = await cards.nth(1).boundingBox();
      const b2 = await cards.nth(2).boundingBox();
      const b3 = await cards.nth(3).boundingBox();
      expect(b0).not.toBeNull();
      expect(b1).not.toBeNull();
      expect(b2).not.toBeNull();
      expect(b3).not.toBeNull();
      expect(Math.abs(b0!.y - b1!.y)).toBeLessThanOrEqual(2);
      expect(Math.abs(b0!.y - b2!.y)).toBeLessThanOrEqual(2);
      expect(Math.abs(b0!.y - b3!.y)).toBeLessThanOrEqual(2);
    } else if (testInfo.project.name.startsWith('mobile')) {
      const b0 = await cards.nth(0).boundingBox();
      const b1 = await cards.nth(1).boundingBox();
      expect(b0).not.toBeNull();
      expect(b1).not.toBeNull();
      expect(Math.abs(b0!.x - b1!.x)).toBeLessThanOrEqual(2);
      expect(b1!.y).toBeGreaterThan(b0!.y);
    }

    expect(consoleErrors).toEqual([]);
    expect(fs.existsSync(path.resolve(process.cwd(), screenshotPath))).toBe(true);
  });

  test('captures high-res LinkedIn 4:5 @2x showcase images for overview and projects', async ({
    browser,
  }, testInfo) => {
    if (testInfo.project.name !== 'desktop-dark') {
      return;
    }

    const setupContextPage = async (colorScheme: 'dark' | 'light') => {
      const context = await browser.newContext({
        viewport: { width: 1200, height: 1500 },
        deviceScaleFactor: 2,
        colorScheme,
      });

      const page = await context.newPage();
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (err) => {
        consoleErrors.push(err.message);
      });

      await mockShowcaseApi(page);
      return { context, page, consoleErrors };
    };

    {
      const { context, page, consoleErrors } = await setupContextPage('dark');
      await page.goto('/dashboard');
      const darkOverviewPath = 'docs/showcase/linkedin-overview-dark.png';
      await captureOverviewWhenReady(page, darkOverviewPath);

      const cards = page.locator('.metric-cards-grid > *');
      const b0 = await cards.nth(0).boundingBox();
      const b1 = await cards.nth(1).boundingBox();
      const b2 = await cards.nth(2).boundingBox();
      const b3 = await cards.nth(3).boundingBox();
      expect(b0).not.toBeNull();
      expect(b1).not.toBeNull();
      expect(b2).not.toBeNull();
      expect(b3).not.toBeNull();
      expect(Math.abs(b0!.y - b1!.y)).toBeLessThanOrEqual(2);
      expect(Math.abs(b0!.y - b2!.y)).toBeLessThanOrEqual(2);
      expect(Math.abs(b0!.y - b3!.y)).toBeLessThanOrEqual(2);

      expect(consoleErrors).toEqual([]);
      expect(fs.statSync(path.resolve(process.cwd(), darkOverviewPath)).size).toBeGreaterThan(50000);

      await page.goto('/dashboard/projetos');
      await expect(page.locator('text=Chaves Virtuais e Orçamentos')).toBeVisible();
      await expect(page.locator('text=suporte-chatbot')).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => (document.activeElement as HTMLElement)?.blur?.());
      await page.evaluate(() => document.fonts.ready);

      const darkProjetosPath = 'docs/showcase/linkedin-projetos-dark.png';
      await page.screenshot({ path: darkProjetosPath });
      expect(consoleErrors).toEqual([]);
      expect(fs.statSync(path.resolve(process.cwd(), darkProjetosPath)).size).toBeGreaterThan(50000);

      await context.close();
    }

    {
      const { context, page, consoleErrors } = await setupContextPage('light');
      await page.goto('/dashboard');
      const lightOverviewPath = 'docs/showcase/linkedin-overview-light.png';
      await captureOverviewWhenReady(page, lightOverviewPath);
      expect(consoleErrors).toEqual([]);
      expect(fs.statSync(path.resolve(process.cwd(), lightOverviewPath)).size).toBeGreaterThan(50000);

      await context.close();
    }
  });
});
