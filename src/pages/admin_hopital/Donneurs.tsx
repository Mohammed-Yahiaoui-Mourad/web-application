import { useEffect, useState } from 'react'
import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import DetailDrawer from '../../components/DetailDrawer'
import Pagination from '../../components/Pagination'
import Topbar from '../../components/Topbar'
import { api } from '../../lib/api'
import {
  formatDate,
  formatDateTime,
  formatTime,
  getEligibility,
  getInitials,
} from '../../lib/hospitalUtils'

const ITEMS_PER_PAGE = 5

export default function Donneurs() {
  const [donors, setDonors] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  async function loadData() {
    try {
      const [donorData, appointmentData] = await Promise.all([
        api.get('/api/admin/donors'),
        api.get('/api/admin/appointments'),
      ])

      const nextDonors = Array.isArray(donorData) ? donorData : []
      const nextAppointments = Array.isArray(appointmentData) ? appointmentData : []

      setDonors(nextDonors)
      setAppointments(nextAppointments)
      setSelectedDonorId((current) =>
        current && nextDonors.some((donor) => donor.id === current) ? current : null
      )
    } catch (error) {
      console.error('loadData error:', error)
    }
  }

  const filteredDonors = donors.filter((donor) => {
    const query = search.toLowerCase()
    return (
      (donor.full_name || '').toLowerCase().includes(query) ||
      (donor.blood_type || '').toLowerCase().includes(query) ||
      (donor.wilaya || '').toLowerCase().includes(query)
    )
  })

  const safePage = Math.min(currentPage, Math.max(1, Math.ceil(filteredDonors.length / ITEMS_PER_PAGE)))
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const paginatedDonors = filteredDonors.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const selectedDonor = donors.find((donor) => donor.id === selectedDonorId) || null
  const donorAppointments = appointments
    .filter((appointment) => appointment.donor_id === selectedDonor?.id)
    .sort((first, second) => new Date(second.scheduled_time).getTime() - new Date(first.scheduled_time).getTime())
  const eligibility = getEligibility(selectedDonor?.last_donation)

  return (
    <div className="space-y-6 pb-8">
      <Topbar
        title="Registre des donneurs"
        subtitle="Consultez les profils disponibles, ouvrez une fiche donneur complète et recoupez rapidement les disponibilités avec les rendez-vous planifiés."
        hideSearch
        hideActions
      />

      <div className="mx-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, groupe sanguin ou wilaya"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-sky-300"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <RegistryMetric title="Donneurs suivis" value={filteredDonors.length} />
          <RegistryMetric
            title="Éligibles aujourd’hui"
            value={donors.filter((donor) => getEligibility(donor.last_donation).label === 'Éligible').length}
          />
        </div>
      </div>

      <div className="mx-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50/70">
              <tr className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4">Donneur</th>
                <th className="px-6 py-4">Profil</th>
                <th className="px-6 py-4">Éligibilité</th>
                <th className="px-6 py-4">Dernier don</th>
                <th className="px-6 py-4 text-right">Fiche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedDonors.map((donor) => {
                const donorEligibility = getEligibility(donor.last_donation)
                return (
                  <tr
                    key={donor.id}
                    onClick={() => setSelectedDonorId(donor.id)}
                    className={`cursor-pointer transition ${
                      selectedDonorId === donor.id ? 'bg-sky-50/80' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                          {getInitials(donor.full_name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-950">{donor.full_name}</div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <Phone size={14} />
                            {donor.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">{donor.occupation}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin size={14} />
                          {donor.wilaya}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <span className={`text-sm font-semibold ${donorEligibility.tone}`}>{donorEligibility.label}</span>
                        <p className="text-sm text-slate-500">{donorEligibility.note}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">{formatDate(donor.last_donation)}</div>
                        <div className="text-sm text-slate-500">{donor.total_donations} dons cumulés</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedDonorId(donor.id)
                        }}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                      >
                        Ouvrir la fiche
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredDonors.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm font-semibold text-slate-600">
            Aucun donneur ne correspond à la recherche.
          </div>
        ) : null}

        <Pagination
          currentPage={safePage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={filteredDonors.length}
          onPageChange={setCurrentPage}
          label="donneurs"
        />
      </div>

      <DetailDrawer
        open={Boolean(selectedDonor)}
        title={selectedDonor?.full_name || 'Fiche donneur'}
        subtitle={selectedDonor ? `${selectedDonor.blood_type} • ${selectedDonor.wilaya}` : undefined}
        badge={
          selectedDonor ? (
            <span className={`rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold ${eligibility.tone}`}>
              {eligibility.label}
            </span>
          ) : null
        }
        onClose={() => setSelectedDonorId(null)}
        footer={
          selectedDonor ? (
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                Créer un rendez-vous
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-2xl bg-[#c73b42] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b02d35]"
              >
                <PhoneCall size={16} />
                Appeler le donneur
              </button>
            </div>
          ) : null
        }
      >
        {selectedDonor ? (
          <div className="space-y-6">
            <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-lg font-semibold text-slate-700 shadow-sm">
                  {getInitials(selectedDonor.full_name)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <UserRound size={15} />
                    {selectedDonor.occupation}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail size={15} />
                    {selectedDonor.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={15} />
                    {selectedDonor.address}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <DrawerMetric title="Âge" value={`${selectedDonor.age} ans`} />
              <DrawerMetric title="Poids" value={`${selectedDonor.weight_kg} kg`} />
              <DrawerMetric title="Dernier screening" value={formatDate(selectedDonor.last_screening)} />
              <DrawerMetric title="Préférence contact" value={selectedDonor.preferred_contact} />
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Informations opérationnelles</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailField label="Disponibilité" value={selectedDonor.availability} />
                <DetailField label="Total de dons" value={`${selectedDonor.total_donations}`} />
                <DetailField label="Contact d’urgence" value={selectedDonor.emergency_contact_name} />
                <DetailField label="Téléphone d’urgence" value={selectedDonor.emergency_contact_phone} />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">{selectedDonor.notes}</p>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Rendez-vous liés</h3>
                <span className="text-sm font-semibold text-slate-700">{donorAppointments.length} occurrence(s)</span>
              </div>

              <div className="mt-4 space-y-3">
                {donorAppointments.length > 0 ? (
                  donorAppointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{formatDateTime(appointment.scheduled_time)}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {appointment.room} • {appointment.assigned_nurse}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{appointment.units_expected || 1} poche(s)</p>
                          <p className="mt-1 text-sm text-slate-500">{appointment.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Aucun rendez-vous enregistré pour ce donneur.</p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  )
}

function RegistryMetric({ title, value }: any) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

function DrawerMetric({ title, value }: any) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function DetailField({ label, value }: any) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value || 'Non renseigné'}</p>
    </div>
  )
}
