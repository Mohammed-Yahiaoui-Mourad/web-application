import { useEffect, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Save,
} from 'lucide-react'
import DetailDrawer from '../../components/DetailDrawer'
import Pagination from '../../components/Pagination'
import Topbar from '../../components/Topbar'
import { api } from '../../lib/api'
import {
  formatDate,
  formatDateTime,
  formatTime,
  getAppointmentStatusMeta,
  getRequestStatusMeta,
} from '../../lib/hospitalUtils'

const ITEMS_PER_PAGE = 5

export default function Planning() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: '',
    time: '',
    status: 'scheduled',
    units_expected: 1,
    room: '',
    assigned_nurse: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const selected = appointments.find((appointment) => appointment.id === selectedAppointmentId)
    if (!selected) return

    const date = new Date(selected.scheduled_time)
    setForm({
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().slice(0, 5),
      status: selected.status || 'scheduled',
      units_expected: selected.units_expected || 1,
      room: selected.room || '',
      assigned_nurse: selected.assigned_nurse || '',
      notes: selected.notes || '',
    })
  }, [selectedAppointmentId, appointments])

  async function loadData() {
    try {
      const [appointmentData, requestData] = await Promise.all([
        api.get('/api/admin/appointments'),
        api.get('/api/admin/requests'),
      ])

      const nextAppointments = Array.isArray(appointmentData) ? appointmentData : []
      setAppointments(nextAppointments)
      setRequests(Array.isArray(requestData) ? requestData : [])
      setSelectedAppointmentId(nextAppointments[0]?.id || null)
    } catch (error) {
      console.error('loadData error:', error)
    }
  }

  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay()
  const blanks = Array.from({ length: (firstDayOfMonth + 6) % 7 }, (_, index) => index)
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1)
  const monthName = selectedMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

  const orderedAppointments = [...appointments].sort(
    (first, second) => new Date(first.scheduled_time).getTime() - new Date(second.scheduled_time).getTime()
  )
  const safePage = Math.min(currentPage, Math.max(1, Math.ceil(orderedAppointments.length / ITEMS_PER_PAGE)))
  const paginatedAppointments = orderedAppointments.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )
  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) || null
  const linkedRequest = requests.find((request) => request.id === selectedAppointment?.request_id) || null
  const selectedStatus = getAppointmentStatusMeta(selectedAppointment?.status)

  const stats = {
    planned: appointments.filter((appointment) => appointment.status === 'scheduled').length,
    completed: appointments.filter((appointment) => appointment.status === 'completed').length,
    rescheduled: appointments.filter((appointment) => appointment.status === 'rescheduled').length,
  }

  function getAppointmentsForDay(day: number) {
    const dateString = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return appointments.filter((appointment) => appointment.scheduled_time.startsWith(dateString))
  }

  function changeMonth(offset: number) {
    const nextMonth = new Date(selectedMonth)
    nextMonth.setMonth(selectedMonth.getMonth() + offset)
    setSelectedMonth(nextMonth)
  }

  function updateForm(field: string, value: any) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function saveAppointment() {
    if (!selectedAppointment) return

    setSaving(true)
    try {
      const scheduled_time = new Date(`${form.date}T${form.time}:00`).toISOString()
      const payload = {
        ...selectedAppointment,
        ...form,
        scheduled_time,
        units_expected: Number(form.units_expected),
      }

      await api.patch(`/api/admin/appointments/${selectedAppointment.id}`, payload)

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === selectedAppointment.id ? { ...appointment, ...payload } : appointment
        )
      )
      setMessage('Le rendez-vous a été mis à jour dans le planning.')
    } catch (error: any) {
      setMessage(error?.message || 'Impossible de sauvegarder le rendez-vous.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <Topbar
        title="Planning des collectes"
        subtitle="Cliquez sur un créneau du calendrier ou sur un rendez-vous pour ajuster l’horaire, le statut ou l’affectation opérationnelle."
        hideSearch
        hideActions
      />

      <div className="mx-8 grid gap-4 xl:grid-cols-3">
        <PlanningMetric title="Planifiés" value={stats.planned} />
        <PlanningMetric title="Effectués" value={stats.completed} tone="bg-emerald-50 border-emerald-200" />
        <PlanningMetric title="Replanifiés" value={stats.rescheduled} tone="bg-amber-50 border-amber-200" />
      </div>

      {message ? (
        <div className="mx-8 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">{message}</div>
      ) : null}

      <div className="mx-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,1fr)]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Vue mensuelle</p>
              <h2 className="mt-2 text-2xl font-semibold capitalize tracking-tight text-slate-950">{monthName}</h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 overflow-hidden rounded-[24px] border border-slate-200">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div
                key={day}
                className="border-b border-slate-200 bg-slate-50 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                {day}
              </div>
            ))}

            {blanks.map((index) => (
              <div key={`blank-${index}`} className="min-h-[132px] border-r border-b border-slate-200 bg-slate-50/40" />
            ))}

            {days.map((day) => {
              const dailyAppointments = getAppointmentsForDay(day)
              const isToday =
                day === new Date().getDate() &&
                selectedMonth.getMonth() === new Date().getMonth() &&
                selectedMonth.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={day}
                  className={`min-h-[132px] border-r border-b border-slate-200 p-3 ${
                    isToday ? 'bg-sky-50/60' : 'bg-white'
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-semibold ${
                      isToday ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
                    }`}
                  >
                    {day}
                  </span>

                  <div className="mt-3 space-y-2">
                    {dailyAppointments.map((appointment) => {
                      const appointmentStatus = getAppointmentStatusMeta(appointment.status)
                      return (
                        <button
                          key={appointment.id}
                          type="button"
                          onClick={() => setSelectedAppointmentId(appointment.id)}
                          className={`block w-full rounded-2xl border px-3 py-2 text-left text-xs transition ${appointmentStatus.tone}`}
                        >
                          <div className="font-semibold">{formatTime(appointment.scheduled_time)}</div>
                          <div className="mt-1 truncate">{appointment.donor_name}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Liste planifiée</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Rendez-vous opérationnels</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50/70">
                <tr className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Donneur</th>
                  <th className="px-6 py-4">Salle</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedAppointments.map((appointment) => {
                  const status = getAppointmentStatusMeta(appointment.status)
                  return (
                    <tr
                      key={appointment.id}
                      onClick={() => setSelectedAppointmentId(appointment.id)}
                      className={`cursor-pointer transition ${
                        selectedAppointmentId === appointment.id ? 'bg-sky-50/80' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-900">{formatDate(appointment.scheduled_time)}</div>
                        <div className="mt-1 text-sm text-slate-500">{formatTime(appointment.scheduled_time)}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-950">{appointment.donor_name}</div>
                        <div className="mt-1 text-sm text-slate-500">{appointment.blood_type}</div>
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

          <Pagination
            currentPage={safePage}
            pageSize={ITEMS_PER_PAGE}
            totalItems={orderedAppointments.length}
            onPageChange={setCurrentPage}
            label="rendez-vous"
          />
        </section>
      </div>

      <DetailDrawer
        open={Boolean(selectedAppointment)}
        title={selectedAppointment?.donor_name || 'Rendez-vous'}
        subtitle={selectedAppointment ? `Créneau du ${formatDateTime(selectedAppointment.scheduled_time)}` : undefined}
        badge={
          selectedAppointment ? (
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${selectedStatus.tone}`}>
              {selectedStatus.label}
            </span>
          ) : null
        }
        onClose={() => setSelectedAppointmentId(null)}
        footer={
          selectedAppointment ? (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={saveAppointment}
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                <Save size={16} />
                Enregistrer
              </button>
            </div>
          ) : null
        }
      >
        {selectedAppointment ? (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <PlanningField label="Date">
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateForm('date', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                />
              </PlanningField>
              <PlanningField label="Heure">
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) => updateForm('time', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                />
              </PlanningField>
              <PlanningField label="Statut">
                <select
                  value={form.status}
                  onChange={(event) => updateForm('status', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                >
                  <option value="scheduled">Planifié</option>
                  <option value="rescheduled">Replanifié</option>
                  <option value="completed">Effectué</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </PlanningField>
              <PlanningField label="Poches attendues">
                <input
                  type="number"
                  min="1"
                  value={form.units_expected}
                  onChange={(event) => updateForm('units_expected', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                />
              </PlanningField>
              <PlanningField label="Salle">
                <input
                  type="text"
                  value={form.room}
                  onChange={(event) => updateForm('room', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                />
              </PlanningField>
              <PlanningField label="Infirmier référent">
                <input
                  type="text"
                  value={form.assigned_nurse}
                  onChange={(event) => updateForm('assigned_nurse', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                />
              </PlanningField>
            </section>

            <PlanningField label="Consignes">
              <textarea
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
              />
            </PlanningField>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Demande associée</h3>
              {linkedRequest ? (
                <div className="mt-4 space-y-3">
                  <p className="font-semibold text-slate-950">{linkedRequest.patient_name}</p>
                  <p className="text-sm text-slate-600">{linkedRequest.department} • {linkedRequest.procedure}</p>
                  <p className="text-sm text-slate-600">
                    Statut dossier: {getRequestStatusMeta(linkedRequest.status).label} • Échéance {formatDateTime(linkedRequest.required_by)}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Aucune demande liée à ce rendez-vous.</p>
              )}
            </section>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  )
}

function PlanningMetric({ title, value, tone }: any) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ${tone || ''}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

function PlanningField({ label, children }: any) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      {children}
    </div>
  )
}
