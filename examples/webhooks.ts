import { constructWebhookEvent, KordioSignatureError } from '@kordio/sdk'

const SECRETS = {
  '/webhooks/ledger': (process.env.KORDIO_LEDGER_WEBHOOK_SECRET ?? '').split(',').filter(Boolean),
  '/webhooks/control': (process.env.KORDIO_CONTROL_WEBHOOK_SECRET ?? '').split(',').filter(Boolean),
} as const

interface KordioEvent {
  id: string
  type: string
  created_at: string
  data: Record<string, unknown>
}

const handled = new Set<string>()

async function handle(event: KordioEvent) {
  switch (event.type) {
    case 'transaction.created':
    case 'transaction.reversed':
      console.log(`${event.type} ${event.data.id}`)
      break

    case 'action.requires_approval':
      console.log(`someone needs to review ${event.data.id}`)
      break

    case 'budget.low':
      console.warn(`budget ${event.data.id} is nearly spent`)
      break

    default:
      console.log(`ignoring ${event.type}`)
  }
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 8787),

  async fetch(request) {
    const path = new URL(request.url).pathname as keyof typeof SECRETS
    const secrets = SECRETS[path]

    if (!secrets) return new Response('not found', { status: 404 })
    if (request.method !== 'POST') return new Response('method not allowed', { status: 405 })
    if (secrets.length === 0) return new Response('endpoint not configured', { status: 503 })

    const body = await request.text()

    let event: KordioEvent
    try {
      event = await constructWebhookEvent<KordioEvent>({
        payload: body,
        header: request.headers.get('Kordio-Signature'),
        secret: secrets,
      })
    } catch (error) {
      if (error instanceof KordioSignatureError) {
        console.warn(`rejected delivery on ${path}: ${error.reason}`)
        return new Response(error.reason, { status: 400 })
      }
      throw error
    }

    if (handled.has(event.id)) return new Response('ok')

    try {
      await handle(event)
    } catch (error) {
      console.error(`${event.type} ${event.id} failed, letting Kordio retry`, error)
      return new Response('retry me', { status: 500 })
    }

    handled.add(event.id)
    return new Response('ok')
  },
})

console.log(`listening on :${server.port}`)
