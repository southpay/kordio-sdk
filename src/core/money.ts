export type Direction = 'debit' | 'credit'

export type AmountInput = bigint | number | string

export class KordioAmountError extends TypeError {}

export function toMinorUnits(value: AmountInput, field = 'amount'): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new KordioAmountError(`${field} must be a finite number, received ${value}`)
    }
    if (!Number.isInteger(value)) {
      throw new KordioAmountError(
        `${field} must be an integer in minor units, received ${value}. ` +
          'Convert to minor units before calling (e.g. 12.34 EUR -> 1234).',
      )
    }
    if (!Number.isSafeInteger(value)) {
      throw new KordioAmountError(
        `${field} ${value} exceeds Number.MAX_SAFE_INTEGER. Pass a bigint or a decimal string.`,
      )
    }
    return BigInt(value)
  }
  const trimmed = value.trim()
  if (!/^-?\d+$/.test(trimmed)) {
    throw new KordioAmountError(
      `${field} must be a whole number of minor units as a decimal string, received "${value}".`,
    )
  }
  return BigInt(trimmed)
}

export function abs(value: bigint): bigint {
  return value < 0n ? -value : value
}

export function formatMinorUnits(value: bigint, decimals: number): string {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new KordioAmountError(`decimals must be a non-negative integer, received ${decimals}`)
  }
  if (decimals === 0) return value.toString()
  const negative = value < 0n
  const digits = abs(value)
    .toString()
    .padStart(decimals + 1, '0')
  const whole = digits.slice(0, digits.length - decimals)
  const fraction = digits.slice(digits.length - decimals)
  return `${negative ? '-' : ''}${whole}.${fraction}`
}

export function parseDecimal(value: string, decimals: number): bigint {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new KordioAmountError(`decimals must be a non-negative integer, received ${decimals}`)
  }
  const trimmed = value.trim()
  const match = /^(-?)(\d+)(?:\.(\d*))?$/.exec(trimmed)
  if (!match) {
    throw new KordioAmountError(`"${value}" is not a decimal number`)
  }
  const sign = match[1] === '-' ? -1n : 1n
  const whole = match[2] ?? '0'
  const fraction = match[3] ?? ''
  if (fraction.length > decimals) {
    throw new KordioAmountError(
      `"${value}" has ${fraction.length} decimal places but the currency carries ${decimals}.`,
    )
  }
  const padded = fraction.padEnd(decimals, '0')
  return sign * BigInt(`${whole}${padded}`)
}

export interface CurrencyTotals {
  debit: bigint
  credit: bigint
}

export interface BalanceCheck {
  balanced: boolean
  byCurrency: Record<string, CurrencyTotals>
  offenders: string[]
}

export function checkBalanced(
  entries: readonly { amount: bigint; currency: string; direction: Direction }[],
): BalanceCheck {
  const byCurrency: Record<string, CurrencyTotals> = {}
  for (const entry of entries) {
    const totals = byCurrency[entry.currency] ?? { debit: 0n, credit: 0n }
    if (entry.direction === 'debit') totals.debit += abs(entry.amount)
    else totals.credit += abs(entry.amount)
    byCurrency[entry.currency] = totals
  }
  const offenders = Object.entries(byCurrency)
    .filter(([, totals]) => totals.debit !== totals.credit)
    .map(([currency]) => currency)
  return { balanced: offenders.length === 0, byCurrency, offenders }
}
