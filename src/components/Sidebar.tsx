import React, { useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type })
    window.setTimeout(() => setToast(null), 3600)
  }

  const handleSignOut = async () => {
    setLogoutConfirm(false)

    try {
      await signOut()
      showToast('Vous êtes déconnecté avec succès.', 'success')
    } catch (error: any) {
      showToast(error?.message || 'Impossible de se déconnecter.', 'error')
    }
  }

  return (
    <aside className="flex h-screen w-[264px] max-h-screen flex-col border-r border-slate-200/80 bg-white/96 px-4 py-5 overflow-y-auto overscroll-contain backdrop-blur-xl">
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
            onClick={() => setLogoutConfirm(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <LogOut size={18} />
            </span>
            Déconnexion
          </button>
        </div>
      ) : null}

      {logoutConfirm ? createPortal(
        <div className="fixed inset-0 z-50 flex min-h-screen w-full items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white px-8 py-10 shadow-[0_50px_120px_-60px_rgba(15,23,42,0.45)]">
            <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl text-amber-700 shadow-sm">
                ?
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-slate-950">Confirmer la déconnexion</p>
                <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
                  Voulez-vous vraiment vous déconnecter de votre session actuelle ?
                </p>
              </div>
              <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setLogoutConfirm(false)}
                  className="inline-flex min-w-[140px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex min-w-[140px] items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      ) : null}

      {toast ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div
            className="w-full max-w-3xl rounded-[32px] border px-8 py-10 shadow-2xl"
            style={{
              backgroundColor: toast.type === 'success' ? 'rgba(236, 253, 245, 0.98)' : 'rgba(254, 242, 242, 0.98)',
              borderColor: toast.type === 'success' ? '#34d399' : '#fca5a5',
            }}
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <span className={`inline-flex h-16 w-16 items-center justify-center rounded-3xl text-3xl ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {toast.type === 'success' ? '✓' : '!'}
              </span>
              <div>
                <p className="text-2xl font-semibold text-slate-950">{toast.type === 'success' ? 'Succès' : 'Erreur'}</p>
                <p className="mt-3 text-base leading-7 text-slate-700">{toast.text}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
