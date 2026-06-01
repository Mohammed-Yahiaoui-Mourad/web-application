import { useEffect, useState } from 'react'
import useAuthStore from '../store/useAuthStore'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const profile = useAuthStore((s) => s.profile)
  const [form, setForm] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        blood_type: profile.blood_type || '',
        wilaya: profile.wilaya || '',
      })
    }
  }, [profile])

  if (!profile) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Chargement du profil…</p>
      </div>
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        birth_date: form.birth_date,
        blood_type: form.blood_type,
        wilaya: form.wilaya,
      })
      .eq('id', profile.id)

    if (error) {
      setMessage(`Erreur : ${error.message}`)
    } else {
      setMessage('Profil mis à jour avec succès.')
      useAuthStore.setState({ profile: { ...profile, ...form } })
    }
    setSaving(false)
  }

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-red-600">Mon profil</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Modifier vos informations</h1>
        <p className="mt-2 text-gray-600">Votre compte peut à la fois demander du sang et recevoir des alertes.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Prénom</span>
          <input
            type="text"
            value={form.first_name}
            onChange={(event) => setForm({ ...form, first_name: event.target.value })}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Nom</span>
          <input
            type="text"
            value={form.last_name}
            onChange={(event) => setForm({ ...form, last_name: event.target.value })}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Téléphone</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Date de naissance</span>
          <input
            type="date"
            value={form.birth_date}
            onChange={(event) => setForm({ ...form, birth_date: event.target.value })}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Groupe sanguin</span>
          <input
            type="text"
            value={form.blood_type}
            onChange={(event) => setForm({ ...form, blood_type: event.target.value })}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Wilaya</span>
          <input
            type="text"
            value={form.wilaya}
            onChange={(event) => setForm({ ...form, wilaya: event.target.value })}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>
      </form>

      {message ? (
        <div className="mt-6 rounded-3xl bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm">{message}</div>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
      >
        {saving ? 'Enregistrement...' : 'Mettre à jour le profil'}
      </button>
    </div>
  )
}
