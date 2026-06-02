import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import useAuthStore from '../../store/useAuthStore'
import { ROLE_ROUTES } from '../../constants'

const DEFAULT_EMAIL = 'chu.admin@bloodmatch.dz'
const DEFAULT_PASSWORD = 'chu_1234'

export default function DevSetup() {
  const navigate = useNavigate()
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [password, setPassword] = useState(DEFAULT_PASSWORD)
  const [log, setLog] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function addLog(msg: string) {
    setLog((prev) => [...prev, msg])
  }

  async function getHospitalId() {
    const hospitals = await api.get('/api/admin/hospitals')
    const found = hospitals.find(
      (h: any) => h.name === 'CHU 1er Novembre' && h.region === 'Oran'
    )
    if (!found) {
      throw new Error(
        "Hôpital 'CHU 1er Novembre' introuvable dans la base. Assurez-vous que le backend est démarré et a auto-semé les hôpitaux."
      )
    }
    addLog(`Hôpital trouvé : ${found.name} (${found.id})`)
    return found.id
  }

  async function runSetup() {
    setLog([])
    setLoading(true)

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      addLog(`Backend : ${backendUrl}`)

      addLog('Enregistrement admin racine (admin@amal.org)...')
      try {
        await api.post('/api/auth/register', {
          email: 'admin@amal.org',
          password: 'admin_password_123',
          full_name: 'Root Admin',
          phone_number: '0500000000',
          is_donor: false,
        })
        addLog('Admin racine créé.')
      } catch (err) {
        addLog('Admin racine déjà existant (ou erreur ignorée).')
      }

      addLog('Connexion en tant que Root Admin...')
      const loginParams = new URLSearchParams()
      loginParams.append('username', 'admin@amal.org')
      loginParams.append('password', 'admin_password_123')
      const adminToken = await api.post('/api/auth/login', loginParams)
      localStorage.setItem('access_token', adminToken.access_token)

      const hospitalId = await getHospitalId()

      addLog(`Création de l'admin hôpital (${email})...`)
      try {
        await api.post('/api/admin/create-hospital-admin', {
          first_name: 'Admin',
          last_name: 'CHU 1er Novembre',
          email,
          password,
          hopital_id: hospitalId,
        })
        addLog('Admin hôpital créé avec succès.')
      } catch (err: any) {
        addLog(`Note: ${err.message || 'Admin hôpital déjà existant.'}`)
      }

      addLog(`Connexion en tant que : ${email}...`)
      const chuParams = new URLSearchParams()
      chuParams.append('username', email)
      chuParams.append('password', password)
      const chuToken = await api.post('/api/auth/login', chuParams)
      localStorage.setItem('access_token', chuToken.access_token)

      await fetchProfile()
      addLog('Profil chargé. Redirection...')
      navigate(ROLE_ROUTES.admin_hopital || '/admin-hopital')
    } catch (err: any) {
      addLog(`ERREUR : ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!import.meta.env.DEV) {
    return <p className="text-center text-slate-600">Page disponible uniquement en développement.</p>
  }

  return (
    <div className="space-y-6 relative">
      <div className="absolute -right-16 top-12 h-28 w-28 rounded-full bg-[#f97316]/10 blur-3xl" />
      <div className="absolute left-0 top-32 h-28 w-28 rounded-full bg-[#22d3ee]/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/95 p-8 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80 backdrop-blur-xl page-transition">
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -right-14 bottom-0 h-44 w-44 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative space-y-5">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex rounded-full bg-[#ecfdf5] px-4 py-2 text-xs uppercase tracking-[0.28em] text-emerald-700 shadow-sm shadow-slate-200/50">
              Setup dev rapide
            </p>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Admin CHU en un clic</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Crée un compte administrateur hospitalier et connecte-toi automatiquement au dashboard.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 px-5 py-4 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Identifiant recommandé</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{DEFAULT_EMAIL}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 px-5 py-4 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Mot de passe</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{DEFAULT_PASSWORD}</p>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6 shadow-sm border border-slate-200/80">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Email de l'admin CHU</label>
                <input
                  className="mt-3 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#E8293A] focus:ring-2 focus:ring-[#E8293A]/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Mot de passe</label>
                <input
                  type="password"
                  className="mt-3 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#E8293A] focus:ring-2 focus:ring-[#E8293A]/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={runSetup}
            className="w-full rounded-full bg-gradient-to-r from-[#E8293A] to-[#f97316] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E8293A]/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-[#E8293A]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Création...' : 'Créer admin CHU + se connecter'}
          </button>
        </div>
      </div>

      {log.length > 0 && (
        <pre className="max-h-72 overflow-y-auto rounded-3xl bg-slate-950/95 px-5 py-4 text-xs leading-6 text-emerald-300 shadow-lg shadow-slate-900/10">
          {log.join('\n')}
        </pre>
      )}

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <p className="text-sm text-slate-600">
          Ce mode est réservé au développement. Le lien de retour renverra à la page de connexion.
        </p>
        <p className="mt-4">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8293A] px-6 py-3 text-sm font-semibold text-[#E8293A] transition hover:border-[#be123c] hover:bg-[#fee2e2] hover:text-[#be123c]"
          >
            ← Retour login
          </Link>
        </p>
      </div>
    </div>
  )
}
