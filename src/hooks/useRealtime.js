import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtimeTable(table, filter, onInsert, onUpdate) {
  useEffect(() => {
    if (!filter) return

    const channel = supabase
      .channel(`realtime-${table}-${filter}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter,
        },
        (payload) => onInsert?.(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter,
        },
        (payload) => onUpdate?.(payload.new)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, onInsert, onUpdate])
}
