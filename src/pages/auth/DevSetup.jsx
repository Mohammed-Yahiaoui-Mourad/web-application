import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/useAuthStore'
import { ROLE_ROUTES } from '../../constants'

const DEFAULT_EMAIL = 'chu.admin@bloodmatch.dz'
const DEFAULT_PASSWORD = 'chu_1234'

export default function DevSetup() {
  const navigate = useNavigate()
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [password, setPassword] = useState(DEFAULT_PASSWORD)
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(false)

  function addLog(msg) {
    setLog((prev) => [...prev, msg])
  }

  async function getHospitalId() {
    const { data, error } = await supabase
      .from('hopitals')
      .select('id')
      .eq('name', 'CHU 1er Novembre')
      .eq('region', 'Oran')
      .maybeSingle()

    if (error) {
      if (error.message.includes('hopitals') || error.code === 'PGRST205') {
        throw new Error(
          "Table 'hopitals' absente → Supabase → SQL Editor → exécutez tout le fichier supabase/schema.sql puis réessayez."
        )
      }
      throw new Error(`Lecture hôpital : ${error.message}`)
    }
    if (!data?.id) {
      throw new Error(
        'Hôpital introuvable. Exécutez import-hopitals-osm.sql dans Supabase SQL Editor.'
      )
    }
    addLog(`Hôpital trouvé : ${data.id}`)
    return data.id
  }

  async function runSetup() {
    setLog([])
    setLoading(true)

    try {
      const url = import.meta.env.VITE_SUPABASE_URL
      if (!url?.includes('supabase.co')) {
        throw new Error('Vérifiez .env (VITE_SUPABASE_URL)')
      }
      addLog(`Projet : ${url}`)

      let userId = null

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.status === 422) {
          addLog('Compte existant → connexion...')
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (signInError) throw new Error(`Connexion : ${signInError.message}`)
          userId = signInData.user.id
          addLog(`Connecté : ${userId}`)
        } else {
          throw new Error(`Inscription : ${signUpError.message}`)
        }
      } else {
        if (!signUpData.session) {
          throw new Error(
            'Email non confirmé : Supabase → Authentication → Providers → Email → désactiver Confirm email, puis réessayez.'
          )
        }
        userId = signUpData.user?.id
        if (!userId) throw new Error('Pas de user id après signUp')
        addLog(`Compte créé : ${userId}`)
      }

      const hopitalId = await getHospitalId()

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        role: 'admin_hopital',
        first_name: 'Admin',
        last_name: 'CHU 1er Novembre',
        region: 'Oran',
        hopital_id: hopitalId,
        phone: '0410000000',
      })

      if (profileError) throw new Error(`Profil : ${profileError.message}`)
      addLog('Profil admin_hopital OK')

      await fetchProfile(userId)
      addLog('Redirection...')
      navigate(ROLE_ROUTES.admin_hopital)
    } catch (err) {
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
        Crée le compte Auth + hôpital + profil en un clic. Nécessite que <code>schema.sql</code> soit exécuté.
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
