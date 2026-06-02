export default function KpiCard({ label, value, subtext, icon, bgColor = 'white', textColor = 'text-slate-900', accentColor = 'text-[#E8293A]' }) {
  return (
    <div className={`rounded-xl border border-gray-200 ${bgColor} p-6 shadow-sm transition hover:shadow-md`}>
      {/* Label & Icon */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>

      {/* Value */}
      <p className={`mt-3 text-4xl font-bold ${textColor}`}>{value}</p>

      {/* Subtext */}
      {subtext && <p className="mt-2 text-xs text-gray-500">{subtext}</p>}
    </div>
  )
}
