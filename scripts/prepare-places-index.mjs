// Additive search index for the "Cari Lokasi" feature: lets a user type a
// kabupaten, kecamatan, or river name and fly the map there. Not a new map
// layer, not a model feature, not evidence for scoring or R0-R5
// reclassification -- CONTEXT_GEOMETRY_NOT_EVIDENCE, same role as the other
// public/data/context/ outputs.
//
// Kabupaten: reuses the already-clipped admin_kabupaten.geojson (12 features
// that intersect the DAS Mahakam basin).
// Kecamatan: BIG BATAS_KECAMATAN_AR bbox snapshot (raw, unclipped -- covers a
// much wider area than the basin), filtered to (a) parent kabupaten in the
// same 12-name whitelist admin_kabupaten.geojson already uses, and (b) the
// kecamatan's own bounding box overlaps the DAS Mahakam bounding box. This is
// a coarse bbox filter, not true polygon clipping (no GDAL/geopandas in this
// environment), so a few edge kecamatan from the 5 sliver kabupaten
// (Barito Utara, Berau, Kapuas Hulu, Murung Raya, Paser -- each <120 km^2 of
// actual overlap) may be included even if their true intersection is tiny;
// acceptable for a search index (worst case: flies just outside the basin
// edge), not acceptable for a rendered boundary layer, so no such layer is
// produced here.
// Sungai: rivers_major.geojson + rivers_minor.geojson, grouped by name
// (a single river can have many segments), bbox unioned across segments.
//
// Not part of postinstall/build: rerun manually if source snapshots change.
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

const REPO_ROOT = path.resolve('..');
const OUT_DIR = path.resolve('public/data/context');

const KABUPATEN_WHITELIST = new Set([
  'Barito Utara', 'Berau', 'Kapuas Hulu', 'Kota Samarinda', 'Kutai Barat',
  'Kutai Kartanegara', 'Kutai Timur', 'Mahakam Ulu', 'Malinau', 'Murung Raya',
  'Paser', 'Penajam Paser Utara',
]);

async function readJson(p) {
  return JSON.parse(await readFile(p, 'utf8'));
}

function bboxOf(coords, box = [Infinity, Infinity, -Infinity, -Infinity]) {
  if (typeof coords[0] === 'number') {
    const [x, y] = coords;
    if (x < box[0]) box[0] = x;
    if (y < box[1]) box[1] = y;
    if (x > box[2]) box[2] = x;
    if (y > box[3]) box[3] = y;
    return box;
  }
  for (const c of coords) bboxOf(c, box);
  return box;
}
function round(v) {
  return Math.round(v * 1e5) / 1e5;
}
function roundBbox(b) {
  return b.map(round);
}
function bboxOverlaps(a, b) {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}
function unionBbox(a, b) {
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
}

const metadata = await readJson(path.resolve('public/data/mahakam/metadata.json'));
const DAS_BOUNDS = metadata.bounds;

const places = [];

// ---- kabupaten (already clipped to the basin) ----
const kabupaten = await readJson(path.join(OUT_DIR, 'admin_kabupaten.geojson'));
for (const f of kabupaten.features) {
  places.push({
    name: f.properties.name,
    kind: 'kabupaten',
    bbox: roundBbox(bboxOf(f.geometry.coordinates)),
  });
}

// ---- kecamatan (raw bbox snapshot, filtered) ----
const kecRaw = await readJson(path.join(
  REPO_ROOT, 'data/01_raw/mahakam/D09_ADMIN/raw/D09_BIG_kecamatan_D08_bbox_snapshot_2026-08-31.geojson',
));
let kecCount = 0;
for (const f of kecRaw.features) {
  const name = f.properties.WADMKC;
  const kabName = f.properties.WADMKK;
  if (f.properties.TIPADM === 999 || !name || !KABUPATEN_WHITELIST.has(kabName)) continue;
  const bbox = roundBbox(bboxOf(f.geometry.coordinates));
  if (!bboxOverlaps(bbox, DAS_BOUNDS)) continue;
  places.push({name, kind: 'kecamatan', kabupaten: kabName, bbox});
  kecCount++;
}

// ---- sungai (grouped by name across major + minor segments) ----
const riverGroups = new Map();
for (const file of ['rivers_major.geojson', 'rivers_minor.geojson']) {
  const data = await readJson(path.join(OUT_DIR, file));
  for (const f of data.features) {
    const name = f.properties.name;
    if (!name) continue;
    const bbox = bboxOf(f.geometry.coordinates);
    riverGroups.set(name, riverGroups.has(name) ? unionBbox(riverGroups.get(name), bbox) : bbox);
  }
}
for (const [name, bbox] of riverGroups) {
  places.push({name, kind: 'sungai', bbox: roundBbox(bbox)});
}

places.sort((a, b) => a.name.localeCompare(b.name, 'id'));

const output = {
  role: 'CONTEXT_GEOMETRY_NOT_EVIDENCE',
  role_statement: 'Indeks pencarian lokasi untuk navigasi peta. Bukan fitur model, bukan evidence skoring.',
  generated_by: 'web-dashboard/scripts/prepare-places-index.mjs',
  counts: {
    kabupaten: kabupaten.features.length,
    kecamatan: kecCount,
    sungai: riverGroups.size,
    total: places.length,
  },
  places,
};

await writeFile(path.join(OUT_DIR, 'places_index.json'), JSON.stringify(output));
console.log(JSON.stringify({status: 'PASS', ...output.counts}, null, 2));
