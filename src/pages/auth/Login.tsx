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

      if (!['admin_hopital', 'super_admin', 'admin'].includes(profile.role)) {
        throw new Error(
          "Accès réservé aux administrateurs hôpital / super admin. Les patients et donneurs doivent utiliser l'application mobile."
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
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-bold text-[#1a1917]">Connexion</h1>
      <p className="mb-6 text-gray-600">Accédez à votre espace BloodMatch</p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#E8293A] focus:outline-none focus:ring-1 focus:ring-[#E8293A]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#E8293A] focus:outline-none focus:ring-1 focus:ring-[#E8293A]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#E8293A] py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Accès réservé au personnel hospitalier. Contactez l'administrateur pour obtenir un compte.
      </p>

      {import.meta.env.DEV && (
        <p className="mt-4 text-center text-sm">
          <Link to="/dev-setup" className="font-medium text-orange-600 hover:underline">
            Setup dev — créer admin CHU automatiquement
          </Link>
        </p>
      )}
    </div>
  )
}
