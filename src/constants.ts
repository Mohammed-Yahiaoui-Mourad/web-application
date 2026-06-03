export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const SEVERITIES = [
  { value: 'critique', label: 'CRITIQUE', emoji: '🔴', color: 'bg-[#E8293A]' },
  { value: 'urgent', label: 'URGENT', emoji: '🟠', color: 'bg-[#F97316]' },
  { value: 'normal', label: 'NORMAL', emoji: '🟢', color: 'bg-[#16a34a]' },
]

export const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj',
  'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal',
  'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa',
]

export const ROLE_ROUTES = {
  admin: '/admin-hopital',
  admin_hopital: '/admin-hopital',
}

export const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000

export function canDonate(lastDonationDate) {
  if (!lastDonationDate) return true
  const last = new Date(lastDonationDate)
  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
  return last < twoMonthsAgo
}
