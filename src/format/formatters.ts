/**
 * Formatadores Contábeis e Monetários determinísticos
 * Padrão Apple HIG com suporte a números tabulares
 */

const MONTH_NAMES_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

/**
 * Converte um valor em micros (1 USD = 1.000.000 micros) para uma string formatada em US$.
 * Se o valor for menor que US$ 0.01 e diferente de zero, exibe 4 casas decimais para preservar precisão.
 */
export function microsToUsd(
  micros: number | bigint,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const numericMicros = typeof micros === 'bigint' ? Number(micros) : micros;
  const isNegative = numericMicros < 0;
  const absMicros = Math.abs(numericMicros);
  const dollars = absMicros / 1_000_000;

  if (absMicros === 0) {
    return '$0.00';
  }

  let minDigits = options?.minimumFractionDigits ?? 2;
  let maxDigits = options?.maximumFractionDigits ?? 2;

  if (dollars < 0.01 && options?.maximumFractionDigits === undefined) {
    minDigits = 4;
    maxDigits = 4;
  }

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(dollars);

  return isNegative ? `-${formatted}` : formatted;
}

export interface PercentChange {
  value: number;
  formatted: string;
  trend: 'up' | 'down' | 'neutral';
}

/**
 * Calcula a variação percentual entre o valor atual e o anterior com sinal explícito.
 */
export function formatPercentChange(current: number, previous: number): PercentChange {
  if (previous === 0) {
    if (current === 0) {
      return { value: 0, formatted: '0.0%', trend: 'neutral' };
    }
    return { value: 100, formatted: '+100.0%', trend: 'up' };
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;
  const rounded = Math.round(change * 10) / 10;

  if (rounded === 0) {
    return { value: 0, formatted: '0.0%', trend: 'neutral' };
  }

  if (rounded > 0) {
    return { value: rounded, formatted: `+${rounded.toFixed(1)}%`, trend: 'up' };
  }

  return { value: rounded, formatted: `${rounded.toFixed(1)}%`, trend: 'down' };
}

/**
 * Converte data ISO YYYY-MM-DD em formato curto legível: "17 out".
 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const monthIndex = parseInt(parts[1] ?? '0', 10) - 1;
  const day = parseInt(parts[2] ?? '0', 10);

  if (monthIndex < 0 || monthIndex >= 12 || isNaN(day)) {
    return dateStr;
  }

  const monthName = MONTH_NAMES_SHORT[monthIndex];
  return `${day} ${monthName}`;
}

/**
 * Formata números inteiros com separadores de milhar (ex.: 565080 -> "565.080").
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('pt-BR').format(n);
}
