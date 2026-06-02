export default function BloodTypePill({ type, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border-2 border-[#E8293A] bg-white px-3 py-1 text-sm font-bold text-[#E8293A] ${className}`}
    >
      {type}
    </span>
  )
}
