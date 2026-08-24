import { buildError } from '../core/errors'
import type { HttpResponse } from '../core/http'
import type { Decision, DecisionResult, Headroom, Outcome } from './types'

export interface DecisionEnvelope<T> {
  data?: T
  decision?: Decision
  cosignature?: string | null
}

const DECISION_STATUSES = [200, 201, 202, 403] as const

export const DECISION_EXPECTED_STATUSES: readonly number[] = DECISION_STATUSES

export function toDecisionResult<T>(
  response: HttpResponse<DecisionEnvelope<T>>,
  context: { method: string; path: string },
): DecisionResult<T> {
  const body = response.data
  const decision = body?.decision

  if (!decision || typeof decision.outcome !== 'string') {
    throw buildError({
      surface: 'control',
      status: response.status,
      body,
      method: context.method,
      path: context.path,
      headers: response.headers,
    })
  }

  const outcome = decision.outcome as Outcome
  const base = {
    status: response.status,
    decision,
    headroom: (decision.headroom ?? {}) as Headroom,
    rule: decision.rule ?? null,
    detail: (decision.detail ?? {}) as Record<string, unknown>,
    intent: body?.data as T,
  }

  if (outcome === 'allowed') {
    return { ...base, outcome, allowed: true, cosignature: body?.cosignature ?? null }
  }
  if (outcome === 'requires_approval') {
    return { ...base, outcome, allowed: false, cosignature: null }
  }
  return { ...base, outcome: 'denied', allowed: false, cosignature: null }
}

export class KordioDeniedError extends Error {
  readonly rule: string | null
  readonly detail: Record<string, unknown>
  readonly headroom: Headroom
  readonly result: DecisionResult<unknown>

  constructor(result: DecisionResult<unknown>) {
    super(result.rule ? `${result.outcome} by ${result.rule}` : result.outcome)
    this.name = 'KordioDeniedError'
    this.rule = result.rule
    this.detail = result.detail
    this.headroom = result.headroom
    this.result = result
  }
}

export function assertAllowed<T>(
  result: DecisionResult<T>,
): asserts result is Extract<DecisionResult<T>, { outcome: 'allowed' }> {
  if (result.outcome !== 'allowed') throw new KordioDeniedError(result)
}
