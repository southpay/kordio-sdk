export class KordioSignatureError extends Error {
  readonly reason: 'missing_header' | 'malformed_header' | 'timestamp_out_of_tolerance' | 'no_match'

  constructor(reason: KordioSignatureError['reason'], message: string) {
    super(message)
    this.name = 'KordioSignatureError'
    this.reason = reason
  }
}

export interface VerifyWebhookOptions {
  payload: string | Uint8Array
  header: string | null | undefined
  secret: string | readonly string[]
  toleranceSeconds?: number
  nowSeconds?: number
}

const DEFAULT_TOLERANCE_SECONDS = 300
const encoder = new TextEncoder()

function parseHeader(header: string): { timestamp: string; signatures: string[] } {
  const signatures: string[] = []
  let timestamp: string | null = null
  for (const part of header.split(',')) {
    const index = part.indexOf('=')
    if (index === -1) continue
    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (key === 't') timestamp = value
    else if (key === 'v1') signatures.push(value)
  }
  if (timestamp === null || signatures.length === 0) {
    throw new KordioSignatureError(
      'malformed_header',
      'Kordio-Signature header must contain a `t=` timestamp and at least one `v1=` signature',
    )
  }
  return { timestamp, signatures }
}

function toBytes(payload: string | Uint8Array): Uint8Array {
  return typeof payload === 'string' ? encoder.encode(payload) : payload
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let out = ''
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0')
  return out
}

async function hmacHex(secret: string, message: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, message as BufferSource)
  return toHex(signature)
}

export async function verifyWebhookSignature(options: VerifyWebhookOptions): Promise<true> {
  if (!options.header) {
    throw new KordioSignatureError('missing_header', 'Kordio-Signature header is missing')
  }

  const { timestamp, signatures } = parseHeader(options.header)
  const tolerance = options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS

  if (tolerance > 0) {
    const sent = Number(timestamp)
    const now = options.nowSeconds ?? Math.floor(Date.now() / 1000)
    if (!Number.isFinite(sent) || Math.abs(now - sent) > tolerance) {
      throw new KordioSignatureError(
        'timestamp_out_of_tolerance',
        `signature timestamp ${timestamp} is outside the ${tolerance}s tolerance window`,
      )
    }
  }

  const body = toBytes(options.payload)
  const signed = new Uint8Array(encoder.encode(`${timestamp}.`).length + body.length)
  const prefix = encoder.encode(`${timestamp}.`)
  signed.set(prefix, 0)
  signed.set(body, prefix.length)

  const secrets = typeof options.secret === 'string' ? [options.secret] : options.secret
  for (const secret of secrets) {
    const computed = await hmacHex(secret, signed)
    for (const candidate of signatures) {
      if (constantTimeEqual(computed, candidate)) return true
    }
  }

  throw new KordioSignatureError('no_match', 'no signature matched the provided secret(s)')
}

export interface ConstructEventOptions<_T> extends VerifyWebhookOptions {
  payload: string
}

export async function constructWebhookEvent<T = unknown>(
  options: ConstructEventOptions<T>,
): Promise<T> {
  await verifyWebhookSignature(options)
  return JSON.parse(options.payload) as T
}
