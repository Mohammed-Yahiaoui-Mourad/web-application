import SeverityBadge from './SeverityBadge'
import BloodTypePill from './BloodTypePill'
import Timer from './Timer'

export default function AlertCard({ alert, request, hospital, onAccept, onDecline, loading }: any) {
  const expired = alert.expires_at && new Date(alert.expires_at) < new Date()
  const disabled = alert.status !== 'pending' || expired || loading

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm card-smooth">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SeverityBadge severity={request?.severity} />
        {request?.blood_type && <BloodTypePill type={request.blood_type} />}
      </div>

      {hospital && (
        <div className="mb-3">
          <h3 className="font-semibold text-[#1a1917]">{hospital.name}</h3>
          {hospital.address && (
            <p className="text-sm text-gray-600">{hospital.address}</p>
          )}
          <p className="text-sm text-gray-500">{hospital.region}</p>
        </div>
      )}

      {request?.diagnosis && (
        <p className="mb-3 text-sm text-gray-700">{request.diagnosis}</p>
      )}

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Temps restant :</span>
        <Timer expiresAt={alert.expires_at} />
      </div>

      {alert.status !== 'pending' ? (
        <p className="text-sm font-medium capitalize text-gray-600">
          Statut : {alert.status}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAccept(alert)}
            className="rounded-lg bg-[#E8293A] px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            J&apos;accepte de donner
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDecline(alert)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Pas disponible
          </button>
        </div>
      )}
    </div>
  )
}
