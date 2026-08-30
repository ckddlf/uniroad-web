/** 1234567 → 1,234,567 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('ko-KR').format(value);
}

/**
 * 금액 표시.
 * 가계부에 currency 필드가 없어 통화 기호는 호출부에서 추론해 넘긴다.
 */
export function formatAmount(value: number | null | undefined, symbol?: string): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  const digits = Number.isInteger(value) ? 0 : 2;
  const text = new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  }).format(value);
  return symbol ? `${symbol}${text}` : text;
}

/** 정가 대비 할인율 — 계산할 수 없으면 null */
export function discountRate(
  originalPrice: number | null | undefined,
  transferPrice: number | null | undefined,
): number | null {
  if (!originalPrice || originalPrice <= 0) return null;
  if (transferPrice === null || transferPrice === undefined) return null;
  if (transferPrice >= originalPrice) return null;
  return Math.round(((originalPrice - transferPrice) / originalPrice) * 100);
}

/** 1024 → 1KB */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/** 닉네임이 있으면 닉네임, 없으면 이름 */
export function displayName(
  nickname: string | null | undefined,
  name: string | null | undefined,
): string {
  return nickname?.trim() || name?.trim() || '알 수 없음';
}

/** 아바타 이니셜 */
export function initial(value: string | null | undefined): string {
  const text = value?.trim();
  return text ? text.slice(0, 1).toUpperCase() : '?';
}
