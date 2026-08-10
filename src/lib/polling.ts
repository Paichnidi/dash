import { useEffect, useRef } from 'react'

/**
 * Runs `callback` on a fixed interval, and ALSO immediately whenever the page becomes
 * visible again (tab refocus, screen wake, switching back to the PWA). This matters
 * specifically for iOS Safari: it suspends JS timers when a tab/PWA is backgrounded or
 * the screen locks, so a plain setInterval can silently stop firing for long stretches.
 * Catching the 'visibilitychange' event closes that gap by re-syncing the moment the
 * dashboard is looked at again, instead of waiting for the next scheduled tick.
 */
export function useVisibilityPoll(callback: () => void, intervalMs: number, enabled = true) {
    const callbackRef = useRef(callback)
    callbackRef.current = callback

    useEffect(() => {
        if (!enabled) return

        callbackRef.current()
        const interval = setInterval(() => callbackRef.current(), intervalMs)

        const onVisible = () => {
            if (document.visibilityState === 'visible') callbackRef.current()
        }
        document.addEventListener('visibilitychange', onVisible)
        window.addEventListener('focus', onVisible)
        window.addEventListener('pageshow', onVisible)

        return () => {
            clearInterval(interval)
            document.removeEventListener('visibilitychange', onVisible)
            window.removeEventListener('focus', onVisible)
            window.removeEventListener('pageshow', onVisible)
        }
    }, [intervalMs, enabled])
}