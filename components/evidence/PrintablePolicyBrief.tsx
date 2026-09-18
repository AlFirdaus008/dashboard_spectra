'use client';

import React, { useEffect } from 'react';
import type { Grid, Metadata } from '@/types/data';
import { colors, code } from '@/lib/data/client';
import { tierPlainSummary, recommendationTitleText } from '@/lib/data/vocabulary';
import { IconPrinter, IconClose } from '@/components/ui/Icons';
import BrandMark from '@/components/ui/BrandMark';
import { useMountTransition } from '@/lib/hooks/useMountTransition';

export interface DistrictStats {
  districtName: string;
  provinceName: string;
  totalGrids: number;
  priorityGrids: number;
  overlapGrids: number;
  overlapPct: string;
  bridgeGrids: number;
  crossDistrictGrids: number;
}

interface PrintablePolicyBriefProps {
  isOpen: boolean;
  onClose: () => void;
  grid?: Grid | null;
  districtStats?: DistrictStats | null;
  metadata?: Metadata | null;
}

function getCentroid(geometry: Grid['geometry']): { lat: string; lng: string } {
  try {
    if (geometry.type === 'Polygon' && geometry.coordinates?.[0]) {
      const ring = geometry.coordinates[0];
      let sumLng = 0;
      let sumLat = 0;
      for (const pt of ring) {
        sumLng += pt[0];
        sumLat += pt[1];
      }
      const avgLng = sumLng / ring.length;
      const avgLat = sumLat / ring.length;
      return {
        lng: `${avgLng.toFixed(4)}° BT`,
        lat: `${Math.abs(avgLat).toFixed(4)}° ${avgLat >= 0 ? 'LU' : 'LS'}`,
      };
    }
  } catch {
    // fallback if malformed geometry
  }
  return { lng: '116.8200° BT', lat: '0.4500° LS' };
}

export default function PrintablePolicyBrief({
  isOpen,
  onClose,
  grid,
  districtStats,
  metadata,
}: PrintablePolicyBriefProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const { shouldRender, isVisible } = useMountTransition(isOpen, 200);
  if (!shouldRender) return null;

  const handlePrint = () => {
    window.print();
  };

  const isGridBrief = !!grid;
  const p = grid?.properties;
  const coords = grid ? getCentroid(grid.geometry) : null;
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className={`policy-brief-overlay${isVisible ? ' is-visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Lembar Koordinasi Kebijakan"
    >
      {/* On-screen control bar */}
      <div className="policy-brief-toolbar no-print">
        <div className="toolbar-left">
          <span className="brief-mode-badge">
            {isGridBrief ? 'LEMBAR REKOMENDASI GRID' : 'RINGKASAN EKSEKUTIF KABUPATEN'}
          </span>
          <strong>{isGridBrief ? `Grid: ${p?.grid_id}` : `Kabupaten: ${districtStats?.districtName}`}</strong>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="btn-print-action" onClick={handlePrint}>
            <IconPrinter size={15} />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button type="button" className="btn-close-brief" onClick={onClose} aria-label="Tutup pratinjau">
            <span>Tutup</span>
            <IconClose size={13} />
          </button>
        </div>
      </div>

      {/* The Printable A4 Sheet */}
      <div className="policy-brief-sheet">
        {/* Document Header */}
        <header className="brief-header">
          <div className="brief-brand">
            <div className="brief-logo"><BrandMark /></div>
            <div>
              <span className="brief-sup">SISTEM PENDUKUNG KEPUTUSAN SPASIAL · BRINATHON</span>
              <h1 className="brief-title">LEMBAR REKOMENDASI KOORDINASI TEKNIS</h1>
              <span className="brief-sub">Daerah Aliran Sungai (DAS) Mahakam · Spatial Screening Platform</span>
            </div>
          </div>
          <div className="brief-meta-box">
            <div className="meta-row"><span>Status:</span> <strong>Screening Ilmiah (Non-Yudisial)</strong></div>
            <div className="meta-row"><span>Tanggal Dokumen:</span> <strong>{currentDate}</strong></div>
            <div className="meta-row"><span>Referensi Sistem:</span> <strong>EPSG:4326 · Grid 1×1 km</strong></div>
          </div>
        </header>

        <hr className="brief-divider" />

        {isGridBrief && p ? (
          /* ================================================================
             SECTION A: SINGLE GRID BRIEF
             ================================================================ */
          <div className="brief-body">
            {/* Identity & Priority Banner */}
            <div className="brief-grid-identity">
              <div className="identity-block">
                <span className="identity-label">IDENTIFIKASI TITIK SPASIAL</span>
                <div className="grid-code-display">
                  <strong>{p.grid_id}</strong>
                  <span className="tier-tag" style={{ backgroundColor: colors[p.recommendation_level] || '#258a87' }}>
                    {code(p.recommendation_level)} · {recommendationTitleText[String(p.dashboard_recommendation_label)] ?? String(p.dashboard_recommendation_label)}
                  </span>
                </div>
                <div className="identity-details">
                  <span>Wilayah Administrasi: <strong>{String(p.admin_district_name || '-')}, {String(p.admin_province_name || '-')}</strong></span>
                  <span>Koordinat Perkiraan: <strong>{coords?.lat}, {coords?.lng}</strong></span>
                  <span>Target Prioritas: <strong>{p.screening_target ? 'Ya (Target Screening Aktif)' : 'Node Referensi'}</strong></span>
                </div>
              </div>

              <div className="coordination-block">
                <span className="identity-label">CAKUPAN KOORDINASI PEMDA</span>
                <p className="coord-status">
                  {p.coordination_scope === 'CROSS_DISTRICT_COORDINATION_RECOMMENDED'
                    ? 'Perlu Koordinasi Lintas Kabupaten / Antar-Dinas'
                    : 'Penanganan Internal Satu Kabupaten / Dinas Terkait'}
                </p>
                <small>Berdasarkan letak titik terhadap batas yurisdiksi dan aliran hidrologi.</small>
              </div>
            </div>

            {/* Evidence & Screening Flags */}
            <div className="brief-section-title">BUKTI SPASIAL &amp; INDIKATOR PEMICU</div>
            <table className="brief-table">
              <thead>
                <tr>
                  <th>Indikator Screening</th>
                  <th>Status Terdeteksi</th>
                  <th>Penjelasan Kontekstual</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Tumpang Tindih Izin Tambang / Sawit</strong></td>
                  <td>
                    {p.any_policy_overlap_primary ? (
                      <span className="status-badge badge-warning">Terdeteksi ({Number(p.max_policy_overlap_pct || 0).toFixed(1)}%)</span>
                    ) : (
                      <span className="status-badge badge-neutral">Tidak Terdata</span>
                    )}
                  </td>
                  <td>Izin usaha pertambangan atau perkebunan beririsan dengan grid hulu ini (konteks eksposur kebijakan).</td>
                </tr>
                <tr>
                  <td><strong>Kerentanan Banjir Retrospektif</strong></td>
                  <td>
                    <span className={`status-badge ${p.high_susceptibility_primary ? 'badge-danger' : 'badge-neutral'}`}>
                      {Math.round(Number(p.susceptibility_percentile_01 || 0) * 100)}% Persentil
                    </span>
                  </td>
                  <td>Tingkat kerentanan relatif dibanding grid lain dalam pemodelan historis; bukan probabilitas masa depan.</td>
                </tr>
                <tr>
                  <td><strong>Peran Simpul Jaringan Hidrologi</strong></td>
                  <td>
                    {p.critical_cross_system_bridge || p.structural_bridge_candidate || p.administrative_hydrological_bridge ? (
                      <span className="status-badge badge-info">Simpul Kritis (Bridge)</span>
                    ) : (
                      <span className="status-badge badge-neutral">Aliran Reguler</span>
                    )}
                  </td>
                  <td>Titik transmisi debit air dan sedimentasi antar-subsistem atau batas kabupaten.</td>
                </tr>
              </tbody>
            </table>

            {/* Action Matrix by Agency */}
            <div className="brief-section-title">MATRIKS REKOMENDASI TINDAKAN LAPANGAN PER INSTANSI</div>
            <table className="brief-table action-matrix-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Instansi Penanggung Jawab</th>
                  <th style={{ width: '45%' }}>Rekomendasi Tindak Lanjut Teknis</th>
                  <th style={{ width: '30%' }}>Dasar Rujukan &amp; Target</th>
                </tr>
              </thead>
              <tbody>
                {p.any_policy_overlap_primary && (
                  <tr>
                    <td><strong>Dinas ESDM / Ditjen Minerba</strong><small>Sektor Pertambangan</small></td>
                    <td>Audit kepatuhan kolam pengendap sedimen (settling pond), periksa stabilitas lereng bukaan tambang, dan validasi koordinat izin aktif.</td>
                    <td>PP No. 26/2025 &amp; Batas Izin IUP Aktif</td>
                  </tr>
                )}
                <tr>
                  <td><strong>Dinas Lingkungan Hidup (DLH)</strong><small>Pengawasan Ekologis</small></td>
                  <td>Pemantauan baku mutu air sungai berkala, verifikasi sempadan sungai alami 50–100 m, serta evaluasi dokumen lingkungan (AMDAL/UKL-UPL).</td>
                  <td>Instrumen Pengendalian Pencemaran Air</td>
                </tr>
                {(p.high_susceptibility_primary || p.critical_cross_system_bridge) && (
                  <tr>
                    <td><strong>BPBD Kabupaten / Kota</strong><small>Kesiapsiagaan Kebencanaan</small></td>
                    <td>Pemasangan sensor peringatan dini ketinggian air di simpul hidrologi, sosialisasi jalur evakuasi pemukiman hilir, dan penetapan posko siaga banjir.</td>
                    <td>Rencana Kontinjensi Bencana Daerah</td>
                  </tr>
                )}
                {(p.critical_cross_system_bridge || p.structural_bridge_candidate) && (
                  <tr>
                    <td><strong>Balai Wilayah Sungai (BWS / PUPR)</strong><small>Pengelolaan Sumber Daya Air</small></td>
                    <td>Normalisasi sumbatan sedimen alur sungai utama dan inspeksi ketahanan tanggul penahan limpasan di simpul kritis.</td>
                    <td>Pola Pengelolaan SDA Wilayah Sungai Mahakam</td>
                  </tr>
                )}
                {p.coordination_scope === 'CROSS_DISTRICT_COORDINATION_RECOMMENDED' && (
                  <tr>
                    <td><strong>Bappeda &amp; Forum Lintas Pemda</strong><small>Sinkronisasi Kebijakan</small></td>
                    <td>Inisiasi rapat koordinasi lintas kabupaten (hulu-hilir) untuk sinkronisasi rencana tata ruang wilayah (RTRW) berbasis satu DAS.</td>
                    <td>Penyelarasan Rencana Aksi Daerah</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : districtStats ? (
          /* ================================================================
             SECTION B: DISTRICT EXECUTIVE BRIEF
             ================================================================ */
          <div className="brief-body">
            <div className="district-header-card">
              <div>
                <span className="identity-label">YURISDIKSI ADMINISTRATIF</span>
                <h2 className="district-headline">{districtStats.districtName}</h2>
                <span className="district-province">Provinsi {districtStats.provinceName} · Wilayah Tangkapan DAS Mahakam</span>
              </div>
              <div className="district-quick-kpi">
                <strong>{districtStats.priorityGrids}</strong>
                <span>Grid Target Prioritas</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="district-metrics-row">
              <div className="d-metric-box">
                <span className="d-label">Total Grid Wilayah</span>
                <strong className="d-val">{districtStats.totalGrids.toLocaleString('id-ID')}</strong>
                <small>Petak 1×1 km terdata</small>
              </div>
              <div className="d-metric-box">
                <span className="d-label">Target Screening</span>
                <strong className="d-val highlight-val">{districtStats.priorityGrids.toLocaleString('id-ID')}</strong>
                <small>Memerlukan koordinasi teknis</small>
              </div>
              <div className="d-metric-box">
                <span className="d-label">Beririsan Izin Tambang/Sawit</span>
                <strong className="d-val">{districtStats.overlapPct}%</strong>
                <small>{districtStats.overlapGrids} grid terdaftar konsesi</small>
              </div>
              <div className="d-metric-box">
                <span className="d-label">Simpul Kritis Lintas Batas</span>
                <strong className="d-val">{districtStats.bridgeGrids}</strong>
                <small>Simpul penghubung hidrologi</small>
              </div>
            </div>

            {/* Institutional Action Directives */}
            <div className="brief-section-title">PETUNJUK TINDAKAN TERKOORDINASI UNTUK PERANGKAT DAERAH</div>
            <table className="brief-table action-matrix-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Organisasi Perangkat Daerah</th>
                  <th style={{ width: '45%' }}>Agenda Koordinasi &amp; Tindak Lanjut</th>
                  <th style={{ width: '30%' }}>Fokus Sasaran Wilayah</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Dinas ESDM</strong></td>
                  <td>Inspeksi bersama tim teknis ke titik konsesi tambang batubara aktif di wilayah hulu. Prioritaskan audit tampungan kolam sedimen untuk mencegah luapan lumpur ke anak sungai.</td>
                  <td>{districtStats.overlapGrids} grid dengan tumpang tindih izin konsesi</td>
                </tr>
                <tr>
                  <td><strong>Dinas Lingkungan Hidup (DLH)</strong></td>
                  <td>Pemantauan kualitas air dan penegakan batas sempadan sungai. Laporkan penurunan vegetasi penahan limpasan kepada forum koordinasi DAS.</td>
                  <td>Koridor sungai utama dan sempadan anak sungai</td>
                </tr>
                <tr>
                  <td><strong>BPBD Kabupaten / Kota</strong></td>
                  <td>Uji kelayakan jalur komunikasi peringatan dini dengan BPBD kabupaten tetangga dan BMKG. Petakan kawasan pemukiman yang berada di bawah simpul hidrologi kritis.</td>
                  <td>{districtStats.bridgeGrids} simpul aliran penghubung berisiko</td>
                </tr>
                <tr>
                  <td><strong>Bappeda Kabupaten / Kota</strong></td>
                  <td>Penyusunan nota kesepakatan penataan ruang terpadu DAS Mahakam dalam penyusunan revisi RTRW dan RPJMD kabupaten.</td>
                  <td>Sinkronisasi kebijakan wilayah hulu-hilir</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Verification & Sign-off Block for Meetings */}
        <div className="brief-signoff">
          <div className="signoff-heading">KOLOM PARAF &amp; VERIFIKASI KOORDINASI LAPANGAN</div>
          <div className="signoff-grid">
            <div className="signoff-box">
              <span className="box-title">Perwakilan Bappeda</span>
              <div className="sign-line" />
              <small>Nama / NIP: .......................................</small>
            </div>
            <div className="signoff-box">
              <span className="box-title">Perwakilan Dinas ESDM</span>
              <div className="sign-line" />
              <small>Nama / NIP: .......................................</small>
            </div>
            <div className="signoff-box">
              <span className="box-title">Perwakilan DLH</span>
              <div className="sign-line" />
              <small>Nama / NIP: .......................................</small>
            </div>
            <div className="signoff-box">
              <span className="box-title">Perwakilan BPBD</span>
              <div className="sign-line" />
              <small>Nama / NIP: .......................................</small>
            </div>
          </div>
        </div>

        {/* Legal & Scientific Disclaimer Footer */}
        <footer className="brief-footer">
          <p className="brief-footer-id">
            <strong>Batasan Ilmiah Resmi:</strong> Dokumen ini adalah lembar kerja pendukung keputusan berdasarkan pemodelan screening spasial DAS Mahakam.
            Tingkatan rekomendasi (R1–R5) bukan kelas kepastian bencana masa depan, tumpang tindih izin bukan bukti pelanggaran hukum fisik, dan
            keterkaitan spasial bukan bukti sebab-akibat. Keputusan regulasi final tetap menjadi kewenangan instansi yang sah.
          </p>
          <p lang="en" className="brief-footer-en">
            <em>{metadata?.contract?.required_disclaimer ?? 'Screening-based decision support for the Mahakam pilot. Recommendation classes are not calibrated future-risk classes, policy/permit overlap is not physical footprint, and spatial/model association does not establish causality or authorize regulatory action.'}</em>
          </p>
          <div className="brief-footer-sub">
            <span>Platform Riset SPECTRA · BRINATHON 2026</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
