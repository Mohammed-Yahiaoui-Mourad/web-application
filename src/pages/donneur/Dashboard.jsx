import { Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import BloodTypePill from '../../components/BloodTypePill'
import { canDonate } from '../../constants'

export default function DonorDashboard() {
  const profile = useAuthStore((s) => s.profile)
  const eligible = canDonate(profile?.last_donation_date)

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Espace Donneur</h1>
      <p className="mb-6 text-gray-600">
        {profile?.first_name} {profile?.last_name} —{' '}
        <BloodTypePill type={profile?.blood_type} className="inline-flex" /> — {profile?.region}
      </p>

      {!eligible && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Vous avez donné récemment. Attendez 2 mois avant de recevoir de nouvelles alertes.
        </div>
      )}

      {!profile?.is_available && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-700">
          Vous êtes marqué comme indisponible. Activez la disponibilité dans votre profil.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/donneur/alertes"
          className="rounded-xl bg-white p-6 shadow transition hover:shadow-md"
        >
          <span className="text-3xl">🔔</span>
          <h2 className="mt-2 text-lg font-semibold">Mes alertes</h2>
          <p className="text-sm text-gray-600">Répondre aux demandes de sang en temps réel</p>
        </Link>
      </div>
    </div>
  )
}
