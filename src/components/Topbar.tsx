import React, { useState } from 'react'
import { Search, Bell, Menu } from 'lucide-react'

export default function Topbar({ 
  title = 'Hospital Administration', 
  onSearch, 
  onEmergency, 
  hideSearch = false, 
  hideActions = false 
}: any) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8 py-5">
      <div className="flex items-center justify-between gap-8">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600">
            <Menu size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
        </div>

        {/* Center: Search */}
        {!hideSearch && (
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E8293A] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Rechercher une information..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-4 text-sm font-medium transition focus:border-[#E8293A] focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-50"
              />
            </div>
          </div>
        )}

        {/* Right: Actions */}
        {!hideActions && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#E8293A] ring-2 ring-white" />
            </button>
            <div className="h-10 w-px bg-slate-100 mx-1 hidden sm:block" />
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900 leading-none">Status Serveur</span>
              <span className="text-[10px] font-bold text-green-500 uppercase mt-1 flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                Opérationnel
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
