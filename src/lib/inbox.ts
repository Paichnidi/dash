import { useEffect } from 'react'
import { useLocalState, uid } from './storage'
import { useTasks } from './data'
import type { Task, TaskCategory, TaskPriority } from '../types'

interface InboxApiTask {
    id: string
    title: string
    category?: TaskCategory
    priority?: TaskPriority
    dueDate?: string
    createdAt: string
}

const ENDPOINT = '/api/inbox-tasks'
const POLL_MS = 60 * 1000 // 1 minute

/**
 * Polls the Netlify Function inbox for tasks added via the iOS Shortcut (or anything
 * else that POSTs to /api/inbox-tasks) and merges any not-yet-seen ones into local tasks.
 * A device-local "seen" list means a task never reappears after you delete it locally,
 * even though the server keeps the inbox entry around (so other devices still pick it up too).
 */
export function useTaskInbox() {
    const [, setTasks] = useTasks()
    const [, setSeenIds] = useLocalState<string[]>('hub.inboxSeen.v1', [])

    useEffect(() => {
        // No token configured client-side -> inbox sync is a no-op, dashboard works as normal.
        const token = import.meta.env.VITE_INBOX_TOKEN
        if (!token) return

        let cancelled = false

        const poll = async () => {
            try {
                const res = await fetch(ENDPOINT, { headers: { 'x-inbox-token': token } })
                if (!res.ok) return
                const items: InboxApiTask[] = await res.json()
                if (cancelled || items.length === 0) return

                setSeenIds((prevSeen) => {
                    const unseen = items.filter((i) => !prevSeen.includes(i.id))
                    if (unseen.length === 0) return prevSeen

                    setTasks((prevTasks) => [
                        ...unseen.map(
                            (i): Task => ({
                                id: uid(),
                                title: i.title,
                                category: i.category ?? 'Personal',
                                priority: i.priority ?? 'medium',
                                dueDate: i.dueDate,
                                done: false,
                                createdAt: i.createdAt,
                            })
                        ),
                        ...prevTasks,
                    ])

                    return [...prevSeen, ...unseen.map((i) => i.id)]
                })
            } catch {
                // offline or endpoint unreachable — silently skip this cycle
            }
        }

        poll()
        const t = setInterval(poll, POLL_MS)
        return () => { cancelled = true; clearInterval(t) }
    }, [setTasks, setSeenIds])
}