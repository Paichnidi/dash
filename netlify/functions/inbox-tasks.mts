import { getStore } from '@netlify/blobs'
import type { Config, Context } from '@netlify/functions'

interface InboxTask {
    id: string
    title: string
    category?: 'School' | 'Aviation' | 'Personal' | 'Maintenance'
    priority?: 'low' | 'medium' | 'high'
    dueDate?: string
    createdAt: string
}

const RETENTION_DAYS = 30

function checkToken(req: Request): boolean {
    const expected = process.env.TASK_INBOX_SECRET
    if (!expected) return false
    const url = new URL(req.url)
    const provided = req.headers.get('x-inbox-token') ?? url.searchParams.get('token')
    return provided === expected
}

function prune(items: InboxTask[]): InboxTask[] {
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
    return items.filter((i) => new Date(i.createdAt).getTime() >= cutoff)
}

export default async (req: Request, _context: Context) => {
    if (!checkToken(req)) {
        return new Response(JSON.stringify({ error: 'Missing or invalid token' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
        })
    }

    const store = getStore('task-inbox')

    if (req.method === 'POST') {
        let body: any
        try {
            body = await req.json()
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            })
        }

        const title = typeof body?.title === 'string' ? body.title.trim() : ''
        if (!title) {
            return new Response(JSON.stringify({ error: '"title" is required' }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            })
        }

        const validCategories = ['School', 'Aviation', 'Personal', 'Maintenance']
        const validPriorities = ['low', 'medium', 'high']

        const task: InboxTask = {
            id: crypto.randomUUID(),
            title,
            category: validCategories.includes(body.category) ? body.category : 'Personal',
            priority: validPriorities.includes(body.priority) ? body.priority : 'medium',
            dueDate: typeof body?.dueDate === 'string' ? body.dueDate : undefined,
            createdAt: new Date().toISOString(),
        }

        const existing = (await store.get('inbox', { type: 'json' })) as InboxTask[] | null
        const updated = prune([...(existing ?? []), task])
        await store.setJSON('inbox', updated)

        return new Response(JSON.stringify({ ok: true, task }), {
            status: 201,
            headers: { 'content-type': 'application/json' },
        })
    }

    if (req.method === 'GET') {
        const items = ((await store.get('inbox', { type: 'json' })) as InboxTask[] | null) ?? []
        return new Response(JSON.stringify(prune(items)), {
            headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'content-type': 'application/json' },
    })
}

export const config: Config = {
    path: '/api/inbox-tasks',
}