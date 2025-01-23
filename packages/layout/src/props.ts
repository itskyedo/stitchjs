export type Display = keyof typeof Display;
export const Display = Object.freeze({
  block: 'block',
  inlineBlock: 'inlineBlock',
});

export type Fill = typeof Fill;
export const Fill = 'fill';

export type Intrinsic = typeof Intrinsic;
export const Intrinsic = 'intrinsic';

export type Percent = `${number}%`;

/**
 * Resolves a unit to a fixed value.
 *
 * @param value - The value.
 * @param containerSize - The size of the container.
 * @param override - The override value.
 * @returns - A fixed value.
 */
export function parseUnit(
  value: number | Intrinsic | Fill | Percent | null,
  containerSize: number | null | undefined,
  override: number | null | undefined,
): number {
  if (typeof override === 'number') {
    return override;
  } else if (typeof value === 'number') {
    return value;
  } else if (isPercent(value)) {
    const ratio = percentToFloat(value);
    return ratio > 0 ? (containerSize ?? 0) * ratio : 0;
  } else if (value === Fill) {
    return 0;
  } else {
    return 0;
  }
}

/**
 * Checks if a value is a number.
 *
 * @param value - The value to check.
 * @returns - `true` if the value is a number, `false` otherwise.
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

/**
 * Checks if a value is a percent.
 *
 * @param value - The value to check.
 * @returns - `true` if the value is a percent, `false` otherwise.
 */
export function isPercent(value: unknown): value is Percent {
  return (
    typeof value === 'string' &&
    value.at(-1) === '%' &&
    Number.isFinite(Number(value.substring(0, value.length - 1)))
  );
}

/**
 * Converts a percent to a floating number.
 *
 * @param percent - The percent to convert.
 * @returns - The percent as a floating number.
 */
export function percentToFloat(percent: Percent): number {
  return Number(percent.substring(0, percent.length - 1)) / 100;
}
