import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/useAuthStore'
import { useRealtimeTable } from '../../hooks/useRealtime'
import AlertCard from '../../components/AlertCard'
import { canDonate } from '../../constants'

export default function MyAlerts() {
  const profile = useAuthStore((s) => s.profile)
  const [alerts, setAlerts] = useState([])
  const [details, setDetails] = useState({})
  const [loadingId, setLoadingId] = useState(null)
  const [notification, setNotification] = useState(null)

  const eligible = profile && canDonate(profile.last_donation_date) && profile.is_available

  const loadAlerts = useCallback(async () => {
    if (!profile?.id || !eligible) return

    const { data: alertData } = await supabase
      .from('donor_alerts')
      .select('*')
      .eq('donor_id', profile.id)
      .in('status', ['pending', 'accepted'])
      .order('sent_at', { ascending: false })

    const list = alertData || []
    setAlerts(list)

    const requestIds = [...new Set(list.map((a) => a.request_id))]
    if (requestIds.length === 0) {
      setDetails({})
      return
    }

    const { data: requests } = await supabase
      .from('blood_requests')
      .select('*, hopitals(*)')
      .in('id', requestIds)

    const map = {}
    for (const req of requests || []) {
      map[req.id] = {
        request: req,
        hospital: req.hopitals,
      }
    }
    setDetails(map)
  }, [profile?.id, eligible])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  useRealtimeTable(
    'donor_alerts',
    profile?.id ? `donor_id=eq.${profile.id}` : null,
    (newAlert) => {
      if (!eligible) return
      setNotification('Nouvelle alerte de don de sang !')
      setAlerts((prev) => {
        if (prev.some((a) => a.id === newAlert.id)) return prev
        return [newAlert, ...prev]
      })
      loadAlerts()
      setTimeout(() => setNotification(null), 5000)
    },
    () => loadAlerts()
  )

  async function respond(alert, status) {
    setLoadingId(alert.id)
    const { error } = await supabase
      .from('donor_alerts')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', alert.id)

    if (!error && status === 'accepted') {
      const req = details[alert.request_id]?.request
      if (req) {
        await supabase
          .from('blood_requests')
          .update({ donors_confirmed: (req.donors_confirmed || 0) + 1 })
          .eq('id', req.id)
      }
    }

    setLoadingId(null)
    loadAlerts()
  }

  if (!eligible) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Mes alertes</h1>
        <p className="rounded-xl bg-white p-8 text-center text-gray-600 shadow">
          Vous n&apos;êtes pas éligible aux alertes (indisponible ou don récent &lt; 2 mois).
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Mes alertes</h1>

      {notification && (
        <div className="mb-4 rounded-lg bg-[#E8293A] px-4 py-3 font-semibold text-white animate-pulse">
          {notification}
        </div>
      )}

      {alerts.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-gray-500 shadow">
          Aucune alerte active. Vous serez notifié en temps réel.
        </p>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => {
            const d = details[alert.request_id] || {}
            return (
              <AlertCard
                key={alert.id}
                alert={alert}
                request={d.request}
                hospital={d.hospital}
                loading={loadingId === alert.id}
                onAccept={(a) => respond(a, 'accepted')}
                onDecline={(a) => respond(a, 'declined')}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
