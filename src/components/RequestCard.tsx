import SeverityBadge from './SeverityBadge'
import BloodTypePill from './BloodTypePill'

export default function RequestCard({ request, patient, actions }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm card-smooth">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={request.severity} />
        <BloodTypePill type={request.blood_type} />
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
            request.status === 'active'
              ? 'bg-blue-100 text-blue-800'
              : request.status === 'fulfilled'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
          }`}
        >
          {request.status}
        </span>
      </div>

      {patient && (
        <p className="mb-1 text-sm text-gray-700">
          Patient : {patient.first_name} {patient.last_name}
        </p>
      )}

      {request.diagnosis && (
        <p className="mb-2 text-sm text-gray-600">{request.diagnosis}</p>
      )}

      <p className="text-sm text-gray-500">
        {request.units_needed} poche(s) · {request.region} ·{' '}
        {new Date(request.created_at).toLocaleString('fr-FR')}
      </p>

      {request.donors_confirmed > 0 && (
        <p className="mt-2 text-sm font-medium text-green-700">
          {request.donors_confirmed} donneur(s) confirmé(s)
        </p>
      )}

      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
