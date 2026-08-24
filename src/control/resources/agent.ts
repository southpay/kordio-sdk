import { encodePathSegment, Resource } from '../../core/resource'
import { DECISION_EXPECTED_STATUSES, type DecisionEnvelope, toDecisionResult } from '../decision'
import { iso, omitUndefined, toRequestOptions } from '../request'
import type {
  ActionIntent,
  ActionParams,
  ActionResult,
  Budget,
  BudgetParams,
  PaymentIntent,
  PaymentParams,
  PaymentResult,
  RequestConfig,
  SpendToken,
  SpendTokenParams,
} from '../types'

function requireIdempotencyKey(key: string | undefined, call: string): string {
  if (typeof key === 'string' && key.length > 0) return key
  throw new TypeError(
    `${call} requires an \`idempotencyKey\` unique to this attempt. A replay returns the ` +
      'original decision instead of reserving budget twice.',
  )
}

export class ActionsResource extends Resource {
  async authorize(params: ActionParams): Promise<ActionResult> {
    const key = requireIdempotencyKey(params.idempotencyKey, 'actions.authorize')
    const body = omitUndefined({
      budget_id: params.budgetId,
      action_type: params.actionType,
      resource: params.resource,
      cost_cents: params.costCents,
      metadata: params.metadata,
      trace_id: params.traceId,
    })
    const response = await this.raw<DecisionEnvelope<ActionIntent>>('POST', '/v1/agent/actions', {
      ...toRequestOptions(params, { body, idempotencyKey: key }),
      expectedStatuses: DECISION_EXPECTED_STATUSES,
    })
    return toDecisionResult<ActionIntent>(response, {
      method: 'POST',
      path: '/v1/agent/actions',
    })
  }

  async simulate(params: Omit<ActionParams, 'idempotencyKey'>): Promise<ActionResult> {
    const body = omitUndefined({
      budget_id: params.budgetId,
      action_type: params.actionType,
      resource: params.resource,
      cost_cents: params.costCents,
      metadata: params.metadata,
      trace_id: params.traceId,
    })
    const response = await this.raw<DecisionEnvelope<ActionIntent>>(
      'POST',
      '/v1/agent/actions/simulate',
      {
        ...toRequestOptions(params, { body }),
        expectedStatuses: DECISION_EXPECTED_STATUSES,
      },
    )
    return toDecisionResult<ActionIntent>(response, {
      method: 'POST',
      path: '/v1/agent/actions/simulate',
    })
  }

  async get(id: string, config?: RequestConfig): Promise<ActionIntent> {
    return await this.unwrap<ActionIntent>(
      'GET',
      `/v1/agent/actions/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async complete(id: string, config?: RequestConfig): Promise<ActionIntent> {
    return await this.unwrap<ActionIntent>(
      'POST',
      `/v1/agent/actions/${encodePathSegment(id)}/complete`,
      toRequestOptions(config),
    )
  }

  async fail(id: string, params: RequestConfig & { reason?: string } = {}): Promise<ActionIntent> {
    return await this.unwrap<ActionIntent>(
      'POST',
      `/v1/agent/actions/${encodePathSegment(id)}/fail`,
      toRequestOptions(params, { body: omitUndefined({ reason: params.reason }) }),
    )
  }
}

export class AgentBudgetsResource extends Resource {
  async create(params: BudgetParams): Promise<Budget> {
    const body = omitUndefined({
      budget_cents: params.budgetCents,
      currency: params.currency,
      parent_budget_id: params.parentBudgetId,
    })
    return await this.unwrap<Budget>(
      'POST',
      '/v1/agent/budgets',
      toRequestOptions(params, { body }),
    )
  }

  async get(id: string, config?: RequestConfig): Promise<Budget> {
    return await this.unwrap<Budget>(
      'GET',
      `/v1/agent/budgets/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }
}

export class AgentSpendTokensResource extends Resource {
  async create(params: SpendTokenParams): Promise<SpendToken> {
    const body = omitUndefined({
      budget_id: params.budgetId,
      amount_ceiling_cents: params.amountCeilingCents,
      counterparty: params.counterparty,
      expires_at: iso(params.expiresAt),
    })
    return await this.unwrap<SpendToken>(
      'POST',
      '/v1/agent/spend_tokens',
      toRequestOptions(params, { body }),
    )
  }
}

export class AgentPaymentIntentsResource extends Resource {
  async authorize(params: PaymentParams): Promise<PaymentResult> {
    const key = requireIdempotencyKey(params.idempotencyKey, 'paymentIntents.authorize')
    const body = omitUndefined({
      budget_id: params.budgetId,
      amount_cents: params.amountCents,
      idempotency_key: key,
      counterparty: params.counterparty,
      spend_token_id: params.spendTokenId,
      trace_id: params.traceId,
      decision_context: params.decisionContext,
      metadata: params.metadata,
    })
    const response = await this.raw<DecisionEnvelope<PaymentIntent>>(
      'POST',
      '/v1/agent/payment_intents',
      {
        ...toRequestOptions(params, { body }),
        expectedStatuses: DECISION_EXPECTED_STATUSES,
      },
    )
    return toDecisionResult<PaymentIntent>(response, {
      method: 'POST',
      path: '/v1/agent/payment_intents',
    })
  }

  async simulate(
    params: Omit<PaymentParams, 'idempotencyKey' | 'spendTokenId' | 'decisionContext' | 'metadata'>,
  ): Promise<PaymentResult> {
    const body = omitUndefined({
      budget_id: params.budgetId,
      amount_cents: params.amountCents,
      counterparty: params.counterparty,
      trace_id: params.traceId,
    })
    const response = await this.raw<DecisionEnvelope<PaymentIntent>>(
      'POST',
      '/v1/agent/payment_intents/simulate',
      {
        ...toRequestOptions(params, { body }),
        expectedStatuses: DECISION_EXPECTED_STATUSES,
      },
    )
    return toDecisionResult<PaymentIntent>(response, {
      method: 'POST',
      path: '/v1/agent/payment_intents/simulate',
    })
  }

  async get(id: string, config?: RequestConfig): Promise<PaymentIntent> {
    return await this.unwrap<PaymentIntent>(
      'GET',
      `/v1/agent/payment_intents/${encodePathSegment(id)}`,
      toRequestOptions(config),
    )
  }

  async complete(id: string, config?: RequestConfig): Promise<PaymentIntent> {
    return await this.unwrap<PaymentIntent>(
      'POST',
      `/v1/agent/payment_intents/${encodePathSegment(id)}/complete`,
      toRequestOptions(config),
    )
  }

  async fail(id: string, params: RequestConfig & { reason?: string } = {}): Promise<PaymentIntent> {
    return await this.unwrap<PaymentIntent>(
      'POST',
      `/v1/agent/payment_intents/${encodePathSegment(id)}/fail`,
      toRequestOptions(params, { body: omitUndefined({ reason: params.reason }) }),
    )
  }
}
