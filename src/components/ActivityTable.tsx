export default function ActivityTable({ requests = [], patients = {}, onAction }) {
  const getSeverityBadge = (severity) => {
    if (severity === 'critique') return { bg: 'bg-red-100', text: 'text-red-700', label: 'Critique' }
    if (severity === 'urgent') return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Urgent' }
    return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Normal' }
  }

  const getStatusBadge = (status) => {
    if (status === 'active') return { bg: 'bg-blue-100', text: 'text-blue-700', label: '🔄 Actif' }
    if (status === 'fulfilled') return { bg: 'bg-green-100', text: 'text-green-700', label: '✅ Complété' }
    if (status === 'cancelled') return { bg: 'bg-gray-100', text: 'text-gray-700', label: '❌ Annulé' }
    return { bg: 'bg-gray-100', text: 'text-gray-600', label: status }
  }

  const recentRequests = requests.slice(0, 8)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          <p className="text-sm text-gray-600">Suivi des dernières demandes de sang</p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {recentRequests.length} demandes
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Patient
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Urgence
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Statut
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((req, idx) => {
              const patient = patients[req.patient_id]
              const severityBadge = getSeverityBadge(req.severity)
              const statusBadge = getStatusBadge(req.status)

              return (
                <tr
                  key={req.id}
                  className={`border-b border-gray-100 transition hover:bg-gray-50 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                    {patient?.first_name || 'Patient'} {patient?.last_name || ''}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 font-semibold">
                    {req.blood_type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${severityBadge.bg} ${severityBadge.text}`}>
                      {severityBadge.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <div className="flex justify-center gap-2">
                      {req.status === 'active' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onAction?.(req.id, 'validate')}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 active:bg-green-800"
                          >
                            Valider
                          </button>
                          <button
                            type="button"
                            onClick={() => onAction?.(req.id, 'assign')}
                            className="rounded-lg bg-[#E8293A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 active:bg-red-800"
                          >
                            Alerter
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {recentRequests.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">Aucune demande pour le moment</p>
        </div>
      )}
    </div>
  )
}
