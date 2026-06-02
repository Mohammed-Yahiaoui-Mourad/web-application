export default function FilterBar({ filters = {}, onFilterChange, bloodTypes = [] }: any) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Blood Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
          <select
            value={filters.bloodType || ''}
            onChange={(e) => onFilterChange?.('bloodType', e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-[#E8293A] focus:outline-none focus:ring-1 focus:ring-[#E8293A]"
          >
            <option value="">All Types</option>
            {bloodTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
          <select
            value={filters.severity || ''}
            onChange={(e) => onFilterChange?.('severity', e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-[#E8293A] focus:outline-none focus:ring-1 focus:ring-[#E8293A]"
          >
            <option value="">All Levels</option>
            <option value="critique">Critique</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange?.('status', e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-[#E8293A] focus:outline-none focus:ring-1 focus:ring-[#E8293A]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
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
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}
