import React, { useEffect, useState } from 'react'
import { 
  ClipboardList, 
  AlertCircle, 
  Calendar, 
  Droplets,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { api } from '../../lib/api'
import useAuthStore from '../../store/useAuthStore'
import Topbar from '../../components/Topbar'
import KpiCard from '../../components/KpiCard'

export default function AdminHopitalDashboard() {
  const profile = useAuthStore((s) => s.profile)
  const [stats, setStats] = useState({
    active: 0,
    urgent: 0,
    upcoming: 0,
    totalUnits: 0,
  })
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    if (profile?.hopital_id) loadData()
  }, [profile?.hopital_id])

  async function loadData() {
    try {
      const [requestsListRaw, appointmentsListRaw] = await Promise.all([
        api.get('/api/admin/requests'),
        api.get('/api/admin/appointments')
      ])

      const requestsList = Array.isArray(requestsListRaw) ? requestsListRaw : []
      const appointmentsList = Array.isArray(appointmentsListRaw) ? appointmentsListRaw : []

      const today = new Date().toISOString().split('T')[0]
      const todayAppointments = appointmentsList.filter((a: any) => 
        a.scheduled_time?.startsWith(today) && a.status === 'scheduled'
      )

      setAppointments(todayAppointments)

      setStats({
        active: requestsList.filter((r: any) => r.status === 'active' || r.status === 'partially_fulfilled').length,
        urgent: requestsList.filter((r: any) => 
          r.severity === 'urgent' || r.severity === 'critique' || r.severity === 'high' || r.severity === 'critical'
        ).length,
        upcoming: todayAppointments.length,
        totalUnits: requestsList.reduce((sum: number, r: any) => sum + (r.units_needed || 0), 0),
      })
    } catch (err: any) {
      console.error('loadData error:', err)
    }
  }

  return (
    <div className="space-y-6">
      <Topbar title="Tableau de bord" hideSearch hideActions />

      {/* KPI Cards */}
      <div className="mx-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Demandes Actives"
          value={stats.active}
          subtext="en attente de sang"
          icon={ClipboardList}
          iconColor="text-blue-600"
        />
        <KpiCard
          label="Cas Urgents"
          value={stats.urgent}
          subtext="priorités absolues"
          icon={AlertCircle}
          iconColor="text-red-600"
          textColor="text-red-600"
        />
        <KpiCard
          label="Donneurs du Jour"
          value={stats.upcoming}
          subtext="rendez-vous aujourd'hui"
          icon={Calendar}
          iconColor="text-green-600"
        />
        <KpiCard
          label="Poches Requises"
          value={stats.totalUnits}
          subtext="total des unités"
          icon={Droplets}
          iconColor="text-orange-600"
        />
      </div>

      <div className="mx-8 grid grid-cols-1 gap-6 lg:grid-cols-3 pb-8">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 rounded-[32px] bg-white p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-[#E8293A]" size={20} />
              Donneurs attendus aujourd'hui
            </h2>
            <span className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
              {appointments.length} Rendez-vous
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-5 px-4">Donneur</th>
                  <th className="pb-5 px-4">Groupe</th>
                  <th className="pb-5 px-4">Heure</th>
                  <th className="pb-5 px-4">Statut</th>
                  <th className="pb-5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((app) => (
                  <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-4">
                      <div className="font-bold text-slate-900">{app.donor_name}</div>
                    </td>
                    <td className="py-5 px-4">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-[#E8293A] border border-red-100">
                        {app.blood_type}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="text-sm font-medium text-slate-600 flex items-center gap-2 uppercase tracking-tight font-bold">
                        <Clock size={14} className="text-slate-400" />
                        {app.scheduled_time ? new Date(app.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-600 border border-blue-100">
                        <CheckCircle2 size={12} />
                        Confirmé
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 uppercase tracking-widest">
                        Valider Don
                      </button>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center">
                         <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-3">
                           <Calendar size={24} />
                         </div>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucun donneur attendu</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hospital Metrics / Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-[32px] bg-[#E8293A] p-8 text-white shadow-lg shadow-red-200 relative overflow-hidden">
            <Droplets className="absolute -right-8 -bottom-8 text-white opacity-10" size={160} />
            <div className="relative z-10">
              <h3 className="mb-3 text-xl font-bold flex items-center gap-2">
                <AlertCircle size={24} />
                Urgence Sang O-
              </h3>
              <p className="mb-8 text-sm opacity-90 leading-relaxed font-medium">Stock critique. 3 demandes en attente nécessitent une intervention immédiate.</p>
              <button className="w-full rounded-2xl bg-white py-4 text-sm font-black text-[#E8293A] transition hover:bg-red-50 active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-red-900/20 uppercase tracking-widest">
                Lancer Alerte Massive
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100">
            <h3 className="mb-6 text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={20} className="text-green-500" />
              Statistiques Hebdo
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dons réalisés</span>
                  <span className="text-xl font-black text-slate-900">42</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-[80%] rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all duration-1000"></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Objectif mensuel</span>
                <div className="flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                  <TrendingUp size={14} />
                  +12%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
