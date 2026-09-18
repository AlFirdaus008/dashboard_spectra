'use client';

import React, { useState, useMemo } from 'react';
import { useExplorer } from '@/components/dashboard/ExplorerProvider';
import PrintablePolicyBrief, { type DistrictStats } from '@/components/evidence/PrintablePolicyBrief';
import { loadPlaces, type Place } from '@/lib/data/places';
import { IconPrinter, IconFocus, IconClose } from '@/components/ui/Icons';

const DISTRICT_PROVINCES: Record<string, string> = {
  'Kutai Kartanegara': 'Kalimantan Timur',
  'Kota Samarinda': 'Kalimantan Timur',
  'Kutai Barat': 'Kalimantan Timur',
  'Kutai Timur': 'Kalimantan Timur',
  'Mahakam Ulu': 'Kalimantan Timur',
  'Penajam Paser Utara': 'Kalimantan Timur',
  'Malinau': 'Kalimantan Utara',
  'Murung Raya': 'Kalimantan Tengah',
};

export default function DistrictBrief() {
  const { metadata, filters, setFilters, filtered, flyToPlace } = useExplorer();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    loadPlaces().then(p => { if (!cancelled) setPlaces(p); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const selectedDistrict = filters.admin_district_name || '';

  // Calculate statistics for the selected district based on features in the collection
  const districtStats = useMemo<DistrictStats | null>(() => {
    if (!selectedDistrict) return null;

    const districtFeatures = filtered.features.filter(
      f => f.properties.admin_district_name === selectedDistrict
    );

    const totalGrids = districtFeatures.length;
    const priorityGrids = districtFeatures.filter(f => f.properties.screening_target).length;
    const overlapGrids = districtFeatures.filter(f => f.properties.any_policy_overlap_primary).length;
    const overlapPct = totalGrids > 0 ? ((overlapGrids / totalGrids) * 100).toFixed(1) : '0';
    const bridgeGrids = districtFeatures.filter(f =>
      f.properties.critical_cross_system_bridge ||
      f.properties.structural_bridge_candidate ||
      f.properties.administrative_hydrological_bridge
    ).length;
    const crossDistrictGrids = districtFeatures.filter(f =>
      f.properties.coordination_scope === 'CROSS_DISTRICT_COORDINATION_RECOMMENDED'
    ).length;

    return {
      districtName: selectedDistrict,
      provinceName: DISTRICT_PROVINCES[selectedDistrict] || 'Kalimantan Timur',
      totalGrids,
      priorityGrids,
      overlapGrids,
      overlapPct,
      bridgeGrids,
      crossDistrictGrids,
    };
  }, [filtered, selectedDistrict]);

  const handleSelectDistrict = (districtName: string) => {
    if (districtName === selectedDistrict) {
      // Toggle off
      setFilters(prev => ({ ...prev, admin_district_name: '' }));
    } else {
      setFilters(prev => ({ ...prev, admin_district_name: districtName }));
      // Automatically fly to the district if place found
      const match = places.find(p => p.kind === 'kabupaten' && p.name.toLowerCase().includes(districtName.toLowerCase()));
      if (match) {
        flyToPlace(match.bbox);
      }
    }
  };

  const handleFocusMap = () => {
    if (!selectedDistrict) return;
    const match = places.find(p => p.kind === 'kabupaten' && p.name.toLowerCase().includes(selectedDistrict.toLowerCase()));
    if (match) {
      flyToPlace(match.bbox);
    }
  };

  const districtList = metadata.options.admin_district_name || [
    'Kutai Kartanegara',
    'Kota Samarinda',
    'Kutai Barat',
    'Kutai Timur',
    'Mahakam Ulu',
    'Penajam Paser Utara',
    'Malinau',
    'Murung Raya',
  ];

  return (
    <section className="district-brief-section" aria-label="Ringkasan Eksekutif per Kabupaten/Kota">
      <div className="district-selector-bar">
        <div className="district-selector-header">
          <div className="d-title-group">
            <span className="section-kicker">PROFIL YURISDIKSI PEMDA</span>
            <h3>Ringkasan Eksekutif per Kabupaten/Kota (Executive District Brief)</h3>
          </div>
          <span className="district-hint-text">
            Pilih kabupaten untuk melihat indikator dampak langsung dan kontak koordinasi dinas:
          </span>
        </div>

        {/* Quick district selector pills */}
        <div className="district-pills-row" role="group" aria-label="Pilih Kabupaten / Kota">
          <button
            type="button"
            className={`district-pill ${!selectedDistrict ? 'is-active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, admin_district_name: '' }))}
          >
            Seluruh DAS Mahakam
          </button>
          {districtList.map(dist => (
            <button
              key={dist}
              type="button"
              className={`district-pill ${selectedDistrict === dist ? 'is-active' : ''}`}
              onClick={() => handleSelectDistrict(dist)}
            >
              {dist}
            </button>
          ))}
        </div>
      </div>

      {/* When a district is selected, display the Executive Brief Card */}
      {districtStats && (
        <div key={districtStats.districtName} className="district-brief-card animate-popup">
          <div className="d-card-header">
            <div>
              <div className="d-badge-row">
                <span className="d-region-badge">Kabupaten / Kota Terpilih</span>
                <span className="d-province-tag">Provinsi {districtStats.provinceName}</span>
              </div>
              <h4 className="d-region-name">{districtStats.districtName}</h4>
            </div>

            <div className="d-card-actions">
              <button
                type="button"
                className="btn-print-district"
                onClick={() => setIsPrintModalOpen(true)}
                title="Cetak lembar koordinasi ringkas untuk bahan rapat lintas dinas"
              >
                <IconPrinter size={14} />
                <span>Cetak Lembar Koordinasi</span>
              </button>
              <button
                type="button"
                className="btn-focus-district"
                onClick={handleFocusMap}
                title="Arahkan peta ke wilayah ini"
              >
                <span>Arahkan Peta</span>
                <IconFocus size={13} />
              </button>
              <button
                type="button"
                className="btn-dismiss-district"
                onClick={() => setFilters(prev => ({ ...prev, admin_district_name: '' }))}
                aria-label="Tutup ringkasan kabupaten"
              >
                <IconClose size={13} />
              </button>
            </div>
          </div>

          {/* 4 Executive Metrics */}
          <div className="d-metrics-grid">
            <div className="d-metric-item">
              <span className="d-m-label">Target Screening Prioritas</span>
              <strong className="d-m-value highlight-teal">{districtStats.priorityGrids.toLocaleString('id-ID')} Grid</strong>
              <small className="d-m-desc">Memerlukan tinjauan dan tindak lanjut teknis</small>
            </div>

            <div className="d-metric-item">
              <span className="d-m-label">Beririsan Izin Tambang / Sawit</span>
              <strong className="d-m-value highlight-amber">{districtStats.overlapPct}% Area</strong>
              <small className="d-m-desc">{districtStats.overlapGrids} grid terdaftar konsesi hulu</small>
            </div>

            <div className="d-metric-item">
              <span className="d-m-label">Simpul Kritis Jaringan Hidrologi</span>
              <strong className="d-m-value highlight-cyan">{districtStats.bridgeGrids} Simpul</strong>
              <small className="d-m-desc">Titik penentu kelancaran aliran antar-sistem</small>
            </div>

            <div className="d-metric-item">
              <span className="d-m-label">Kebutuhan Koordinasi Lintas Batas</span>
              <strong className="d-m-value highlight-purple">{districtStats.crossDistrictGrids} Titik</strong>
              <small className="d-m-desc">Keterkaitan hidrologi melewati batas kabupaten</small>
            </div>
          </div>

          {/* Institutional Contact & Action Directives */}
          <div className="d-agencies-box">
            <strong>Instansi Kunci yang Perlu Dihubungi untuk Koordinasi Lapangan:</strong>
            <div className="d-agencies-list">
              <div className="d-agency-item">
                <span className="badge-agency esdm">Dinas ESDM</span>
                <p>Pengawasan kolam pengendap sedimen (settling pond) konsesi tambang batubara aktif di wilayah tangkapan hulu.</p>
              </div>
              <div className="d-agency-item">
                <span className="badge-agency dlh">Dinas Lingkungan Hidup</span>
                <p>Pemantauan kualitas air sungai dan penegakan batas sempadan vegetasi sungai penahan lumpur.</p>
              </div>
              <div className="d-agency-item">
                <span className="badge-agency bpbd">BPBD Kabupaten</span>
                <p>Pemasangan sensor dini ketinggian air di simpul hidrologi rawan dan kesiapsiagaan jalur evakuasi warga.</p>
              </div>
              <div className="d-agency-item">
                <span className="badge-agency bappeda">Bappeda &amp; Forum Lintas Pemda</span>
                <p>Penyelarasan tata ruang (RTRW) berbasis satu Daerah Aliran Sungai bersama kabupaten tetangga.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for One-Page Printable Policy Brief */}
      <PrintablePolicyBrief
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        districtStats={districtStats}
        metadata={metadata}
      />
    </section>
  );
}
