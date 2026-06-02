import { useState } from 'react'
import { api } from '../../lib/api'
import Topbar from '../../components/Topbar'

export default function ToolsPage() {
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  const tools = [
    {
      id: 'force-match',
      name: 'Force Match Scheduler',
      icon: '🤖',
      description: 'Automatically schedule compatible donors for active blood requests',
      color: 'blue',
      action: handleForceMatch,
    },
    {
      id: 'broadcast-urgent',
      name: 'Broadcast Emergency Alerts',
      icon: '📢',
      description: 'Send urgent alerts to eligible donors for critical requests',
      color: 'red',
      action: handleBroadcastUrgent,
    },
    {
      id: 'dashboard-refresh',
      name: 'Refresh Dashboard Metrics',
      icon: '📊',
      description: 'Recalculate KPI statistics using backend metrics',
      color: 'purple',
      action: handleDashboardRefresh,
    },
  ]

  async function handleForceMatch() {
    setLoading((p) => ({ ...p, 'force-match': true }))
    setErrors((p) => ({ ...p, 'force-match': null }))
    try {
      const res = await api.post('/api/admin/force-match')
      setResults((p) => ({
        ...p,
        'force-match': `✅ Match scheduler executed: ${res.data || 0} appointment(s) scheduled`,
      }))
    } catch (err: any) {
      setErrors((p) => ({ ...p, 'force-match': err.message }))
    } finally {
      setLoading((p) => ({ ...p, 'force-match': false }))
    }
  }

  async function handleBroadcastUrgent() {
    setLoading((p) => ({ ...p, 'broadcast-urgent': true }))
    setErrors((p) => ({ ...p, 'broadcast-urgent': null }))
    try {
      const requests = await api.get('/api/admin/requests')
      const urgentRequests = (requests || []).filter(
        (r: any) =>
          (r.status === 'active' || r.status === 'pending') &&
          (r.severity === 'urgent' || r.severity === 'critique' || r.severity === 'high' || r.severity === 'critical')
      )

      if (urgentRequests.length === 0) {
        setResults((p) => ({
          ...p,
          'broadcast-urgent': '⚠️ No urgent requests found',
        }))
        setLoading((p) => ({ ...p, 'broadcast-urgent': false }))
        return
      }

      let totalAlerted = 0
      for (const req of urgentRequests) {
        const res = await api.post(`/api/admin/requests/${req.id}/broadcast`)
        totalAlerted += res.data || 0
      }

      setResults((p) => ({
        ...p,
        'broadcast-urgent': `✅ ${totalAlerted} donor(s) alerted for ${urgentRequests.length} urgent request(s)`,
      }))
    } catch (err: any) {
      setErrors((p) => ({ ...p, 'broadcast-urgent': err.message }))
    } finally {
      setLoading((p) => ({ ...p, 'broadcast-urgent': false }))
    }
  }

  async function handleDashboardRefresh() {
    setLoading((p) => ({ ...p, 'dashboard-refresh': true }))
    setErrors((p) => ({ ...p, 'dashboard-refresh': null }))
    try {
      const stats = await api.get('/api/admin/dashboard')
      setResults((p) => ({
        ...p,
        'dashboard-refresh': `✅ Metrics refreshed: ${stats.requests.pending + stats.requests.partially_fulfilled} active, ${stats.users.available_donors} donors available`,
      }))
    } catch (err: any) {
      setErrors((p) => ({ ...p, 'dashboard-refresh': err.message }))
    } finally {
      setLoading((p) => ({ ...p, 'dashboard-refresh': false }))
    }
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      red: 'bg-red-50 border-red-200 hover:bg-red-100',
      green: 'bg-green-50 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    }
    return colors[color] || colors.blue
  }

  const getButtonClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      red: 'bg-[#E8293A] hover:bg-red-700',
      green: 'bg-green-600 hover:bg-green-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <Topbar
        title="Tools & Actions"
        hideSearch
        hideActions
        onSearch={() => {}}
        onEmergency={() => {}}
      />

      {/* Tools Grid */}
      <div className="mx-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`rounded-xl border ${getColorClasses(
              tool.color,
            )} p-6 shadow-sm transition`}
          >
            {/* Icon & Title */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="mb-2 text-3xl">{tool.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900">{tool.name}</h3>
              </div>
            </div>

            {/* Description */}
            <p className="mb-5 text-sm text-gray-600">{tool.description}</p>

            {/* Result/Error Messages */}
            {results[tool.id] && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                {results[tool.id]}
              </div>
            )}
            {errors[tool.id] && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                ❌ {errors[tool.id]}
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={() => tool.action()}
              disabled={loading[tool.id]}
              className={`w-full rounded-lg ${getButtonClasses(
                tool.color,
              )} px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50`}
            >
              {loading[tool.id] ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Executing...
                </span>
              ) : (
                'Execute'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mx-8 rounded-xl border border-gray-200 bg-blue-50 p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-blue-900">ℹ️ About These Tools</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Force Match Scheduler:</strong> Automatically matches compatible donors to active blood requests and schedules appointments.
          </p>
          <p>
            <strong>Broadcast Emergency:</strong> Sends urgent alerts to eligible donors for critical blood type requests.
          </p>
          <p>
            <strong>Refresh Dashboard Metrics:</strong> Recalculates and updates all KPI statistics on the main dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
