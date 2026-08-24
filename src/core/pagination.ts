import type { HttpResponse, Query, RequestOptions, Transport } from './http'

export interface ListEnvelope<T> {
  object?: string
  data: T[]
  has_more: boolean
  next_cursor?: string | null
  total?: number | null
  livemode?: boolean
  request_id?: string
}

export interface PageFetchSpec {
  transport: Transport
  path: string
  query: Query
  cursorParam: string
  options: RequestOptions
}

export class Page<T> implements AsyncIterable<T> {
  readonly data: readonly T[]
  readonly hasMore: boolean
  readonly nextCursor: string | null
  readonly total: number | null
  readonly requestId: string | undefined
  readonly livemode: boolean | undefined
  private readonly spec: PageFetchSpec

  constructor(response: HttpResponse<ListEnvelope<T>>, spec: PageFetchSpec) {
    const body = response.data
    this.data = body?.data ?? []
    this.hasMore = body?.has_more ?? false
    this.nextCursor = body?.next_cursor ?? null
    this.total = body?.total ?? null
    this.livemode = body?.livemode
    this.requestId = response.requestId
    this.spec = spec
  }

  async nextPage(): Promise<Page<T> | null> {
    if (!this.hasMore || this.nextCursor === null) return null
    return await fetchPage<T>({
      ...this.spec,
      query: { ...this.spec.query, [this.spec.cursorParam]: this.nextCursor },
    })
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let page: Page<T> | null = this
    while (page !== null) {
      for (const item of page.data) yield item
      page = await page.nextPage()
    }
  }

  async toArray(options: { limit?: number } = {}): Promise<T[]> {
    const limit = options.limit ?? Number.POSITIVE_INFINITY
    const out: T[] = []
    for await (const item of this) {
      out.push(item)
      if (out.length >= limit) break
    }
    return out
  }
}

export async function fetchPage<T>(spec: PageFetchSpec): Promise<Page<T>> {
  const response = await spec.transport.request<ListEnvelope<T>>('GET', spec.path, {
    ...spec.options,
    query: spec.query,
  })
  return new Page<T>(response, spec)
}
