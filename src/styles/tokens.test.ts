import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Design Tokens Apple HIG (AC-2A-02, AC-2A-03, AC-25)', () => {
  const cssPath = path.resolve(__dirname, 'tokens.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  it('defines required light mode semantic variables', () => {
    expect(cssContent).toContain('--hig-bg-app: #f5f5f7');
    expect(cssContent).toContain('--hig-bg-card: #ffffff');
    expect(cssContent).toContain('--hig-text-primary: #1d1d1f');
    expect(cssContent).toContain('--hig-accent: #0071e3');
    expect(cssContent).toContain('--hig-nav-glass: rgba(255, 255, 255, 0.72)');
  });

  it('defines dark mode overrides via prefers-color-scheme and data-theme="dark"', () => {
    expect(cssContent).toContain('@media (prefers-color-scheme: dark)');
    expect(cssContent).toContain(":root[data-theme='dark']");
    expect(cssContent).toContain('--hig-bg-card: #1c1c1e');
    expect(cssContent).toContain('--hig-text-primary: #f5f5f7');
    expect(cssContent).toContain('--hig-accent: #2997ff');
  });

  it('converts liquid glass to 100% solid surface when prefers-reduced-transparency is reduce (AC-25)', () => {
    expect(cssContent).toContain('@media (prefers-reduced-transparency: reduce)');
    expect(cssContent).toContain('--hig-nav-glass: #ffffff !important');
    expect(cssContent).toContain('--hig-nav-backdrop: none !important');
  });

  it('enforces higher contrast borders and text on prefers-contrast: more (AC-25)', () => {
    expect(cssContent).toContain('@media (prefers-contrast: more)');
    expect(cssContent).toContain('--hig-border: #000000 !important');
    expect(cssContent).toContain('--hig-border: #ffffff !important');
  });

  it('defines tabular-nums and glass-nav utilities', () => {
    expect(cssContent).toContain('.tabular-nums');
    expect(cssContent).toContain('font-variant-numeric: tabular-nums');
    expect(cssContent).toContain('.glass-nav');
    expect(cssContent).toContain('backdrop-filter: var(--hig-nav-backdrop)');
  });

  it('defines responsive navigation breakpoint below 760px for compact tabs (AC-2A-07)', () => {
    expect(cssContent).toContain('@media (max-width: 759px)');
    expect(cssContent).toContain('.sidebar-container');
    expect(cssContent).toContain('.sidebar-nav-list');
  });

  it('defines skeleton-shimmer animation and respects prefers-reduced-motion', () => {
    expect(cssContent).toContain('@keyframes shimmer');
    expect(cssContent).toContain('.skeleton-shimmer');
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('defines provider color tokens for charts and badges (AC-2B-01)', () => {
    expect(cssContent).toContain('--hig-provider-anthropic: #d97706');
    expect(cssContent).toContain('--hig-provider-openai: #06b6d4');
    expect(cssContent).toContain('--hig-provider-gemini: #6366f1');
    expect(cssContent).toContain('--hig-provider-anthropic: #f59e0b');
    expect(cssContent).toContain('--hig-provider-openai: #22d3ee');
    expect(cssContent).toContain('--hig-provider-gemini: #818cf8');
  });

  it('defines screen-reader only utility (.sr-only) for chart accessibility (AC-23)', () => {
    expect(cssContent).toContain('.sr-only');
    expect(cssContent).toContain('clip: rect(0, 0, 0, 0)');
  });

  it('defines responsive .metric-cards-grid with 1 col on mobile, 2 cols on tablet, and 4 cols on desktop without orphan cards (AC-SHOW-03)', () => {
    expect(cssContent).toContain('.metric-cards-grid');
    expect(cssContent).toContain('grid-template-columns: 1fr');
    expect(cssContent).toContain('@media (min-width: 600px)');
    expect(cssContent).toContain('grid-template-columns: repeat(2, 1fr)');
    expect(cssContent).toContain('@media (min-width: 1024px)');
    expect(cssContent).toContain('grid-template-columns: repeat(4, 1fr)');
  });
});
