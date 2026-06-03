import { useEffect, useState } from 'react'
import { Mail, Phone, Plus, ShieldCheck, UserRound, UserPlus } from 'lucide-react'
import DetailDrawer from '../../components/DetailDrawer'
import Pagination from '../../components/Pagination'
import Topbar from '../../components/Topbar'
import { api } from '../../lib/api'
import { getInitials } from '../../lib/hospitalUtils'

const ITEMS_PER_PAGE = 5

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  role: '',
  department: '',
  email: '',
  phone: '',
  shift: '',
}

export default function Team() {
  const [members, setMembers] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
    try {
      const data = await api.get('/api/admin/team')
      setMembers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('loadMembers error:', error)
    }
  }

  async function addMember() {
    setSaving(true)
    try {
      await api.post('/api/admin/team', form)
      const newMember = {
        id: `tm-${Date.now()}`,
        ...form,
        status: 'pending',
      }
      setMembers((current) => [newMember, ...current])
      setForm(EMPTY_FORM)
      setDrawerOpen(false)
      setMessage('Le nouveau membre a été ajouté à l’équipe hospitalière.')
    } catch (error: any) {
      setMessage(error?.message || 'Impossible d’ajouter ce membre.')
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const safePage = Math.min(currentPage, Math.max(1, Math.ceil(members.length / ITEMS_PER_PAGE)))
  const paginatedMembers = members.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6 pb-8">
      <Topbar
        title="Équipe hospitalière"
        subtitle="Ajoutez des coordinateurs, infirmiers et personnels de support pour structurer l’organisation interne du site."
        hideSearch
        actions={
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={16} />
            Ajouter un membre
          </button>
        }
      />

      <div className="mx-8 grid gap-4 xl:grid-cols-3">
        <TeamMetric title="Membres actifs" value={members.filter((member) => member.status === 'active').length} />
        <TeamMetric title="Invitations en attente" value={members.filter((member) => member.status === 'pending').length} tone="bg-amber-50 border-amber-200" />
        <TeamMetric title="Services couverts" value={new Set(members.map((member) => member.department)).size} tone="bg-sky-50 border-sky-200" />
      </div>

      {message ? (
        <div className="mx-8 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">{message}</div>
      ) : null}

      <div className="mx-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Organisation interne</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Annuaire de l’équipe</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50/70">
              <tr className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4">Membre</th>
                <th className="px-6 py-4">Fonction</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Shift</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                        {getInitials(`${member.first_name} ${member.last_name}`)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-950">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <Mail size={13} />
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-medium text-slate-900">{member.role}</td>
                  <td className="px-6 py-5 text-slate-700">{member.department}</td>
                  <td className="px-6 py-5 text-slate-700">{member.shift}</td>
                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        member.status === 'active'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {member.status === 'active' ? 'Actif' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={safePage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={members.length}
          onPageChange={setCurrentPage}
          label="membres"
        />
      </div>

      <DetailDrawer
        open={drawerOpen}
        title="Ajouter un membre"
        subtitle="Invitez un nouveau collaborateur dans l’espace hospitalier."
        onClose={() => setDrawerOpen(false)}
        badge={
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            Nouveau
          </span>
        }
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={addMember}
              className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              <UserPlus size={16} />
              Enregistrer
            </button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TeamField label="Prénom">
            <input
              type="text"
              value={form.first_name}
              onChange={(event) => updateField('first_name', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
            />
          </TeamField>
          <TeamField label="Nom">
            <input
              type="text"
              value={form.last_name}
              onChange={(event) => updateField('last_name', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
            />
          </TeamField>
          <TeamField label="Fonction">
            <input
              type="text"
              value={form.role}
              onChange={(event) => updateField('role', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
            />
          </TeamField>
          <TeamField label="Service">
            <input
              type="text"
              value={form.department}
              onChange={(event) => updateField('department', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
            />
          </TeamField>
          <TeamField label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
            />
          </TeamField>
          <TeamField label="Téléphone">
            <input
              type="text"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
            />
          </TeamField>
          <div className="sm:col-span-2">
            <TeamField label="Shift">
              <input
                type="text"
                value={form.shift}
                onChange={(event) => updateField('shift', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300"
              />
            </TeamField>
          </div>
        </div>
      </DetailDrawer>
    </div>
  )
}

function TeamMetric({ title, value, tone }: any) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ${tone || ''}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

function TeamField({ label, children }: any) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      {children}
    </div>
  )
}
