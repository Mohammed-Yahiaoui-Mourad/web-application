import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Users,
  History,
  UserPlus,
  LogOut,
  Moon,
  Sun,
  Droplet,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
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
  admin: [
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
  admin: 'Administrateur système',
}

const themes = ['light', 'ocean', 'midnight'] as const
const themeLabels = {
  light: 'Clair',
  ocean: 'Océan',
  midnight: 'Nuit',
} as const
const themeIcons = {
  light: Sun,
  ocean: Droplet,
  midnight: Moon,
}

type ThemeName = (typeof themes)[number]

export default function Sidebar() {
  const { profile, signOut } = useAuthStore()
  const [theme, setTheme] = useState<ThemeName>('light')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedTheme = window.localStorage.getItem('amal-theme') as ThemeName | null
    setTheme(storedTheme || 'light')
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('amal-theme', theme)
  }, [theme])

  const links = profile ? roleLinks[profile.role] || [] : guestLinks
  const roleLabel = profile ? roleLabels[profile.role] || profile.role || 'Utilisateur' : 'Invité'
  const userName = profile ? profile.full_name || 'Utilisateur' : 'Bienvenue'
  const initials = getInitials(userName)
  const ThemeIcon = themeIcons[theme]
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length]

  function closeSidebar() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('sidebar-open')
    }
  }

  function handleLogout() {
    toast((toastInstance) => (
      <div className="max-w-xs rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 shadow-[var(--card-shadow)]">
        <p className="text-sm font-semibold text-[var(--text)]">Confirmer la déconnexion</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Voulez-vous vraiment vous déconnecter ?</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              signOut()
              toast.dismiss(toastInstance.id)
            }}
            className="flex-1 rounded-2xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Déconnecter
          </button>
          <button
            type="button"
            onClick={() => toast.dismiss(toastInstance.id)}
            className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface)]"
          >
            Annuler
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
    })
  }

  return (
    <aside className="mobile-sidebar hidden h-screen w-[264px] flex-col border-r border-[var(--border)] bg-[var(--surface)]/95 px-4 py-5 backdrop-blur-xl overflow-y-auto transition-colors duration-500 animate-fade-in-up lg:flex">
      <div className="flex items-center justify-start lg:hidden pb-3">
        <button
          type="button"
          onClick={closeSidebar}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--accent)]"
          aria-label="Fermer le menu"
        >
          <X size={18} />
        </button>
      </div>
      <div className="space-y-5">
        <div className="px-1">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4 shadow-sm transition-colors duration-500">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="AMAL Logo" className="h-11 w-11 object-contain" />
              <div className="min-w-0">
                <p className="truncate text-[1.2rem] font-semibold tracking-tight text-[var(--text)]">AMAL</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Hospital admin
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-1">
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Navigation clinique
          </p>

          <nav className="space-y-1.5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin-hopital'}
                onClick={() => {
                  if (typeof document !== 'undefined') {
                    document.documentElement.classList.remove('sidebar-open')
                  }
                }}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all duration-300 ease-out transform ${isActive
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/15 scale-[1.002]'
                    : 'border-transparent text-[var(--text)] hover:-translate-y-0.5 hover:border-[var(--border)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)] hover:shadow-sm'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${isActive ? 'bg-white/12 text-white shadow-xl shadow-[var(--accent)]/20' : 'bg-[var(--surface-alt)] text-[var(--muted)] group-hover:bg-[var(--surface)]'
                        }`}
                    >
                      <link.icon size={18} strokeWidth={isActive ? 2.35 : 2} />
                    </span>
                    <div className="flex-1">
                      <div className="leading-tight">{link.label}</div>
                      <div className={`mt-0.5 text-[11px] font-medium leading-tight ${isActive ? 'text-white/80' : 'text-[var(--muted)]'}`}>
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
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-3 shadow-sm transition-colors duration-500">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-alt)] text-sm font-semibold text-[var(--text)]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{userName}</p>
                <p className="truncate text-xs text-[var(--muted)]">{roleLabel}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Région</span>
              <span className="rounded-full bg-[var(--surface-alt)] px-2.5 py-1 font-semibold text-[var(--text)]">
                {profile?.region || 'Alger'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-alt)] text-[var(--accent)]">
              <ThemeIcon size={18} />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold">Thème {themeLabels[theme]}</p>
              <p className="text-xs text-[var(--muted)]">Cliquez pour changer</p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-3 text-sm font-semibold text-[var(--text)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--surface)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-alt)] text-[var(--muted)]">
              <LogOut size={18} />
            </span>
            Déconnexion
          </button>
        </div>
      ) : null}
    </aside>
  )
}
