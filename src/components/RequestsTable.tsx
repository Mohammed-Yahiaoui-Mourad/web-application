export default function RequestsTable({
  requests = [],
  patients = {},
  filters = {},
  onAction,
}: any) {

  const getSeverityBadge = (severity) => {
    if (severity === 'critique') return { bg: 'bg-red-100', text: 'text-red-700', label: '🔴 Critique' }
    if (severity === 'urgent') return { bg: 'bg-orange-100', text: 'text-orange-700', label: '🟠 Urgent' }
    return { bg: 'bg-blue-100', text: 'text-blue-700', label: '🔵 Normal' }
  }

  const getStatusBadge = (status) => {
    if (status === 'active') return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Actif' }
    if (status === 'fulfilled') return { bg: 'bg-green-100', text: 'text-green-700', label: 'Complété' }
    if (status === 'cancelled') return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Annulé' }
    return { bg: 'bg-gray-100', text: 'text-gray-600', label: status }
  }

  // Filter requests
  let filtered = requests
  if (filters.bloodType) {
    filtered = filtered.filter((r) => r.blood_type === filters.bloodType)
  }
  if (filters.severity) {
    filtered = filtered.filter((r) => r.severity === filters.severity)
  }
  if (filters.status) {
    filtered = filtered.filter((r) => r.status === filters.status)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Blood Requests</h2>
          <p className="text-sm text-gray-600">Gestion et assignment des demandes de sang</p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {filtered.length} demandes
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
                Groupe
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Unités
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
            {filtered.map((req, idx) => {
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
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900">
                    {req.blood_type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                    {req.units_needed || '—'} poche(s)
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
                            onClick={(e) => {
                              e.stopPropagation()
                              onAction?.(req.id, 'assign')
                            }}
                            className="rounded-lg bg-[#E8293A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 active:bg-red-800"
                          >
                            Alert Donors
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onAction?.(req.id, 'validate')
                            }}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 active:bg-green-800"
                          >
                            Mark fulfilled
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">Aucune demande ne correspond aux filtres</p>
        </div>
      )}
    </div>
  )
}
