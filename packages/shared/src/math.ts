// mathjs's `isNumber` is exactly `typeof n === 'number'` (NaN included); it is
// inlined so these helpers do not load all of mathjs at Worker startup.
const isNumber = (value: unknown): value is number => typeof value === 'number';

export const round = (num: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const average = (arr: (number | null)[], includeZero = false) => {
  const filtered = arr.filter(
    (n): n is number =>
      isNumber(n) &&
      !Number.isNaN(n) &&
      Number.isFinite(n) &&
      (includeZero || n !== 0)
  );
  const avg = filtered.reduce((p, c) => p + c, 0) / filtered.length;
  return Number.isNaN(avg) ? 0 : avg;
};

export const sum = (arr: (number | null | undefined)[]): number =>
  round(arr.filter(isNumber).reduce((acc, item) => acc + item, 0));

export const min = (arr: (number | null | undefined)[]): number => {
  const filtered = arr.filter(isNumber);
  if (filtered.length === 0) {
    return 0;
  }
  return filtered.reduce((a, b) => (b < a ? b : a), filtered[0]!);
};

export const max = (arr: (number | null | undefined)[]): number => {
  const filtered = arr.filter(isNumber);
  if (filtered.length === 0) {
    return 0;
  }
  return filtered.reduce((a, b) => (b > a ? b : a), filtered[0]!);
};

export const ifNaN = <T extends number>(
  n: number | null | undefined,
  defaultValue: T
): T => (Number.isNaN(n) ? defaultValue : (n as T));
