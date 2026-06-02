import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import useAuthStore from '../../store/useAuthStore'
import { ROLE_ROUTES } from '../../constants'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  async function handleSubmit(e: any) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const params = new URLSearchParams()
      params.append('username', email)
      params.append('password', password)

      const tokenData = await api.post('/api/auth/login', params)
      localStorage.setItem('access_token', tokenData.access_token)

      const profile = await fetchProfile()
      if (!profile) {
        throw new Error('Profil non configuré.')
      }

      if (profile.role !== 'admin_hopital') {
        throw new Error(
          "Accès réservé aux administrateurs hôpital. Les patients et donneurs doivent utiliser l'application mobile."
        )
      }

      navigate(ROLE_ROUTES[profile.role] || '/')
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion inattendue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="absolute left-2/3 top-8 hidden h-24 w-24 rounded-full bg-[#93c5fd]/20 blur-3xl sm:block" />
      <div className="absolute -right-16 top-24 h-44 w-44 rounded-full bg-[#fb7185]/15 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/95 p-8 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80 backdrop-blur-xl page-transition">
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#fb7185]/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative space-y-4">
          <p className="inline-flex rounded-full bg-[#eef2ff] px-4 py-1 text-xs uppercase tracking-[0.28em] text-[#4338ca] shadow-sm shadow-slate-200/50">
            Espace administrateur
          </p>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Connexion</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              Accédez à votre espace AMAL avec une interface fluide et sécurisée.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          {error && (
            <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-3 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#E8293A] focus:bg-white focus:ring-2 focus:ring-[#E8293A]/20"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Mot de passe
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-3 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#E8293A] focus:bg-white focus:ring-2 focus:ring-[#E8293A]/20"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-[#E8293A] to-[#f97316] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E8293A]/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-[#E8293A]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>

      <div className="relative rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <div className="absolute left-4 top-4 h-14 w-14 rounded-full bg-[#f8fafc] shadow-inner" />
        <p className="text-sm leading-6 text-slate-600">
          Accès réservé au personnel hospitalier. Contactez l'administrateur pour obtenir un compte.
        </p>

        {import.meta.env.DEV && (
          <p className="mt-4 text-sm">
            <Link
              to="/dev-setup"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8293A] px-5 py-3 text-sm font-semibold text-[#E8293A] transition hover:border-[#be123c] hover:bg-[#fee2e2] hover:text-[#be123c]"
            >
              Setup dev — créer admin CHU automatiquement
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
