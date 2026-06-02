import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ClipboardList, 
  CalendarDays, 
  Users, 
  History, 
  LogOut,
  Droplet
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

const roleLinks = {
  admin_hopital: [
    { to: '/admin-hopital', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin-hopital/demandes', label: 'Demandes', icon: ClipboardList },
    { to: '/admin-hopital/planning', label: 'Planning', icon: CalendarDays },
    { to: '/admin-hopital/donneurs', label: 'Donneurs', icon: Users },
    { to: '/admin-hopital/historique', label: 'Historique', icon: History },
  ],
}

const guestLinks = [
  { to: '/login', label: 'Connexion', icon: LogOut },
]

const roleLabels = {
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
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white px-4 py-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Branding */}
        <div className="px-2">
          <div className="flex items-center gap-3 text-[#E8293A]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-sm">
              <Droplet size={24} fill="currentColor" />
            </span>
            <div>
              <p className="text-lg font-bold text-slate-900 leading-tight">Amal Blood</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Hospital Management</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="mx-2 rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
              <p className="truncate text-[11px] text-slate-500 font-medium">{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1 px-2">
          <p className="mb-4 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Menu Principal</p>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin-hopital'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#E8293A] text-white shadow-md shadow-red-200'
                    : 'text-slate-600 hover:bg-red-50 hover:text-[#E8293A]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      {profile ? (
        <div className="mt-auto px-2 pt-4">
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      ) : null}
    </aside>
  )
}
