/**
 * Importe uniquement les hôpitaux depuis algeria_health_facilities_dataset.csv
 * Usage: node scripts/import-csv-hospitals.mjs "C:\chemin\algeria_health_facilities_dataset.csv"
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

/** Parse CSV (guillemets, virgules dans les champs) */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || (c === '\r' && text[i + 1] === '\n')) {
      row.push(field)
      if (row.some((cell) => cell.length > 0)) rows.push(row)
      row = []
      field = ''
      if (c === '\r') i++
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function isHospitalRow(row) {
  const amenity = (row.amenity || '').trim().toLowerCase()
  const healthcare = (row.healthcare || '').trim().toLowerCase()
  return amenity === 'hospital' || healthcare === 'hospital'
}

function pickName(row) {
  for (const n of [row.name, row.name_en, row.name_ar]) {
    const s = (n || '').trim()
    if (s.length >= 3 && !/^\d+$/.test(s)) return s.slice(0, 200)
  }
  const city = (row.addr_city || row.capacity_p || '').trim()
  if (city && !/^\d+$/.test(city)) return `Établissement — ${city}`.slice(0, 200)
  return null
}

const csvPath =
  process.argv[2] ||
  path.join(process.env.USERPROFILE || '', 'Desktop', 'algeria_health_facilities_dataset.csv')

if (!fs.existsSync(csvPath)) {
  console.error('Fichier CSV introuvable:', csvPath)
  process.exit(1)
}

console.log('Lecture:', csvPath)
const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'))
const header = rows[0]
const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]))

function get(row, key) {
  const i = col[key]
  return i === undefined ? '' : (row[i] || '').trim()
}

const raw = []
let skippedNoCoords = 0
let skippedNoName = 0
let skippedNotHospital = 0

for (let r = 1; r < rows.length; r++) {
  const row = rows[r]
  if (!row.length) continue

  const record = {
    name: get(row, 'name'),
    name_en: get(row, 'name_en'),
    name_ar: get(row, 'name_ar'),
    amenity: get(row, 'amenity'),
    healthcare: get(row, 'healthcare'),
    addr_full: get(row, 'addr_full'),
    addr_city: get(row, 'addr_city'),
    capacity_p: get(row, 'capacity_p'),
    osm_id: get(row, 'osm_id'),
  }

  if (!isHospitalRow(record)) {
    skippedNotHospital++
    continue
  }

  const lon = Number(get(row, 'longitude'))
  const lat = Number(get(row, 'latitude'))
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    skippedNoCoords++
    continue
  }

  const name = pickName(record)
  if (!name) {
    skippedNoName++
    continue
  }

  const region = resolveWilaya(lat, lon, record.addr_city, record.capacity_p, record.addr_full, name)
  const address =
    [record.addr_full, record.addr_city].filter(Boolean).join(' — ') || null
  const osmId = record.osm_id && /^\d+$/.test(record.osm_id) ? record.osm_id : null

  raw.push({
    name,
    address: address?.slice(0, 500) || null,
    region,
    phone: null,
    latitude: Math.round(lat * 1e6) / 1e6,
    longitude: Math.round(lon * 1e6) / 1e6,
    osm_id: osmId,
    facility_type: 'hospital',
  })
}

console.log(`Lignes CSV: ${rows.length - 1}`)
console.log(`Filtré (non-hôpital): ${skippedNotHospital}`)
console.log(`Ignoré (coords): ${skippedNoCoords}, (nom): ${skippedNoName}`)
console.log(`Avant déduplication: ${raw.length}`)

const facilities = dedupeFacilities(raw)
const paths = writeHospitalImport(facilities, {
  sourceLabel: 'CSV Algérie (amenity/healthcare=hospital)',
  scriptDir: __dirname,
})
logImportSummary(facilities, paths)
