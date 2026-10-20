import { describe, expect, it } from 'vitest';
import { formatDateShort, formatNumber, formatPercentChange, microsToUsd } from './formatters';

describe('Formatadores Contábeis e Monetários HIG (AC-2A-06 / F-04)', () => {
  describe('microsToUsd', () => {
    it('converts typical micro amounts to formatted USD string', () => {
      expect(microsToUsd(137090585)).toBe('$137.09');
      expect(microsToUsd(141859142)).toBe('$141.86');
      expect(microsToUsd(1000000)).toBe('$1.00');
    });

    it('handles zero correctly', () => {
      expect(microsToUsd(0)).toBe('$0.00');
    });

    it('formats sub-cent micro amounts with high precision without truncating to zero', () => {
      expect(microsToUsd(3500)).toBe('$0.0035');
      expect(microsToUsd(100)).toBe('$0.0001');
    });

    it('handles negative values correctly', () => {
      expect(microsToUsd(-5000000)).toBe('-$5.00');
      expect(microsToUsd(-137090585)).toBe('-$137.09');
    });

    it('supports BigInt inputs', () => {
      expect(microsToUsd(BigInt(2500000))).toBe('$2.50');
    });
  });

  describe('formatPercentChange', () => {
    it('calculates positive growth with plus sign', () => {
      const result = formatPercentChange(110, 100);
      expect(result.trend).toBe('up');
      expect(result.formatted).toBe('+10.0%');
      expect(result.value).toBe(10);
    });

    it('calculates reduction with negative sign', () => {
      const result = formatPercentChange(90, 100);
      expect(result.trend).toBe('down');
      expect(result.formatted).toBe('-10.0%');
      expect(result.value).toBe(-10);
    });

    it('handles zero change as neutral', () => {
      const result = formatPercentChange(100, 100);
      expect(result.trend).toBe('neutral');
      expect(result.formatted).toBe('0.0%');
      expect(result.value).toBe(0);
    });

    it('handles both current and previous zero gracefully', () => {
      const result = formatPercentChange(0, 0);
      expect(result.trend).toBe('neutral');
      expect(result.formatted).toBe('0.0%');
    });

    it('handles previous zero gracefully without dividing by zero', () => {
      const result = formatPercentChange(50, 0);
      expect(result.trend).toBe('up');
      expect(result.formatted).toBe('+100.0%');
    });
  });

  describe('formatDateShort', () => {
    it('formats ISO dates YYYY-MM-DD into readable short month/day strings', () => {
      expect(formatDateShort('2026-10-17')).toBe('17 out');
      expect(formatDateShort('2026-09-17')).toBe('17 set');
      expect(formatDateShort('2026-01-05')).toBe('5 jan');
    });

    it('returns empty string on empty or invalid input', () => {
      expect(formatDateShort('')).toBe('');
      expect(formatDateShort('invalid-date')).toBe('invalid-date');
      expect(formatDateShort('2026-99-99')).toBe('2026-99-99');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with thousand separators', () => {
      expect(formatNumber(565080)).toMatch(/565[.,]080/);
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(42)).toBe('42');
    });
  });
});
