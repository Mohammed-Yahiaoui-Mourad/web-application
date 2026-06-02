import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ClipboardList, 
  CalendarDays, 
  Users, 
  History, 
  UserPlus,
  LogOut,
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { getInitials } from '../lib/hospitalUtils'

const roleLinks = {
  admin_hopital: [
    { to: '/admin-hopital', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin-hopital/demandes', label: 'Demandes', icon: ClipboardList },
    { to: '/admin-hopital/planning', label: 'Planning', icon: CalendarDays },
    { to: '/admin-hopital/donneurs', label: 'Donneurs', icon: Users },
    { to: '/admin-hopital/historique', label: 'Historique', icon: History },
    { to: '/admin-hopital/equipe', label: 'Équipe', icon: UserPlus },
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
  const initials = getInitials(userName)

  return (
    <aside className="flex h-screen w-[264px] flex-col border-r border-slate-200/80 bg-white/96 px-4 py-5 backdrop-blur-xl">
      <div className="space-y-5">
        <div className="px-1">
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm card-smooth hover-float">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 shadow-sm">
                <img src="/amal-logo.png" alt="AMAL logo" className="h-8 w-8 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[1.2rem] font-semibold tracking-tight text-slate-950">Amal Blood</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Hospital admin
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-1">
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Navigation clinique
          </p>

          <nav className="space-y-1.5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin-hopital'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all duration-300 ease-out ${
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:-translate-y-0.5 hover:shadow-sm'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                        isActive ? 'bg-white/12 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                      }`}
                    >
                      <link.icon size={18} strokeWidth={isActive ? 2.35 : 2} />
                    </span>
                    <div className="flex-1">
                      <div className="leading-tight">{link.label}</div>
                      <div className={`mt-0.5 text-[11px] font-medium leading-tight ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {link.to === '/admin-hopital' && 'Vue d’ensemble'}
                        {link.to === '/admin-hopital/demandes' && 'Demandes et priorités'}
                        {link.to === '/admin-hopital/planning' && 'Rendez-vous et collecte'}
                        {link.to === '/admin-hopital/donneurs' && 'Annuaire des donneurs'}
                        {link.to === '/admin-hopital/historique' && 'Traçabilité des dons'}
                        {link.to === '/admin-hopital/equipe' && 'Personnel hospitalier'}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

      </div>

      {profile ? (
        <div className="mt-auto space-y-3 px-1 pt-5">
          <div className="rounded-[22px] border border-slate-200 bg-white px-3 py-3 shadow-sm card-smooth hover-float">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950">{userName}</p>
                <p className="truncate text-xs text-slate-600">{roleLabel}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-[0.16em] text-slate-500">Région</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                {profile?.region || 'Alger'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <LogOut size={18} />
            </span>
            Déconnexion
          </button>
        </div>
      ) : null}
    </aside>
  )
}
