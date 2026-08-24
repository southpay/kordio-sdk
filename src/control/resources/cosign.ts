import { buildError } from '../../core/errors'
import { compact } from '../../core/params'
import { Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type { CosignatureInvalid, CosignatureValid, RequestConfig } from '../types'

export type CosignatureCheck =
  | ({ valid: true } & CosignatureValid)
  | ({ valid: false } & CosignatureInvalid)

export class CosignResource extends Resource {
  async verify(params: RequestConfig & { authorization: string }): Promise<CosignatureCheck> {
    return await this.call('/v1/cosign/verify', params, { authorization: params.authorization })
  }

  async consume(
    params: RequestConfig & { authorization: string; consumedBy?: string },
  ): Promise<CosignatureCheck> {
    return await this.call('/v1/cosign/consume', params, {
      authorization: params.authorization,
      consumed_by: params.consumedBy,
    })
  }

  private async call(
    path: string,
    config: RequestConfig,
    payload: Record<string, unknown>,
  ): Promise<CosignatureCheck> {
    const response = await this.raw<{ data?: CosignatureCheck }>('POST', path, {
      ...toRequestOptions(config, { body: compact(payload) }),
      expectedStatuses: [200, 401, 422],
    })
    const data = response.data?.data
    if (data && typeof data.valid === 'boolean') return data
    throw buildError({
      surface: 'control',
      status: response.status,
      body: response.data,
      method: 'POST',
      path,
      headers: response.headers,
    })
  }
}
