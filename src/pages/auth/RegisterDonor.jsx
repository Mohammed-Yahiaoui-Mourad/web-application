import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { BLOOD_TYPES, WILAYAS } from '../../constants'

export default function RegisterDonor() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    blood_type: 'O+',
    region: 'Alger',
    last_donation_date: '',
    is_available: true,
    email: '',
    password: '',
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setError('Vérifiez votre email pour confirmer le compte.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      role: 'donneur',
      first_name: form.first_name,
      last_name: form.last_name,
      date_of_birth: form.date_of_birth,
      phone: form.phone,
      blood_type: form.blood_type,
      region: form.region,
      last_donation_date: form.last_donation_date || null,
      is_available: form.is_available,
    })

    setLoading(false)
    if (profileError) {
      setError(profileError.message)
      return
    }

    navigate('/donneur')
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#E8293A] focus:outline-none focus:ring-1 focus:ring-[#E8293A]'

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-bold">Inscription Donneur</h1>
      <p className="mb-6 text-gray-600">Rejoignez le réseau de donneurs BloodMatch</p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Prénom</label>
            <input required className={inputClass} value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Nom</label>
            <input required className={inputClass} value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Date de naissance</label>
          <input type="date" required className={inputClass} value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Téléphone</label>
          <input required className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Groupe sanguin</label>
          <select className={inputClass} value={form.blood_type} onChange={(e) => update('blood_type', e.target.value)}>
            {BLOOD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Wilaya</label>
          <select className={inputClass} value={form.region} onChange={(e) => update('region', e.target.value)}>
            {WILAYAS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Dernière date de don (optionnel)</label>
          <input type="date" className={inputClass} value={form.last_donation_date} onChange={(e) => update('last_donation_date', e.target.value)} />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => update('is_available', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#E8293A]"
          />
          <span className="text-sm font-medium">Disponible pour donner</span>
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" required className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Mot de passe</label>
          <input type="password" required minLength={6} className={inputClass} value={form.password} onChange={(e) => update('password', e.target.value)} />
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#E8293A] py-2.5 font-semibold text-white disabled:opacity-50">
          {loading ? 'Inscription...' : "S'inscrire comme donneur"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-[#E8293A] hover:underline">Déjà inscrit ? Connexion</Link>
      </p>
    </div>
  )
}
