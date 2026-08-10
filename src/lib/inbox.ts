import { useLocalState, uid } from './storage'
import { useTasks } from './data'
import { useVisibilityPoll } from './polling'
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
 * Also re-syncs immediately whenever the page becomes visible again (see useVisibilityPoll),
 * since iOS Safari suspends the interval timer while the screen is locked or backgrounded.
 */
export function useTaskInbox() {
    const [, setTasks] = useTasks()
    const [, setSeenIds] = useLocalState<string[]>('hub.inboxSeen.v1', [])
    const token = import.meta.env.VITE_INBOX_TOKEN as string | undefined

    useVisibilityPoll(
        async () => {
            if (!token) return
            try {
                const res = await fetch(ENDPOINT, { headers: { 'x-inbox-token': token } })
                if (!res.ok) return
                const items: InboxApiTask[] = await res.json()
                if (items.length === 0) return

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
        },
        POLL_MS,
        Boolean(token)
    )
}