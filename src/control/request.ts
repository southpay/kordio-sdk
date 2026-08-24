import type { Query, RequestOptions } from '../core/http'
import type { RequestConfig } from './types'

export function toRequestOptions(
  config: RequestConfig | undefined,
  extra: {
    query?: Query
    body?: unknown
    idempotencyKey?: string
    expectedStatuses?: readonly number[]
  } = {},
): RequestOptions {
  const options: RequestOptions = { ...extra }
  if (config?.headers) options.headers = config.headers
  if (config?.signal) options.signal = config.signal
  if (config?.timeoutMs !== undefined) options.timeoutMs = config.timeoutMs
  if (config?.maxRetries !== undefined) options.maxRetries = config.maxRetries
  return options
}

export function omitUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) out[key] = value
  }
  return out as Partial<T>
}

export function iso(value: Date | string | null | undefined): string | null | undefined {
  if (value === null || value === undefined) return value
  return value instanceof Date ? value.toISOString() : value
}
