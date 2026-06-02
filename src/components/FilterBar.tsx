import { Activity, AlertTriangle, Droplet, X } from 'lucide-react'

export default function FilterBar({ filters = {}, onFilterChange, bloodTypes = [] }: any) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm card-smooth hover-float fade-in-up">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Droplet size={14} />
            Groupe sanguin
          </label>
          <select
            value={filters.bloodType || ''}
            onChange={(e) => onFilterChange?.('bloodType', e.target.value || null)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white"
          >
            <option value="">Tous les groupes</option>
            {bloodTypes.map((type: string) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <AlertTriangle size={14} />
            Priorité
          </label>
          <select
            value={filters.severity || ''}
            onChange={(e) => onFilterChange?.('severity', e.target.value || null)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white"
          >
            <option value="">Toutes les priorités</option>
            <option value="critical">Critique</option>
            <option value="high">Urgent</option>
            <option value="normal">Standard</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Activity size={14} />
            Statut
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange?.('status', e.target.value || null)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="partially_fulfilled">Partielle</option>
            <option value="fulfilled">Complétée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              onFilterChange?.('bloodType', null)
              onFilterChange?.('severity', null)
              onFilterChange?.('status', null)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 ease-out hover:border-slate-300 hover:bg-white hover:-translate-y-0.5 hover:shadow-sm"
          >
            <X size={16} />
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  )
}
