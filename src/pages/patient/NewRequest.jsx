import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/useAuthStore'
import { SEVERITIES } from '../../constants'
import HospitalSelect from '../../components/HospitalSelect'

export default function NewRequest() {
  const profile = useAuthStore((s) => s.profile)
  const navigate = useNavigate()
  const [hopitals, setHopitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    hopital_id: '',
    severity: 'normal',
    diagnosis: '',
    units_needed: 1,
  })

  useEffect(() => {
    if (!profile?.region) return
    supabase
      .from('hopitals')
      .select('id, name, address, region, latitude, longitude')
      .eq('region', profile.region)
      .order('name')
      .then(({ data }) => setHopitals(data || []))
  }, [profile?.region])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!profile) return
    setError('')
    setLoading(true)

    const hopital = hopitals.find((h) => h.id === form.hopital_id)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const { data, error: insertError } = await supabase
      .from('blood_requests')
      .insert({
        hopital_id: form.hopital_id,
        patient_id: profile.id,
        blood_type: profile.blood_type,
        severity: form.severity,
        diagnosis: form.diagnosis,
        units_needed: Number(form.units_needed),
        region: hopital?.region || profile.region,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    navigate('/patient', {
      state: {
        message: `Demande envoyée à l'hôpital. En attente de validation pour le broadcast.`,
        requestId: data.id,
      },
    })
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#E8293A] focus:outline-none focus:ring-1 focus:ring-[#E8293A]'

  return (
    <div className="mx-auto max-w-lg">
      <Link to="/patient" className="mb-4 inline-block text-sm text-[#E8293A] hover:underline">
        ← Retour
      </Link>
      <h1 className="mb-2 text-2xl font-bold">Nouvelle demande de sang</h1>
      <p className="mb-6 text-gray-600">
        Groupe sanguin : <strong>{profile?.blood_type}</strong> — L&apos;hôpital lancera le broadcast aux donneurs.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div>
          <label className="mb-1 block text-sm font-medium">Hôpital ({profile?.region})</label>
          <HospitalSelect
            hopitals={hopitals}
            region={profile?.region}
            value={form.hopital_id}
            onChange={(hopital_id) => setForm((f) => ({ ...f, hopital_id }))}
          />
          {hopitals.length === 0 && (
            <p className="mt-1 text-sm text-amber-600">
              Aucun hôpital dans votre wilaya. Importez les données OSM (voir README).
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Niveau de sévérité</label>
          <div className="flex flex-wrap gap-2">
            {SEVERITIES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, severity: s.value }))}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${s.color} ${
                  form.severity === s.value ? 'ring-2 ring-offset-2 ring-gray-800' : 'opacity-70'
                }`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Diagnostic</label>
          <textarea
            className={inputClass}
            rows={3}
            value={form.diagnosis}
            onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))}
            placeholder="Informations médicales..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Nombre de poches</label>
          <input
            type="number"
            min={1}
            max={10}
            required
            className={inputClass}
            value={form.units_needed}
            onChange={(e) => setForm((f) => ({ ...f, units_needed: e.target.value }))}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.hopital_id}
          className="w-full rounded-lg bg-[#E8293A] py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Envoi...' : "Envoyer la demande à l'hôpital"}
        </button>
      </form>
    </div>
  )
}
