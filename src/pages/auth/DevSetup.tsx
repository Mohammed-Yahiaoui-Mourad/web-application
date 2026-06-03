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
      (h: any) => h.name === 'EHU USTO - 1 Novembre' && h.region === 'Oran'
    )
    if (!found) {
      throw new Error(
        "Hôpital 'EHU USTO - 1 Novembre' introuvable dans la base. Assurez-vous que le backend est démarré et a auto-semé les hôpitaux."
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

      // 1. Register root admin (admin@amal.org) if not existing
      addLog('Enregistrement admin racine (admin@amal.org)...')
      try {
        await api.post('/api/auth/register', {
          email: 'admin@amal.org',
          password: 'admin123',
          full_name: 'Root Admin',
          phone_number: '0500000000',
          is_donor: false
        })
        addLog('Admin racine créé.')
      } catch (err) {
        addLog('Admin racine déjà existant (ou erreur ignorée).')
      }

      // 2. Log in as Root Admin
      addLog('Connexion en tant que Root Admin...')
      const loginParams = new URLSearchParams()
      loginParams.append('username', 'admin@amal.org')
      loginParams.append('password', 'admin123')
      const adminToken = await api.post('/api/auth/login', loginParams)
      localStorage.setItem('access_token', adminToken.access_token)

      // 3. Resolve Hospital ID
      const hospitalId = await getHospitalId()

      // 4. Create Hospital Admin
      addLog(`Création de l'admin hôpital (${email})...`)
      try {
        await api.post('/api/admin/create-hospital-admin', {
          first_name: 'Admin',
          last_name: 'CHU 1er Novembre',
          email: email,
          password: password,
          hopital_id: hospitalId
        })
        addLog('Admin hôpital créé avec succès.')
      } catch (err: any) {
        addLog(`Note: ${err.message || 'Admin hôpital déjà existant.'}`)
      }

      // 5. Log out Root Admin, and Log in as the new Hospital Admin
      addLog(`Connexion en tant que : ${email}...`)
      const chuParams = new URLSearchParams()
      chuParams.append('username', email)
      chuParams.append('password', password)
      const chuToken = await api.post('/api/auth/login', chuParams)
      localStorage.setItem('access_token', chuToken.access_token)

      // 6. Fetch Profile & Redirect
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
    return <p className="text-center text-gray-600">Page disponible uniquement en développement.</p>
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-bold text-[#E8293A]">Setup dev — Admin CHU</h1>
      <p className="mb-4 text-sm text-gray-600">
        Crée le compte admin racine, l&apos;hôpital, l&apos;administrateur et se connecte automatiquement en un clic.
      </p>

      <div className="mb-4 space-y-3 rounded-xl bg-white p-6 shadow">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={runSetup}
          className="w-full rounded-lg bg-[#E8293A] py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer admin CHU + se connecter'}
        </button>
      </div>

      {log.length > 0 && (
        <pre className="rounded-lg bg-gray-900 p-4 text-xs text-green-400">{log.join('\n')}</pre>
      )}

      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-[#E8293A] hover:underline">← Retour login</Link>
      </p>
    </div>
  )
}
