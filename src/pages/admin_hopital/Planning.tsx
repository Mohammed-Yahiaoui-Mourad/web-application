import React, { useEffect, useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Plus, 
  User 
} from 'lucide-react'
import { api } from '../../lib/api'
import Topbar from '../../components/Topbar'

export default function Planning() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    try {
      const data = await api.get('/api/admin/appointments')
      setAppointments(data || [])
    } catch (err) {
      console.error('loadAppointments error:', err)
    }
  }

  // Simplified calendar logic
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: (firstDayOfMonth + 6) % 7 }, (_, i) => i)

  const monthName = selectedMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return appointments.filter(a => a.scheduled_time.startsWith(dateStr))
  }

  return (
    <div className="space-y-6 pb-8">
      <Topbar title="Planning des Collectes" hideSearch hideActions />

      <div className="mx-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Calendar View */}
        <div className="lg:col-span-2 rounded-[32px] bg-white p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 capitalize flex items-center gap-2">
              <Calendar className="text-[#E8293A]" size={24} />
              {monthName}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-500 hover:text-slate-900"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-500 hover:text-slate-900"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="bg-slate-50 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {day}
              </div>
            ))}
            
            {blanks.map(i => (
              <div key={`blank-${i}`} className="bg-white min-h-[120px] p-2 opacity-30"></div>
            ))}
            
            {days.map(day => {
              const dayApps = getAppointmentsForDay(day)
              const isToday = day === new Date().getDate() && selectedMonth.getMonth() === new Date().getMonth() && selectedMonth.getFullYear() === new Date().getFullYear()
              
              return (
                <div key={day} className={`bg-white min-h-[120px] p-3 transition hover:bg-slate-50/50 ${isToday ? 'bg-red-50/20' : ''}`}>
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${isToday ? 'bg-[#E8293A] text-white shadow-lg shadow-red-200' : 'text-slate-900'}`}>
                    {day}
                  </span>
                  
                  <div className="mt-2 space-y-1">
                    {dayApps.map(app => (
                      <div key={app.id} className="rounded-lg bg-red-50 p-1.5 text-[10px] font-bold text-[#E8293A] border border-red-100/50">
                        <div className="flex items-center justify-between">
                          <span className="bg-white px-1 rounded text-[9px] border border-red-100">{app.blood_type}</span>
                          <span className="flex items-center gap-0.5 opacity-60">
                            <Clock size={8} />
                            {new Date(app.scheduled_time).getHours()}h
                          </span>
                        </div>
                        <div className="truncate mt-1 opacity-80 font-medium flex items-center gap-1">
                          <User size={8} />
                          {app.donor_name.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Operations Sidebar */}
        <div className="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100 h-fit">
          <h3 className="mb-6 text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            Prochaines collectes
          </h3>
          
          <div className="space-y-6">
            {appointments
              .filter(a => new Date(a.scheduled_time) >= new Date())
              .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
              .slice(0, 5)
              .map(app => (
                <div key={app.id} className="flex gap-4 group cursor-pointer">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 px-3 py-2 border border-slate-100 min-w-[64px] group-hover:bg-red-50 group-hover:border-red-100 transition shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-red-400">
                      {new Date(app.scheduled_time).toLocaleString('fr-FR', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-slate-900 group-hover:text-[#E8293A]">
                      {new Date(app.scheduled_time).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 py-1">
                    <div className="font-bold text-slate-900 group-hover:text-[#E8293A] transition">{app.donor_name}</div>
                    <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-tight">
                      <Droplet size={10} className="text-red-400" />
                      Groupe {app.blood_type} • 
                      <Clock size={10} className="ml-1" />
                      {new Date(app.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            {appointments.filter(a => new Date(a.scheduled_time) >= new Date()).length === 0 && (
              <p className="text-sm text-slate-500 py-4 text-center italic">Aucune collecte à venir.</p>
            )}
          </div>

          <button className="mt-8 w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-bold text-slate-400 transition hover:border-[#E8293A] hover:text-[#E8293A] hover:bg-red-50/30 flex items-center justify-center gap-2 group">
            <Plus size={18} className="group-hover:scale-110 transition" />
            Programmer une collecte
          </button>
        </div>
      </div>
    </div>
  )
}

function Droplet({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  )
}
