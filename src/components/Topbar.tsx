import { useState } from 'react'
import { Bell, Menu, Search } from 'lucide-react'

export default function Topbar({
  title = 'Hospital Administration',
  subtitle,
  onSearch,
  actions,
  hideSearch = false,
  hideActions = false,
}: any) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 px-8 py-5 backdrop-blur-xl">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[2rem] font-semibold tracking-tight text-slate-950">{title}</h1>
              <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                Système actif
              </span>
            </div>
            {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {!hideSearch ? (
            <div className="relative min-w-0 flex-1 lg:w-[320px]">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Rechercher un donneur, une demande..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white"
              />
            </div>
          ) : null}

          {!hideActions ? (
            actions || (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#c73b42] ring-2 ring-white" />
                </button>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Opérations</p>
                  <p className="text-sm font-semibold text-slate-900">Coordination en temps réel</p>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
