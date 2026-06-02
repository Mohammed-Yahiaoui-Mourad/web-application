import { useMemo, useState } from 'react'

export default function HospitalSelect({ hopitals, value, onChange, region, required = true }: any) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = hopitals || []
    if (region) list = list.filter((h) => h.region === region)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (h) =>
          h.name?.toLowerCase().includes(q) ||
          h.address?.toLowerCase().includes(q) ||
          h.region?.toLowerCase().includes(q)
      )
    }
    return list.slice(0, 200)
  }, [hopitals, region, search])

  return (
    <div className="space-y-2">
      <input
        type="search"
        placeholder="Rechercher un hôpital..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E8293A] focus:outline-none focus:ring-1 focus:ring-[#E8293A]"
      />
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#E8293A] focus:outline-none focus:ring-1 focus:ring-[#E8293A]"
        size={Math.min(filtered.length + 1, 8)}
      >
        <option value="">
          {filtered.length === 0
            ? `Aucun hôpital${region ? ` en ${region}` : ''}`
            : `Sélectionner (${filtered.length} résultats)`}
        </option>
        {filtered.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name}
            {h.region && h.region !== region ? ` — ${h.region}` : ''}
          </option>
        ))}
      </select>
      {filtered.length >= 200 && (
        <p className="text-xs text-gray-500">Affinez la recherche pour voir plus de résultats.</p>
      )}
    </div>
  )
}
