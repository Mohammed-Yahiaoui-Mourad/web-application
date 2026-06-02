import { useEffect } from 'react'

export function useRealtimeTable(
  _table: string,
  _filter: string,
  _onInsert?: (val: any) => void,
  _onUpdate?: (val: any) => void
) {
  useEffect(() => {
    // No-op: Supabase realtime disabled.
  }, [_table, _filter, _onInsert, _onUpdate])
}
