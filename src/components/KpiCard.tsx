import React from 'react'
import { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: LucideIcon
  bgColor?: string
  textColor?: string
  iconColor?: string
}

export default function KpiCard({ 
  label, 
  value, 
  subtext, 
  icon: Icon, 
  bgColor = 'bg-white', 
  textColor = 'text-slate-900',
  iconColor = 'text-[#E8293A]'
}: KpiCardProps) {
  return (
    <div className={`rounded-[28px] border border-slate-200 ${bgColor} p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className={`text-3xl font-semibold tracking-tight ${textColor}`}>{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ${iconColor} border border-slate-200 shadow-sm`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {subtext && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-600">
            {subtext}
          </p>
        </div>
      )}
    </div>
  )
}
