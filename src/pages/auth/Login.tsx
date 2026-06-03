import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/api-service'
import useAuthStore from '../../store/useAuthStore'
import { ROLE_ROUTES } from '../../constants'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)

    try {
      // Call the real backend login API
      const loginResponse = await authService.login(email, password)
      
      // Store the token
      authService.setToken(loginResponse.access_token)
      setToken(loginResponse.access_token)

      // Fetch user profile
      const profile = await fetchProfile()
      if (!profile) {
        throw new Error('Profil non configuré.')
      }

      if (profile.role !== 'admin' && profile.role !== 'admin_hopital') {
        throw new Error(
          "Accès réservé aux administrateurs hôpital. Les patients et donneurs doivent utiliser l'application mobile."
        )
      }

      // Set user in store
      setUser({ email: profile.email, id: profile.id })

      navigate(ROLE_ROUTES[profile.role] || '/dashboard')
      toast.success('Connexion réussie')
    } catch (err: any) {
      toast.error(err?.message || 'Erreur de connexion inattendue.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-background">
      <div className="auth-visual" />
      <div className="auth-brand animate-fade-in-up">
        <img src="/logo.png" alt="AMAL Logo" />
        <div className="auth-brand-title">
          <strong>AMAL</strong>
          <span className="auth-brand-subtitle">Gestion hospitalière du don de sang</span>
        </div>
      </div>
      <div className="auth-card animate-fade-in-up">
        <h1 className="mb-2 text-3xl font-semibold text-[var(--text)]">Connexion</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">Accédez à votre espace AMAL en toute sécurité.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="admin@amal.org"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="auth-button bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Accès réservé au personnel hospitalier. Contactez l'administrateur pour obtenir un compte.
        </p>

        {import.meta.env.DEV && (
          <p className="mt-4 text-center text-sm">
            <Link
              to="/dev-setup"
              className="auth-button auth-button--small inline-flex items-center justify-center border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] transition hover:bg-[var(--accent-soft)]/90 hover:text-[var(--accent-strong)]"
            >
              Setup dev — créer admin CHU automatiquement
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
