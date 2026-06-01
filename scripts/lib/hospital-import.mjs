/**
 * Utilitaires partagés — import hôpitaux (KML / CSV) → hopitals-osm.json + import-hopitals-osm.sql
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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

const WILAYA_COORDS = {
  Adrar: [27.876, -0.293],
  Chlef: [36.165, 1.335],
  Laghouat: [33.8, 2.865],
  'Oum El Bouaghi': [35.875, 7.114],
  Batna: [35.556, 6.175],
  Béjaïa: [36.752, 5.056],
  Biskra: [34.85, 5.733],
  Béchar: [31.617, -2.216],
  Blida: [36.47, 2.828],
  Bouira: [36.369, 3.9],
  Tamanrasset: [22.785, 5.522],
  Tébessa: [35.404, 8.124],
  Tlemcen: [34.878, -1.315],
  Tiaret: [35.371, 1.317],
  'Tizi Ouzou': [36.717, 4.05],
  Alger: [36.754, 3.059],
  Djelfa: [34.667, 3.25],
  Jijel: [36.821, 5.764],
  Sétif: [36.19, 5.411],
  Saïda: [34.83, 0.152],
  Skikda: [36.876, 6.909],
  'Sidi Bel Abbès': [35.198, -0.63],
  Annaba: [36.9, 7.767],
  Guelma: [36.463, 7.426],
  Constantine: [36.365, 6.615],
  Médéa: [36.268, 2.753],
  Mostaganem: [35.933, 0.089],
  "M'Sila": [35.709, 4.542],
  Mascara: [35.396, 0.14],
  Ouargla: [31.949, 5.325],
  Oran: [35.697, -0.633],
  'El Bayadh': [33.683, 1.02],
  Illizi: [26.483, 8.466],
  'Bordj Bou Arréridj': [36.073, 4.761],
  Boumerdès: [36.767, 3.474],
  'El Tarf': [36.767, 8.314],
  Tindouf: [27.671, -8.147],
  Tissemsilt: [35.607, 1.811],
  'El Oued': [33.368, 6.867],
  Khenchela: [35.426, 7.143],
  'Souk Ahras': [36.286, 7.951],
  Tipaza: [36.589, 2.447],
  Mila: [36.45, 6.264],
  'Aïn Defla': [36.264, 1.968],
  Naâma: [33.267, -0.311],
  'Aïn Témouchent': [35.297, -1.14],
  Ghardaïa: [32.483, 3.673],
  Relizane: [35.738, 0.556],
  Timimoun: [29.258, 0.23],
  'Bordj Badji Mokhtar': [21.327, 0.952],
  'Ouled Djellal': [34.417, 5.067],
  'Béni Abbès': [30.133, -2.167],
  'In Salah': [27.195, 2.483],
  'In Guezzam': [19.572, 5.769],
  Touggourt: [33.109, 6.063],
  Djanet: [24.554, 9.482],
  "El M'Ghair": [33.95, 5.922],
  'El Meniaa': [30.579, 2.879],
}

const CITY_TO_WILAYA = {
  barika: 'Batna', rouiba: 'Boumerdès', tenes: 'Chlef', 'ain el berd': 'Sidi Bel Abbès',
  'ouled yaich': 'Blida', frenda: 'Tiaret', mascara: 'Mascara', blida: 'Blida',
  oran: 'Oran', constantine: 'Constantine', annaba: 'Annaba', setif: 'Sétif',
  bejaia: 'Béjaïa', tlemcen: 'Tlemcen', mostaganem: 'Mostaganem', biskra: 'Biskra',
  djelfa: 'Djelfa', medea: 'Médéa', tipaza: 'Tipaza', jijel: 'Jijel',
  'sidi bel abbes': 'Sidi Bel Abbès', 'ain defla': 'Aïn Defla', boumerdes: 'Boumerdès',
  'el bayadh': 'El Bayadh', ouargla: 'Ouargla', ghardaia: 'Ghardaïa', relizane: 'Relizane',
  chlef: 'Chlef', laghouat: 'Laghouat', tebessa: 'Tébessa', guelma: 'Guelma',
  khenchela: 'Khenchela', mila: 'Mila', 'souk ahras': 'Souk Ahras', 'el oued': 'El Oued',
  adrar: 'Adrar', bechar: 'Béchar', tamanrasset: 'Tamanrasset', bouira: 'Bouira',
  tizi: 'Tizi Ouzou', 'tizi ouzou': 'Tizi Ouzou', saida: 'Saïda', msila: "M'Sila",
  aoulef: 'Adrar',
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function wilayaFromCoords(lat, lon) {
  let best = 'Alger'
  let bestD = Infinity
  for (const [wilaya, [wLat, wLon]] of Object.entries(WILAYA_COORDS)) {
    const d = haversineKm(lat, lon, wLat, wLon)
    if (d < bestD) {
      bestD = d
      best = wilaya
    }
  }
  return best
}

export function normalize(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ⵡⴻⵀⵔⴰⵏ]/g, '')
    .toLowerCase()
    .trim()
}

function matchWilayaFromText(...texts) {
  for (const raw of texts) {
    if (!raw || /^\d+$/.test(String(raw).trim())) continue
    const t = normalize(String(raw).split(/[,;]/)[0])
    if (CITY_TO_WILAYA[t]) return CITY_TO_WILAYA[t]
    for (const [city, wilaya] of Object.entries(CITY_TO_WILAYA)) {
      if (t.includes(city)) return wilaya
    }
    for (const w of WILAYAS) {
      const nw = normalize(w)
      if (t === nw || t.includes(nw)) return w
    }
  }
  return null
}

export function resolveWilaya(lat, lon, ...texts) {
  const fromText = matchWilayaFromText(...texts)
  const fromGps = wilayaFromCoords(lat, lon)
  if (fromText) {
    if (fromText === fromGps) return fromText
    if (haversineKm(lat, lon, ...WILAYA_COORDS[fromText]) < 120) return fromText
  }
  return fromGps
}

export function scoreFacility(f) {
  let s = f.name.length
  if (/chu|hôpital|hopital|hospital|مستشفى/i.test(f.name)) s += 50
  if (f.address) s += 20
  if (f.facility_type === 'hospital') s += 10
  if (f.osm_id) s += 5
  return s
}

export function dedupeFacilities(rawList) {
  const facilityMap = new Map()
  for (const entry of rawList) {
    const dedupeKey = `${entry.region}|${normalize(entry.name)}`
    const existing = facilityMap.get(dedupeKey)
    if (!existing || scoreFacility(entry) > scoreFacility(existing)) {
      facilityMap.set(dedupeKey, entry)
    }
  }
  return [...facilityMap.values()]
}

function escapeSql(s) {
  return (s || '').replace(/'/g, "''")
}

export function writeHospitalImport(facilities, { sourceLabel, scriptDir }) {
  const outDir = path.join(scriptDir, '..', 'supabase')
  const jsonPath = path.join(outDir, 'hopitals-osm.json')
  fs.writeFileSync(jsonPath, JSON.stringify(facilities, null, 0))

  const sqlPath = path.join(outDir, 'import-hopitals-osm.sql')
  let sql = `-- Import ${sourceLabel} — ${facilities.length} hôpitaux (dédupliqués)
-- Exécuter après schema.sql

TRUNCATE hopitals RESTART IDENTITY CASCADE;

`

  const BATCH = 80
  for (let i = 0; i < facilities.length; i += BATCH) {
    const batch = facilities.slice(i, i + BATCH)
    sql += 'INSERT INTO hopitals (name, address, region, phone, latitude, longitude, osm_id, facility_type)\nVALUES\n'
    sql += batch
      .map(
        (f) =>
          `  ('${escapeSql(f.name)}', ${f.address ? `'${escapeSql(f.address)}'` : 'NULL'}, '${escapeSql(f.region)}', NULL, ${f.latitude}, ${f.longitude}, ${f.osm_id ? `'${escapeSql(f.osm_id)}'` : 'NULL'}, '${f.facility_type}')`
      )
      .join(',\n')
    sql += '\nON CONFLICT (osm_id) WHERE osm_id IS NOT NULL DO NOTHING;\n\n'
  }

  fs.writeFileSync(sqlPath, sql)
  return { jsonPath, sqlPath, outDir }
}

export function logImportSummary(facilities, paths) {
  console.log(`Établissements uniques: ${facilities.length}`)
  console.log('JSON:', paths.jsonPath)
  console.log('SQL:', paths.sqlPath)
  const byRegion = {}
  for (const f of facilities) {
    byRegion[f.region] = (byRegion[f.region] || 0) + 1
  }
  console.log('Top wilayas:', Object.entries(byRegion).sort((a, b) => b[1] - a[1]).slice(0, 10))
}

export const __dirname = path.dirname(fileURLToPath(import.meta.url))
