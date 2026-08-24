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
