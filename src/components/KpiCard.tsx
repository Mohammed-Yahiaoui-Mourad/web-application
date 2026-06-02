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
    <div className={`rounded-[32px] border border-slate-100 ${bgColor} p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className={`text-3xl font-black ${textColor}`}>{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ${iconColor} border border-slate-100 shadow-sm`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {subtext && (
        <div className="mt-4 pt-4 border-t border-slate-50">
          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-tight">
            {subtext}
          </p>
        </div>
      )}
    </div>
  )
}
