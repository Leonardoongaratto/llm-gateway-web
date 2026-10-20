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
});
