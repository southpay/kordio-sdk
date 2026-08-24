import {
  buildError,
  KordioConnectionError,
  type KordioError,
  type KordioErrorSurface,
  KordioTimeoutError,
} from './errors'

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly (string | number)[]
  | Record<string, string | number | boolean | null | undefined>

export type Query = Record<string, QueryValue>

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>

export interface AuthProvider {
  headers(options: { forceRefresh: boolean }): Promise<Record<string, string>>
}

export interface RateLimitSnapshot {
  limit: number | null
  remaining: number | null
  resetSeconds: number | null
}

export interface HttpResponse<T> {
  status: number
  data: T
  headers: Record<string, string>
  requestId: string | undefined
  rateLimit: RateLimitSnapshot
  idempotentReplay: boolean
}

export interface RequestOptions {
  query?: Query
  body?: unknown
  headers?: Record<string, string>
  idempotencyKey?: string
  signal?: AbortSignal
  timeoutMs?: number
  maxRetries?: number
  expectedStatuses?: readonly number[]
}

export interface TransportConfig {
  surface: KordioErrorSurface
  baseUrl: string
  auth: AuthProvider
  fetch?: FetchLike
  timeoutMs?: number
  maxRetries?: number
  defaultHeaders?: Record<string, string>
  userAgentSuffix?: string
}

const SDK_VERSION = '0.4.1'
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])
const DEFAULT_TIMEOUT_MS = 60_000
const DEFAULT_MAX_RETRIES = 2
const MAX_BACKOFF_MS = 8_000

export function encodeQuery(query: Query | undefined): string {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      if (value.length === 0) continue
      params.set(key, value.join(','))
      continue
    }
    if (typeof value === 'object') {
      for (const [inner, innerValue] of Object.entries(value)) {
        if (innerValue === undefined || innerValue === null) continue
        params.append(`${key}[${inner}]`, String(innerValue))
      }
      continue
    }
    params.set(key, String(value))
  }
  const encoded = params.toString()
  return encoded ? `?${encoded}` : ''
}

function headersToObject(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {}
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value
  })
  return out
}

function toNumberOrNull(raw: string | undefined): number | null {
  if (raw === undefined) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

function readRateLimit(headers: Record<string, string>): RateLimitSnapshot {
  return {
    limit: toNumberOrNull(headers['x-ratelimit-limit']),
    remaining: toNumberOrNull(headers['x-ratelimit-remaining']),
    resetSeconds: toNumberOrNull(headers['x-ratelimit-reset']),
  }
}

function backoffMs(attempt: number, retryAfterSeconds: number | null): number {
  if (retryAfterSeconds !== null && retryAfterSeconds >= 0) {
    return Math.min(retryAfterSeconds * 1000, MAX_BACKOFF_MS)
  }
  const base = Math.min(2 ** attempt * 250, MAX_BACKOFF_MS)
  return base / 2 + Math.random() * (base / 2)
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason)
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(signal?.reason)
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function linkSignals(external: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs)
  const onAbort = () => controller.abort(external?.reason)
  if (external) {
    if (external.aborted) onAbort()
    else external.addEventListener('abort', onAbort, { once: true })
  }
  return {
    signal: controller.signal,
    release: () => {
      clearTimeout(timer)
      external?.removeEventListener('abort', onAbort)
    },
  }
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (text.length === 0) return null
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('json')) return text
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export class Transport {
  private readonly config: TransportConfig
  private readonly fetchImpl: FetchLike
  private readonly userAgent: string

  constructor(config: TransportConfig) {
    this.config = config
    this.fetchImpl = config.fetch ?? ((input, init) => globalThis.fetch(input, init))
    this.userAgent = [`kordio-sdk-js/${SDK_VERSION}`, config.userAgentSuffix]
      .filter(Boolean)
      .join(' ')
  }

  get baseUrl(): string {
    return this.config.baseUrl
  }

  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const url = `${this.config.baseUrl}${path}${encodeQuery(options.query)}`
    const timeoutMs = options.timeoutMs ?? this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const maxRetries = options.maxRetries ?? this.config.maxRetries ?? DEFAULT_MAX_RETRIES
    const idempotencyKey = options.idempotencyKey
    const safeToRetry = method === 'GET' || method === 'HEAD' || idempotencyKey !== undefined

    let attempt = 0
    let forceRefresh = false
    let lastError: KordioError | undefined

    while (true) {
      const authHeaders = await this.config.auth.headers({ forceRefresh })
      forceRefresh = false

      const headers: Record<string, string> = {
        accept: 'application/json',
        'user-agent': this.userAgent,
        ...this.config.defaultHeaders,
        ...authHeaders,
        ...options.headers,
      }
      if (idempotencyKey !== undefined) headers['idempotency-key'] = idempotencyKey
      if (options.body !== undefined) headers['content-type'] = 'application/json'

      const link = linkSignals(options.signal, timeoutMs)
      let response: Response
      try {
        response = await this.fetchImpl(url, {
          method,
          headers,
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
          signal: link.signal,
        })
      } catch (cause) {
        link.release()
        const aborted = options.signal?.aborted === true
        const isTimeout = !aborted
        const error = isTimeout
          ? new KordioTimeoutError({
              surface: this.config.surface,
              message: `request timed out after ${timeoutMs}ms`,
              method,
              path,
              cause,
            })
          : new KordioConnectionError({
              surface: this.config.surface,
              message: cause instanceof Error ? cause.message : 'network error',
              method,
              path,
              cause,
            })
        if (aborted || !safeToRetry || attempt >= maxRetries) throw error
        lastError = error
        await sleep(backoffMs(attempt, null), options.signal)
        attempt++
        continue
      }
      link.release()

      const responseHeaders = headersToObject(response.headers)
      const body = await readBody(response)

      if (response.ok || options.expectedStatuses?.includes(response.status)) {
        return {
          status: response.status,
          data: body as T,
          headers: responseHeaders,
          requestId: responseHeaders['x-request-id'],
          rateLimit: readRateLimit(responseHeaders),
          idempotentReplay: responseHeaders['idempotent-replayed'] === 'true',
        }
      }

      const retryAfterSeconds = toNumberOrNull(responseHeaders['retry-after'])
      const error = buildError({
        surface: this.config.surface,
        status: response.status,
        body,
        method,
        path,
        headers: responseHeaders,
        retryAfterSeconds,
      })

      if (response.status === 401 && attempt < maxRetries && lastError?.status !== 401) {
        forceRefresh = true
        lastError = error
        attempt++
        continue
      }

      if (RETRYABLE_STATUSES.has(response.status) && safeToRetry && attempt < maxRetries) {
        lastError = error
        await sleep(backoffMs(attempt, retryAfterSeconds), options.signal)
        attempt++
        continue
      }

      throw error
    }
  }
}
