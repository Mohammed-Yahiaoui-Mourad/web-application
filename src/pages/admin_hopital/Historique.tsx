import { useEffect, useState } from 'react'
import { Eye, FileDown, History, XCircle } from 'lucide-react'
import DetailDrawer from '../../components/DetailDrawer'
import Pagination from '../../components/Pagination'
import Topbar from '../../components/Topbar'
import { api } from '../../lib/api'
import {
  formatDateTime,
  getAppointmentStatusMeta,
} from '../../lib/hospitalUtils'

const ITEMS_PER_PAGE = 5

export default function Historique() {
  const [history, setHistory] = useState<any[]>([])
  const [selectedOperationId, setSelectedOperationId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      const data = await api.get('/api/admin/appointments')
      const operations = (Array.isArray(data) ? data : []).filter(
        (appointment: any) => appointment.status === 'completed' || appointment.status === 'cancelled'
      )
      setHistory(operations)
      setSelectedOperationId((current) =>
        current && operations.some((operation) => operation.id === current) ? current : null
      )
    } catch (error) {
      console.error('loadHistory error:', error)
    }
  }

  function exportCsv() {
    const headers = ['id', 'donor_name', 'blood_type', 'scheduled_time', 'status', 'units_donated']
    const rows = filteredHistory.map((operation) =>
      headers.map((header) => JSON.stringify(operation[header] ?? '')).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'historique-dons.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredHistory =
    statusFilter === 'all' ? history : history.filter((operation) => operation.status === statusFilter)
  const safePage = Math.min(currentPage, Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)))
  const paginatedHistory = filteredHistory.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)
  const selectedOperation = history.find((operation) => operation.id === selectedOperationId) || null
  const selectedStatus = getAppointmentStatusMeta(selectedOperation?.status)

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  return (
    <div className="space-y-6 pb-8">
      <Topbar
        title="Historique des dons"
        subtitle="Archive opérationnelle des collectes réalisées ou annulées, avec export rapide et fiche de traçabilité par opération."
        hideSearch
        hideActions
      />

      <div className="mx-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Archive clinique</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Registre des opérations passées</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-300"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Effectués</option>
              <option value="cancelled">Annulés</option>
            </select>
            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              <FileDown size={16} />
              Exporter CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50/70">
              <tr className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4">Date & heure</th>
                <th className="px-6 py-4">Donneur</th>
                <th className="px-6 py-4">Groupe</th>
                <th className="px-6 py-4">Unités</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedHistory.map((operation) => {
                const status = getAppointmentStatusMeta(operation.status)
                return (
                  <tr
                    key={operation.id}
                    className={`transition ${
                      selectedOperationId === operation.id ? 'bg-sky-50/80' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-900">{formatDateTime(operation.scheduled_time)}</div>
                      <div className="mt-1 text-sm text-slate-500">{operation.room}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-950">{operation.donor_name}</div>
                      <div className="mt-1 text-sm text-slate-500">{operation.assigned_nurse}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-[#c73b42]">
                        {operation.blood_type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-medium text-slate-900">{operation.units_donated || operation.units_expected || 0} poche(s)</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOperationId(operation.id)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Eye size={15} />
                          Voir
                        </span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm font-semibold text-slate-600">
            Aucun enregistrement dans l’historique pour ce filtre.
          </div>
        ) : null}

        <Pagination
          currentPage={safePage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={filteredHistory.length}
          onPageChange={setCurrentPage}
          label="opérations"
        />
      </div>

      <DetailDrawer
        open={Boolean(selectedOperation)}
        title={selectedOperation?.donor_name || 'Opération'}
        subtitle={selectedOperation ? formatDateTime(selectedOperation.scheduled_time) : undefined}
        badge={
          selectedOperation ? (
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${selectedStatus.tone}`}>
              {selectedStatus.label}
            </span>
          ) : null
        }
        onClose={() => setSelectedOperationId(null)}
      >
        {selectedOperation ? (
          <div className="space-y-6">
            <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Traçabilité</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <HistoryField label="Salle" value={selectedOperation.room} />
                <HistoryField label="Infirmier référent" value={selectedOperation.assigned_nurse} />
                <HistoryField label="Poches prévues" value={`${selectedOperation.units_expected || 0}`} />
                <HistoryField label="Poches validées" value={`${selectedOperation.units_donated || 0}`} />
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Compte rendu</p>
              <p className="mt-4 text-sm leading-7 text-slate-700">{selectedOperation.notes || 'Aucun commentaire enregistré.'}</p>
            </section>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  )
}

function HistoryField({ label, value }: any) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value || 'Non renseigné'}</p>
    </div>
  )
}
