import type { Query, RequestOptions } from '../core/http'
import type { IdempotentRequestConfig, RequestConfig } from './types'

export function toRequestOptions(
  config: RequestConfig | undefined,
  extra: { query?: Query; body?: unknown; idempotencyKey?: string } = {},
): RequestOptions {
  const headers: Record<string, string> = { ...config?.headers }
  if (config?.ledgerId) headers['x-ledger-id'] = config.ledgerId

  const options: RequestOptions = {
    headers,
    ...extra,
  }
  if (config?.signal) options.signal = config.signal
  if (config?.timeoutMs !== undefined) options.timeoutMs = config.timeoutMs
  if (config?.maxRetries !== undefined) options.maxRetries = config.maxRetries
  return options
}

export function idempotencyKeyOf(
  config: IdempotentRequestConfig | undefined,
  inline: string | undefined,
): string | undefined {
  return config?.idempotencyKey ?? inline
}

export function splitConfig<T extends Record<string, unknown>>(
  params: T | undefined,
  configKeys: readonly string[] = [
    'signal',
    'timeoutMs',
    'maxRetries',
    'headers',
    'ledgerId',
    'idempotencyKey',
  ],
): { config: RequestConfig & { idempotencyKey?: string }; rest: Record<string, unknown> } {
  const config: Record<string, unknown> = {}
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params ?? {})) {
    if (configKeys.includes(key)) config[key] = value
    else rest[key] = value
  }
  return { config: config as RequestConfig & { idempotencyKey?: string }, rest }
}
