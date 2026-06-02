import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Check,
  CircleAlert,
  Clock3,
  Droplets,
  Send,
  ShieldAlert,
} from 'lucide-react'
import { api } from '../../lib/api'
import DetailDrawer from '../../components/DetailDrawer'
import FilterBar from '../../components/FilterBar'
import RequestsTable from '../../components/RequestsTable'
import Topbar from '../../components/Topbar'
import {
  formatDateTime,
  getRequestStatusMeta,
  getSeverityMeta,
} from '../../lib/hospitalUtils'
import useAuthStore from '../../store/useAuthStore'

export default function ManageRequests() {
  const profile = useAuthStore((state) => state.profile)
  const [requests, setRequests] = useState<any[]>([])
  const [patients, setPatients] = useState<Record<string, any>>({})
  const [filters, setFilters] = useState<any>({})
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAll()
  }, [profile?.hopital_id])

  async function loadAll() {
    if (!profile?.hopital_id) return

    try {
      const data = await api.get('/api/admin/requests')
      const nextRequests = Array.isArray(data) ? data : []
      setRequests(nextRequests)

      const nextPatients: Record<string, any> = {}
      for (const request of nextRequests) {
        if (request.patient_id) {
          const names = (request.patient_name || 'Patient').split(' ')
          nextPatients[request.patient_id] = {
            id: request.patient_id,
            first_name: names[0] || 'Patient',
            last_name: names.slice(1).join(' '),
          }
        }
      }

      setPatients(nextPatients)
      setSelectedRequestId((current) =>
        current && nextRequests.some((request) => request.id === current) ? current : null
      )
    } catch (error: any) {
      console.error('loadAll error:', error)
      setMessage(error?.message || 'Impossible de charger les demandes.')
    }
  }

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type })
    window.setTimeout(() => setToast(null), 3600)
  }

  async function alertDonors(requestId: string) {
    setSubmitting(true)
    try {
      const response = await api.post(`/api/admin/requests/${requestId}/broadcast`)
      const successMessage = `${response.data || 0} donneur(s) contacté(s) pour cette demande.`
      setMessage(successMessage)
      showToast(successMessage, 'success')
      await loadAll()
    } catch (error: any) {
      const errorMessage = error?.message || 'Échec de la diffusion de l’alerte.'
      setMessage(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function setStatus(requestId: string, status: string) {
    setSubmitting(true)
    try {
      await api.patch(`/api/admin/requests/${requestId}/status?status_update=${status}`)
      const successMessage = status === 'fulfilled' ? 'La demande a été marquée comme complétée.' : 'Statut mis à jour.'
      setMessage(successMessage)
      showToast(successMessage, 'success')
      await loadAll()
    } catch (error: any) {
      const errorMessage = error?.message || 'Impossible de mettre à jour le statut.'
      setMessage(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = (requestId: string, action: string) => {
    if (action === 'assign') {
      alertDonors(requestId)
    }

    if (action === 'validate') {
      setStatus(requestId, 'fulfilled')
    }
  }

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters((previous: any) => ({
      ...previous,
      [filterName]: value,
    }))
  }

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) || null
  const severity = getSeverityMeta(selectedRequest?.severity)
  const status = getRequestStatusMeta(selectedRequest?.status)
  const bloodTypes = [...new Set(requests.map((request) => request.blood_type).filter(Boolean))]
  const activeCount = requests.filter((request) => request.status === 'active').length
  const criticalCount = requests.filter(
    (request) => request.severity === 'critical' || request.severity === 'critique'
  ).length
  const unitsNeeded = requests.reduce((sum, request) => sum + (request.units_needed || 0), 0)

  return (
    <div className="space-y-6 pb-8">
      <Topbar
        title="Demandes hospitalières"
        subtitle="Supervisez les besoins transfusionnels, ouvrez chaque dossier pour consulter le contexte clinique et coordonner la mobilisation des donneurs."
        hideSearch
        hideActions
      />

      <div className="mx-8 grid gap-4 xl:grid-cols-3">
        <MetricCard
          icon={CircleAlert}
          title="Demandes actives"
          value={activeCount}
          description="Dossiers nécessitant encore une action de l’équipe."
        />
        <MetricCard
          icon={ShieldAlert}
          title="Cas critiques"
          value={criticalCount}
          description="Demandes à traiter en priorité absolue."
          tone="bg-rose-50 border-rose-200 text-rose-800"
        />
        <MetricCard
          icon={Droplets}
          title="Unités requises"
          value={unitsNeeded}
          description="Volume total restant à sécuriser pour les patients."
          tone="bg-sky-50 border-sky-200 text-sky-800"
        />
      </div>

      {message ? (
        <div className="mx-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {message}
        </div>
      ) : null}

      <div className="mx-8">
        <FilterBar filters={filters} onFilterChange={handleFilterChange} bloodTypes={bloodTypes} />
      </div>

      <div className="mx-8">
        <RequestsTable
          requests={requests}
          patients={patients}
          filters={filters}
          onAction={handleAction}
          onSelect={setSelectedRequestId}
          selectedRequestId={selectedRequestId}
          disabled={submitting}
        />
      </div>

      <DetailDrawer
        open={Boolean(selectedRequest)}
        title={selectedRequest?.patient_name || 'Détail de la demande'}
        subtitle={selectedRequest ? `${selectedRequest.department} • ${selectedRequest.id}` : undefined}
        badge={
          selectedRequest ? (
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
          ) : null
        }
        onClose={() => setSelectedRequestId(null)}
        footer={
          selectedRequest ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                {(selectedRequest.status === 'active' || selectedRequest.status === 'partially_fulfilled') && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleAction(selectedRequest.id, 'assign')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c73b42] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b02d35] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <Send size={16} />
                    Alerter les donneurs
                  </button>
                )}
                {(selectedRequest.status === 'active' || selectedRequest.status === 'partially_fulfilled') && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleAction(selectedRequest.id, 'validate')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <Check size={16} />
                    Marquer comme complétée
                  </button>
                )}
              </div>
            </div>
          ) : null
        }
      >
        {selectedRequest ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                label="Priorité clinique"
                value={severity.label}
                tone={severity.tone}
                caption={selectedRequest.procedure}
              />
              <InfoCard
                label="Volume requis"
                value={`${selectedRequest.units_needed} poche(s)`}
                caption={`${selectedRequest.donors_confirmed} donneur(s) confirmé(s)`}
              />
            </div>

            <section className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Contexte patient</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Service" value={selectedRequest.department} />
                <Field label="Salle" value={selectedRequest.room} />
                <Field label="Médecin référent" value={selectedRequest.attending_physician} />
                <Field label="Demandé par" value={selectedRequest.requested_by} />
                <Field label="Groupe sanguin" value={selectedRequest.blood_type} />
                <Field label="Échéance clinique" value={formatDateTime(selectedRequest.required_by)} />
                <Field label="Téléphone du service" value={selectedRequest.contact_phone} />
                <Field label="Création du dossier" value={formatDateTime(selectedRequest.created_at)} />
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Observations</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {selectedRequest.notes || 'Aucune note clinique complémentaire.'}
              </p>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Plan opérationnel</h3>
              <div className="mt-4 space-y-4">
                <TimelineRow
                  icon={AlertTriangle}
                  title="Validation du besoin"
                  text={`Le dossier reste classé ${severity.label.toLowerCase()} jusqu’à couverture complète des unités nécessaires.`}
                />
                <TimelineRow
                  icon={Send}
                  title="Mobilisation des donneurs"
                  text="Utilisez l’action d’alerte pour diffuser la demande aux profils compatibles et disponibles."
                />
                <TimelineRow
                  icon={Clock3}
                  title="Suivi d’échéance"
                  text={`Intervention attendue avant le ${formatDateTime(selectedRequest.required_by)}.`}
                />
              </div>
            </section>
          </div>
        ) : null}
      </DetailDrawer>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-3xl border px-5 py-4 shadow-2xl transition-all duration-300 ease-out sm:max-w-md"
          style={{
            backgroundColor: toast.type === 'success' ? 'rgba(236, 253, 245, 0.98)' : 'rgba(255, 241, 242, 0.98)',
            borderColor: toast.type === 'success' ? '#34d399' : '#fca5a5',
          }}
        >
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {toast.type === 'success' ? '✓' : '!'}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">{toast.type === 'success' ? 'Succès' : 'Erreur'}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{toast.text}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MetricCard({ icon: Icon, title, value, description, tone }: any) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ${tone || ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value, caption, tone }: any) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${tone || 'border-slate-200 text-slate-900'}`}>
        {value}
      </div>
      {caption ? <p className="mt-3 text-sm text-slate-600">{caption}</p> : null}
    </div>
  )
}

function Field({ label, value }: any) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value || 'Non renseigné'}</p>
    </div>
  )
}

function TimelineRow({ icon: Icon, title, text }: any) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  )
}
