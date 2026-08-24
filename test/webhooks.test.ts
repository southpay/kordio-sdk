import { describe, expect, test } from 'bun:test'
import { createHmac } from 'node:crypto'
import {
  constructWebhookEvent,
  KordioSignatureError,
  verifyWebhookSignature,
} from '../src/core/webhooks'

const SECRET = 'whsec_test_abc123'

function sign(payload: string, secret = SECRET, timestamp = 1_756_000_000): string {
  const digest = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex')
  return `t=${timestamp},v1=${digest}`
}

const PAYLOAD = JSON.stringify({ type: 'transaction.created', data: { id: 'tx_1' } })

describe('verifyWebhookSignature', () => {
  test('accepts a correctly signed payload', async () => {
    await expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        header: sign(PAYLOAD),
        secret: SECRET,
        nowSeconds: 1_756_000_010,
      }),
    ).resolves.toBe(true)
  })

  test('rejects a tampered payload', async () => {
    await expect(
      verifyWebhookSignature({
        payload: `${PAYLOAD} `,
        header: sign(PAYLOAD),
        secret: SECRET,
        nowSeconds: 1_756_000_010,
      }),
    ).rejects.toMatchObject({ reason: 'no_match' })
  })

  test('rejects the wrong secret', async () => {
    await expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        header: sign(PAYLOAD),
        secret: 'whsec_other',
        nowSeconds: 1_756_000_010,
      }),
    ).rejects.toBeInstanceOf(KordioSignatureError)
  })

  test('rejects a replayed delivery outside the tolerance window', async () => {
    await expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        header: sign(PAYLOAD),
        secret: SECRET,
        nowSeconds: 1_756_000_000 + 3600,
      }),
    ).rejects.toMatchObject({ reason: 'timestamp_out_of_tolerance' })
  })

  test('tolerance can be disabled for replay tooling', async () => {
    await expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        header: sign(PAYLOAD),
        secret: SECRET,
        toleranceSeconds: 0,
        nowSeconds: 1_756_000_000 + 86_400,
      }),
    ).resolves.toBe(true)
  })

  test('accepts either secret during a rotation', async () => {
    await expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        header: sign(PAYLOAD, 'whsec_new'),
        secret: [SECRET, 'whsec_new'],
        nowSeconds: 1_756_000_010,
      }),
    ).resolves.toBe(true)
  })

  test('rejects a missing or malformed header', async () => {
    await expect(
      verifyWebhookSignature({ payload: PAYLOAD, header: null, secret: SECRET }),
    ).rejects.toMatchObject({ reason: 'missing_header' })
    await expect(
      verifyWebhookSignature({ payload: PAYLOAD, header: 'nonsense', secret: SECRET }),
    ).rejects.toMatchObject({ reason: 'malformed_header' })
  })

  test('verifies raw bytes, not a re-serialized object', async () => {
    const raw = '{"type":"transaction.created",  "spaced":true}'
    await expect(
      verifyWebhookSignature({
        payload: new TextEncoder().encode(raw),
        header: sign(raw),
        secret: SECRET,
        nowSeconds: 1_756_000_010,
      }),
    ).resolves.toBe(true)
  })
})

describe('constructWebhookEvent', () => {
  test('verifies then parses', async () => {
    const event = await constructWebhookEvent<{ type: string }>({
      payload: PAYLOAD,
      header: sign(PAYLOAD),
      secret: SECRET,
      nowSeconds: 1_756_000_010,
    })
    expect(event.type).toBe('transaction.created')
  })

  test('never parses an unverified payload', async () => {
    await expect(
      constructWebhookEvent({
        payload: PAYLOAD,
        header: sign(PAYLOAD, 'wrong'),
        secret: SECRET,
        nowSeconds: 1_756_000_010,
      }),
    ).rejects.toBeInstanceOf(KordioSignatureError)
  })
})
