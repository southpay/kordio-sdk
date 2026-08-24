import { describe, expect, test } from 'bun:test'
import {
  KordioRateLimitError,
  KordioUnbalancedError,
  KordioValidationError,
} from '../src/core/errors'
import { KordioLedger } from '../src/ledger/client'
import { KordioPostingError } from '../src/ledger/postings'
import { ledgerEnvelope, ledgerList, mockFetch } from './helpers'

function client(server: ReturnType<typeof mockFetch>, options = {}) {
  return new KordioLedger({
    accessToken: 'test-token',
    baseUrl: 'https://api.test',
    fetch: server.fetch,
    maxRetries: 2,
    ...options,
  })
}

describe('transactions.create', () => {
  test('turns signed amounts into the API debit/credit wire format', async () => {
    const server = mockFetch([
      { status: 201, body: ledgerEnvelope({ object: 'transaction', id: 'tx_1' }) },
    ])
    const kordio = client(server)

    await kordio.transactions.create({
      idempotencyKey: 'order:4471:debit',
      postings: [
        { accountId: 'customer:4471', amount: -12000, currency: 'EUR' },
        { accountId: 'merchant_payable', amount: 12000, currency: 'EUR' },
      ],
      metadata: { orderId: '4471' },
    })

    const request = server.last()
    expect(request.method).toBe('POST')
    expect(request.url).toBe('https://api.test/ledger/v1/transactions')
    expect(request.headers['idempotency-key']).toBe('order:4471:debit')
    expect(request.body).toEqual({
      postings: [
        { account: 'customer:4471', amount: '12000', currency: 'EUR', direction: 'credit' },
        { account: 'merchant_payable', amount: '12000', currency: 'EUR', direction: 'debit' },
      ],
      metadata: { orderId: '4471' },
    })
  })

  test('accepts explicit directions with positive magnitudes', async () => {
    const server = mockFetch([{ status: 201, body: ledgerEnvelope({ object: 'transaction' }) }])
    await client(server).transactions.create({
      idempotencyKey: 'k',
      postings: [
        { account: 'cash:usd', amount: '10000000', currency: 'USDC', direction: 'debit' },
        { account: 'revenue:fees', amount: '10000000', currency: 'USDC', direction: 'credit' },
      ],
    })
    const postings = (server.last().body as { postings: unknown[] }).postings
    expect(postings[0]).toEqual({
      account: 'cash:usd',
      amount: '10000000',
      currency: 'USDC',
      direction: 'debit',
    })
  })

  test('handles amounts past Number.MAX_SAFE_INTEGER via bigint', async () => {
    const server = mockFetch([{ status: 201, body: ledgerEnvelope({ object: 'transaction' }) }])
    await client(server).transactions.create({
      idempotencyKey: 'k',
      postings: [
        { account: 'wallet:eth', amount: 10_000000000000000000n, currency: 'ETH' },
        { account: 'revenue:eth', amount: -10_000000000000000000n, currency: 'ETH' },
      ],
    })
    const postings = (server.last().body as { postings: { amount: string }[] }).postings
    expect(postings[0]?.amount).toBe('10000000000000000000')
  })

  test('refuses to send an unbalanced transaction', async () => {
    const server = mockFetch([{ status: 201, body: ledgerEnvelope({}) }])
    await expect(
      client(server).transactions.create({
        idempotencyKey: 'k',
        postings: [
          { account: 'a', amount: 100, currency: 'EUR' },
          { account: 'b', amount: -99, currency: 'EUR' },
        ],
      }),
    ).rejects.toThrow(KordioPostingError)
    expect(server.requests).toHaveLength(0)
  })

  test('refuses a contradictory sign and direction', async () => {
    const server = mockFetch([{ status: 201, body: ledgerEnvelope({}) }])
    await expect(
      client(server).transactions.create({
        idempotencyKey: 'k',
        postings: [{ account: 'a', amount: -100, currency: 'EUR', direction: 'debit' }],
      }),
    ).rejects.toThrow(/direction "debit" but the amount is negative/)
  })

  test('requires an idempotency key on writes', async () => {
    const server = mockFetch([{ status: 201, body: ledgerEnvelope({}) }])
    await expect(
      client(server).transactions.create({
        postings: [
          { account: 'a', amount: 100, currency: 'EUR' },
          { account: 'b', amount: -100, currency: 'EUR' },
        ],
      }),
    ).rejects.toThrow(/requires an idempotency key/)
  })

  test('dry runs need no key and set dry_run', async () => {
    const server = mockFetch([{ status: 201, body: { object: 'dry_run', valid: true } }])
    await client(server).transactions.dryRun({
      postings: [
        { account: 'a', amount: 100, currency: 'EUR' },
        { account: 'b', amount: -100, currency: 'EUR' },
      ],
    })
    expect(server.last().url).toContain('dry_run=true')
    expect(server.last().headers['idempotency-key']).toBeUndefined()
  })
})

describe('errors', () => {
  test('maps an unbalanced 422 to a typed error carrying the currency totals', async () => {
    const server = mockFetch([
      {
        status: 422,
        body: {
          error: {
            code: 'unbalanced',
            message: 'transaction does not balance',
            details: { by_currency: { EUR: { debit: '100', credit: '99' } } },
          },
          livemode: false,
          request_id: 'req_x',
        },
      },
    ])
    try {
      await client(server).transactions.create({
        idempotencyKey: 'k',
        validate: false,
        postings: [{ account: 'a', amount: 100, currency: 'EUR' }],
      })
      throw new Error('should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(KordioUnbalancedError)
      const typed = error as KordioUnbalancedError
      expect(typed.code).toBe('unbalanced')
      expect(typed.requestId).toBe('req_x')
      expect(typed.byCurrency.EUR).toEqual({ debit: '100', credit: '99' })
    }
  })

  test('surfaces 422 as a validation error', async () => {
    const server = mockFetch([
      { status: 422, body: { error: { code: 'invalid_request', message: 'bad' } } },
    ])
    await expect(client(server).accounts.get('a')).rejects.toBeInstanceOf(KordioValidationError)
  })
})

describe('retries', () => {
  test('retries a rate-limited read and honours Retry-After', async () => {
    const server = mockFetch([
      {
        status: 429,
        body: { error: { code: 'rate_limited', message: 'slow down' } },
        headers: { 'retry-after': '0' },
      },
      { status: 200, body: ledgerEnvelope({ object: 'account', id: 'cash:usd' }) },
    ])
    const account = await client(server).accounts.get('cash:usd')
    expect(server.requests).toHaveLength(2)
    expect((account as { id: string }).id).toBe('cash:usd')
  })

  test('gives up after maxRetries and throws the rate limit error', async () => {
    const server = mockFetch([
      {
        status: 429,
        body: { error: { code: 'rate_limited', message: 'slow' } },
        headers: { 'retry-after': '0' },
      },
    ])
    await expect(client(server, { maxRetries: 1 }).accounts.get('cash:usd')).rejects.toBeInstanceOf(
      KordioRateLimitError,
    )
    expect(server.requests).toHaveLength(2)
  })
})

describe('pagination', () => {
  test('iterates across pages transparently', async () => {
    const server = mockFetch((req) =>
      req.url.includes('cursor=page2')
        ? { body: ledgerList([{ id: 'c' }]) }
        : { body: ledgerList([{ id: 'a' }, { id: 'b' }], { hasMore: true, nextCursor: 'page2' }) },
    )
    const page = await client(server).accounts.list({ limit: 2 })
    const all: unknown[] = []
    for await (const account of page) all.push(account)
    expect(all).toHaveLength(3)
    expect(server.requests).toHaveLength(2)
    expect(server.requests[0]?.url).toContain('limit=2')
  })

  test('toArray can stop early without fetching more pages', async () => {
    const server = mockFetch([
      { body: ledgerList([{ id: 'a' }, { id: 'b' }], { hasMore: true, nextCursor: 'p2' }) },
    ])
    const page = await client(server).accounts.list()
    expect(await page.toArray({ limit: 1 })).toHaveLength(1)
    expect(server.requests).toHaveLength(1)
  })
})

describe('ledger scoping', () => {
  test('sends X-Ledger-Id when configured', async () => {
    const server = mockFetch([{ body: ledgerEnvelope({}) }])
    await client(server, { ledgerId: 'led_123' }).accounts.get('cash:usd')
    expect(server.last().headers['x-ledger-id']).toBe('led_123')
  })

  test('a per-call ledgerId overrides the client default', async () => {
    const server = mockFetch([{ body: ledgerEnvelope({}) }])
    await client(server, { ledgerId: 'led_123' }).accounts.get('cash:usd', {
      ledgerId: 'led_other',
    })
    expect(server.last().headers['x-ledger-id']).toBe('led_other')
  })
})

describe('balances', () => {
  test('reads an account balance as signed decimal strings', async () => {
    const server = mockFetch([
      {
        body: ledgerEnvelope({
          object: 'balance',
          account: 'accounts_receivable:acme',
          currency: 'USDC',
          posted: '9700000',
          pending: '0',
          available: '9700000',
        }),
      },
    ])
    const balance = await client(server).balances.get('accounts_receivable:acme')
    expect(server.last().url).toBe(
      'https://api.test/ledger/v1/accounts/accounts_receivable:acme/balance',
    )
    expect(BigInt(balance.available ?? '0')).toBe(9700000n)
  })

  test('accounts.balance hits the same endpoint', async () => {
    const server = mockFetch([{ body: ledgerEnvelope({ object: 'balance' }) }])
    await client(server).accounts.balance('cash:usd')
    expect(server.last().url).toBe('https://api.test/ledger/v1/accounts/cash:usd/balance')
  })
})

describe('path encoding', () => {
  test('keeps colons readable but escapes slashes in ids', async () => {
    const server = mockFetch([{ body: ledgerEnvelope({}) }])
    await client(server).accounts.get('accounts_payable:onchain/acme')
    expect(server.last().url).toBe(
      'https://api.test/ledger/v1/accounts/accounts_payable:onchain%2Facme',
    )
  })
})

describe('contract details the live API taught us', () => {
  test('creating an account needs only id, name, type and currency', async () => {
    const server = mockFetch([{ status: 201, body: ledgerEnvelope({ object: 'account' }) }])
    await client(server).accounts.create({
      id: 'cash:usd',
      name: 'Operating cash',
      type: 'asset',
      currency: 'USDC',
    })
    expect(server.last().body).toEqual({
      id: 'cash:usd',
      name: 'Operating cash',
      type: 'asset',
      currency: 'USDC',
    })
  })

  test('lookup sends the rail/kind/value tuple the API actually wants', async () => {
    const server = mockFetch([{ body: ledgerEnvelope({ object: 'transaction', id: 'tx_1' }) }])
    await client(server).transactions.lookup({
      rail: 'ethereum',
      kind: 'tx_hash',
      value: '0xabc123',
    })
    const url = new URL(server.last().url)
    expect(url.pathname).toBe('/ledger/v1/transactions/lookup')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      rail: 'ethereum',
      kind: 'tx_hash',
      value: '0xabc123',
    })
  })

  test('lookup names the missing part of the tuple before spending a round trip', async () => {
    const server = mockFetch([{ body: ledgerEnvelope({}) }])
    await expect(
      (client(server).transactions.lookup as unknown as (p: unknown) => Promise<unknown>)({
        rail: 'ethereum',
        kind: 'tx_hash',
      }),
    ).rejects.toThrow(/Missing: value/)
    expect(server.requests).toHaveLength(0)
  })

  test('statement is a statement object, not a page of postings', async () => {
    const server = mockFetch([
      {
        body: ledgerEnvelope({
          object: 'account_statement',
          account: 'cash:usd',
          currency: 'USDC',
          period: { from: null, to: '2026-08-24T00:00:00Z' },
          opening_balance: { posted: '0', pending: '0', currency: 'USDC' },
          closing_balance: { posted: '10000000', pending: '0', currency: 'USDC' },
          entries: [{ object: 'posting', id: 1 }],
          entry_count: 1,
          truncated: false,
        }),
      },
    ])
    const statement = await client(server).accounts.statement('cash:usd', { limit: 50 })
    expect(statement.object).toBe('account_statement')
    expect(statement.closing_balance.posted).toBe('10000000')
    expect(statement.entries).toHaveLength(1)
    expect(server.last().url).toContain('limit=50')
    expect(server.last().url).not.toContain('cursor')
  })

  test('list calls do not send include_total, which the API ignores', async () => {
    const server = mockFetch([{ body: ledgerList([]) }])
    await client(server).accounts.list({ limit: 5 })
    expect(server.last().url).not.toContain('include_total')
  })
})

describe('path segments', () => {
  test('an empty id fails loudly instead of building a broken url', async () => {
    const server = mockFetch([{ body: ledgerEnvelope({}) }])
    await expect(client(server).accounts.get('')).rejects.toThrow(/path segment is empty/)
    await expect(client(server).transactions.get('   ')).rejects.toThrow(/path segment is empty/)
    expect(server.requests).toHaveLength(0)
  })
})

describe('default base url', () => {
  test('resolves to the prefix the ledger is served under, not the host root', async () => {
    const server = mockFetch([{ status: 200, body: ledgerList([]) }])
    const kordio = new KordioLedger({ accessToken: 'test-token', fetch: server.fetch })

    await kordio.accounts.list()

    expect(server.last().url).toBe('https://api.kordio.io/ledger/v1/accounts')
  })
})
