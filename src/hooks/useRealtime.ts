import { useEffect } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export function useRequestsRealtime(onUpdate: () => void) {
  useEffect(() => {
    // Connect to the SSE endpoint in the backend FastAPI app
    const eventSource = new EventSource(`${BACKEND_URL}/api/requests/stream`)

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.event === 'request_created') {
          console.log('Realtime SSE Event: New blood request broadcasted. Triggering UI refresh.')
          onUpdate()
        }
      } catch (err) {
        // Suppress parsing errors for connection ping events
      }
    }

    eventSource.onerror = (err) => {
      console.warn('Realtime SSE EventSource encountered error (attempting auto-reconnect):', err)
    }

    return () => {
      eventSource.close()
    }
  }, [onUpdate])
}
