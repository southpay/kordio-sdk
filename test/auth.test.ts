import { describe, expect, test } from 'bun:test'
import { KordioAuthenticationError } from '../src/core/errors'
import { OAuthAuthProvider } from '../src/ledger/auth'
import { KordioLedger } from '../src/ledger/client'
import { ledgerEnvelope } from './helpers'

interface Call {
  url: string
  method: string
  headers: Record<string, string>
  body: string | undefined
}

function tracker(handler: (call: Call, index: number) => Response) {
  const calls: Call[] = []
  const fetchImpl = async (url: string, init: RequestInit) => {
    const headers: Record<string, string> = {}
    for (const [k, v] of Object.entries((init.headers ?? {}) as Record<string, string>)) {
      headers[k.toLowerCase()] = v
    }
    const call: Call = {
      url,
      method: init.method ?? 'GET',
      headers,
      body: typeof init.body === 'string' ? init.body : undefined,
    }
    calls.push(call)
    return handler(call, calls.length - 1)
  }
  return { calls, fetch: fetchImpl }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('OAuth client credentials', () => {
  test('mints a token once and reuses it across calls', async () => {
    const t = tracker((call) =>
      call.url.endsWith('/oauth/token')
        ? json({ access_token: 'tok_1', token_type: 'Bearer', expires_in: 3600 })
        : json(ledgerEnvelope({ object: 'account' })),
    )
    const kordio = new KordioLedger({
      clientId: 'client_x',
      clientSecret: 'sk_test_y',
      baseUrl: 'https://api.test',
      fetch: t.fetch,
    })

    await kordio.accounts.get('cash:usd')
    await kordio.accounts.get('cash:eur')

    const tokenCalls = t.calls.filter((c) => c.url.endsWith('/oauth/token'))
    expect(tokenCalls).toHaveLength(1)
    expect(tokenCalls[0]?.body).toBe('grant_type=client_credentials')
    expect(tokenCalls[0]?.headers.authorization).toBe(
      `Basic ${Buffer.from('client_x:sk_test_y').toString('base64')}`,
    )
    const apiCalls = t.calls.filter((c) => !c.url.endsWith('/oauth/token'))
    expect(apiCalls).toHaveLength(2)
    expect(apiCalls[1]?.headers.authorization).toBe('Bearer tok_1')
  })

  test('refreshes once when the API rejects a cached token', async () => {
    let issued = 0
    const t = tracker((call) => {
      if (call.url.endsWith('/oauth/token')) {
        issued++
        return json({ access_token: `tok_${issued}`, token_type: 'Bearer', expires_in: 3600 })
      }
      return call.headers.authorization === 'Bearer tok_1'
        ? json({ error: { code: 'unauthorized', message: 'expired' } }, 401)
        : json(ledgerEnvelope({ object: 'account', id: 'cash:usd' }))
    })

    const kordio = new KordioLedger({
      clientId: 'c',
      clientSecret: 's',
      baseUrl: 'https://api.test',
      fetch: t.fetch,
    })

    const account = await kordio.accounts.get('cash:usd')
    expect((account as { id: string }).id).toBe('cash:usd')
    expect(issued).toBe(2)
  })

  test('requests the scopes it was given', async () => {
    const t = tracker(() => json({ access_token: 'tok', token_type: 'Bearer', expires_in: 3600 }))
    const provider = new OAuthAuthProvider({
      clientId: 'c',
      clientSecret: 's',
      baseUrl: 'https://api.test',
      scope: ['ledger:read', 'ledger:write'],
      fetch: t.fetch,
    })
    await provider.headers({ forceRefresh: false })
    expect(t.calls[0]?.body).toBe(
      'grant_type=client_credentials&scope=ledger%3Aread+ledger%3Awrite',
    )
  })

  test('surfaces invalid_client with a usable message', async () => {
    const t = tracker(() =>
      json({ error: 'invalid_client', error_description: 'client credentials are invalid' }, 401),
    )
    const provider = new OAuthAuthProvider({
      clientId: 'c',
      clientSecret: 'bad',
      baseUrl: 'https://api.test',
      fetch: t.fetch,
    })
    await expect(provider.headers({ forceRefresh: false })).rejects.toBeInstanceOf(
      KordioAuthenticationError,
    )
  })

  test('concurrent calls share a single token request', async () => {
    let issued = 0
    const t = tracker((call) => {
      if (call.url.endsWith('/oauth/token')) {
        issued++
        return json({ access_token: 'tok', token_type: 'Bearer', expires_in: 3600 })
      }
      return json(ledgerEnvelope({}))
    })
    const kordio = new KordioLedger({
      clientId: 'c',
      clientSecret: 's',
      baseUrl: 'https://api.test',
      fetch: t.fetch,
    })
    await Promise.all([
      kordio.accounts.get('a'),
      kordio.accounts.get('b'),
      kordio.accounts.get('c'),
    ])
    expect(issued).toBe(1)
  })
})

describe('token endpoint location', () => {
  test('the token endpoint is resolved against the host, not the API path prefix', async () => {
    const t = tracker((call) =>
      call.url.includes('/oauth/token')
        ? json({ access_token: 'tok', token_type: 'Bearer', expires_in: 3600 })
        : json(ledgerEnvelope({ object: 'account' })),
    )
    const kordio = new KordioLedger({
      clientId: 'c',
      clientSecret: 's',
      baseUrl: 'http://localhost:4000',
      fetch: t.fetch,
    })

    await kordio.accounts.get('cash:usd')

    expect(t.calls[0]?.url).toBe('http://localhost:4000/oauth/token')
    expect(t.calls[1]?.url).toBe('http://localhost:4000/ledger/v1/accounts/cash:usd')
  })

  test('an explicit tokenUrl wins', async () => {
    const t = tracker(() => json({ access_token: 'tok', token_type: 'Bearer', expires_in: 3600 }))
    const provider = new OAuthAuthProvider({
      clientId: 'c',
      clientSecret: 's',
      baseUrl: 'https://api.kordio.io',
      tokenUrl: 'https://auth.internal/token',
      fetch: t.fetch,
    })
    await provider.headers({ forceRefresh: false })
    expect(t.calls[0]?.url).toBe('https://auth.internal/token')
  })
})
