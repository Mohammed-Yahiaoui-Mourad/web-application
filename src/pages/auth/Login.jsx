import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/useAuthStore'
import { ROLE_ROUTES } from '../../constants'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const profile = await fetchProfile(data.user.id)
    setLoading(false)

    if (profile?.role) {
      navigate(ROLE_ROUTES[profile.role] || '/')
    } else {
      setError('Profil non configuré.')
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
        Pas de compte ?{' '}
        <Link to="/register/patient" className="font-medium text-[#E8293A] hover:underline">
          Patient
        </Link>
        {' · '}
        <Link to="/register/donor" className="font-medium text-[#E8293A] hover:underline">
          Donneur
        </Link>
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
