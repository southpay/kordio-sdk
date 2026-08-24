import { Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type { FundSegregationReport, RequestConfig, ReservesOutstandingReport } from '../types'

export interface AsOfParams extends RequestConfig {
  at?: Date | string
  currency?: string
}

export interface TrialBalanceParams extends AsOfParams {
  includeZero?: boolean
}

export interface PeriodParams extends RequestConfig {
  from?: Date | string
  to?: Date | string
  currency?: string
}

function iso(value: Date | string | undefined): string | undefined {
  if (value === undefined) return undefined
  return value instanceof Date ? value.toISOString() : value
}

export class ReportsResource extends Resource {
  async trialBalance<T = unknown>(params: TrialBalanceParams = {}): Promise<T> {
    const query = {
      at: iso(params.at),
      currency: params.currency,
      include_zero: params.includeZero,
    }
    return await this.unwrap<T>(
      'GET',
      '/v1/reports/trial_balance',
      toRequestOptions(params, { query }),
    )
  }

  async balanceSheet<T = unknown>(params: AsOfParams = {}): Promise<T> {
    const query = { at: iso(params.at), currency: params.currency }
    return await this.unwrap<T>(
      'GET',
      '/v1/reports/balance_sheet',
      toRequestOptions(params, { query }),
    )
  }

  async incomeStatement<T = unknown>(params: PeriodParams = {}): Promise<T> {
    const query = { from: iso(params.from), to: iso(params.to), currency: params.currency }
    return await this.unwrap<T>(
      'GET',
      '/v1/reports/income_statement',
      toRequestOptions(params, { query }),
    )
  }

  async cashFlow<T = unknown>(params: PeriodParams = {}): Promise<T> {
    const query = { from: iso(params.from), to: iso(params.to), currency: params.currency }
    return await this.unwrap<T>('GET', '/v1/reports/cash_flow', toRequestOptions(params, { query }))
  }

  async reservesOutstanding(params: AsOfParams = {}): Promise<ReservesOutstandingReport> {
    const query = { at: iso(params.at), currency: params.currency }
    return await this.unwrap<ReservesOutstandingReport>(
      'GET',
      '/v1/reports/reserves_outstanding',
      toRequestOptions(params, { query }),
    )
  }

  async fundSegregation(params: AsOfParams = {}): Promise<FundSegregationReport> {
    const query = { at: iso(params.at), currency: params.currency }
    return await this.unwrap<FundSegregationReport>(
      'GET',
      '/v1/reports/fund_segregation',
      toRequestOptions(params, { query }),
    )
  }
}
