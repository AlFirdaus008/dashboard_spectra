import type {Properties} from '@/types/data';

// One-sentence, everyday-language explanations for the "?" hint icon next to
// technical terms and field labels across the dashboard. Kept short on
// purpose: this is an at-a-glance hint, not a methodology reference (that
// lives on /atlas#methodology).
export const glossary: Record<string, string> = {
  shap: 'Metode yang menunjukkan faktor apa saja yang paling memengaruhi hasil model untuk satu grid tertentu, dan seberapa besar pengaruhnya.',
  bridgeNode: 'Titik aliran sungai yang jika tersumbat atau rusak, dampaknya merembet ke sistem sungai lainnya.',
  susceptibilityPercentile: 'Seberapa tinggi kerentanan banjir grid ini dibandingkan grid lain, dari 0% (paling rendah) sampai 100% (paling tinggi).',
  irc: 'Skor gabungan yang direncanakan dalam riset ini, tetapi belum pernah dihitung karena data pendukungnya belum lengkap.',
  evidence: 'Petunjuk pendukung yang dipakai sistem screening untuk menyoroti grid, bukan bukti hukum atau bukti pelanggaran.',
  screening: 'Proses penyaringan awal untuk menandai grid yang perlu ditinjau lebih lanjut, bukan keputusan akhir.',
  grid: 'Petak wilayah berukuran 1×1 km, satuan analisis terkecil dalam sistem ini.',
  policyOverlap: 'Area grid yang beririsan dengan poligon izin tambang atau sawit yang tercatat, bukan bukti bahwa aktivitas fisik benar-benar terjadi di sana.',
  coordinationScope: 'Menunjukkan apakah tindak lanjut grid ini cukup ditangani satu kabupaten, atau perlu koordinasi lintas kabupaten.',
  recommendationLevel: 'Tingkat prioritas tinjauan teknis dari sistem screening (R0 sampai R5), bukan tingkat bahaya atau risiko bencana.',
};

// Plain-language paraphrase of each tier's already-authorized contract `interpretation`.
// Deliberately avoids risk-ranking language (e.g. "tinggi/rendah risiko") to stay inside
// the required disclaimer: recommendation classes are not calibrated future-risk classes.
export const tierPlainSummary: Record<number, string> = {
  99: 'Node referensi (pembanding), tidak ada rekomendasi otomatis untuk grid ini.',
  1: 'Prioritas tinjauan teknis tertinggi dalam sistem screening ini, bukan berarti "risiko paling tinggi". Perlu tinjauan gabungan lintas sistem hidrologi, kerentanan, dan tumpang-tindih kebijakan.',
  2: 'Grid ini teridentifikasi sebagai node bridge kritis jaringan hidrologi, perlu validasi lapangan tertarget.',
  3: 'Beberapa sinyal evidence muncul bersamaan di grid ini, perlu asesmen lapangan multi-aspek.',
  4: 'Satu jenis evidence signifikan ditemukan, cukup tindak lanjut pada konteks tersebut saja.',
  5: 'Fokus pemantauan jaringan dan perbaikan kualitas data, bukan tindak lanjut lapangan segera.',
};

export type StakeholderTag = {name: string; reason: string};

// Indicative grouping only: a presentation aid over existing authorized fields, not an
// authoritative institutional assignment. Kept out of the frozen source data on purpose.
export function relevantStakeholders(p: Properties): StakeholderTag[] {
  const tags: StakeholderTag[] = [];
  if (p.critical_cross_system_bridge || p.structural_bridge_candidate || p.administrative_hydrological_bridge)
    tags.push({name: 'Pengelola DAS / BBWS', reason: 'node bridge jaringan hidrologi'});
  if (p.high_susceptibility_primary)
    tags.push({name: 'BNPB / BPBD', reason: 'konteks kerentanan banjir retrospektif tinggi'});
  if (p.any_policy_overlap_primary)
    tags.push({name: 'Bappenas / dinas ESDM & perkebunan terkait', reason: 'tumpang-tindih kebijakan/izin'});
  if (p.coordination_scope === 'CROSS_DISTRICT_COORDINATION_RECOMMENDED')
    tags.push({name: 'Koordinasi lintas-Pemda / Bappenas', reason: 'cakupan koordinasi lintas kabupaten'});
  return tags;
}

export const coordinationScopeText: Record<string, string> = {
  CROSS_DISTRICT_COORDINATION_RECOMMENDED: 'Perlu koordinasi lintas kabupaten/kota karena keterkaitan jaringan hidrologi melewati batas wilayah administrasi.',
  LOCAL_OR_WITHIN_DISTRICT_TECHNICAL_FOLLOW_UP: 'Tindak lanjut teknis cukup dalam satu kabupaten/kota, tidak memerlukan koordinasi lintas wilayah.',
  REFERENCE_ONLY: 'Node referensi, tidak memerlukan koordinasi atau tindak lanjut.',
};

// Compact version of coordinationScopeText for the filter dropdown, where a full
// sentence per option doesn't fit.
export const coordinationScopeShortLabel: Record<string, string> = {
  CROSS_DISTRICT_COORDINATION_RECOMMENDED: 'Perlu koordinasi lintas kabupaten',
  LOCAL_OR_WITHIN_DISTRICT_TECHNICAL_FOLLOW_UP: 'Cukup dalam satu kabupaten',
  REFERENCE_ONLY: 'Referensi saja',
};

// Display-only Indonesian labels for the frozen field-name aliases in `metadata.aliases`.
// The underlying metadata.json is never modified; this only changes what components
// render for field labels (grid detail panel, filter dropdown, bridge-highlight cards).
export const aliasTranslation: Record<string, string> = {
  grid_id: 'ID Grid / Node',
  dashboard_recommendation_label: 'Kelas Rekomendasi',
  recommendation_level: 'Tingkat Rekomendasi',
  screening_target: 'Target Screening',
  admin_district_name: 'Kabupaten/Kota',
  admin_province_name: 'Provinsi',
  coordination_scope: 'Cakupan Koordinasi',
  susceptibility_percentile_01: 'Persentil Kerentanan Banjir Retrospektif',
  high_susceptibility_primary: 'Konteks Kerentanan Retrospektif Tinggi',
  any_policy_overlap_primary: 'Konteks Tumpang Tindih Kebijakan/Izin',
  max_policy_overlap_pct: 'Tumpang Tindih Kebijakan/Izin Maksimum (%)',
  critical_cross_system_bridge: 'Bridge Kritis Lintas-Sistem',
  structural_bridge_candidate: 'Kandidat Bridge Struktural',
  administrative_hydrological_bridge: 'Bridge Administratif-Hidrologis',
  recommendation_evidence: 'Evidence Screening',
  recommended_action_bundle: 'Paket Tindak Lanjut Teknis',
};

// Display-only Indonesian labels for the frozen gate/QA status enums in
// `metadata.gate`/`metadata.qa`. Falls back to the raw value when not listed here.
export const statusText: Record<string, string> = {
  PASS: 'Lulus',
  CONDITIONAL: 'Bersyarat',
  CLOSED_WITH_DOCUMENTED_LIMITATIONS: 'Ditutup dengan keterbatasan yang terdokumentasi',
  WEB_PRESENTATION_PACKAGE_READY: 'Paket presentasi web siap',
};

// Per-field plain-language meaning of a Yes/No evidence flag. A generic "Present/Not
// flagged" badge doesn't say what the field actually means on its own.
export const evidenceFieldText: Record<string, {yes: string; no: string}> = {
  critical_cross_system_bridge: {
    yes: 'Ya, grid ini adalah node penghubung kritis antar sub-sistem jaringan hidrologi yang berbeda.',
    no: 'Tidak, grid ini bukan node penghubung kritis antar sub-sistem.',
  },
  structural_bridge_candidate: {
    yes: 'Ya, grid ini berperan sebagai penghubung struktural dalam topologi jaringan (posisi yang sering dilalui rute antar-node).',
    no: 'Tidak, grid ini bukan kandidat penghubung struktural.',
  },
  administrative_hydrological_bridge: {
    yes: 'Ya, grid ini menghubungkan jaringan hidrologi lintas batas administrasi (kabupaten/provinsi).',
    no: 'Tidak, grid ini tidak menghubungkan jaringan lintas batas administrasi.',
  },
  high_susceptibility_primary: {
    yes: 'Ya, persentil kerentanan banjir retrospektif grid ini tergolong tinggi dibanding grid lain.',
    no: 'Tidak, persentil kerentanan banjir retrospektif grid ini tidak tergolong tinggi.',
  },
  any_policy_overlap_primary: {
    yes: 'Ya, area grid ini tumpang tindih dengan setidaknya satu izin/kebijakan (tambang atau sawit) yang tercatat.',
    no: 'Tidak, tidak ada tumpang tindih izin/kebijakan yang tercatat pada grid ini.',
  },
};

// Shared between the global SHAP summary (ShapSummary.tsx) and the per-grid
// SHAP explanation (GridShapExplanation.tsx), so both name the same four
// physical predictors the same way.
export const shapFeatureLabel: Record<string, string> = {
  slope_mean_deg: 'Kemiringan lahan (rata-rata, derajat)',
  max_event_antecedent_rainfall_3d_mm: 'Curah hujan antesenden 3 hari (mm)',
  max_event_antecedent_rainfall_7d_mm: 'Curah hujan antesenden 7 hari (mm)',
  distance_to_river_m: 'Jarak ke sungai (meter)',
};

// Display-only Indonesian rendering of the frozen claim boundary matrix, keyed by
// claim_id. The underlying data file (English, with internal pipeline references)
// is never modified; this only changes what MethodologyInfo.tsx renders on screen.
export const claimTranslation: Record<string, {claim: string; reason: string}> = {
  C01: {
    claim: 'Sistem ini mengidentifikasi target rekomendasi teknis berbasis screening.',
    reason: 'Didukung langsung oleh aturan rekomendasi dan penanda target yang sudah dibakukan.',
  },
  C02: {
    claim: 'Evidence node bridge jaringan hidrologi dapat digabungkan dengan kerentanan retrospektif dan konteks tumpang tindih kebijakan untuk keperluan screening.',
    reason: 'Sah sebagai screening multi-evidence; bukan bukti sebab-akibat atau rute jaringan DAS yang otoritatif.',
  },
  C03: {
    claim: 'Tumpang tindih izin tambang/sawit merepresentasikan konteks eksposur kebijakan.',
    reason: 'Tumpang tindih izin/lokasi tidak setara dengan jejak fisik tambang atau perkebunan yang teramati langsung.',
  },
  C04: {
    claim: 'Layer kerentanan ini adalah probabilitas banjir masa depan yang terkalibrasi.',
    reason: 'Implementasi saat ini adalah kerentanan banjir retrospektif, bukan probabilitas bencana final yang terkalibrasi.',
  },
  C05: {
    claim: 'Eksposur kebijakan/izin menyebabkan banjir pada node yang di-screening.',
    reason: 'Keterkaitan spasial/model dan tumpang tindih tidak membuktikan efek sebab-akibat dari kebijakan.',
  },
  C06: {
    claim: 'Rekomendasi R1/R2 mengesahkan moratorium, pencabutan izin, atau tindakan regulasi otomatis lainnya.',
    reason: 'Sistem ini murni dukungan keputusan teknis.',
  },
  C07: {
    claim: 'Skor IRC final dan persentase Kontribusi Kebijakan telah dihasilkan untuk pilot Mahakam.',
    reason: 'Keduanya masih ditangguhkan secara ilmiah dalam implementasi saat ini.',
  },
  C08: {
    claim: 'Pilot Mahakam adalah implementasi penelitian final yang mencakup seluruh tiga DAS.',
    reason: 'Mahakam adalah pilot yang sedang berjalan; cakupan penuh mencakup Mahakam, Musi, dan Larona, dengan Citarum untuk generalisasi.',
  },
};

// Display-only Indonesian rendering of the frozen `metadata.contract.legend[].label`
// strings, keyed by the exact frozen English title so `l.label` can be looked up directly.
export const recommendationTitleText: Record<string, string> = {
  'Reference / No Automated Recommendation': 'Node Referensi / Tanpa Rekomendasi Otomatis',
  'Integrated Cross-System Technical Review': 'Tinjauan Teknis Terintegrasi Lintas-Sistem',
  'Critical Bridge Targeted Validation': 'Validasi Tertarget Bridge Kritis',
  'Multi-Signal Site Assessment': 'Asesmen Lokasi Multi-Sinyal',
  'Single-Context Follow-Up': 'Tindak Lanjut Satu Konteks',
  'Network Monitoring & Data Improvement': 'Pemantauan Jaringan & Perbaikan Data',
};

// Display-only Indonesian rendering of the frozen `metadata.contract.legend[].interpretation`
// strings, keyed by `recommendation_level`.
export const legendInterpretationText: Record<number, string> = {
  1: "Tingkatan tinjauan teknis tertinggi dalam sistem screening ini; bukan berarti 'risiko sebab-akibat tertinggi'.",
  2: 'Tingkatan validasi tertarget.',
  3: 'Tindak lanjut screening multi-evidence.',
  4: 'Tindak lanjut screening satu konteks.',
  5: 'Tingkatan pemantauan/perbaikan data berorientasi jaringan.',
  99: 'Node referensi; tanpa rekomendasi otomatis.',
};

// The frozen per-grid recommendation label uses an em dash as separator ("R2 <dash>
// Critical Bridge Targeted Validation"). Built from a char code, not typed literally, so
// no em-dash character appears in this source file.
const LABEL_SEPARATOR = String.fromCharCode(8212);

// Translates the frozen per-grid recommendation label into Indonesian.
export function translateRecommendationLabel(raw: string): string {
  const sepIndex = raw.indexOf(LABEL_SEPARATOR);
  if (sepIndex === -1) return raw;
  const tierCode = raw.slice(0, sepIndex).trim();
  const title = raw.slice(sepIndex + 1).trim();
  return `${tierCode} · ${recommendationTitleText[title] ?? title}`;
}

const ACTION_CLAUSE_TEXT: Record<string, string> = {
  'Reference only; no automated technical-action recommendation':
    'Node referensi saja; tanpa rekomendasi tindakan teknis otomatis',
  'Pertahankan monitoring pada bridge network, perkuat validasi hydrological routing dan data pendukung, serta lakukan re-screening ketika evidence context baru tersedia':
    'Pertahankan monitoring pada bridge jaringan, perkuat validasi posisi hidrologis dan data pendukung, serta lakukan screening ulang ketika evidence konteks baru tersedia',
  'Validasi routing/hydrological position dengan evidence yang lebih authoritative sebelum membuat klaim upstream/downstream':
    'Validasi rute/posisi hidrologis dengan evidence yang lebih otoritatif sebelum membuat klaim hulu/hilir',
  'Gunakan hasil ini sebagai decision-support screening, bukan keputusan regulatif otomatis':
    'Gunakan hasil ini sebagai dukungan keputusan berbasis screening, bukan keputusan regulatif otomatis',
  'Koordinasikan review dengan administrasi yang terhubung melalui river-network edge terkait':
    'Koordinasikan tinjauan dengan administrasi yang terhubung melalui jaringan sungai terkait',
  'Lakukan follow-up terarah pada bridge dan context yang terdeteksi, tingkatkan monitoring, dan lengkapi evidence susceptibility atau policy context yang belum mendukung screening multi-sinyal':
    'Lakukan tindak lanjut terarah pada bridge dan konteks yang terdeteksi, tingkatkan monitoring, dan lengkapi evidence kerentanan atau konteks kebijakan yang belum mendukung screening multi-sinyal',
  'Verifikasi status dan interpretasi spatial policy/permit overlap; jangan menganggap overlap sebagai physical footprint':
    'Verifikasi status dan interpretasi tumpang tindih kebijakan/izin secara spasial; jangan menganggap tumpang tindih ini sebagai jejak fisik di lapangan',
  'Lakukan asesmen lokasi pada bridge multi-sinyal, verifikasi kondisi koridor sungai dan policy overlap, serta evaluasi kebutuhan mitigasi, restorasi, dan monitoring berbasis kondisi lokal':
    'Lakukan asesmen lokasi pada bridge multi-sinyal, verifikasi kondisi koridor sungai dan tumpang tindih kebijakan, serta evaluasi kebutuhan mitigasi, restorasi, dan monitoring berbasis kondisi lokal',
  'Lakukan validasi lapangan terhadap bridge kritis, verifikasi context susceptibility/policy yang tersedia, dan lengkapi evidence yang belum konvergen sebelum menentukan intervensi teknis lanjutan':
    'Lakukan validasi lapangan terhadap bridge kritis, verifikasi konteks kerentanan/kebijakan yang tersedia, dan lengkapi evidence yang belum konvergen sebelum menentukan intervensi teknis lanjutan',
  'Prioritaskan verifikasi lapangan terarah, review lintas-administrasi bila relevan, audit keterkaitan spasial policy/permit overlap, asesmen hidrologis lokal, serta penyusunan opsi mitigasi/restorasi berbasis kondisi lapangan':
    'Prioritaskan verifikasi lapangan terarah, tinjauan lintas-administrasi bila relevan, audit keterkaitan spasial tumpang tindih kebijakan/izin, asesmen hidrologis lokal, serta penyusunan opsi mitigasi/restorasi berbasis kondisi lapangan',
};

// Translates the frozen per-grid action-bundle text (a handful of composable Indonesian/
// English-mixed sentence clauses) into full Indonesian, clause by clause. Any sentence not
// in the lookup (e.g. from a future STEP54 rebuild) passes through untranslated rather than
// breaking the page.
export function translateActionBundle(raw: string): string {
  const sentences = raw.split('. ').map(s => s.replace(/\.$/, ''));
  return sentences.map(s => ACTION_CLAUSE_TEXT[s] ?? s).join('. ') + '.';
}

const EVIDENCE_CLAUSE_TEXT: Record<string, string> = {
  'critical cross-system bridge': 'Node bridge kritis lintas-sistem',
  'structural bridge candidate': 'Kandidat bridge struktural',
  'administrative hydrological bridge': 'Bridge administratif-hidrologis',
  'community-boundary node': 'Node batas antar-komunitas jaringan',
  'non-bridge reference node': 'Node referensi (bukan node bridge)',
  'flood susceptibility unavailable': 'Data kerentanan banjir tidak tersedia untuk grid ini',
  'no positive primary policy overlap': 'Tidak ada tumpang tindih izin tambang/sawit yang tercatat',
};

// Translates the frozen, pipe-delimited evidence string into a readable Indonesian list.
// The exact clause vocabulary here mirrors the upstream generator one-for-one, so every
// possible clause it can produce is covered and nothing falls through untranslated.
export function translateEvidence(raw: string): string[] {
  return raw.split('|').map(part => part.trim()).filter(Boolean).map(clause => {
    if (clause in EVIDENCE_CLAUSE_TEXT) return EVIDENCE_CLAUSE_TEXT[clause];
    const percentile = clause.match(/^flood susceptibility percentile=([\d.]+)$/);
    if (percentile) return `Persentil kerentanan banjir retrospektif: ${Math.round(Number(percentile[1]) * 100)}%`;
    const mining = clause.match(/^mining-policy overlap=([\d.]+)%$/);
    if (mining) return `Tumpang tindih izin tambang: ${mining[1]}% area grid`;
    const palm = clause.match(/^palm-policy overlap=([\d.]+)%$/);
    if (palm) return `Tumpang tindih izin lokasi sawit: ${palm[1]}% area grid`;
    return clause;
  });
}

/**
 * Menghasilkan narasi eksekutif berbasis bahasa manusia alami untuk petak yang dipilih.
 * Membantu juri dan pengguna awam memahami konteks petak dalam hitungan detik.
 */
export function generateGridExecutiveSummary(p: Properties): string {
  const district = p.admin_district_name ? String(p.admin_district_name) : 'Kawasan DAS';
  const province = p.admin_province_name ? String(p.admin_province_name) : 'Kalimantan Timur';
  const isHighSusc = !!p.high_susceptibility_primary;
  const suscPct = typeof p.susceptibility_percentile_01 === 'number' ? Math.round(p.susceptibility_percentile_01 * 100) : null;
  const overlapPct = typeof p.max_policy_overlap_pct === 'number' ? p.max_policy_overlap_pct : 0;
  const hasOverlap = !!p.any_policy_overlap_primary && overlapPct > 0;
  const isBridge = !!(p.critical_cross_system_bridge || p.structural_bridge_candidate || p.administrative_hydrological_bridge);
  const isCrossDistrict = p.coordination_scope === 'CROSS_DISTRICT_COORDINATION_RECOMMENDED';

  const parts: string[] = [];
  parts.push(`Petak ${p.grid_id} berada di ${district}, ${province}.`);

  if (isBridge && isHighSusc) {
    parts.push(`Lokasi ini memiliki signifikansi hidrologi ganda: berfungsi sebagai simpul aliran air strategis sekaligus mencatatkan riwayat kerentanan banjir tinggi${suscPct !== null ? ` (${suscPct}%)` : ''}.`);
  } else if (isBridge) {
    parts.push(`Petak ini berperan sebagai simpul jembatan hidrologis strategis yang menghubungkan jaringan aliran air lintas-wilayah.`);
  } else if (isHighSusc) {
    parts.push(`Karakteristik fisik petak ini menunjukkan riwayat kerentanan banjir tinggi${suscPct !== null ? ` (persentil ke-${suscPct})` : ''} berdasarkan data historis.`);
  } else {
    parts.push(`Karakteristik aliran air dan kerentanan pada petak ini berada pada ambang batas dasar pemantauan.`);
  }

  if (hasOverlap) {
    parts.push(`Teridentifikasi irisan konsesi tambang atau perkebunan sebesar ${overlapPct.toFixed(1)}% dari luasan petak, sehingga menjadi titik prioritas pengawasan tata ruang.`);
  }

  if (isCrossDistrict && hasOverlap) {
    parts.push(`Langkah prioritas yang disarankan adalah koordinasi bersama antar-kabupaten melibatkan DLH, Dinas ESDM, BPBD, dan Bappeda.`);
  } else if (isCrossDistrict) {
    parts.push(`Penanganan petak ini memerlukan koordinasi tata air terpadu lintas batas wilayah kabupaten guna melindungi kawasan hilir.`);
  } else if (hasOverlap) {
    parts.push(`Disarankan sinkronisasi berkala antara pengawas lingkungan hidup daerah dan instansi perizinan sektor ekstraktif.`);
  } else {
    parts.push(`Pemantauan berkala direkomendasikan melalui pos hidrometeorologi dan instansi pengelola DAS setempat.`);
  }

  return parts.join(' ');
}
