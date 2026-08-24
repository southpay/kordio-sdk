import { encodePathSegment, Resource } from '../../core/resource'
import { splitConfig, toRequestOptions } from '../request'
import type {
  IdempotentRequestConfig,
  ReserveClawInput,
  ReserveOpResult,
  ReserveReleaseInput,
  ReserveSweepInput,
} from '../types'

function requireKey(key: string | undefined, call: string): string {
  if (key) return key
  throw new TypeError(`${call} requires a stable \`idempotencyKey\`.`)
}

export class ReservesResource extends Resource {
  async sweep(params: ReserveSweepInput & IdempotentRequestConfig): Promise<ReserveOpResult> {
    const { config, body } = splitConfig(params)
    const key = requireKey(params.idempotencyKey, 'reserves.sweep')
    return await this.unwrap<ReserveOpResult>(
      'POST',
      '/ledger/v1/reserves',
      toRequestOptions(config, { body, idempotencyKey: key }),
    )
  }

  async release(
    id: string,
    params: ReserveReleaseInput & IdempotentRequestConfig,
  ): Promise<ReserveOpResult> {
    const { config, body } = splitConfig(params)
    const key = requireKey(params.idempotencyKey, 'reserves.release')
    return await this.unwrap<ReserveOpResult>(
      'POST',
      `/ledger/v1/reserves/${encodePathSegment(id)}/release`,
      toRequestOptions(config, { body, idempotencyKey: key }),
    )
  }

  async claw(
    id: string,
    params: ReserveClawInput & IdempotentRequestConfig,
  ): Promise<ReserveOpResult> {
    const { config, body } = splitConfig(params)
    const key = requireKey(params.idempotencyKey, 'reserves.claw')
    return await this.unwrap<ReserveOpResult>(
      'POST',
      `/ledger/v1/reserves/${encodePathSegment(id)}/claw`,
      toRequestOptions(config, { body, idempotencyKey: key }),
    )
  }
}
