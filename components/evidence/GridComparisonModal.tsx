'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Grid, Metadata } from '@/types/data';
import { colors, code } from '@/lib/data/client';
import { useMountTransition } from '@/lib/hooks/useMountTransition';
import {
  tierPlainSummary,
  translateRecommendationLabel,
  coordinationScopeText,
  relevantStakeholders,
} from '@/lib/data/vocabulary';
import {
  IconScale,
  IconSearch,
  IconClose,
  IconSwap,
  IconFocus,
  IconLightbulb,
} from '@/components/ui/Icons';

interface GridComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGridA?: Grid | null;
  allGrids: Grid[];
  metadata: Metadata;
  onFocusGridOnMap?: (grid: Grid) => void;
}

// Preset definitions using verified canonical targets
const PRESET_PAIRS = [
  {
    id: 'hulu-mining-vs-hilir-flood',
    name: 'Hulu Tambang (Kubar) vs Hilir Rawan Banjir (Samarinda)',
    subtitle: 'Rekomendasi Utama: Kontras antara perizinan hulu dan akumulasi risiko banjir hilir',
    idA: 'MHK_R0237_C0166', // Kutai Barat: 100% overlap, R4
    idB: 'MHK_R0262_C0367', // Kota Samarinda: 94% susceptibility, 0% overlap, R4
  },
  {
    id: 'cross-boundary-bridge-vs-mouth',
    name: 'Simpul Kritis Lintas Batas (Kubar) vs Kawasan Muara (Samarinda)',
    subtitle: 'Konektivitas hidrologi perbatasan lintas kabupaten versus hilir muara',
    idA: 'MHK_R0226_C0260', // Kutai Barat: R2, Cross-system bridge, 100% overlap
    idB: 'MHK_R0270_C0362', // Kota Samarinda: R5, aliran muara
  },
  {
    id: 'highest-priority-vs-middle-basin',
    name: 'Target Prioritas R1 (Kutim) vs Simpul Hilir (Kukar)',
    subtitle: 'Poin prioritas screening tertinggi bersanding dengan simpul perbatasan penyangga hilir',
    idA: 'MHK_R0180_C0329', // Kutai Timur: R1, 98% susc, 19.4% overlap, bridge
    idB: 'MHK_R0225_C0260', // Kutai Kartanegara: R2, bridge perbatasan
  },
];

function getDistrictZone(districtName: string): string {
  const name = districtName.toLowerCase();
  if (name.includes('mahakam ulu') || name.includes('malinau') || name.includes('murung')) return 'Kawasan Hulu Pedalaman';
  if (name.includes('kutai barat')) return 'Kawasan Hulu';
  if (name.includes('kutai timur')) return 'Kawasan Tengah / Hulu Sub-DAS';
  if (name.includes('kutai kartanegara')) return 'Kawasan Tengah / Pesisir Hilir';
  if (name.includes('samarinda')) return 'Kawasan Hilir Perkotaan / Muara';
  return 'Wilayah Aliran Sungai';
}

export default function GridComparisonModal({
  isOpen,
  onClose,
  initialGridA,
  allGrids,
  metadata,
  onFocusGridOnMap,
}: GridComparisonModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('hulu-mining-vs-hilir-flood');
  const [gridAId, setGridAId] = useState<string>('MHK_R0237_C0166');
  const [gridBId, setGridBId] = useState<string>('MHK_R0262_C0367');
  const [searchTermA, setSearchTermA] = useState<string>('');
  const [searchTermB, setSearchTermB] = useState<string>('');

  // When opened with an initial grid, slot it into Grid A
  useEffect(() => {
    if (isOpen) {
      if (initialGridA) {
        setGridAId(initialGridA.properties.grid_id);
        // If initial grid is in Samarinda (hilir), slot a default hulu in B, else slot Samarinda in B
        const isHilir = String(initialGridA.properties.admin_district_name || '').toLowerCase().includes('samarinda');
        if (isHilir) {
          setGridBId('MHK_R0237_C0166'); // Kubar hulu
        } else {
          setGridBId('MHK_R0262_C0367'); // Samarinda hilir
        }
        setSelectedPreset('');
      } else {
        // Default to preset 1
        setGridAId('MHK_R0237_C0166');
        setGridBId('MHK_R0262_C0367');
        setSelectedPreset('hulu-mining-vs-hilir-flood');
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, initialGridA, onClose]);

  // Lookup map for fast O(1) grid retrieval
  const gridMap = useMemo(() => {
    const map = new Map<string, Grid>();
    for (const g of allGrids) {
      map.set(g.properties.grid_id, g);
    }
    return map;
  }, [allGrids]);

  const gridA = gridMap.get(gridAId) || (initialGridA?.properties.grid_id === gridAId ? initialGridA : null) || allGrids[0] || null;
  const gridB = gridMap.get(gridBId) || allGrids[1] || null;

  // Filter candidate grid options for search dropdowns (unconditional hooks before any return)
  const filteredOptionsA = useMemo(() => {
    let list = allGrids;
    if (searchTermA.trim()) {
      const q = searchTermA.toLowerCase();
      list = allGrids.filter(g =>
        g.properties.grid_id.toLowerCase().includes(q) ||
        String(g.properties.admin_district_name || '').toLowerCase().includes(q)
      );
    }
    const sliced = list.slice(0, 25);
    // Ensure currently selected gridA is always in the options list
    if (gridA && !sliced.some(g => g.properties.grid_id === gridA.properties.grid_id)) {
      return [gridA, ...sliced];
    }
    return sliced;
  }, [allGrids, searchTermA, gridA]);

  const filteredOptionsB = useMemo(() => {
    let list = allGrids;
    if (searchTermB.trim()) {
      const q = searchTermB.toLowerCase();
      list = allGrids.filter(g =>
        g.properties.grid_id.toLowerCase().includes(q) ||
        String(g.properties.admin_district_name || '').toLowerCase().includes(q)
      );
    }
    const sliced = list.slice(0, 25);
    // Ensure currently selected gridB is always in the options list
    if (gridB && !sliced.some(g => g.properties.grid_id === gridB.properties.grid_id)) {
      return [gridB, ...sliced];
    }
    return sliced;
  }, [allGrids, searchTermB, gridB]);

  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_PAIRS.find(p => p.id === presetId);
    if (!preset) return;
    setSelectedPreset(preset.id);
    setGridAId(preset.idA);
    setGridBId(preset.idB);
  };

  const handleSwap = () => {
    setGridAId(gridBId);
    setGridBId(gridAId);
    setSelectedPreset('');
  };

  const { shouldRender, isVisible } = useMountTransition(isOpen, 200);
  if (!shouldRender) return null;

  const pA = gridA?.properties;
  const pB = gridB?.properties;

  const overlapPctA = pA ? (typeof pA.max_policy_overlap_pct === 'number' ? pA.max_policy_overlap_pct : 0) : 0;
  const overlapPctB = pB ? (typeof pB.max_policy_overlap_pct === 'number' ? pB.max_policy_overlap_pct : 0) : 0;

  const suscPctA = pA ? (typeof pA.susceptibility_percentile_01 === 'number' ? Math.round(pA.susceptibility_percentile_01 * 100) : 0) : 0;
  const suscPctB = pB ? (typeof pB.susceptibility_percentile_01 === 'number' ? Math.round(pB.susceptibility_percentile_01 * 100) : 0) : 0;

  const stakeholdersA = pA ? relevantStakeholders(pA) : [];
  const stakeholdersB = pB ? relevantStakeholders(pB) : [];

  return (
    <div
      className={`policy-brief-overlay${isVisible ? ' is-visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      <div className="compare-modal-container">
        {/* Top Bar */}
        <div className="compare-header">
          <div>
            <div className="d-badge-row">
              <span className="d-region-badge">
                <IconScale size={12} />
                <span>Fitur Komparasi Dua Titik</span>
              </span>
              <span className="d-province-tag">Analisis Spasial Komparatif Hulu vs Hilir</span>
            </div>
            <h3 id="compare-modal-title" className="compare-title">
              Komparasi Karakteristik Titik Spasial DAS Mahakam
            </h3>
            <p className="compare-subtitle">
              Bandingkan dua grid secara berdampingan untuk melihat disparitas tutupan izin tambang/sawit hulu, tingkat kerentanan banjir hilir, serta kebutuhan koordinasi lintas instansi.
            </p>
          </div>

          <button
            type="button"
            className="btn-dismiss-district"
            onClick={onClose}
            aria-label="Tutup jendela komparasi"
          >
            <IconClose size={13} />
          </button>
        </div>

        {/* Quick Preset Buttons */}
        <div className="compare-presets-bar">
          <span className="preset-label">Skenario Komparasi Cepat:</span>
          <div className="preset-buttons-group">
            {PRESET_PAIRS.map(preset => (
              <button
                key={preset.id}
                type="button"
                className={`preset-pill-btn ${selectedPreset === preset.id ? 'is-active' : ''}`}
                onClick={() => handleApplyPreset(preset.id)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Grid Selector Toolbar with structured layout */}
        <div className="compare-selectors-bar">
          {/* Column A Card */}
          <div className="selector-box box-a">
            <div className="selector-box-header">
              <div className="selector-title-group">
                <span className="selector-tag tag-a">Titik Pertama (Grid A)</span>
                <span className="selector-role-hint">Fokus Hulu / Titik Acuan</span>
              </div>
              {pA && (
                <span className="selector-active-badge">
                  {pA.grid_id} : {String(pA.admin_district_name || 'DAS')}
                </span>
              )}
            </div>

            <div className="selector-fields-stack">
              <div className="search-input-wrap">
                <span className="search-icon" aria-hidden="true">
                  <IconSearch size={13} />
                </span>
                <input
                  id="search-grid-a"
                  type="text"
                  placeholder="Ketik filter (misal: Kutai Barat, MHK...)"
                  value={searchTermA}
                  onChange={e => setSearchTermA(e.target.value)}
                  className="selector-search-input"
                />
                {searchTermA && (
                  <button
                    type="button"
                    className="btn-clear-search"
                    onClick={() => setSearchTermA('')}
                    title="Hapus pencarian A"
                  >
                    <IconClose size={11} />
                  </button>
                )}
              </div>

              <div className="select-dropdown-wrap">
                <select
                  id="select-grid-a"
                  className="selector-select-dropdown"
                  value={gridAId}
                  onChange={e => {
                    setGridAId(e.target.value);
                    setSelectedPreset('');
                  }}
                  aria-label="Pilih Grid A dari daftar"
                >
                  {filteredOptionsA.map(g => (
                    <option key={g.properties.grid_id} value={g.properties.grid_id}>
                      {g.properties.grid_id} : {g.properties.admin_district_name || 'DAS'} (Tier {code(g.properties.recommendation_level)})
                    </option>
                  ))}
                  {filteredOptionsA.length === 0 && (
                    <option disabled>Tidak ada grid yang sesuai pencarian</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Swap Button (Centered Column) */}
          <div className="swap-btn-container">
            <button
              type="button"
              className="btn-swap-grids"
              onClick={handleSwap}
              title="Tukar posisi Grid A dan Grid B"
              aria-label="Tukar posisi Grid A dan Grid B"
            >
              <IconSwap size={14} className="swap-icon" />
              <span className="swap-label">Tukar</span>
            </button>
          </div>

          {/* Column B Card */}
          <div className="selector-box box-b">
            <div className="selector-box-header">
              <div className="selector-title-group">
                <span className="selector-tag tag-b">Titik Kedua (Grid B)</span>
                <span className="selector-role-hint">Fokus Hilir / Pembanding</span>
              </div>
              {pB && (
                <span className="selector-active-badge">
                  {pB.grid_id} : {String(pB.admin_district_name || 'DAS')}
                </span>
              )}
            </div>

            <div className="selector-fields-stack">
              <div className="search-input-wrap">
                <span className="search-icon" aria-hidden="true">
                  <IconSearch size={13} />
                </span>
                <input
                  id="search-grid-b"
                  type="text"
                  placeholder="Ketik filter (misal: Samarinda, MHK...)"
                  value={searchTermB}
                  onChange={e => setSearchTermB(e.target.value)}
                  className="selector-search-input"
                />
                {searchTermB && (
                  <button
                    type="button"
                    className="btn-clear-search"
                    onClick={() => setSearchTermB('')}
                    title="Hapus pencarian B"
                  >
                    <IconClose size={11} />
                  </button>
                )}
              </div>

              <div className="select-dropdown-wrap">
                <select
                  id="select-grid-b"
                  className="selector-select-dropdown"
                  value={gridBId}
                  onChange={e => {
                    setGridBId(e.target.value);
                    setSelectedPreset('');
                  }}
                  aria-label="Pilih Grid B dari daftar"
                >
                  {filteredOptionsB.map(g => (
                    <option key={g.properties.grid_id} value={g.properties.grid_id}>
                      {g.properties.grid_id} : {g.properties.admin_district_name || 'DAS'} (Tier {code(g.properties.recommendation_level)})
                    </option>
                  ))}
                  {filteredOptionsB.length === 0 && (
                    <option disabled>Tidak ada grid yang sesuai pencarian</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Columns */}
        {pA && pB ? (
          <div className="compare-grid-layout">
            {/* COLUMN A */}
            <div className="compare-card col-a">
              <div className="compare-card-top">
                <div className="compare-slot-tag slot-a">TITIK A (HULU)</div>
                <div className="compare-tier-pill" style={{ background: colors[pA.recommendation_level] }}>
                  {code(pA.recommendation_level)}
                </div>
              </div>

              <h4 className="compare-grid-id">{pA.grid_id}</h4>
              <div className="compare-region-info">
                <strong>{String(pA.admin_district_name || 'Wilayah DAS')}</strong>
                <span className="zone-tag">{getDistrictZone(String(pA.admin_district_name || ''))}</span>
              </div>
              <p className="compare-tier-label">
                {translateRecommendationLabel(String(pA.dashboard_recommendation_label))}
              </p>
              <p className="compare-tier-desc">{tierPlainSummary[pA.recommendation_level]}</p>

              {onFocusGridOnMap && gridA && (
                <button
                  type="button"
                  className="btn-compare-focus"
                  onClick={() => {
                    onFocusGridOnMap(gridA);
                    onClose();
                  }}
                >
                  <span>Fokuskan Grid A di Peta</span>
                  <IconFocus size={13} />
                </button>
              )}

              {/* Metric 1: Policy Overlap */}
              <div className="compare-metric-box">
                <div className="compare-m-header">
                  <span>Tumpang Tindih Izin Tambang / Sawit</span>
                  <strong className="val-amber">{overlapPctA.toFixed(1)}% Area</strong>
                </div>
                <div className="compare-bar-track">
                  <div
                    className="compare-bar-fill fill-amber"
                    style={{ width: `${Math.min(100, Math.max(0, overlapPctA))}%` }}
                  />
                </div>
                <small className="compare-m-hint">
                  {pA.any_policy_overlap_primary
                    ? 'Terindikasi beririsan dengan konsesi lahan aktif'
                    : 'Tidak beririsan langsung dengan konsesi terdaftar'}
                </small>
              </div>

              {/* Metric 2: Flood Susceptibility */}
              <div className="compare-metric-box">
                <div className="compare-m-header">
                  <span>Kerentanan Banjir Retrospektif</span>
                  <strong className="val-teal">Persentil ke-{suscPctA}</strong>
                </div>
                <div className="compare-bar-track">
                  <div
                    className="compare-bar-fill fill-teal"
                    style={{ width: `${suscPctA}%` }}
                  />
                </div>
                <small className="compare-m-hint">
                  {pA.high_susceptibility_primary
                    ? 'Masuk kategori kerentanan tinggi historis'
                    : 'Tingkat kerentanan hidrologi standar'}
                </small>
              </div>

              {/* Metric 3: Hydrological Connectivity */}
              <div className="compare-metric-box">
                <span className="compare-m-title">Konektivitas Simpul Jaringan:</span>
                <div className="compare-tags-wrap">
                  <span className={`compare-tag ${pA.critical_cross_system_bridge ? 'is-yes' : 'is-no'}`}>
                    Simpul Lintas Sistem: {pA.critical_cross_system_bridge ? 'Ya' : 'Tidak'}
                  </span>
                  <span className={`compare-tag ${pA.structural_bridge_candidate ? 'is-yes' : 'is-no'}`}>
                    Penghubung Struktural: {pA.structural_bridge_candidate ? 'Ya' : 'Tidak'}
                  </span>
                  <span className="compare-tag is-scope">
                    {coordinationScopeText[String(pA.coordination_scope)] || 'Koordinasi Lokal'}
                  </span>
                </div>
              </div>

              {/* Metric 4: Key Stakeholder Directives */}
              <div className="compare-metric-box">
                <span className="compare-m-title">Instansi Kunci & Prioritas Aksi:</span>
                <div className="compare-agencies-list">
                  {stakeholdersA.slice(0, 3).map(s => (
                    <div key={s.name} className="compare-agency-item">
                      <strong className="agency-name">{s.name}</strong>
                      <span className="agency-reason">{s.reason}</span>
                    </div>
                  ))}
                  {stakeholdersA.length === 0 && (
                    <span className="agency-reason">Monitoring berkala melalui dinas lingkungan hidup setempat.</span>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN B */}
            <div className="compare-card col-b">
              <div className="compare-card-top">
                <div className="compare-slot-tag slot-b">TITIK B (HILIR)</div>
                <div className="compare-tier-pill" style={{ background: colors[pB.recommendation_level] }}>
                  {code(pB.recommendation_level)}
                </div>
              </div>

              <h4 className="compare-grid-id">{pB.grid_id}</h4>
              <div className="compare-region-info">
                <strong>{String(pB.admin_district_name || 'Wilayah DAS')}</strong>
                <span className="zone-tag">{getDistrictZone(String(pB.admin_district_name || ''))}</span>
              </div>
              <p className="compare-tier-label">
                {translateRecommendationLabel(String(pB.dashboard_recommendation_label))}
              </p>
              <p className="compare-tier-desc">{tierPlainSummary[pB.recommendation_level]}</p>

              {onFocusGridOnMap && gridB && (
                <button
                  type="button"
                  className="btn-compare-focus"
                  onClick={() => {
                    onFocusGridOnMap(gridB);
                    onClose();
                  }}
                >
                  <span>Fokuskan Grid B di Peta</span>
                  <IconFocus size={13} />
                </button>
              )}

              {/* Metric 1: Policy Overlap */}
              <div className="compare-metric-box">
                <div className="compare-m-header">
                  <span>Tumpang Tindih Izin Tambang / Sawit</span>
                  <strong className="val-amber">{overlapPctB.toFixed(1)}% Area</strong>
                </div>
                <div className="compare-bar-track">
                  <div
                    className="compare-bar-fill fill-amber"
                    style={{ width: `${Math.min(100, Math.max(0, overlapPctB))}%` }}
                  />
                </div>
                <small className="compare-m-hint">
                  {pB.any_policy_overlap_primary
                    ? 'Terindikasi beririsan dengan konsesi lahan aktif'
                    : 'Tidak beririsan langsung dengan konsesi terdaftar'}
                </small>
              </div>

              {/* Metric 2: Flood Susceptibility */}
              <div className="compare-metric-box">
                <div className="compare-m-header">
                  <span>Kerentanan Banjir Retrospektif</span>
                  <strong className="val-teal">Persentil ke-{suscPctB}</strong>
                </div>
                <div className="compare-bar-track">
                  <div
                    className="compare-bar-fill fill-teal"
                    style={{ width: `${suscPctB}%` }}
                  />
                </div>
                <small className="compare-m-hint">
                  {pB.high_susceptibility_primary
                    ? 'Masuk kategori kerentanan tinggi historis'
                    : 'Tingkat kerentanan hidrologi standar'}
                </small>
              </div>

              {/* Metric 3: Hydrological Connectivity */}
              <div className="compare-metric-box">
                <span className="compare-m-title">Konektivitas Simpul Jaringan:</span>
                <div className="compare-tags-wrap">
                  <span className={`compare-tag ${pB.critical_cross_system_bridge ? 'is-yes' : 'is-no'}`}>
                    Simpul Lintas Sistem: {pB.critical_cross_system_bridge ? 'Ya' : 'Tidak'}
                  </span>
                  <span className={`compare-tag ${pB.structural_bridge_candidate ? 'is-yes' : 'is-no'}`}>
                    Penghubung Struktural: {pB.structural_bridge_candidate ? 'Ya' : 'Tidak'}
                  </span>
                  <span className="compare-tag is-scope">
                    {coordinationScopeText[String(pB.coordination_scope)] || 'Koordinasi Lokal'}
                  </span>
                </div>
              </div>

              {/* Metric 4: Key Stakeholder Directives */}
              <div className="compare-metric-box">
                <span className="compare-m-title">Instansi Kunci & Prioritas Aksi:</span>
                <div className="compare-agencies-list">
                  {stakeholdersB.slice(0, 3).map(s => (
                    <div key={s.name} className="compare-agency-item">
                      <strong className="agency-name">{s.name}</strong>
                      <span className="agency-reason">{s.reason}</span>
                    </div>
                  ))}
                  {stakeholdersB.length === 0 && (
                    <span className="agency-reason">Monitoring berkala melalui dinas lingkungan hidup setempat.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="compare-empty-state">
            <p>Pilih dua titik grid kanonis untuk memulai komparasi berdampingan.</p>
          </div>
        )}

        {/* Head-to-Head Key Metrics Comparison Table */}
        {pA && pB && (
          <div className="compare-h2h-table-wrap">
            <div className="compare-h2h-title">
              <span className="section-kicker">MATRIKS KOMPARASI LANGSUNG</span>
              <h4>Perbandingan Head-to-Head Indikator Kunci</h4>
            </div>
            <table className="compare-h2h-table">
              <thead>
                <tr>
                  <th className="th-metric">Indikator Geospasial</th>
                  <th className="th-grid-a">Grid A ({pA.grid_id})</th>
                  <th className="th-diff">Kontras Antar-Titik</th>
                  <th className="th-grid-b">Grid B ({pB.grid_id})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="td-label">Kawasan &amp; Wilayah</td>
                  <td className="td-a">{String(pA.admin_district_name || '-')} ({getDistrictZone(String(pA.admin_district_name || ''))})</td>
                  <td className="td-diff-badge">Lintas Wilayah</td>
                  <td className="td-b">{String(pB.admin_district_name || '-')} ({getDistrictZone(String(pB.admin_district_name || ''))})</td>
                </tr>
                <tr>
                  <td className="td-label">Tingkat Rekomendasi Screening</td>
                  <td className="td-a">
                    <span className="tier-pill" style={{ background: colors[pA.recommendation_level] }}>
                      {code(pA.recommendation_level)}
                    </span>
                  </td>
                  <td className="td-diff-badge">Prioritas Lapangan</td>
                  <td className="td-b">
                    <span className="tier-pill" style={{ background: colors[pB.recommendation_level] }}>
                      {code(pB.recommendation_level)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="td-label">Tumpang Tindih Konsesi Tambang/Sawit</td>
                  <td className="td-a"><strong>{overlapPctA.toFixed(1)}%</strong> area petak</td>
                  <td className="td-diff-badge">
                    {Math.abs(overlapPctA - overlapPctB) > 5 ? `Selisih ${Math.abs(overlapPctA - overlapPctB).toFixed(1)}%` : 'Relatif Setara'}
                  </td>
                  <td className="td-b"><strong>{overlapPctB.toFixed(1)}%</strong> area petak</td>
                </tr>
                <tr>
                  <td className="td-label">Kerentanan Banjir Retrospektif</td>
                  <td className="td-a">Persentil ke-<strong>{suscPctA}</strong></td>
                  <td className="td-diff-badge">
                    {Math.abs(suscPctA - suscPctB) > 5 ? `Selisih ${Math.abs(suscPctA - suscPctB)}%` : 'Relatif Setara'}
                  </td>
                  <td className="td-b">Persentil ke-<strong>{suscPctB}</strong></td>
                </tr>
                <tr>
                  <td className="td-label">Peran Simpul Jaringan Hidrologis</td>
                  <td className="td-a">{pA.critical_cross_system_bridge ? 'Simpul Jembatan Lintas Sistem' : pA.structural_bridge_candidate ? 'Jembatan Struktural' : 'Node Aliran Standar'}</td>
                  <td className="td-diff-badge">Konektivitas</td>
                  <td className="td-b">{pB.critical_cross_system_bridge ? 'Simpul Jembatan Lintas Sistem' : pB.structural_bridge_candidate ? 'Jembatan Struktural' : 'Node Aliran Standar'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic Comparative Synthesis Insight */}
        {pA && pB && (
          <div className="compare-synthesis-card">
            <div className="synthesis-badge">
              <IconLightbulb size={14} />
              <span>Sintesis Analisis Hubungan Hulu-Hilir</span>
            </div>
            <p className="synthesis-text">
              {overlapPctA > overlapPctB && suscPctB > suscPctA ? (
                <>
                  Hasil komparasi memperlihatkan disparitas khas Daerah Aliran Sungai: <strong>Grid A ({pA.grid_id})</strong> di <em>{pA.admin_district_name}</em> memiliki tutupan konsesi tambang/sawit sebesar <strong>{overlapPctA.toFixed(1)}%</strong> di daerah tangkapan hulu. Sebaliknya, <strong>Grid B ({pB.grid_id})</strong> di <em>{pB.admin_district_name}</em> memiliki tingkat kerentanan banjir mencapai <strong>persentil ke-{suscPctB}</strong> di kawasan hilir.
                  <br /><br />
                  Fakta spasial ini membuktikan bahwa mitigasi banjir di <em>{pB.admin_district_name}</em> tidak dapat diselesaikan hanya dengan normalisasi muara hilir. Dibutuhkan koordinasi lintas daerah: audit kepatuhan kolam pengendap sedimen (*settling pond*) tambang hulu di <em>{pA.admin_district_name}</em> oleh Dinas ESDM dan DLH merupakan syarat mutlak untuk melindungi warga hilir dari sedimentasi dan luapan debit air ekstrim.
                </>
              ) : (
                <>
                  Perbandingan antara <strong>Grid A ({pA.grid_id} - {pA.admin_district_name})</strong> dan <strong>Grid B ({pB.grid_id} - {pB.admin_district_name})</strong> memetakan variasi peran hidrologi dalam satu kesatuan DAS. Grid A berstatus <strong>Tier {code(pA.recommendation_level)}</strong> dengan tumpang tindih konsesi {overlapPctA.toFixed(1)}%, sementara Grid B berstatus <strong>Tier {code(pB.recommendation_level)}</strong> dengan tingkat kerentanan persentil ke-{suscPctB}. Pemantauan terpadu antar-instansi (ESDM, DLH, BPBD, Bappeda) memastikan intervensi teknis berjalan sinkron tanpa ego sektoral wilayah.
                </>
              )}
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="compare-footer-actions">
          <span className="compare-disclaimer-note">
            * Data komparasi bersumber dari paket screening kanonis terverifikasi (STEP54 beku). Tidak ada data baru yang direkayasa.
          </span>
          <button
            type="button"
            className="btn-close-compare"
            onClick={onClose}
          >
            Tutup Komparasi
          </button>
        </div>
      </div>
    </div>
  );
}
