import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

const DEFAULT_EMAIL = 'chu.admin@bloodmatch.dz'
const DEFAULT_PASSWORD = 'chu_1234'

export default function DevSetup() {
  const navigate = useNavigate()
  const { setUser, setProfile, setToken } = useAuthStore()
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [password, setPassword] = useState(DEFAULT_PASSWORD)
  const [log, setLog] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function addLog(msg: string) {
    console.log(msg)
    setLog((prev) => [...prev, msg])
  }

  async function runSetup() {
    setLog([])
    setLoading(true)

    try {
      const backendUrl = 'http://localhost:8000'
      addLog(`🔗 Backend: ${backendUrl}`)

      // 1. Try to register the admin CHU
      addLog(`📝 Enregistrement admin CHU (${email})...`)
      try {
        const registerResp = await fetch(`${backendUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            password: password,
            full_name: 'Admin CHU',
            phone_number: '0500000000',
            is_donor: false
          })
        })

        if (registerResp.ok) {
          const registerData = await registerResp.json()
          addLog(`✅ Admin CHU créé: ${registerData.data?.email || email}`)
        } else {
          const errData = await registerResp.json()
          addLog(`⚠️ Admin CHU déjà existant (${errData.message || 'or error'})`)
        }
      } catch (err: any) {
        addLog(`⚠️ Enregistrement: ${err.message}`)
      }

      // 2. Login as the admin CHU
      addLog(`🔐 Connexion en tant que: ${email}...`)
      const loginParams = new URLSearchParams()
      loginParams.append('username', email)
      loginParams.append('password', password)

      const loginResp = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginParams.toString()
      })

      if (!loginResp.ok) {
        const errData = await loginResp.json()
        throw new Error(errData.detail || errData.message || 'Login failed')
      }

      const loginData = await loginResp.json()
      const token = loginData.data?.access_token || loginData.access_token

      if (!token) {
        throw new Error('No access token received from login')
      }

      addLog(`✅ Connexion réussie!`)

      // 3. Store token
      localStorage.setItem('access_token', token)
      localStorage.setItem('auto_login_role', 'admin')
      setToken(token)

      // 4. Fetch user profile
      addLog(`👤 Récupération du profil...`)
      const profileResp = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (profileResp.ok) {
        const profileData = await profileResp.json()
        const profile = profileData.data || profileData
        
        addLog(`✅ Profil chargé: ${profile.email}`)
        setUser({ email: profile.email, id: profile.id })
        setProfile({ ...profile, role: 'admin_hopital' })
      } else {
        // Even if profile fetch fails, we can still proceed with mock data
        addLog(`⚠️ Profil non disponible (fetch failed), utilisation des données du token`)
        setUser({ email: email, id: 'dev-admin-1' })
        setProfile({ 
          email: email, 
          id: 'dev-admin-1',
          full_name: 'Admin CHU',
          role: 'admin_hopital',
          phone_number: '0500000000'
        })
      }

      // 5. Redirect to dashboard
      addLog(`🎉 Installation terminée! Redirection...`)
      setTimeout(() => {
        navigate('/admin-hopital')
      }, 1500)
    } catch (err: any) {
      addLog(`❌ ERREUR: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!import.meta.env.DEV) {
    return <p className="text-center text-[var(--muted)]">Page disponible uniquement en développement.</p>
  }

  return (
    <div className="auth-background">
      <div className="auth-visual" />
      <div className="auth-brand animate-fade-in-up">
        <img src="/logo.png" alt="AMAL Logo" onError={(e) => { (e.target as any).style.display = 'none' }} />
        <div className="auth-brand-title">
          <strong>AMAL</strong>
          <span className="auth-brand-subtitle">Installation développeur CHU</span>
        </div>
      </div>
      <div className="auth-card animate-fade-in-up">
        <h1 className="mb-2 text-3xl font-semibold text-[var(--text)]">Setup dev — Admin CHU</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">
          Crée le compte admin CHU et se connecte automatiquement.
        </p>

        <div className="mb-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Email</label>
            <input
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Mot de passe</label>
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={runSetup}
            className="auth-button bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer admin CHU + se connecter'}
          </button>
        </div>

        {/* Logs Display */}
        {log.length > 0 && (
          <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="mb-3 font-semibold text-[var(--text)]">Progression:</h3>
            <div className="space-y-1 text-sm font-mono text-[var(--text-muted)]">
              {log.map((msg, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0">{msg.includes('✅') || msg.includes('🎉') ? '✓' : msg.includes('❌') ? '✗' : '▸'}</span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-[var(--accent)] hover:underline">
            ← Retour login
          </a>
        </div>
      </div>
    </div>
  )
}
