import { createClient, Client } from '@libsql/client'

let _client: Client | null = null

function getClient(): Client {
  if (!_client) {
    const url = process.env.TURSO_URL
    const token = process.env.TURSO_AUTH_TOKEN
    if (!url) throw new Error('TURSO_URL is not set')
    _client = createClient({ url, authToken: token })
  }
  return _client
}

// Lazy proxy — only connects on first actual query, not at import time
export const db = new Proxy({} as Client, {
  get(_target, prop) {
    const client = getClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') return value.bind(client)
    return value
  }
})
