import type { Page } from '../../core/pagination'
import { encodePathSegment, Resource } from '../../core/resource'
import { splitConfig, toRequestOptions } from '../request'
import type {
  Account,
  AccountInput,
  AccountStatement,
  AccountType,
  Balance,
  ListParams,
  Posting,
  RequestConfig,
} from '../types'

export interface AccountListParams extends ListParams {
  type?: AccountType
  currency?: string
  kind?: 'standard' | 'reserve'
  counterpartyRef?: string
  fundClassification?: 'client_held' | 'operator' | 'neutral'
  custodyProvider?: string
}

export interface AccountUpdateParams extends RequestConfig {
  name?: string
  metadata?: Record<string, unknown>
}

export interface StatementParams extends RequestConfig {
  from?: Date | string
  to?: Date | string
  limit?: number
}

export class AccountsResource extends Resource {
  async create(params: AccountInput & RequestConfig): Promise<Account> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<Account>('POST', '/v1/accounts', toRequestOptions(config, { body }))
  }

  async get(id: string, config?: RequestConfig): Promise<Account> {
    return await this.unwrap<Account>(
      'GET',
      `/v1/accounts/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async update(id: string, params: AccountUpdateParams): Promise<Account> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<Account>(
      'PATCH',
      `/v1/accounts/${encodePathSegment(id)}`,
      toRequestOptions(config, { body }),
    )
  }

  async list(params: AccountListParams = {}): Promise<Page<Account>> {
    const query = {
      cursor: params.cursor,
      limit: params.limit,
      type: params.type,
      currency: params.currency,
      kind: params.kind,
      counterparty_ref: params.counterpartyRef,
      fund_classification: params.fundClassification,
      custody_provider: params.custodyProvider,
    }
    return await this.page<Account>('/v1/accounts', query, 'cursor', toRequestOptions(params))
  }

  async balance(id: string, config?: RequestConfig): Promise<Balance> {
    return await this.unwrap<Balance>(
      'GET',
      `/v1/accounts/${encodePathSegment(id)}/balance`,
      toRequestOptions(config),
    )
  }

  async categoryBalance(id: string, config?: RequestConfig): Promise<Balance> {
    return await this.unwrap<Balance>(
      'GET',
      `/v1/accounts/${encodePathSegment(id)}/category_balance`,
      toRequestOptions(config),
    )
  }

  async statement(id: string, params: StatementParams = {}): Promise<AccountStatement> {
    const query = {
      limit: params.limit,
      from: params.from instanceof Date ? params.from.toISOString() : params.from,
      to: params.to instanceof Date ? params.to.toISOString() : params.to,
    }
    return await this.unwrap<AccountStatement>(
      'GET',
      `/v1/accounts/${encodePathSegment(id)}/statement`,
      toRequestOptions(params, { query }),
    )
  }

  async postings(id: string, params: ListParams = {}): Promise<Page<Posting>> {
    const query = { cursor: params.cursor, limit: params.limit }
    return await this.page<Posting>(
      `/v1/accounts/${encodePathSegment(id)}/postings`,
      query,
      'cursor',
      toRequestOptions(params),
    )
  }
}
