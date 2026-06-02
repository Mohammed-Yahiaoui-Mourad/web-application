import React, { useEffect, useState } from 'react'
import { 
  History as HistoryIcon, 
  FileDown, 
  Filter, 
  Calendar, 
  User, 
  Droplet, 
  CheckCircle2, 
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react'
import { api } from '../../lib/api'
import Topbar from '../../components/Topbar'

const ITEMS_PER_PAGE = 8

export default function Historique() {
  const [history, setHistory] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      const data = await api.get('/api/admin/appointments')
      // Only show completed or cancelled appointments for history
      setHistory((data || []).filter((a: any) => a.status === 'completed' || a.status === 'cancelled'))
    } catch (err) {
      console.error('loadHistory error:', err)
    }
  }

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedHistory = history.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <Topbar title="Historique des Dons" hideSearch hideActions />

      <div className="mx-8 rounded-[32px] bg-white p-8 shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HistoryIcon size={24} className="text-[#E8293A]" />
              Registre des opérations passées
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Consultez l'ensemble des dons réalisés et rendez-vous passés.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
              <FileDown size={18} />
              Exporter (CSV)
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition shadow-lg shadow-slate-200">
              <Filter size={18} />
              Filtrer
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-5 px-4">Date & Heure</th>
                <th className="pb-5 px-4">Donneur</th>
                <th className="pb-5 px-4">Groupe</th>
                <th className="pb-5 px-4">Unités</th>
                <th className="pb-5 px-4">Statut</th>
                <th className="pb-5 px-4 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedHistory.map((op) => (
                <tr key={op.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                         <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                           {new Date(op.scheduled_time).toLocaleString('fr-FR', { month: 'short' })}
                         </span>
                         <span className="text-sm font-bold text-slate-900 leading-none">
                           {new Date(op.scheduled_time).getDate()}
                         </span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {new Date(op.scheduled_time).getFullYear()}
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(op.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{op.donor_name}</div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">ID: {op.donor_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-[#E8293A] border border-red-100">
                      {op.blood_type}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                       <Droplet size={14} className="text-red-400" />
                       <div className="font-bold text-slate-900">{op.units_donated || 0} poches</div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    {op.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-bold text-green-600 border border-green-100">
                        <CheckCircle2 size={12} />
                        Terminé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 border border-red-100">
                        <XCircle size={12} />
                        Annulé
                      </span>
                    )}
                  </td>
                  <td className="py-5 px-4 text-right">
                    <button className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition shadow-sm">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 border border-slate-100">
                        <HistoryIcon size={32} className="text-slate-200" />
                      </div>
                      <div className="text-sm font-bold text-slate-900 uppercase tracking-widest">Aucun historique disponible</div>
                      <div className="text-xs text-slate-500 mt-1">Les opérations terminées apparaîtront ici.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Opération {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, history.length)} sur {history.length}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center px-5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm">
              Page {currentPage} sur {totalPages || 1}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
