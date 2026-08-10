import { getStore } from '@netlify/blobs'
import type { Config, Context } from '@netlify/functions'

function checkToken(req: Request): boolean {
    const expected = process.env.TASK_INBOX_SECRET
    if (!expected) return false
    const url = new URL(req.url)
    const provided = req.headers.get('x-inbox-token') ?? url.searchParams.get('token')
    return provided === expected
}

export default async (req: Request, _context: Context) => {
    if (!checkToken(req)) {
        return new Response(JSON.stringify({ error: 'Missing or invalid token' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
        })
    }

    const store = getStore('app-state')

    if (req.method === 'GET') {
        const saved = (await store.get('settings', { type: 'json' })) as { settings: unknown; updatedAt: string } | null
        if (!saved) {
            return new Response(JSON.stringify({ error: 'No settings saved yet' }), {
                status: 404,
                headers: { 'content-type': 'application/json' },
            })
        }
        return new Response(JSON.stringify(saved), {
            headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        })
    }

    if (req.method === 'PUT' || req.method === 'POST') {
        let body: unknown
        try {
            body = await req.json()
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            })
        }

        const record = { settings: body, updatedAt: new Date().toISOString() }
        await store.setJSON('settings', record)

        return new Response(JSON.stringify(record), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'content-type': 'application/json' },
    })
}

export const config: Config = {
    path: '/api/settings-sync',
}