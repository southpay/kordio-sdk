import { encodePathSegment, Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type {
  IdempotentRequestConfig,
  ReserveClawInput,
  ReserveOpResult,
  ReserveReleaseInput,
  ReserveSweepInput,
} from '../types'

function requireKey(config: IdempotentRequestConfig, call: string): string {
  if (config.idempotencyKey) return config.idempotencyKey
  throw new TypeError(`${call} requires a stable \`idempotencyKey\`.`)
}

export class ReservesResource extends Resource {
  async sweep(params: ReserveSweepInput & IdempotentRequestConfig): Promise<ReserveOpResult> {
    const { signal, timeoutMs, maxRetries, headers, ledgerId, idempotencyKey, ...body } = params
    const key = requireKey({ idempotencyKey }, 'reserves.sweep')
    return await this.unwrap<ReserveOpResult>(
      'POST',
      '/v1/reserves',
      toRequestOptions(
        { signal, timeoutMs, maxRetries, headers, ledgerId },
        { body, idempotencyKey: key },
      ),
    )
  }

  async release(
    id: string,
    params: ReserveReleaseInput & IdempotentRequestConfig,
  ): Promise<ReserveOpResult> {
    const { signal, timeoutMs, maxRetries, headers, ledgerId, idempotencyKey, ...body } = params
    const key = requireKey({ idempotencyKey }, 'reserves.release')
    return await this.unwrap<ReserveOpResult>(
      'POST',
      `/v1/reserves/${encodePathSegment(id)}/release`,
      toRequestOptions(
        { signal, timeoutMs, maxRetries, headers, ledgerId },
        { body, idempotencyKey: key },
      ),
    )
  }

  async claw(
    id: string,
    params: ReserveClawInput & IdempotentRequestConfig,
  ): Promise<ReserveOpResult> {
    const { signal, timeoutMs, maxRetries, headers, ledgerId, idempotencyKey, ...body } = params
    const key = requireKey({ idempotencyKey }, 'reserves.claw')
    return await this.unwrap<ReserveOpResult>(
      'POST',
      `/v1/reserves/${encodePathSegment(id)}/claw`,
      toRequestOptions(
        { signal, timeoutMs, maxRetries, headers, ledgerId },
        { body, idempotencyKey: key },
      ),
    )
  }
}
