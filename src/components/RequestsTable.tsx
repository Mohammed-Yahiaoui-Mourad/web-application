import { useEffect, useState } from 'react'
import { AlertCircle, Check, Eye, Send } from 'lucide-react'
import Pagination from './Pagination'
import {
  formatDateTime,
  getRequestStatusMeta,
  getSeverityMeta,
} from '../lib/hospitalUtils'

const ITEMS_PER_PAGE = 6

export default function RequestsTable({
  requests = [],
  patients = {},
  filters = {},
  onAction,
  onSelect,
  selectedRequestId,
  disabled = false,
}: any) {
  let filtered = requests

  if (filters.bloodType) {
    filtered = filtered.filter((request: any) => request.blood_type === filters.bloodType)
  }

  if (filters.severity) {
    filtered = filtered.filter((request: any) => request.severity === filters.severity)
  }

  if (filters.status) {
    filtered = filtered.filter((request: any) => request.status === filters.status)
  }

  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, requests.length])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm card-smooth hover-float fade-in-up">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">Demandes de transfusion</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ouvrez une demande pour consulter le dossier patient, la priorité et les actions possibles.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Volume filtré</p>
          <p className="text-lg font-semibold text-slate-950">{filtered.length} dossiers</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50/70">
            <tr className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Besoins</th>
              <th className="px-6 py-4">Priorité</th>
              <th className="px-6 py-4">Échéance</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginated.map((request: any) => {
              const patient = patients[request.patient_id]
              const severity = getSeverityMeta(request.severity)
              const status = getRequestStatusMeta(request.status)

              return (
                <tr
                  key={request.id}
                  onClick={(event) => {
                    const target = event.target as HTMLElement
                    if (!target.closest('button')) {
                      onSelect?.(request.id)
                    }
                  }}
                  className={`cursor-pointer transition-all duration-300 ease-out ${
                    selectedRequestId === request.id
                      ? 'bg-sky-50/80 shadow-inner'
                      : 'hover:bg-slate-50/80 hover:-translate-y-0.5 hover:shadow-sm'
                  }`}
                >
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-950">
                        {patient?.first_name || request.patient_name || 'Patient'} {patient?.last_name || ''}
                      </div>
                      <div className="text-sm text-slate-500">
                        {request.id} • {status.label}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="font-medium text-slate-900">{request.department || 'Service inconnu'}</div>
                      <div className="text-sm text-slate-500">{request.room || 'Salle non définie'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-[#c73b42]">
                        {request.blood_type}
                      </span>
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">{request.units_needed} poche(s)</div>
                        <div className="text-sm text-slate-500">{request.donors_confirmed} donneur(s) confirmé(s)</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${severity.tone}`}
                      >
                        {severity.label}
                      </span>
                      <div
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}
                      >
                        {status.label}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1 text-sm">
                      <div className="font-medium text-slate-900">{formatDateTime(request.required_by)}</div>
                      <div className="text-slate-500">{request.attending_physician}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onSelect?.(request.id)
                        }}
                        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                      >
                        <Eye size={14} />
                        Voir
                      </button>

                      {(request.status === 'active' || request.status === 'partially_fulfilled') && (
                        <>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={(event) => {
                              event.stopPropagation()
                              if (!disabled) onAction?.(request.id, 'assign')
                            }}
                            className="flex items-center gap-2 rounded-2xl bg-[#c73b42] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#b02d35] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Send size={14} />
                            Alerter
                          </button>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={(event) => {
                              event.stopPropagation()
                              if (!disabled) onAction?.(request.id, 'validate')
                            }}
                            className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Check size={14} />
                            Compléter
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <AlertCircle size={24} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">Aucune demande ne correspond aux filtres actifs.</p>
        </div>
      ) : null}

      <Pagination
        currentPage={safePage}
        pageSize={ITEMS_PER_PAGE}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
        label="demandes"
      />
    </div>
  )
}
