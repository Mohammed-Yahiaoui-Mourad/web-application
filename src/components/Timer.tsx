import { useEffect, useState } from 'react'

export default function Timer({ expiresAt, onExpire }: any) {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (!expiresAt) return

    function tick() {
      const end = new Date(expiresAt).getTime()
      const diff = end - Date.now()
      if (diff <= 0) {
        setRemaining(0)
        onExpire?.()
        return
      }
      setRemaining(diff)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpire])

  if (remaining === null) return null
  if (remaining === 0) {
    return <span className="text-sm font-semibold text-[#E8293A]">Expiré</span>
  }

  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)

  return (
    <span className="font-mono text-sm font-semibold text-[#1a1917]">
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  )
}
