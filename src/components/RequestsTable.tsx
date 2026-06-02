import React, { useState } from 'react'
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Check
} from 'lucide-react'

const ITEMS_PER_PAGE = 8

export default function RequestsTable({
  requests = [],
  patients = {},
  filters = {},
  onAction,
}: any) {
  const [currentPage, setCurrentPage] = useState(1)

  const getSeverityBadge = (severity: string) => {
    if (severity === 'critique' || severity === 'critical') return { 
      bg: 'bg-red-50', 
      text: 'text-red-700', 
      border: 'border-red-100',
      icon: <AlertCircle size={12} />,
      label: 'Critique' 
    }
    if (severity === 'urgent' || severity === 'high') return { 
      bg: 'bg-orange-50', 
      text: 'text-orange-700', 
      border: 'border-orange-100',
      icon: <AlertCircle size={12} />,
      label: 'Urgent' 
    }
    return { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      border: 'border-blue-100',
      icon: <CheckCircle2 size={12} />,
      label: 'Normal' 
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active' || status === 'pending') return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', label: 'Actif', icon: <Clock size={12} /> }
    if (status === 'fulfilled') return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', label: 'Complété', icon: <CheckCircle2 size={12} /> }
    if (status === 'cancelled') return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', label: 'Annulé', icon: <XCircle size={12} /> }
    return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', label: status, icon: <Clock size={12} /> }
  }

  // Filter requests
  let filtered = requests
  if (filters.bloodType) {
    filtered = filtered.filter((r: any) => r.blood_type === filters.bloodType)
  }
  if (filters.severity) {
    filtered = filtered.filter((r: any) => r.severity === filters.severity)
  }
  if (filters.status) {
    filtered = filtered.filter((r: any) => r.status === filters.status)
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Demandes de sang</h2>
          <p className="text-sm text-slate-500 font-medium">Gestion et assignment des priorités patient</p>
        </div>
        <span className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
          {filtered.length} total
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-5 px-4">Patient</th>
              <th className="pb-5 px-4">Groupe</th>
              <th className="pb-5 px-4">Unités</th>
              <th className="pb-5 px-4">Urgence</th>
              <th className="pb-5 px-4">Statut</th>
              <th className="pb-5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {paginated.map((req: any) => {
              const patient = patients[req.patient_id]
              const severityBadge = getSeverityBadge(req.severity)
              const statusBadge = getStatusBadge(req.status)

              return (
                <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="font-bold text-slate-900">
                      {patient?.first_name || req.patient_name || 'Patient'} {patient?.last_name || ''}
                    </div>
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">ID: {req.patient_id || 'N/A'}</div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-[#E8293A] border border-red-100">
                      {req.blood_type}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      {req.units_needed || '—'} poche(s)
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold border ${severityBadge.bg} ${severityBadge.text} ${severityBadge.border}`}>
                      {severityBadge.icon}
                      {severityBadge.label}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                      {statusBadge.icon}
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {req.status === 'active' || req.status === 'pending' || req.status === 'partially_fulfilled' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onAction?.(req.id, 'assign')}
                            className="flex items-center gap-2 rounded-xl bg-[#E8293A] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-red-200 transition hover:bg-red-700 active:scale-95"
                          >
                            <Send size={14} />
                            Alerter
                          </button>
                          <button
                            type="button"
                            onClick={() => onAction?.(req.id, 'validate')}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                          >
                            <Check size={14} className="text-green-500" />
                            Compléter
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest px-4">Archivé</span>
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
        <div className="py-20 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucune demande correspondante</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Demande {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
