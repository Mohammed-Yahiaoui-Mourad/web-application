/**
 * Importe les établissements hospitaliers depuis le KML HOTOSM Algérie.
 * Usage: node scripts/import-kml-hospitals.mjs "C:\chemin\vers\fichier.kml"
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  dedupeFacilities,
  logImportSummary,
  resolveWilaya,
  writeHospitalImport,
} from './lib/hospital-import.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const TYPE_TAGS = new Set([
  'hospital', 'clinic', 'doctors', 'dentist', 'pharmacy', 'health_centre',
])

function parseSimpleData(block) {
  const data = {}
  const re = /<SimpleData name="([^"]+)">([^<]*)<\/SimpleData>/g
  let m
  while ((m = re.exec(block)) !== null) data[m[1]] = m[2].trim()
  return data
}

function parseNames(block) {
  return [...block.matchAll(/<name>([^<]+)<\/name>/g)].map((m) => m[1].trim())
}

function centroid(coordsStr) {
  const pairs = coordsStr.trim().split(/\s+/).map((p) => p.split(',').map(Number))
  let lat = 0
  let lon = 0
  let n = 0
  for (const [lng, latVal] of pairs) {
    if (Number.isFinite(lng) && Number.isFinite(latVal)) {
      lon += lng
      lat += latVal
      n++
    }
  }
  return n ? { latitude: lat / n, longitude: lon / n } : null
}

function pickName(names, meta) {
  for (const n of names) {
    const low = n.toLowerCase()
    if (TYPE_TAGS.has(low)) continue
    if (low === 'yes' || low === 'ways_poly' || low === 'relations') continue
    if (n.length < 3) continue
    return n.slice(0, 200)
  }
  const city = meta['capacity:persons'] || meta['addr:city']
  if (city && !/^\d+$/.test(city)) return `Établissement — ${city}`.slice(0, 200)
  return null
}

function isHospitalPlacemark(names, meta) {
  const lowNames = names.map((n) => n.toLowerCase())
  if (lowNames.includes('hospital')) return true
  if (meta.amenity === 'hospital' || meta.healthcare === 'hospital') return true
  const label = names.find((n) => !TYPE_TAGS.has(n.toLowerCase())) || ''
  if (/chu|hôpital|hopital|hospital|centre hospital|eph\b/i.test(label)) return true
  return false
}

const kmlPath =
  process.argv[2] ||
  path.join(process.env.USERPROFILE || '', 'Desktop', 'hotosm_dza_health_facilities_polygons_kml.kml')

if (!fs.existsSync(kmlPath)) {
  console.error('Fichier KML introuvable:', kmlPath)
  process.exit(1)
}

console.log('Lecture:', kmlPath)
const kml = fs.readFileSync(kmlPath, 'utf8')
const chunks = kml.split('<Placemark>').slice(1)

const raw = []

for (const chunk of chunks) {
  const block = chunk.split('</Placemark>')[0]
  const names = parseNames(block)
  const meta = parseSimpleData(block)

  if (!isHospitalPlacemark(names, meta)) continue

  const coordMatch = block.match(/<coordinates>([^<]+)<\/coordinates>/)
  if (!coordMatch) continue

  const center = centroid(coordMatch[1])
  if (!center) continue

  const name = pickName(names, meta)
  if (!name) continue

  const region = resolveWilaya(
    center.latitude,
    center.longitude,
    meta['capacity:persons'],
    meta['addr:city'],
    meta['addr:full'],
    name
  )

  const osmId = meta['name:ar'] && /^\d+$/.test(meta['name:ar']) ? meta['name:ar'] : null
  const address = [meta['addr:full'], meta['addr:city']].filter(Boolean).join(' — ') || null
  const facilityType = names.map((n) => n.toLowerCase()).includes('hospital') ? 'hospital' : 'clinic'

  raw.push({
    name,
    address: address?.slice(0, 500) || null,
    region,
    phone: null,
    latitude: Math.round(center.latitude * 1e6) / 1e6,
    longitude: Math.round(center.longitude * 1e6) / 1e6,
    osm_id: osmId,
    facility_type: facilityType,
  })
}

console.log(`Avant déduplication: ${raw.length}`)
const facilities = dedupeFacilities(raw)
const paths = writeHospitalImport(facilities, {
  sourceLabel: 'KML HOTOSM',
  scriptDir: __dirname,
})
logImportSummary(facilities, paths)
