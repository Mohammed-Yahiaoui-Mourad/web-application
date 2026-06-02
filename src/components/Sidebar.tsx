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
import { getInitials } from '../lib/hospitalUtils'

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
  const initials = getInitials(userName)

  return (
    <aside className="flex h-screen w-80 flex-col border-r border-slate-200/80 bg-white/95 px-5 py-6 backdrop-blur-xl">
      <div className="space-y-6">
        <div className="px-2">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#c73b42] shadow-sm">
                <Droplet size={22} fill="currentColor" />
              </span>
              <div>
                <p className="text-[1.65rem] font-semibold tracking-tight text-slate-950">Amal Blood</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Hospital administration
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-base font-semibold text-slate-700">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-slate-950">{userName}</p>
                  <p className="truncate text-sm text-slate-600">{roleLabel}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-xs">
                <span className="font-semibold uppercase tracking-[0.18em] text-slate-500">Région</span>
                <span className="font-semibold text-slate-800">{profile?.region || 'Alger'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-2">
          <p className="mb-4 px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Navigation clinique
          </p>

          <nav className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin-hopital'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                        isActive ? 'bg-white/12 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                      }`}
                    >
                      <link.icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                    </span>
                    <div className="flex-1">
                      <div>{link.label}</div>
                      <div className={`text-xs font-medium ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {link.to === '/admin-hopital' && 'Vue d’ensemble'}
                        {link.to === '/admin-hopital/demandes' && 'Demandes et priorités'}
                        {link.to === '/admin-hopital/planning' && 'Rendez-vous et collecte'}
                        {link.to === '/admin-hopital/donneurs' && 'Annuaire des donneurs'}
                        {link.to === '/admin-hopital/historique' && 'Traçabilité des dons'}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mx-2 rounded-[24px] border border-sky-100 bg-sky-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Point de vigilance</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Prioriser les demandes critiques et maintenir les rendez-vous du jour à l’heure pour limiter les retards au bloc.
          </p>
        </div>
      </div>

      {profile ? (
        <div className="mt-auto px-2 pt-6">
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <LogOut size={18} />
            </span>
            Déconnexion
          </button>
        </div>
      ) : null}
    </aside>
  )
}
