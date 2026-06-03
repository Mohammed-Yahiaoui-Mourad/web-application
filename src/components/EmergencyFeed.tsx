export default function EmergencyFeed({ requests = [], onAction }) {
  const urgentRequests = requests
    .filter((r) => r.severity === 'critique' || r.severity === 'urgent')
    .slice(0, 5)

  const getSeverityColor = (severity) => {
    if (severity === 'critique') return 'bg-red-100 text-red-700 border-red-200'
    if (severity === 'urgent') return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-blue-100 text-blue-700 border-blue-200'
  }

  const getSeverityBadge = (severity) => {
    if (severity === 'critique') return '🔴 Critique'
    if (severity === 'urgent') return '🟠 Urgent'
    return '🔵 Normal'
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Live Emergency Feed</h3>
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          {urgentRequests.length} actif(s)
        </span>
      </div>

      {/* Feed Items */}
      <div className="space-y-3">
        {urgentRequests.length > 0 ? (
          urgentRequests.map((req) => (
            <div
              key={req.id}
              className={`rounded-lg border-l-4 border-[#E8293A] bg-red-50 p-4 transition hover:bg-red-100`}
            >
              {/* Title & Severity */}
              <div className="mb-2 flex items-start justify-between">
                <p className="font-semibold text-slate-900">
                  {req.blood_type} {req.units_needed || '?'} poche(s)
                </p>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${getSeverityColor(req.severity)}`}>
                  {getSeverityBadge(req.severity)}
                </span>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-600 mb-3">
                Statut: <span className="font-semibold">{req.status}</span>
                {req.donors_confirmed ? ` • ${req.donors_confirmed} assigné(s)` : ' • En attente'}
              </p>

              {/* Action Button */}
              {req.status === 'active' && (
                <button
                  type="button"
                  onClick={() => onAction?.(req.id, 'broadcast')}
                  className="w-full rounded-lg bg-[#E8293A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 active:bg-red-800"
                >
                  Alerter donneurs
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
            Aucune urgence en ce moment
          </div>
        )}
      </div>
    </div>
  )
}
