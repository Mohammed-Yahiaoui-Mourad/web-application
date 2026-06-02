import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import DetailDrawer from '../../components/DetailDrawer'
import Topbar from '../../components/Topbar'
import { api } from '../../lib/api'
import {
  formatDate,
  formatDateTime,
  formatTime,
  getAppointmentStatusMeta,
  getRequestStatusMeta,
} from '../../lib/hospitalUtils'

type ViewMode = 'day' | 'week' | 'month'

export default function Planning() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [anchorDate, setAnchorDate] = useState(new Date())
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
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
  }, [appointments, selectedAppointmentId])

  async function loadData() {
    try {
      const [appointmentData, requestData] = await Promise.all([
        api.get('/api/admin/appointments'),
        api.get('/api/admin/requests'),
      ])
      setAppointments(Array.isArray(appointmentData) ? appointmentData : [])
      setRequests(Array.isArray(requestData) ? requestData : [])
    } catch (error) {
      console.error('loadData error:', error)
    }
  }

  const orderedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (first, second) => new Date(first.scheduled_time).getTime() - new Date(second.scheduled_time).getTime()
      ),
    [appointments]
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

  const visibleAppointments = useMemo(() => {
    if (viewMode === 'day') {
      const dayKey = anchorDate.toISOString().split('T')[0]
      return orderedAppointments.filter((appointment) => appointment.scheduled_time.startsWith(dayKey))
    }

    if (viewMode === 'week') {
      const weekDays = getWeekDays(anchorDate)
      const keys = new Set(weekDays.map((day) => day.dateKey))
      return orderedAppointments.filter((appointment) => keys.has(appointment.scheduled_time.split('T')[0]))
    }

    return orderedAppointments.filter((appointment) => {
      const date = new Date(appointment.scheduled_time)
      return (
        date.getFullYear() === anchorDate.getFullYear() &&
        date.getMonth() === anchorDate.getMonth()
      )
    })
  }, [anchorDate, orderedAppointments, viewMode])

  function updateForm(field: string, value: any) {
    setForm((current) => ({ ...current, [field]: value }))
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

  function shiftPeriod(offset: number) {
    const next = new Date(anchorDate)
    if (viewMode === 'day') {
      next.setDate(anchorDate.getDate() + offset)
    } else if (viewMode === 'week') {
      next.setDate(anchorDate.getDate() + 7 * offset)
    } else {
      next.setMonth(anchorDate.getMonth() + offset)
    }
    setAnchorDate(next)
  }

  const title =
    viewMode === 'day'
      ? `Journée du ${formatDate(anchorDate.toISOString())}`
      : viewMode === 'week'
        ? `Semaine du ${formatDate(getWeekDays(anchorDate)[0].date.toISOString())}`
        : anchorDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 pb-8">
      <Topbar
        title="Planning des collectes"
        subtitle="Passez d’une vue journalière à une vue hebdomadaire ou mensuelle, puis ouvrez un créneau pour ajuster l’horaire, la salle ou l’affectation."
        hideSearch
        hideActions
      />

      <div className="mx-8 grid gap-4 xl:grid-cols-3">
        <PlannerMetric title="Planifiés" value={stats.planned} />
        <PlannerMetric title="Effectués" value={stats.completed} tone="bg-emerald-50 border-emerald-200" />
        <PlannerMetric title="Replanifiés" value={stats.rescheduled} tone="bg-amber-50 border-amber-200" />
      </div>

      {message ? (
        <div className="mx-8 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">{message}</div>
      ) : null}

      <section className="mx-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Vue calendrier</p>
            <h2 className="mt-2 text-3xl font-semibold capitalize tracking-tight text-slate-950">{title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              {[
                { value: 'day', label: 'Journalière' },
                { value: 'week', label: 'Hebdomadaire' },
                { value: 'month', label: 'Mensuelle' },
              ].map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setViewMode(mode.value as ViewMode)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    viewMode === mode.value
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => shiftPeriod(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => shiftPeriod(1)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6">
          {viewMode === 'day' ? (
            <DayPlanner appointments={visibleAppointments} onSelect={setSelectedAppointmentId} />
          ) : null}

          {viewMode === 'week' ? (
            <WeekPlanner anchorDate={anchorDate} appointments={visibleAppointments} onSelect={setSelectedAppointmentId} />
          ) : null}

          {viewMode === 'month' ? (
            <MonthPlanner anchorDate={anchorDate} appointments={visibleAppointments} onSelect={setSelectedAppointmentId} />
          ) : null}
        </div>
      </section>

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
            <div className="grid gap-4 sm:grid-cols-2">
              <PlannerField label="Date">
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateForm('date', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                />
              </PlannerField>
              <PlannerField label="Heure">
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) => updateForm('time', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                />
              </PlannerField>
              <PlannerField label="Statut">
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
              </PlannerField>
              <PlannerField label="Poches attendues">
                <input
                  type="number"
                  min="1"
                  value={form.units_expected}
                  onChange={(event) => updateForm('units_expected', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                />
              </PlannerField>
              <PlannerField label="Salle">
                <input
                  type="text"
                  value={form.room}
                  onChange={(event) => updateForm('room', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                />
              </PlannerField>
              <PlannerField label="Infirmier référent">
                <input
                  type="text"
                  value={form.assigned_nurse}
                  onChange={(event) => updateForm('assigned_nurse', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
                />
              </PlannerField>
            </div>

            <PlannerField label="Consignes">
              <textarea
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
              />
            </PlannerField>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Demande associée</h3>
              {linkedRequest ? (
                <div className="mt-4 space-y-3">
                  <p className="font-semibold text-slate-950">{linkedRequest.patient_name}</p>
                  <p className="text-sm text-slate-600">
                    {linkedRequest.department} • {linkedRequest.procedure}
                  </p>
                  <p className="text-sm text-slate-600">
                    Statut dossier: {getRequestStatusMeta(linkedRequest.status).label} • Échéance{' '}
                    {formatDateTime(linkedRequest.required_by)}
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

function DayPlanner({ appointments, onSelect }: any) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Aujourd’hui</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
          {appointments.length} rendez-vous programmés
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Vue concentrée sur la journée en cours pour piloter les arrivées et ajuster les créneaux.
        </p>
      </div>

      <div className="space-y-3">
        {appointments.length > 0 ? (
          appointments.map((appointment: any) => {
            const status = getAppointmentStatusMeta(appointment.status)
            return (
              <button
                key={appointment.id}
                type="button"
                onClick={() => onSelect(appointment.id)}
                className="flex w-full items-start justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div>
                  <p className="text-lg font-semibold text-slate-950">{formatTime(appointment.scheduled_time)}</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{appointment.donor_name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {appointment.room} • {appointment.assigned_nurse}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
                  {status.label}
                </span>
              </button>
            )
          })
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-8 text-sm text-slate-500">
            Aucun rendez-vous planifié pour cette journée.
          </div>
        )}
      </div>
    </div>
  )
}

function WeekPlanner({ anchorDate, appointments, onSelect }: any) {
  const weekDays = getWeekDays(anchorDate)
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
      {weekDays.map((day) => {
        const dayAppointments = appointments.filter((appointment: any) =>
          appointment.scheduled_time.startsWith(day.dateKey)
        )
        return (
          <div key={day.dateKey} className="rounded-[24px] border border-slate-200 bg-white p-4">
            <div className="mb-4 border-b border-slate-200 pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{day.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{day.date.getDate()}</p>
            </div>
            <div className="space-y-3">
              {dayAppointments.length > 0 ? (
                dayAppointments.map((appointment: any) => {
                  const status = getAppointmentStatusMeta(appointment.status)
                  return (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => onSelect(appointment.id)}
                      className={`w-full rounded-2xl border px-3 py-3 text-left text-sm transition ${status.tone}`}
                    >
                      <div className="font-semibold">{formatTime(appointment.scheduled_time)}</div>
                      <div className="mt-1 truncate">{appointment.donor_name}</div>
                    </button>
                  )
                })
              ) : (
                <p className="text-sm text-slate-400">Aucun créneau</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthPlanner({ anchorDate, appointments, onSelect }: any) {
  const daysInMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1).getDay()
  const blanks = Array.from({ length: (firstDayOfMonth + 6) % 7 }, (_, index) => index)
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1)

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <div className="grid grid-cols-7 bg-slate-50">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div
            key={day}
            className="border-b border-slate-200 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {blanks.map((index) => (
          <div key={`blank-${index}`} className="min-h-[150px] border-r border-b border-slate-200 bg-slate-50/40" />
        ))}

        {days.map((day) => {
          const dateKey = `${anchorDate.getFullYear()}-${String(anchorDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayAppointments = appointments.filter((appointment: any) =>
            appointment.scheduled_time.startsWith(dateKey)
          )
          const isToday =
            day === new Date().getDate() &&
            anchorDate.getMonth() === new Date().getMonth() &&
            anchorDate.getFullYear() === new Date().getFullYear()

          return (
            <div
              key={dateKey}
              className={`min-h-[150px] border-r border-b border-slate-200 p-3 ${isToday ? 'bg-sky-50/60' : 'bg-white'}`}
            >
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold ${
                  isToday ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
                }`}
              >
                {day}
              </span>

              <div className="mt-3 space-y-2">
                {dayAppointments.slice(0, 3).map((appointment: any) => {
                  const status = getAppointmentStatusMeta(appointment.status)
                  return (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => onSelect(appointment.id)}
                      className={`block w-full rounded-2xl border px-3 py-2 text-left text-xs transition ${status.tone}`}
                    >
                      <div className="font-semibold">{formatTime(appointment.scheduled_time)}</div>
                      <div className="mt-1 truncate">{appointment.donor_name}</div>
                    </button>
                  )
                })}
                {dayAppointments.length > 3 ? (
                  <p className="text-xs font-semibold text-slate-500">+{dayAppointments.length - 3} autres</p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PlannerMetric({ title, value, tone }: any) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ${tone || ''}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

function PlannerField({ label, children }: any) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      {children}
    </div>
  )
}

function getWeekDays(date: Date) {
  const base = new Date(date)
  const day = base.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  base.setDate(base.getDate() + mondayOffset)

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(base)
    current.setDate(base.getDate() + index)
    return {
      date: current,
      dateKey: current.toISOString().split('T')[0],
      label: current.toLocaleDateString('fr-FR', { weekday: 'short' }),
    }
  })
}
