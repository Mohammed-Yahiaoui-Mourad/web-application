import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import useAuthStore from '../../store/useAuthStore'
import Topbar from '../../components/Topbar'
import FilterBar from '../../components/FilterBar'
import RequestsTable from '../../components/RequestsTable'

export default function ManageRequests() {
  const profile = useAuthStore((s) => s.profile)
  const [requests, setRequests] = useState<any[]>([])
  const [patients, setPatients] = useState<Record<string, any>>({})
  const [filters, setFilters] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loadAll()
  }, [profile?.hopital_id])

  async function loadAll() {
    if (!profile?.hopital_id) return

    try {
      const reqs = await api.get('/api/admin/requests')
      setRequests(reqs || [])

      const map: Record<string, any> = {}
      for (const r of reqs || []) {
        if (r.patient_id) {
          map[r.patient_id] = { id: r.patient_id, first_name: r.patient_name || 'Patient', last_name: '' }
        }
      }
      setPatients(map)
    } catch (err: any) {
      console.error('loadAll error:', err)
    }
  }

  async function alertDonors(requestId: string) {
    setLoading(true)
    try {
      const res = await api.post(`/api/admin/requests/${requestId}/broadcast`)
      setMsg(`${res.data || 0} donneur(s) alerté(s)`)
      loadAll()
    } catch (error: any) {
      setMsg(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function setStatus(id: string, status: string) {
    setLoading(true)
    try {
      await api.patch(`/api/admin/requests/${id}/status?status_update=${status}`)
      loadAll()
    } catch (error: any) {
      console.error('setStatus error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (requestId: string, action: string) => {
    if (action === 'assign') {
      alertDonors(requestId)
    } else if (action === 'validate') {
      setStatus(requestId, 'fulfilled')
    }
  }

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [filterName]: value,
    }))
  }

  const bloodTypes = [...new Set(requests.map((r) => r.blood_type).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <Topbar
        title="Manage Requests"
        hideActions
        onSearch={() => {}}
        onEmergency={() => {}}
      />

      {/* Message */}
      {msg && (
        <div className="mx-8 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-800 border border-green-200">
          {msg}
        </div>
      )}

      {/* Filters */}
      <div className="mx-8">
        <FilterBar filters={filters} onFilterChange={handleFilterChange} bloodTypes={bloodTypes} />
      </div>

      {/* Main Content: Requests Table */}
      <div className="mx-8">
        <RequestsTable
          requests={requests}
          patients={patients}
          filters={filters}
          onAction={handleAction}
        />
      </div>
    </div>
  )
}
