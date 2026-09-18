'use client';

import React from 'react';
import type { Properties } from '@/types/data';

interface AgencyActionMatrixProps {
  properties: Properties;
  onOpenPrintBrief: () => void;
}

export default function AgencyActionMatrix({
  properties: p,
  onOpenPrintBrief,
}: AgencyActionMatrixProps) {
  const hasOverlap = !!p.any_policy_overlap_primary;
  const hasHighSusceptibility = !!p.high_susceptibility_primary;
  const isBridge = !!(p.critical_cross_system_bridge || p.structural_bridge_candidate || p.administrative_hydrological_bridge);
  const isCrossDistrict = p.coordination_scope === 'CROSS_DISTRICT_COORDINATION_RECOMMENDED';

  return (
    <div className="agency-action-matrix">
      <div className="matrix-header">
        <div>
          <span className="section-kicker">PANDUAN PRAKTIS INSTANSI</span>
          <h4>Matriks Aksi Berdasarkan Instansi</h4>
        </div>
        <button
          type="button"
          className="btn-print-shortcut"
          onClick={onOpenPrintBrief}
          title="Buka dan cetak lembar rekomendasi 1 halaman untuk rapat koordinasi"
        >
          <span aria-hidden="true">⎙</span> Cetak Lembar Koordinasi
        </button>
      </div>

      <p className="matrix-intro">
        Panduan langkah kerja teknis terpadu yang dirancang siap pakai untuk koordinasi lintas dinas di lapangan:
      </p>

      <div className="agency-cards-list">
        {/* Dinas ESDM */}
        <div className={`agency-card ${hasOverlap ? 'is-prioritized' : 'is-monitoring'}`}>
          <div className="agency-card-top">
            <div className="agency-identity">
              <span className="agency-tag tag-esdm">Dinas ESDM</span>
              <span className="agency-status-pill">
                {hasOverlap ? 'Fokus Lapangan Prioritas' : 'Pemantauan Berkala'}
              </span>
            </div>
            {hasOverlap && (
              <span className="agency-evidence-badge">
                Tumpang Tindih {Number(p.max_policy_overlap_pct || 0).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="agency-action-text">
            <strong>Tindakan Teknis:</strong> Audit kepatuhan kolam pengendap sedimen (*settling pond*) pada konsesi tambang hulu, inspeksi stabilitas lereng disposal batubara, dan verifikasi kepatuhan koordinat izin IUP aktif.
          </p>
        </div>

        {/* Dinas Lingkungan Hidup (DLH) */}
        <div className="agency-card is-prioritized">
          <div className="agency-card-top">
            <div className="agency-identity">
              <span className="agency-tag tag-dlh">Dinas Lingkungan Hidup</span>
              <span className="agency-status-pill">Pengawasan Ekologis</span>
            </div>
            <span className="agency-evidence-badge">AMDAL &amp; Koridor Sungai</span>
          </div>
          <p className="agency-action-text">
            <strong>Tindakan Teknis:</strong> Pengujian baku mutu air sungai secara periodik (kadar TSS dan logam terlarut), penegakan sempadan vegetasi alami sungai 50–100 m, dan evaluasi izin lingkungan.
          </p>
        </div>

        {/* Badan Penanggulangan Bencana Daerah (BPBD) */}
        <div className={`agency-card ${(hasHighSusceptibility || isBridge) ? 'is-prioritized' : 'is-monitoring'}`}>
          <div className="agency-card-top">
            <div className="agency-identity">
              <span className="agency-tag tag-bpbd">BPBD Kabupaten/Kota</span>
              <span className="agency-status-pill">
                {(hasHighSusceptibility || isBridge) ? 'Kesiapsiagaan Dini' : 'Pemantauan Jaringan'}
              </span>
            </div>
            {hasHighSusceptibility && (
              <span className="agency-evidence-badge">
                Kerentanan {Math.round(Number(p.susceptibility_percentile_01 || 0) * 100)}%
              </span>
            )}
          </div>
          <p className="agency-action-text">
            <strong>Tindakan Teknis:</strong> Pemasangan sensor dini ketinggian air (Early Warning System) di simpul aliran, penetapan jalur evakuasi pemukiman hilir, dan koordinasi frekuensi informasi darurat banjir.
          </p>
        </div>

        {/* Balai Wilayah Sungai (BWS / PUPR) */}
        {isBridge && (
          <div className="agency-card is-prioritized">
            <div className="agency-card-top">
              <div className="agency-identity">
                <span className="agency-tag tag-bws">BWS Kalimantan IV (PUPR)</span>
                <span className="agency-status-pill">Infrastruktur SDA</span>
              </div>
              <span className="agency-evidence-badge">Simpul Bridge Kritis</span>
            </div>
            <p className="agency-action-text">
              <strong>Tindakan Teknis:</strong> Pengerukan sedimentasi pada titik temu anak sungai utama serta pemeliharaan tanggul hidrologi penahan debit banjir lintas-subsistem.
            </p>
          </div>
        )}

        {/* Bappeda & Lintas Pemda */}
        {isCrossDistrict && (
          <div className="agency-card is-coordination">
            <div className="agency-card-top">
              <div className="agency-identity">
                <span className="agency-tag tag-bappeda">Bappeda &amp; Lintas Pemda</span>
                <span className="agency-status-pill">Koordinasi Antar-Daerah</span>
              </div>
              <span className="agency-evidence-badge">Lintas Batas Yurisdiksi</span>
            </div>
            <p className="agency-action-text">
              <strong>Tindakan Teknis:</strong> Inisiasi forum koordinasi bersama kabupaten tetangga (hulu-hilir) untuk sinkronisasi RTRW dan perjanjian bagi-beban mitigasi daerah aliran sungai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
