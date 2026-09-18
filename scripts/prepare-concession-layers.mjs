// Additive map CONTEXT layer, same role as build_context_layers.py's basin/
// rivers/admin output: visual reference only, never a model feature, never
// evidence for scoring or R0-R5 reclassification. The frozen STEP54 package
// is untouched.
//
// Sources are read-only, government/BIG-published permit snapshots that are
// publicly accessible but (like D08/D09/D10 already shipped in
// context_manifest.json) have unconfirmed redistribution rights. Displayed
// on the project owner's explicit instruction (see
// context_manifest_concessions.json's restriction_note), same posture
// already accepted for the existing BIG context layers.
//
// D01 (mining, IUP) validation: CONDITIONAL, APPROVED_FOR_MODELING: NO.
// D02 (palm, izin lokasi) validation: CONDITIONAL, MODELING GATE: CLOSED.
// Neither was ever used as a model input (STEP45 predictors are 4 physical
// variables only) or as a scoring feature; this script only prepares them
// for on-map DISPLAY, a separate, lower-stakes use than modeling.
//
// Not part of postinstall/build: rerun manually if the source snapshots change.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const REPO_ROOT = path.resolve('..');
const OUT_DIR = path.resolve('public/data/context');
const DECIMALS = 5;

function roundCoords(node) {
  if (typeof node[0] === 'number') return [round(node[0]), round(node[1])];
  return node.map(roundCoords);
}
function round(n) {
  const f = 10 ** DECIMALS;
  return Math.round(n * f) / f;
}
function ha(v) {
  return typeof v === 'number' ? Math.round(v * 10) / 10 : null;
}
function str(v) {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

async function readJson(relPath) {
  return JSON.parse(await readFile(path.join(REPO_ROOT, relPath), 'utf8'));
}

function writeGeojson(features) {
  return JSON.stringify({type: 'FeatureCollection', features});
}

async function buildMining() {
  const src = 'data/02_interim/mahakam/D01/D01_WIUP_intersection_D08_DAS_Mahakam.geojson';
  const data = await readJson(src);
  const features = data.features.map(f => ({
    type: 'Feature',
    properties: {
      nama_usaha: str(f.properties.nama_usaha),
      badan_usaha: str(f.properties.badan_usaha),
      jenis_izin: str(f.properties.jenis_izin),
      komoditas: str(f.properties.komoditas),
      kegiatan: str(f.properties.kegiatan),
      luas_ha: ha(f.properties.luas_sk),
      kabupaten: str(f.properties.nama_kab),
      berlaku_hingga: typeof f.properties.tgl_akhir === 'number'
        ? new Date(f.properties.tgl_akhir).getUTCFullYear() : null,
    },
    geometry: {...f.geometry, coordinates: roundCoords(f.geometry.coordinates)},
  }));
  return {features, sourceFile: src, rawCount: data.features.length};
}

async function buildPalm() {
  const files = [
    'data/01_raw/mahakam/D02_PALM_PERMIT/raw/D02_KSP_Izin_Lokasi_Sawit_Kutai_Barat_snapshot_2026-08-28.geojson',
    'data/01_raw/mahakam/D02_PALM_PERMIT/raw/D02_KSP_Izin_Lokasi_Sawit_Kutai_Kartanegara_snapshot_2026-08-28.geojson',
    'data/01_raw/mahakam/D02_PALM_PERMIT/raw/D02_KSP_Izin_Lokasi_Sawit_Kutai_Timur_snapshot_2026-08-28.geojson',
  ];
  const features = [];
  for (const rel of files) {
    const data = await readJson(rel);
    for (const f of data.features) {
      features.push({
        type: 'Feature',
        properties: {
          nama_perusahaan: str(f.properties.nama_prsh),
          kelompok_usaha: str(f.properties.grp_usaha),
          status: str(f.properties.status),
          luas_ha: ha(f.properties.luas_sk_il),
          kabupaten: str(f.properties.kabupaten),
        },
        geometry: {...f.geometry, coordinates: roundCoords(f.geometry.coordinates)},
      });
    }
  }
  return {features, sourceFiles: files, rawCount: features.length};
}

await mkdir(OUT_DIR, {recursive: true});

const mining = await buildMining();
const palm = await buildPalm();

const outputs = {};
for (const [filename, built] of [['mining_concessions.geojson', mining], ['palm_concessions.geojson', palm]]) {
  const text = writeGeojson(built.features);
  await writeFile(path.join(OUT_DIR, filename), text);
  outputs[filename] = {
    features: built.features.length,
    size_bytes: Buffer.byteLength(text, 'utf8'),
    sha256: createHash('sha256').update(text).digest('hex'),
  };
}

const manifest = {
  manifest_id: 'WEB_CONTEXT_CONCESSION_LAYERS_V1',
  generated_by: 'web-dashboard/scripts/prepare-concession-layers.mjs',
  role: 'CONTEXT_GEOMETRY_NOT_EVIDENCE',
  role_statement:
    'Layer ini adalah referensi visual lokasi konsesi. Tidak dipakai sebagai fitur model ' +
    '(STEP45 hanya memakai 4 prediktor fisik), bukti skoring, atau dasar reklasifikasi ' +
    'level R0-R5. Paket beku STEP54 tetap menjadi batas aplikasi yang sah. Poligon izin ' +
    'bukan jejak fisik tambang/perkebunan yang teramati langsung di lapangan.',
  not_part_of: 'STEP54_WEB_PRESENTATION_PACKAGE',
  frozen_package_untouched: true,
  target_crs: 'EPSG:4326',
  coordinate_decimals: DECIMALS,
  field_aliases: {
    mining_concessions: {
      nama_usaha: 'nama badan usaha pemegang izin',
      badan_usaha: 'bentuk badan usaha (PT, CV, ...)',
      jenis_izin: 'jenis izin (IUP)',
      komoditas: 'komoditas tambang',
      kegiatan: 'tahap kegiatan (eksplorasi/operasi produksi)',
      luas_ha: 'luas sesuai SK (hektare)',
      kabupaten: 'kabupaten/kota',
      berlaku_hingga: 'tahun akhir masa berlaku izin, dari sumber',
    },
    palm_concessions: {
      nama_perusahaan: 'nama perusahaan pemegang izin lokasi',
      kelompok_usaha: 'kelompok usaha induk (jika tercatat)',
      status: 'status pada sumber (mis. aktif)',
      luas_ha: 'luas sesuai SK izin lokasi (hektare)',
      kabupaten: 'kabupaten/kota',
    },
  },
  sources: {
    D01: {
      dataset_id: 'D01',
      dataset_name: 'Wilayah Izin Usaha Pertambangan (WIUP)',
      producer: 'Kementerian ESDM (Ditjen Minerba), One Map',
      product: 'ESDM One Map WIUP, snapshot Kalimantan Timur, dipotong ke DAS Mahakam',
      retrieval_date: '2026-08-28',
      license_status: 'PUBLICLY ACCESSIBLE; REDISTRIBUTION STATUS UNCLEAR (belum dikonfirmasi ke ESDM/PPID)',
      validation_status: 'CONDITIONAL; APPROVED_FOR_MODELING: NO (tidak pernah dipakai sebagai fitur model)',
      known_caveats:
        '26 kelompok geometri duplikat pada data sumber (dibiarkan apa adanya, tidak didedupe ' +
        'secara sepihak); snapshot satu waktu (2026-08-28), bukan arsip historis; izin legal ' +
        'tidak setara dengan jejak fisik tambang.',
      attribution: 'Sumber: Kementerian ESDM - One Map WIUP',
      raw_feature_count: mining.rawCount,
      source_file: mining.sourceFile,
    },
    D02: {
      dataset_id: 'D02',
      dataset_name: 'Izin Lokasi Perkebunan Sawit',
      producer: 'Badan Informasi Geospasial (BIG), Kebijakan Satu Peta',
      product: 'KSP layer Izin Lokasi, snapshot Kutai Barat + Kutai Kartanegara + Kutai Timur',
      retrieval_date: '2026-08-28',
      license_status: 'PUBLICLY ACCESSIBLE; REDISTRIBUTION STATUS UNCLEAR (belum dikonfirmasi ke BIG/KSP)',
      validation_status: 'CONDITIONAL; MODELING GATE: CLOSED (tidak pernah dipakai sebagai fitur model)',
      known_caveats:
        'Hanya mencakup 3 dari kabupaten/kota DAS Mahakam (Mahakam Ulu belum tercakup di sumber); ' +
        'sebagian tanggal SK sudah lama (maksimum tercatat 2019, satu baris anomali 1899); status ' +
        '"aktif" pada sumber bukan jaminan validitas terkini; izin lokasi bukan jejak fisik ' +
        'perkebunan yang teramati langsung di lapangan.',
      attribution: 'Sumber: BIG - Kebijakan Satu Peta, layer Izin Lokasi',
      raw_feature_count: palm.rawCount,
      source_files: palm.sourceFiles,
    },
  },
  restriction_note:
    'Kedua sumber berstatus publicly accessible dengan hak redistribusi yang belum eksplisit, ' +
    'sama seperti status D08/D09/D10 pada context_manifest.json. Ditampilkan atas instruksi ' +
    'eksplisit pemilik proyek; atribusi disertakan pada peta, hindari penggunaan komersial.',
  outputs,
};

await writeFile(path.join(OUT_DIR, 'context_manifest_concessions.json'), JSON.stringify(manifest, null, 2));

console.log(JSON.stringify({
  status: 'PASS',
  mining_features: outputs['mining_concessions.geojson'].features,
  mining_kb: Math.round(outputs['mining_concessions.geojson'].size_bytes / 1024),
  palm_features: outputs['palm_concessions.geojson'].features,
  palm_kb: Math.round(outputs['palm_concessions.geojson'].size_bytes / 1024),
}, null, 2));
