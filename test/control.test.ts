import { describe, expect, test } from 'bun:test'
import { KordioAgent, KordioWorkspace } from '../src/control/client'
import { assertAllowed, KordioDeniedError } from '../src/control/decision'
import { KordioAuthenticationError } from '../src/core/errors'
import { KordioLedger } from '../src/ledger/client'
import { mockFetch } from './helpers'

function agent(server: ReturnType<typeof mockFetch>) {
  return new KordioAgent({
    agentKey: 'krt_test_abc',
    baseUrl: 'https://api.test',
    fetch: server.fetch,
  })
}

const ALLOWED = {
  status: 201,
  body: {
    data: { id: 'ai_1', state: 'pending', cost_cents: 12000 },
    decision: {
      outcome: 'allowed',
      rule: null,
      detail: {},
      headroom: { session_remaining_cents: 38000 },
      policy_snapshot: [],
    },
    cosignature: 'eyJhbGciOiJFUzI1NiJ9',
  },
}

const DENIED = {
  status: 403,
  body: {
    data: { id: 'ai_2', state: 'denied', cost_cents: 120000 },
    decision: {
      outcome: 'denied',
      rule: 'per_transaction_cap',
      detail: { max_cents: 50000, requested_cents: 120000 },
      headroom: { session_remaining_cents: 380000 },
      policy_snapshot: [],
    },
  },
}

const REQUIRES_APPROVAL = {
  status: 202,
  body: {
    data: { id: 'ai_3', state: 'requires_approval' },
    decision: {
      outcome: 'requires_approval',
      rule: 'approval_threshold',
      detail: { above_cents: 100000 },
      headroom: {},
      policy_snapshot: [],
    },
  },
}

describe('actions.authorize', () => {
  test('an allowed decision carries the cosignature and headroom', async () => {
    const server = mockFetch([ALLOWED])
    const result = await agent(server).actions.authorize({
      budgetId: 'b_1',
      actionType: 'payment.create',
      resource: 'acme-supplies.example',
      costCents: 12000,
      idempotencyKey: 'order-4471-attempt-1',
    })

    expect(result.outcome).toBe('allowed')
    expect(result.allowed).toBe(true)
    if (result.outcome === 'allowed') expect(result.cosignature).toBe('eyJhbGciOiJFUzI1NiJ9')
    expect(result.headroom.session_remaining_cents).toBe(38000)
    expect(server.last().headers['idempotency-key']).toBe('order-4471-attempt-1')
    expect(server.last().headers.authorization).toBe('Bearer krt_test_abc')
    expect(server.last().body).toEqual({
      budget_id: 'b_1',
      action_type: 'payment.create',
      resource: 'acme-supplies.example',
      cost_cents: 12000,
    })
  })

  test('a denial is a returned decision, not a thrown error', async () => {
    const server = mockFetch([DENIED])
    const result = await agent(server).actions.authorize({
      budgetId: 'b_1',
      actionType: 'payment.create',
      costCents: 120000,
      idempotencyKey: 'k',
    })

    expect(result.outcome).toBe('denied')
    expect(result.allowed).toBe(false)
    expect(result.rule).toBe('per_transaction_cap')
    expect(result.detail).toEqual({ max_cents: 50000, requested_cents: 120000 })
    expect(result.status).toBe(403)
  })

  test('requires_approval is its own outcome', async () => {
    const server = mockFetch([REQUIRES_APPROVAL])
    const result = await agent(server).actions.authorize({
      budgetId: 'b_1',
      actionType: 'payment.create',
      idempotencyKey: 'k',
    })
    expect(result.outcome).toBe('requires_approval')
    expect(result.rule).toBe('approval_threshold')
  })

  test('assertAllowed turns a non-allow into a throw for callers that want one', async () => {
    const server = mockFetch([DENIED])
    const result = await agent(server).actions.authorize({
      budgetId: 'b_1',
      actionType: 'payment.create',
      idempotencyKey: 'k',
    })
    expect(() => assertAllowed(result)).toThrow(KordioDeniedError)
  })

  test('a real 401 still throws rather than pretending to be a decision', async () => {
    const server = mockFetch([
      {
        status: 401,
        body: { error: { message: 'Agent key is required', code: 'runtime_key_required' } },
      },
    ])
    await expect(
      agent(server).actions.authorize({ budgetId: 'b', actionType: 'x', idempotencyKey: 'k' }),
    ).rejects.toBeInstanceOf(KordioAuthenticationError)
  })

  test('requires a per-attempt idempotency key', async () => {
    const server = mockFetch([ALLOWED])
    await expect(
      agent(server).actions.authorize({ budgetId: 'b', actionType: 'x' }),
    ).rejects.toThrow(/requires an `idempotencyKey`/)
  })
})

describe('payment intents', () => {
  test('carry the idempotency key in the body, not the header', async () => {
    const server = mockFetch([{ status: 201, body: ALLOWED.body }])
    await agent(server).paymentIntents.authorize({
      budgetId: 'b_1',
      amountCents: 9900,
      counterparty: 'acme-supplies.example',
      idempotencyKey: 'pay-1',
    })
    expect(server.last().body).toEqual({
      budget_id: 'b_1',
      amount_cents: 9900,
      idempotency_key: 'pay-1',
      counterparty: 'acme-supplies.example',
    })
    expect(server.last().headers['idempotency-key']).toBeUndefined()
  })
})

describe('budgets and spend tokens', () => {
  test('open a budget', async () => {
    const server = mockFetch([
      { status: 201, body: { data: { id: 'b_1', remaining_cents: 50000 } } },
    ])
    const budget = await agent(server).budgets.create({ budgetCents: 50000, currency: 'USD' })
    expect(budget.remaining_cents).toBe(50000)
    expect(server.last().url).toBe('https://api.test/v1/agent/budgets')
    expect(server.last().body).toEqual({ budget_cents: 50000, currency: 'USD' })
  })

  test('mint a spend token pinned to a counterparty', async () => {
    const server = mockFetch([{ status: 201, body: { data: { id: 'st_1' } } }])
    await agent(server).spendTokens.create({
      budgetId: 'b_1',
      amountCeilingCents: 20000,
      counterparty: 'acme-supplies.example',
      expiresAt: new Date('2026-09-01T00:00:00Z'),
    })
    expect(server.last().body).toEqual({
      budget_id: 'b_1',
      amount_ceiling_cents: 20000,
      counterparty: 'acme-supplies.example',
      expires_at: '2026-09-01T00:00:00.000Z',
    })
  })
})

describe('workspace client', () => {
  function workspace(server: ReturnType<typeof mockFetch>) {
    return new KordioWorkspace({
      token: 'identity-token',
      workspace: 'acme-procurement',
      baseUrl: 'https://api.test',
      fetch: server.fetch,
    })
  }

  test('scopes every call to the workspace slug', async () => {
    const server = mockFetch([{ body: { data: [], has_more: false, next_cursor: null } }])
    await workspace(server).agents.list({ limit: 10 })
    expect(server.last().url).toBe(
      'https://api.test/v1/workspaces/acme-procurement/agents?limit=10',
    )
    expect(server.last().headers.authorization).toBe('Bearer identity-token')
  })

  test('paginates with starting_after rather than cursor', async () => {
    const server = mockFetch((req) =>
      req.url.includes('starting_after=ai_2')
        ? { body: { data: [{ id: 'ai_3' }], has_more: false, next_cursor: null } }
        : { body: { data: [{ id: 'ai_1' }, { id: 'ai_2' }], has_more: true, next_cursor: 'ai_2' } },
    )
    const page = await workspace(server).actionIntents.list({ state: 'requires_approval' })
    const all = await page.toArray()
    expect(all).toHaveLength(3)
    expect(server.requests[0]?.url).toContain('state=requires_approval')
    expect(server.requests[1]?.url).toContain('starting_after=ai_2')
  })

  test('approves a held intent', async () => {
    const server = mockFetch([{ body: { data: { id: 'ai_1', state: 'pending' } } }])
    await workspace(server).actionIntents.approve('ai_1')
    expect(server.last().method).toBe('POST')
    expect(server.last().url).toBe(
      'https://api.test/v1/workspaces/acme-procurement/action_intents/ai_1/approve',
    )
  })
})

describe('credential separation', () => {
  function withoutEnv<T>(names: string[], fn: () => T): T {
    const saved = names.map((name) => [name, process.env[name]] as const)
    for (const name of names) delete process.env[name]
    try {
      return fn()
    } finally {
      for (const [name, value] of saved) {
        if (value !== undefined) process.env[name] = value
      }
    }
  }

  test('an agent client refuses to construct without an agent key', () => {
    withoutEnv(['KORDIO_AGENT_KEY'], () => {
      expect(() => new KordioAgent({ baseUrl: 'https://x' })).toThrow(/needs an agent key/)
    })
  })

  test('a workspace client refuses to construct without a slug', () => {
    withoutEnv(['KORDIO_WORKSPACE'], () => {
      expect(() => new KordioWorkspace({ token: 't', baseUrl: 'https://x' })).toThrow(
        /needs a workspace slug/,
      )
    })
  })

  test('a ledger client refuses to construct without credentials', () => {
    withoutEnv(['KORDIO_TOKEN', 'KORDIO_CLIENT_ID', 'KORDIO_CLIENT_SECRET'], () => {
      expect(() => new KordioLedger({ baseUrl: 'https://x' })).toThrow(/needs credentials/)
    })
  })
})
