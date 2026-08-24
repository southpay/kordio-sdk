import { compact, isoDate } from '../../core/params'
import { Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type {
  BalanceSheetReport,
  CashFlowReport,
  FundSegregationReport,
  IncomeStatementReport,
  RequestConfig,
  ReservesOutstandingReport,
  TrialBalanceReport,
} from '../types'

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

export class ReportsResource extends Resource {
  async trialBalance(params: TrialBalanceParams = {}): Promise<TrialBalanceReport> {
    const query = {
      at: isoDate(params.at),
      currency: params.currency,
      include_zero: params.includeZero,
    }
    return await this.unwrap<TrialBalanceReport>(
      'GET',
      '/v1/reports/trial_balance',
      toRequestOptions(params, { query }),
    )
  }

  async balanceSheet(params: AsOfParams = {}): Promise<BalanceSheetReport> {
    const query = compact({ at: isoDate(params.at), currency: params.currency })
    return await this.unwrap<BalanceSheetReport>(
      'GET',
      '/v1/reports/balance_sheet',
      toRequestOptions(params, { query }),
    )
  }

  async incomeStatement(params: PeriodParams = {}): Promise<IncomeStatementReport> {
    const query = compact({
      from: isoDate(params.from),
      to: isoDate(params.to),
      currency: params.currency,
    })
    return await this.unwrap<IncomeStatementReport>(
      'GET',
      '/v1/reports/income_statement',
      toRequestOptions(params, { query }),
    )
  }

  async cashFlow(params: PeriodParams = {}): Promise<CashFlowReport> {
    const query = compact({
      from: isoDate(params.from),
      to: isoDate(params.to),
      currency: params.currency,
    })
    return await this.unwrap<CashFlowReport>(
      'GET',
      '/v1/reports/cash_flow',
      toRequestOptions(params, { query }),
    )
  }

  async reservesOutstanding(params: AsOfParams = {}): Promise<ReservesOutstandingReport> {
    const query = compact({ at: isoDate(params.at), currency: params.currency })
    return await this.unwrap<ReservesOutstandingReport>(
      'GET',
      '/v1/reports/reserves_outstanding',
      toRequestOptions(params, { query }),
    )
  }

  async fundSegregation(params: AsOfParams = {}): Promise<FundSegregationReport> {
    const query = compact({ at: isoDate(params.at), currency: params.currency })
    return await this.unwrap<FundSegregationReport>(
      'GET',
      '/v1/reports/fund_segregation',
      toRequestOptions(params, { query }),
    )
  }
}
