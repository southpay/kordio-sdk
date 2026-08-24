import { constructWebhookEvent, KordioSignatureError } from '@kordio/sdk'

const LEDGER_SECRET = process.env.KORDIO_LEDGER_WEBHOOK_SECRET ?? ''
const CONTROL_SECRET = process.env.KORDIO_CONTROL_WEBHOOK_SECRET ?? ''

interface KordioEvent {
  id: string
  type: string
  data: Record<string, unknown>
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 8787),

  async fetch(request) {
    const url = new URL(request.url)

    if (request.method !== 'POST') {
      return new Response('method not allowed', { status: 405 })
    }

    const secret =
      url.pathname === '/webhooks/control'
        ? CONTROL_SECRET
        : url.pathname === '/webhooks/ledger'
          ? LEDGER_SECRET
          : null

    if (!secret) return new Response('not found', { status: 404 })

    const raw = await request.text()

    let event: KordioEvent
    try {
      event = await constructWebhookEvent<KordioEvent>({
        payload: raw,
        header: request.headers.get('Kordio-Signature'),
        secret,
      })
    } catch (error) {
      if (error instanceof KordioSignatureError) {
        console.warn(`rejected a delivery: ${error.reason}`)
        return new Response('bad signature', { status: 400 })
      }
      throw error
    }

    if (await alreadyHandled(event.id)) {
      return new Response('ok', { status: 200 })
    }

    switch (event.type) {
      case 'transaction.created':
        console.log('ledger wrote', event.data.id)
        break
      case 'action_intent.requires_approval':
        console.log('someone needs to review', event.data.id)
        break
      default:
        console.log('ignoring', event.type)
    }

    await remember(event.id)
    return new Response('ok', { status: 200 })
  },
})

console.log(`listening on :${server.port}`)

const seen = new Set<string>()
async function alreadyHandled(id: string) {
  return seen.has(id)
}
async function remember(id: string) {
  seen.add(id)
}
