import type { HttpResponse, Query, RequestOptions, Transport } from './http'
import { fetchPage, type Page } from './pagination'

export interface Envelope<T> {
  data: T
}

export abstract class Resource {
  protected readonly transport: Transport

  constructor(transport: Transport) {
    this.transport = transport
  }

  protected async unwrap<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await this.transport.request<Envelope<T> | T>(method, path, options)
    return extractData<T>(response.data)
  }

  protected async raw<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<HttpResponse<T>> {
    return await this.transport.request<T>(method, path, options)
  }

  protected async page<T>(
    path: string,
    query: Query,
    cursorParam: string,
    options: RequestOptions = {},
  ): Promise<Page<T>> {
    return await fetchPage<T>({ transport: this.transport, path, query, cursorParam, options })
  }
}

export function extractData<T>(body: unknown): T {
  if (typeof body === 'object' && body !== null && 'data' in body) {
    return (body as Envelope<T>).data
  }
  return body as T
}

export function encodePathSegment(value: string): string {
  return encodeURIComponent(value).replace(/%3A/g, ':')
}
