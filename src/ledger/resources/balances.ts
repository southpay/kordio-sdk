import { encodePathSegment, Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type { Balance, RequestConfig } from '../types'

export class BalancesResource extends Resource {
  async get(accountId: string, config?: RequestConfig): Promise<Balance> {
    return await this.unwrap<Balance>(
      'GET',
      `/ledger/v1/accounts/${encodePathSegment(accountId)}/balance`,
      toRequestOptions(config),
    )
  }

  async category(accountId: string, config?: RequestConfig): Promise<Balance> {
    return await this.unwrap<Balance>(
      'GET',
      `/ledger/v1/accounts/${encodePathSegment(accountId)}/category_balance`,
      toRequestOptions(config),
    )
  }
}
