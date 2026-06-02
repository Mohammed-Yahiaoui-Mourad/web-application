import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import useAuthStore from '../../store/useAuthStore'
import Topbar from '../../components/Topbar'
import KpiCard from '../../components/KpiCard'
import EmergencyFeed from '../../components/EmergencyFeed'
import ActivityTable from '../../components/ActivityTable'

export default function AdminHopitalDashboard() {
  const profile = useAuthStore((s) => s.profile)
  const navigate = useNavigate()
  const [requests, setRequests] = useState<any[]>([])
  const [patients, setPatients] = useState<Record<string, any>>({})
  const [stats, setStats] = useState({
    active: 0,
    urgent: 0,
    inRoute: 0,
    totalUnits: 0,
    fulfilled: 0,
  })
  const [broadcastMsg, setBroadcastMsg] = useState('')

  useEffect(() => {
    if (profile?.hopital_id) loadData()
  }, [profile?.hopital_id])

  async function loadData() {
    try {
      const list = await api.get('/api/admin/requests')
      setRequests(list)

      setStats({
        active: list.filter((r: any) => r.status === 'active').length,
        urgent: list.filter((r: any) => r.severity === 'urgent' || r.severity === 'critique' || r.severity === 'high' || r.severity === 'critical').length,
        inRoute: list.reduce((sum: number, r: any) => sum + (r.donors_confirmed || 0), 0),
        totalUnits: list.reduce((sum: number, r: any) => sum + (r.units_needed || 0), 0),
        fulfilled: list.filter((r: any) => r.status === 'fulfilled').length,
      })

      const map: Record<string, any> = {}
      for (const r of list) {
        if (r.patient_id) {
          map[r.patient_id] = { id: r.patient_id, first_name: r.patient_name || 'Patient', last_name: '' }
        }
      }
      setPatients(map)
    } catch (err: any) {
      console.error('loadData error:', err)
    }
  }

  async function launchBroadcast(requestId: string) {
    setBroadcastMsg('')
    try {
      const res = await api.post(`/api/admin/requests/${requestId}/broadcast`)
      setBroadcastMsg(`${res.data || 0} donneur(s) alerté(s) !`)
      loadData()
    } catch (error: any) {
      setBroadcastMsg(`Erreur : ${error.message}`)
    }
  }

  async function updateStatus(requestId: string, status: string) {
    try {
      await api.patch(`/api/admin/requests/${requestId}/status?status_update=${status}`)
      loadData()
    } catch (error: any) {
      console.error('updateStatus error:', error)
    }
  }

  const handleTopbarAction = (type: string) => {
    if (type === 'emergency') {
      navigate('/admin-hopital/demandes')
    }
  }

  const handleActivityAction = (requestId: string, action: string) => {
    if (action === 'validate') {
      updateStatus(requestId, 'fulfilled')
    } else if (action === 'assign') {
      launchBroadcast(requestId)
    }
  }

  const handleEmergencyFeedAction = (requestId: string, action: string) => {
    if (action === 'broadcast') {
      launchBroadcast(requestId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <Topbar
        title="Hospital Administration"
        hideSearch
        hideActions
        onSearch={() => {}}
        onEmergency={() => {}}
      />

      {/* Broadcast Message */}
      {broadcastMsg && (
        <div className="mx-8 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-800 border border-green-200">
          {broadcastMsg}
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="mx-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active Requests"
          value={stats.active}
          subtext="demandes en cours"
          icon="📋"
          bgColor="bg-white"
        />
        <KpiCard
          label="Urgent Cases"
          value={stats.urgent}
          subtext="priorités critiques"
          icon="🚨"
          bgColor="bg-white"
          textColor="text-[#E8293A]"
        />
        <KpiCard
          label="Donors Assigned"
          value={stats.inRoute}
          subtext="donneurs actifs"
          icon="👥"
          bgColor="bg-white"
        />
        <KpiCard
          label="Units Needed"
          value={stats.totalUnits}
          subtext="poches requises"
          icon="🩸"
          bgColor="bg-white"
        />
      </div>

      {/* Emergency Feed */}
      <div className="mx-8">
        <EmergencyFeed requests={requests} onAction={handleEmergencyFeedAction} />
      </div>

      {/* Recent Activity Table */}
      <div className="mx-8">
        <ActivityTable
          requests={requests}
          patients={patients}
          onAction={handleActivityAction}
        />
      </div>
    </div>
  )
}
