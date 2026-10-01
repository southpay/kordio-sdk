import { compact, isoDate } from '../../core/params'
import { Resource } from '../../core/resource'
import { toRequestOptions } from '../request'
import type {
  BalanceSheetReport,
  CashFlowReport,
  IncomeStatementReport,
  ReportGranularity,
  RequestConfig,
  TrialBalanceReport,
} from '../types'

export interface AsOfParams extends RequestConfig {
  at?: Date | string
}

export interface TrialBalanceParams extends AsOfParams {
  currency?: string
  includeZero?: boolean
}

export interface PeriodParams extends RequestConfig {
  from?: Date | string
  to?: Date | string
  granularity?: ReportGranularity
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
      '/ledger/v1/reports/trial_balance',
      toRequestOptions(params, { query }),
    )
  }

  async balanceSheet(params: AsOfParams = {}): Promise<BalanceSheetReport> {
    const query = compact({ at: isoDate(params.at) })
    return await this.unwrap<BalanceSheetReport>(
      'GET',
      '/ledger/v1/reports/balance_sheet',
      toRequestOptions(params, { query }),
    )
  }

  async incomeStatement(params: PeriodParams = {}): Promise<IncomeStatementReport> {
    return await this.unwrap<IncomeStatementReport>(
      'GET',
      '/ledger/v1/reports/income_statement',
      toRequestOptions(params, { query: periodQuery(params) }),
    )
  }

  async cashFlow(params: PeriodParams = {}): Promise<CashFlowReport> {
    return await this.unwrap<CashFlowReport>(
      'GET',
      '/ledger/v1/reports/cash_flow',
      toRequestOptions(params, { query: periodQuery(params) }),
    )
  }
}

function periodQuery(params: PeriodParams) {
  return compact({
    from: isoDate(params.from),
    to: isoDate(params.to),
    granularity: params.granularity,
  })
}
