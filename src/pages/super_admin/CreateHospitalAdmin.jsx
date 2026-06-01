import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import HospitalSelect from '../../components/HospitalSelect'

export default function CreateHospitalAdmin() {
  const navigate = useNavigate()
  const [hopitals, setHopitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    hopital_id: '',
  })

  useEffect(() => {
    supabase.from('hopitals').select('*').order('name').then(({ data }) => setHopitals(data || []))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { data, error: fnError } = await supabase.functions.invoke('create-hospital-admin', {
      body: form,
    })

    setLoading(false)

    if (fnError) {
      setError(fnError.message || 'Edge Function non déployée. Voir supabase/functions/create-hospital-admin')
      return
    }

    if (data?.error) {
      setError(data.error)
      return
    }

    setSuccess('Administrateur hôpital créé avec succès.')
    setTimeout(() => navigate('/super-admin'), 1500)
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#E8293A] focus:outline-none focus:ring-1 focus:ring-[#E8293A]'

  return (
    <div className="mx-auto max-w-lg">
      <Link to="/super-admin" className="mb-4 inline-block text-sm text-[#E8293A] hover:underline">
        ← Retour
      </Link>
      <h1 className="mb-2 text-2xl font-bold">Créer un admin hôpital</h1>
      <p className="mb-6 text-sm text-gray-600">
        {hopitals.length} hôpitaux chargés depuis OpenStreetMap. Choisissez l&apos;établissement à administrer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Prénom</label>
            <input required className={inputClass} value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Nom</label>
            <input required className={inputClass} value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" required className={inputClass} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Mot de passe temporaire</label>
          <input type="password" required minLength={8} className={inputClass} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Filtrer par wilaya (optionnel)</label>
          <input
            className={inputClass}
            placeholder="Ex. Oran"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Hôpital</label>
          <HospitalSelect
            hopitals={hopitals.filter(
              (h) => !filterRegion.trim() || h.region?.toLowerCase().includes(filterRegion.trim().toLowerCase())
            )}
            value={form.hopital_id}
            onChange={(hopital_id) => setForm((f) => ({ ...f, hopital_id }))}
          />
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#E8293A] py-2.5 font-semibold text-white disabled:opacity-50">
          {loading ? 'Création...' : 'Créer l\'administrateur'}
        </button>
      </form>
    </div>
  )
}
