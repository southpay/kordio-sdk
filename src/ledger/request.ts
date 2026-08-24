import type { Query, RequestOptions } from '../core/http'
import type { RequestConfig } from './types'

const CONFIG_KEYS = [
  'signal',
  'timeoutMs',
  'maxRetries',
  'headers',
  'ledgerId',
  'idempotencyKey',
  'validate',
] as const

type ConfigKey = (typeof CONFIG_KEYS)[number]

export function toRequestOptions(
  config: RequestConfig | undefined,
  extra: { query?: Query; body?: unknown; idempotencyKey?: string } = {},
): RequestOptions {
  const headers: Record<string, string> = { ...config?.headers }
  if (config?.ledgerId) headers['x-ledger-id'] = config.ledgerId

  const options: RequestOptions = { headers, ...extra }
  if (config?.signal) options.signal = config.signal
  if (config?.timeoutMs !== undefined) options.timeoutMs = config.timeoutMs
  if (config?.maxRetries !== undefined) options.maxRetries = config.maxRetries
  return options
}

export function splitConfig<T extends RequestConfig>(
  params: T,
): { config: RequestConfig; body: Omit<T, ConfigKey> } {
  const config: Record<string, unknown> = {}
  const body: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if ((CONFIG_KEYS as readonly string[]).includes(key)) config[key] = value
    else body[key] = value
  }
  return { config: config as RequestConfig, body: body as Omit<T, ConfigKey> }
}
