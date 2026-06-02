import { useState } from 'react'

export default function Topbar({ title = 'Hospital Administration', onSearch, onEmergency, hideSearch = false, hideActions = false }: any) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  const handleEmergencyClick = () => {
    onEmergency?.()
  }

  return (
    <div className="border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
      <div className="mx-auto flex items-center justify-between gap-6">
        {/* Left: Title */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        </div>

        {!hideSearch && (
          <div className="flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm placeholder-gray-500 transition focus:border-[#E8293A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E8293A]"
            />
          </div>
        )}

        {!hideActions && (
          <div className="flex items-center gap-4">
            {/* Notification Icon */}
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#E8293A]" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
