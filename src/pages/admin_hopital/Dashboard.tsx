import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Clock3,
  Droplets,
  ShieldAlert,
} from 'lucide-react'
import KpiCard from '../../components/KpiCard'
import Pagination from '../../components/Pagination'
import Topbar from '../../components/Topbar'
import { api } from '../../lib/api'
import {
  formatDateTime,
  formatTime,
  getAppointmentStatusMeta,
  getSeverityMeta,
} from '../../lib/hospitalUtils'
import useAuthStore from '../../store/useAuthStore'

const ITEMS_PER_PAGE = 4

export default function AdminHopitalDashboard() {
  const profile = useAuthStore((state) => state.profile)
  const [requests, setRequests] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (profile?.hopital_id) {
      loadData()
    }
  }, [profile?.hopital_id])

  async function loadData() {
    try {
      const [requestData, appointmentData] = await Promise.all([
        api.get('/api/admin/requests'),
        api.get('/api/admin/appointments'),
      ])

      setRequests(Array.isArray(requestData) ? requestData : [])
      setAppointments(Array.isArray(appointmentData) ? appointmentData : [])
    } catch (error) {
      console.error('loadData error:', error)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(
    (appointment) => appointment.scheduled_time?.startsWith(today) && appointment.status !== 'cancelled'
  )
  const urgentRequests = requests
    .filter((request) => request.status !== 'fulfilled' && request.status !== 'cancelled')
    .sort((first, second) => {
      const firstWeight = first.severity === 'critical' ? 0 : first.severity === 'high' ? 1 : 2
      const secondWeight = second.severity === 'critical' ? 0 : second.severity === 'high' ? 1 : 2
      return firstWeight - secondWeight
    })
    .slice(0, 4)

  const safePage = Math.min(currentPage, Math.max(1, Math.ceil(todayAppointments.length / ITEMS_PER_PAGE)))
  const paginatedAppointments = todayAppointments.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const stats = {
    active: requests.filter((request) => request.status === 'active' || request.status === 'partially_fulfilled').length,
    urgent: requests.filter((request) => request.severity === 'critical' || request.severity === 'high').length,
    upcoming: todayAppointments.length,
    totalUnits: requests.reduce((sum, request) => sum + (request.units_needed || 0), 0),
  }

  return (
    <div className="space-y-6 pb-8">
      <Topbar
        title="Tableau de bord"
        subtitle="Vue opérationnelle de la journée : besoins critiques, rendez-vous en cours et charge transfusionnelle restante."
        hideSearch
        hideActions
      />

      <div className="mx-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Demandes actives" value={stats.active} subtext="Dossiers encore ouverts" icon={Activity} iconColor="text-sky-700" />
        <KpiCard label="Cas urgents" value={stats.urgent} subtext="Interventions prioritaires" icon={ShieldAlert} iconColor="text-rose-700" textColor="text-rose-700" />
        <KpiCard label="Rendez-vous du jour" value={stats.upcoming} subtext="Collectes à suivre aujourd’hui" icon={CalendarClock} iconColor="text-emerald-700" />
        <KpiCard label="Unités requises" value={stats.totalUnits} subtext="Volume restant à couvrir" icon={Droplets} iconColor="text-amber-700" />
      </div>

      <div className="mx-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Aujourd’hui</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Collectes programmées</h2>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {todayAppointments.length} rendez-vous suivis
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50/70">
                <tr className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4">Donneur</th>
                  <th className="px-6 py-4">Heure</th>
                  <th className="px-6 py-4">Salle</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedAppointments.map((appointment) => {
                  const status = getAppointmentStatusMeta(appointment.status)
                  return (
                    <tr key={appointment.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-950">{appointment.donor_name}</div>
                        <div className="mt-1 text-sm text-slate-500">{appointment.blood_type}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-medium text-slate-900">{formatTime(appointment.scheduled_time)}</div>
                        <div className="mt-1 text-sm text-slate-500">{formatDateTime(appointment.scheduled_time)}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-medium text-slate-900">{appointment.room}</div>
                        <div className="mt-1 text-sm text-slate-500">{appointment.assigned_nurse}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm font-semibold text-slate-600">
              Aucun rendez-vous planifié aujourd’hui.
            </div>
          ) : null}

          <Pagination
            currentPage={safePage}
            pageSize={ITEMS_PER_PAGE}
            totalItems={todayAppointments.length}
            onPageChange={setCurrentPage}
            label="rendez-vous"
          />
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-rose-200 bg-rose-50/80 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#c73b42] shadow-sm">
                <AlertTriangle size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Alerte transfusionnelle</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Maintenir la couverture O- et A-</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Les demandes critiques ouvertes concernent des groupes à tension élevée. Prioriser les rappels sur les profils déjà qualifiés.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">File critique</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Demandes à traiter</h3>
              </div>
              <Clock3 size={20} className="text-slate-400" />
            </div>

            <div className="mt-5 space-y-4">
              {urgentRequests.map((request) => {
                const severity = getSeverityMeta(request.severity)
                return (
                  <div key={request.id} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{request.patient_name}</p>
                        <p className="mt-1 text-sm text-slate-600">{request.department} • {request.blood_type}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${severity.tone}`}>
                        {severity.label}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {request.units_needed} poche(s) restantes • échéance {formatDateTime(request.required_by)}
                    </p>
                  </div>
                )
              })}
              {urgentRequests.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune demande prioritaire en attente.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
