import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { ROLE_ROUTES } from '../constants'

export default function Navbar() {
  const { profile, signOut } = useAuthStore()
  const home = profile ? ROLE_ROUTES[profile.role] || '/' : '/'

  return (
    <nav className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to={home} className="flex items-center gap-2 text-xl font-bold text-[#E8293A]">
          <span>🩸</span> BloodMatch
        </Link>
        {profile && (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:inline">
              {profile.first_name} {profile.last_name}
              <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">
                {profile.role.replace('_', ' ')}
              </span>
            </span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
