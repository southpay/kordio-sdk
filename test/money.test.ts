import { describe, expect, test } from 'bun:test'
import {
  checkBalanced,
  formatMinorUnits,
  KordioAmountError,
  parseDecimal,
  toMinorUnits,
} from '../src/core/money'

describe('toMinorUnits', () => {
  test('accepts bigint, safe integers and decimal strings', () => {
    expect(toMinorUnits(1234n)).toBe(1234n)
    expect(toMinorUnits(-1234)).toBe(-1234n)
    expect(toMinorUnits('9007199254740993000000')).toBe(9007199254740993000000n)
  })

  test('rejects floats, so 12.34 never silently becomes 12 minor units', () => {
    expect(() => toMinorUnits(12.34)).toThrow(KordioAmountError)
  })

  test('rejects numbers past MAX_SAFE_INTEGER instead of losing precision', () => {
    expect(() => toMinorUnits(Number.MAX_SAFE_INTEGER + 1)).toThrow(KordioAmountError)
  })

  test('rejects non-numeric strings', () => {
    expect(() => toMinorUnits('12.34')).toThrow(KordioAmountError)
    expect(() => toMinorUnits('abc')).toThrow(KordioAmountError)
  })
})

describe('decimal conversion', () => {
  test('formats minor units at any precision', () => {
    expect(formatMinorUnits(9700000n, 6)).toBe('9.700000')
    expect(formatMinorUnits(-500n, 2)).toBe('-5.00')
    expect(formatMinorUnits(1n, 18)).toBe('0.000000000000000001')
    expect(formatMinorUnits(42n, 0)).toBe('42')
  })

  test('parses decimals into minor units without float math', () => {
    expect(parseDecimal('9.7', 6)).toBe(9700000n)
    expect(parseDecimal('-5', 2)).toBe(-500n)
    expect(parseDecimal('0.1', 18)).toBe(100000000000000000n)
  })

  test('refuses more precision than the currency carries', () => {
    expect(() => parseDecimal('1.234', 2)).toThrow(KordioAmountError)
  })
})

describe('checkBalanced', () => {
  test('balances per currency independently', () => {
    const result = checkBalanced([
      { amount: 500000n, currency: 'BTC', direction: 'debit' },
      { amount: 500000n, currency: 'BTC', direction: 'credit' },
      { amount: 30000000n, currency: 'USDC', direction: 'debit' },
      { amount: 29100000n, currency: 'USDC', direction: 'credit' },
      { amount: 900000n, currency: 'USDC', direction: 'credit' },
    ])
    expect(result.balanced).toBe(true)
  })

  test('names the currency that does not balance', () => {
    const result = checkBalanced([
      { amount: 100n, currency: 'EUR', direction: 'debit' },
      { amount: 99n, currency: 'EUR', direction: 'credit' },
    ])
    expect(result.balanced).toBe(false)
    expect(result.offenders).toEqual(['EUR'])
  })
})
