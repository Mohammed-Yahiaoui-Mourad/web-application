import { SEVERITIES } from '../constants'

export default function SeverityBadge({ severity, className = '' }) {
  const config = SEVERITIES.find((s) => s.value === severity) || SEVERITIES[2]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white ${config.color} ${className}`}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  )
}
