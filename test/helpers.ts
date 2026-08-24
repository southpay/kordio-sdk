import type { FetchLike } from '../src/core/http'

export interface RecordedRequest {
  url: string
  method: string
  headers: Record<string, string>
  body: unknown
}

export interface MockReply {
  status?: number
  body?: unknown
  headers?: Record<string, string>
}

export interface MockServer {
  fetch: FetchLike
  requests: RecordedRequest[]
  last(): RecordedRequest
}

export function mockFetch(
  replies: MockReply[] | ((req: RecordedRequest) => MockReply),
): MockServer {
  const requests: RecordedRequest[] = []
  let index = 0

  const fetchImpl: FetchLike = async (url, init) => {
    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries((init.headers ?? {}) as Record<string, string>)) {
      headers[key.toLowerCase()] = value
    }
    const recorded: RecordedRequest = {
      url,
      method: init.method ?? 'GET',
      headers,
      body: typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
    }
    requests.push(recorded)

    const reply =
      typeof replies === 'function' ? replies(recorded) : (replies[index++] ?? replies.at(-1))
    const status = reply?.status ?? 200
    return new Response(reply?.body === undefined ? null : JSON.stringify(reply.body), {
      status,
      headers: { 'content-type': 'application/json', ...reply?.headers },
    })
  }

  return {
    fetch: fetchImpl,
    requests,
    last: () => {
      const item = requests.at(-1)
      if (!item) throw new Error('no requests recorded')
      return item
    },
  }
}

export function formBody(init: RequestInit): URLSearchParams {
  return new URLSearchParams(init.body as string)
}

export function ledgerEnvelope(data: unknown) {
  return { data, livemode: false, request_id: 'req_test' }
}

export function ledgerList(
  data: unknown[],
  opts: { hasMore?: boolean; nextCursor?: string | null } = {},
) {
  return {
    object: 'list',
    data,
    has_more: opts.hasMore ?? false,
    next_cursor: opts.nextCursor ?? null,
    livemode: false,
    request_id: 'req_test',
  }
}
