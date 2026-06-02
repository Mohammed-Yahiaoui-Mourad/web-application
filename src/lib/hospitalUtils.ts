import { canDonate } from '../constants'

export function formatDate(value?: string | null) {
  if (!value) return 'Non renseigné'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value?: string | null) {
  if (!value) return 'Non renseigné'
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(value?: string | null) {
  if (!value) return '--:--'
  return new Date(value).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getSeverityMeta(severity?: string) {
  if (severity === 'critical' || severity === 'critique') {
    return {
      label: 'Critique',
      tone: 'bg-red-50 text-red-700 border-red-200',
    }
  }

  if (severity === 'high' || severity === 'urgent') {
    return {
      label: 'Urgent',
      tone: 'bg-amber-50 text-amber-700 border-amber-200',
    }
  }

  return {
    label: 'Standard',
    tone: 'bg-sky-50 text-sky-700 border-sky-200',
  }
}

export function getRequestStatusMeta(status?: string) {
  if (status === 'fulfilled') {
    return { label: 'Complétée', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  }

  if (status === 'partially_fulfilled') {
    return { label: 'Partielle', tone: 'bg-amber-50 text-amber-700 border-amber-200' }
  }

  if (status === 'cancelled') {
    return { label: 'Annulée', tone: 'bg-slate-100 text-slate-700 border-slate-200' }
  }

  return { label: 'Active', tone: 'bg-sky-50 text-sky-700 border-sky-200' }
}

export function getAppointmentStatusMeta(status?: string) {
  if (status === 'completed') {
    return { label: 'Effectué', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  }

  if (status === 'cancelled') {
    return { label: 'Annulé', tone: 'bg-rose-50 text-rose-700 border-rose-200' }
  }

  if (status === 'rescheduled') {
    return { label: 'Replanifié', tone: 'bg-amber-50 text-amber-700 border-amber-200' }
  }

  return { label: 'Planifié', tone: 'bg-sky-50 text-sky-700 border-sky-200' }
}

export function getEligibility(lastDonationDate?: string | null) {
  if (!lastDonationDate) {
    return { label: 'Éligible', tone: 'text-emerald-700', note: 'Aucun don récent enregistré.' }
  }

  const eligible = canDonate(lastDonationDate)

  if (eligible) {
    return {
      label: 'Éligible',
      tone: 'text-emerald-700',
      note: `Dernier don le ${formatDate(lastDonationDate)}.`,
    }
  }

  const nextEligible = new Date(lastDonationDate)
  nextEligible.setMonth(nextEligible.getMonth() + 2)

  return {
    label: 'En attente',
    tone: 'text-amber-700',
    note: `Disponible à partir du ${formatDate(nextEligible.toISOString())}.`,
  }
}

export function getInitials(name?: string) {
  if (!name) return 'AM'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
