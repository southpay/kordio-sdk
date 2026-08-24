import type { Page } from '../../core/pagination'
import { encodePathSegment, Resource } from '../../core/resource'
import { splitConfig, toRequestOptions } from '../request'
import type {
  AccountTemplate,
  AccountType,
  Export,
  ExportFormat,
  ExportResource,
  FundClassification,
  IdempotentRequestConfig,
  Ledger,
  LedgerMode,
  ListParams,
  OAuthClient,
  OAuthClientInput,
  Organization,
  PeriodClose,
  RequestConfig,
} from '../types'

export interface PeriodCloseInput extends RequestConfig {
  period_start: string
  period_end: string
  closed_by_label: string
  note?: string
}

export interface AccountTemplateInput extends RequestConfig {
  name: string
  accounting_type: AccountType
  allowed_currencies?: readonly string[]
  balance_non_negative?: boolean
  description?: string
  metadata?: Record<string, unknown>
  fund_classification?: FundClassification
  custody_provider?: string
  custody_external_id?: string
}

export interface LedgerInput extends RequestConfig {
  name: string
  mode: LedgerMode
  metadata?: Record<string, unknown>
}

export class PeriodClosesResource extends Resource {
  async create(params: PeriodCloseInput): Promise<PeriodClose> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<PeriodClose>(
      'POST',
      '/ledger/v1/period_closes',
      toRequestOptions(config, { body }),
    )
  }

  async list(params: ListParams & { includeReopened?: boolean } = {}): Promise<Page<PeriodClose>> {
    return await this.page<PeriodClose>(
      '/ledger/v1/period_closes',
      { include_reopened: params.includeReopened },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<PeriodClose> {
    return await this.unwrap<PeriodClose>(
      'GET',
      `/ledger/v1/period_closes/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async reopen(
    id: string,
    params: RequestConfig & { reopenedByLabel: string },
  ): Promise<PeriodClose> {
    return await this.unwrap<PeriodClose>(
      'POST',
      `/ledger/v1/period_closes/${encodePathSegment(id)}/reopen`,
      toRequestOptions(params, { body: { reopened_by_label: params.reopenedByLabel } }),
    )
  }
}

export class AccountTemplatesResource extends Resource {
  async create(params: AccountTemplateInput): Promise<AccountTemplate> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<AccountTemplate>(
      'POST',
      '/ledger/v1/account_templates',
      toRequestOptions(config, { body }),
    )
  }

  async list(params: ListParams = {}): Promise<Page<AccountTemplate>> {
    return await this.page<AccountTemplate>(
      '/ledger/v1/account_templates',
      { cursor: params.cursor, limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(name: string, config?: RequestConfig): Promise<AccountTemplate> {
    return await this.unwrap<AccountTemplate>(
      'GET',
      `/ledger/v1/account_templates/${encodePathSegment(name)}`,
      toRequestOptions(config),
    )
  }
}

export class ExportsResource extends Resource {
  async create(
    params: IdempotentRequestConfig & {
      resources?: readonly ExportResource[]
      format?: ExportFormat
    },
  ): Promise<Export> {
    const body = { resources: params.resources, format: params.format }
    return await this.unwrap<Export>(
      'POST',
      '/ledger/v1/exports',
      toRequestOptions(params, { body, idempotencyKey: params.idempotencyKey }),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<Export> {
    return await this.unwrap<Export>(
      'GET',
      `/ledger/v1/exports/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }
}

export class OAuthClientsResource extends Resource {
  async create(params: OAuthClientInput & RequestConfig): Promise<OAuthClient> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<OAuthClient>(
      'POST',
      '/ledger/v1/oauth_clients',
      toRequestOptions(config, { body }),
    )
  }

  async list(params: ListParams = {}): Promise<Page<OAuthClient>> {
    return await this.page<OAuthClient>(
      '/ledger/v1/oauth_clients',
      { cursor: params.cursor, limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<OAuthClient> {
    return await this.unwrap<OAuthClient>(
      'GET',
      `/ledger/v1/oauth_clients/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async delete(id: string, config?: RequestConfig): Promise<void> {
    await this.raw<void>(
      'DELETE',
      `/ledger/v1/oauth_clients/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async rotateSecret(id: string, config?: IdempotentRequestConfig): Promise<OAuthClient> {
    return await this.unwrap<OAuthClient>(
      'POST',
      `/ledger/v1/oauth_clients/${encodePathSegment(id)}/rotate_secret`,
      toRequestOptions(config, { idempotencyKey: config?.idempotencyKey }),
    )
  }
}

export class LedgersResource extends Resource {
  async create(params: LedgerInput): Promise<Ledger> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<Ledger>(
      'POST',
      '/ledger/v1/ledgers',
      toRequestOptions(config, { body }),
    )
  }

  async list(params: ListParams = {}): Promise<Page<Ledger>> {
    return await this.page<Ledger>(
      '/ledger/v1/ledgers',
      { cursor: params.cursor, limit: params.limit },
      'cursor',
      toRequestOptions(params),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<Ledger> {
    return await this.unwrap<Ledger>(
      'GET',
      `/ledger/v1/ledgers/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async update(
    id: string,
    params: RequestConfig & { name?: string; metadata?: Record<string, unknown> },
  ): Promise<Ledger> {
    const { config, body } = splitConfig(params)
    return await this.unwrap<Ledger>(
      'PATCH',
      `/ledger/v1/ledgers/${encodePathSegment(id)}`,
      toRequestOptions(config, { body }),
    )
  }
}

export class OrganizationsResource extends Resource {
  async me(config?: RequestConfig): Promise<Organization> {
    return await this.unwrap<Organization>(
      'GET',
      '/ledger/v1/organizations/me',
      toRequestOptions(config),
    )
  }
}
