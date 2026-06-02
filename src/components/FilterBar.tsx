import React from 'react'
import { Filter, X, Droplet, AlertTriangle, Activity } from 'lucide-react'

export default function FilterBar({ filters = {}, onFilterChange, bloodTypes = [] }: any) {
  return (
    <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Blood Type Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            <Droplet size={14} />
            Groupe Sanguin
          </label>
          <select
            value={filters.bloodType || ''}
            onChange={(e) => onFilterChange?.('bloodType', e.target.value || null)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#E8293A] transition appearance-none"
          >
            <option value="">Tous les types</option>
            {bloodTypes.map((type: string) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            <AlertTriangle size={14} />
            Niveau d'Urgence
          </label>
          <select
            value={filters.severity || ''}
            onChange={(e) => onFilterChange?.('severity', e.target.value || null)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#E8293A] transition appearance-none"
          >
            <option value="">Tous les niveaux</option>
            <option value="critique">Critique</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            <Activity size={14} />
            Statut Demande
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange?.('status', e.target.value || null)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#E8293A] transition appearance-none"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="fulfilled">Complétée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              onFilterChange?.('bloodType', null)
              onFilterChange?.('severity', null)
              onFilterChange?.('status', null)
            }}
            className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:border-slate-200 active:scale-95 shadow-sm"
          >
            <X size={18} />
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  )
}
