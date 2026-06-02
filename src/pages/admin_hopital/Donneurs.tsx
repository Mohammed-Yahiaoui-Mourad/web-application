import React, { useEffect, useState } from 'react'
import { 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar, 
  History as HistoryIcon,
  ChevronLeft,
  ChevronRight,
  X,
  PhoneCall
} from 'lucide-react'
import { api } from '../../lib/api'
import Topbar from '../../components/Topbar'

const ITEMS_PER_PAGE = 10

export default function Donneurs() {
  const [donors, setDonors] = useState<any[]>([])
  const [selectedDonor, setSelectedDonor] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadDonors()
  }, [])

  async function loadDonors() {
    try {
      const data = await api.get('/api/admin/donors')
      setDonors(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('loadDonors error:', err)
    }
  }

  const filteredDonors = donors.filter(d => 
    (d.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.blood_type || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredDonors.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDonors = filteredDonors.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pb-8">
        <Topbar title="Registre des Donneurs" hideSearch hideActions />

        {/* Search & Stats */}
        <div className="mx-8 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un donneur par nom ou groupe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-[#E8293A] transition shadow-sm"
            />
          </div>
          <div className="flex gap-4">
             <div className="rounded-2xl bg-white px-5 py-2.5 border border-slate-100 shadow-sm flex items-center gap-3">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Donneurs</span>
               <span className="text-xl font-bold text-slate-900">{filteredDonors.length}</span>
             </div>
          </div>
        </div>

        {/* Donors List Table */}
        <div className="mx-8 flex-1 flex flex-col bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-5 px-6">Donneur</th>
                  <th className="py-5 px-6">Groupe</th>
                  <th className="py-5 px-6">Wilaya</th>
                  <th className="py-5 px-6">Dernier Don</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedDonors.map((donor) => (
                  <tr 
                    key={donor.id} 
                    onClick={() => setSelectedDonor(donor)}
                    className={`group cursor-pointer transition-colors ${selectedDonor?.id === donor.id ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{donor.full_name}</div>
                          <div className="text-xs text-slate-500 font-medium">{donor.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-[#E8293A] border border-red-100">
                        {donor.blood_type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-300" />
                        {donor.wilaya}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-300" />
                        {donor.last_donation ? new Date(donor.last_donation).toLocaleDateString('fr-FR') : 'Jamais'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-slate-300 group-hover:text-[#E8293A] transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2 ml-auto">
                        Profil
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedDonors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Search size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">Aucun donneur trouvé pour "{search}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Affichage {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredDonors.length)} sur {filteredDonors.length}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
                {currentPage} / {totalPages || 1}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Sidebar */}
      {selectedDonor && (
        <div className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 relative z-10">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Fiche Donneur</h3>
            <button 
              onClick={() => setSelectedDonor(null)}
              className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto flex-1">
            {/* Profile Header */}
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[32px] bg-red-50 text-3xl font-bold text-[#E8293A] border-4 border-white shadow-xl shadow-red-100/50">
                {selectedDonor.blood_type}
              </div>
              <h4 className="text-xl font-bold text-slate-900">{selectedDonor.full_name}</h4>
              <div className="flex items-center justify-center gap-1.5 text-sm text-slate-400 font-medium mt-1">
                <Mail size={14} />
                {selectedDonor.email}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-center border border-slate-100">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Âge</div>
                <div className="text-lg font-bold text-slate-900">{selectedDonor.age} ans</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center border border-slate-100">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Total Dons</div>
                <div className="text-lg font-bold text-slate-900">{selectedDonor.total_donations}</div>
              </div>
            </div>

            {/* Information List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-slate-50 group">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#E8293A] transition">
                     <Phone size={14} />
                   </div>
                   <span className="text-sm font-medium text-slate-500">Téléphone</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{selectedDonor.phone}</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-slate-50 group">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#E8293A] transition">
                     <MapPin size={14} />
                   </div>
                   <span className="text-sm font-medium text-slate-500">Wilaya</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{selectedDonor.wilaya}</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-slate-50 group">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#E8293A] transition">
                     <HistoryIcon size={14} />
                   </div>
                   <span className="text-sm font-medium text-slate-500">Dernier Don</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {selectedDonor.last_donation ? new Date(selectedDonor.last_donation).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-6">
              <button className="w-full rounded-2xl bg-[#E8293A] py-4 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 active:scale-95 flex items-center justify-center gap-3">
                <PhoneCall size={18} />
                Appeler le donneur
              </button>
              <button className="w-full rounded-2xl border border-slate-200 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95">
                Consulter Historique
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
