import { NavLink } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

const roleLinks = {
  super_admin: [
    { to: '/super-admin', label: 'Dashboard', icon: '🏠' },
    { to: '/super-admin/creer-admin', label: 'Créer admin hôpital', icon: '👤' },
  ],
  admin_hopital: [
    { to: '/admin-hopital', label: 'Dashboard', icon: '🏥' },
    { to: '/admin-hopital/demandes', label: 'Demandes', icon: '📋' },
    { to: '/admin-hopital/tools', label: 'Outils & Actions', icon: '⚙️' },
  ],
}

const guestLinks = [
  { to: '/login', label: 'Connexion', icon: '🔑' },
]

const roleLabels = {
  super_admin: 'Super administrateur',
  admin_hopital: 'Administrateur hôpital',
}

export default function Sidebar() {
  const { profile, signOut } = useAuthStore()
  const links = profile ? roleLinks[profile.role] || [] : guestLinks
  const roleLabel = profile ? roleLabels[profile.role] || profile.role || 'Utilisateur' : 'Invité'
  const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Bienvenue'
  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : 'A'

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-red-100 bg-[#fff5f6] px-4 py-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Branding */}
        <div>
          <div className="flex items-center gap-3 text-[#B91C1C]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-xl shadow-sm">
              🩸
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900">Amal Blood</p>
              <p className="text-sm text-slate-500">Hospital Administration</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-[32px] bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-red-400">Connecté</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-lg font-semibold text-red-700">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{userName}</p>
              <p className="text-sm text-slate-500">{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-2 pt-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-200/50'
                    : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
          {links.length === 0 && (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Aucun lien disponible.
            </p>
          )}
        </nav>

      </div>

      {/* Logout Button */}
      {profile ? (
        <div className="mt-auto border-t border-red-100 pt-4">
          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Déconnexion
          </button>
        </div>
      ) : null}
    </aside>
  )
}
