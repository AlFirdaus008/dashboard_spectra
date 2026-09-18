'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Collection, Grid } from '@/types/data';
import { colors, code } from '@/lib/data/client';
import { tierPlainSummary, recommendationTitleText, legendInterpretationText, coordinationScopeText } from '@/lib/data/vocabulary';
import { useExplorer } from '@/components/dashboard/ExplorerProvider';
import Filters from '@/components/filters/Filters';
import GridDetail from '@/components/evidence/GridDetail';
import DistrictBrief from '@/components/evidence/DistrictBrief';
import OnboardingGuide, { hasDismissedOnboarding } from '@/components/guide/OnboardingGuide';
import GridComparisonModal from '@/components/evidence/GridComparisonModal';
import GlossaryModal from '@/components/guide/GlossaryModal';
import { IconGuide, IconScale, IconDownload, IconMaximize, IconMinimize, IconBook } from '@/components/ui/Icons';

const Map = dynamic(() => import('@/components/map/MahakamMap'), {ssr: false, loading: () => <div className="map-wrap loading">Menyiapkan peta interaktif…</div>});

const FILTERS_COLLAPSE_KEY = 'mahakam_filters_collapsed';
const DETAIL_COLLAPSE_KEY = 'mahakam_detail_collapsed';

function PanelChevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === 'left' ? <path d="m15 6-6 6 6 6" /> : <path d="m9 6 6 6-6 6" />}
    </svg>
  );
}

export default function AtlasView() {
  const {
    metadata, scope, setScope, filters, setFilters, search, setSearch, selected, setSelected,
    visible, setVisible, resetToken, bumpReset, loading, needsAll, filtered, allTargets, displayedTargets, setTier, resetFilters,
    flyTo, flyToPlace,
  } = useExplorer();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareInitialGrid, setCompareInitialGrid] = useState<Grid | null>(null);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [detailCollapsed, setDetailCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Deep linking: read grid from URL parameter on initial target load
  useEffect(() => {
    if (!allTargets.length) return;
    const params = new URLSearchParams(window.location.search);
    const gridId = params.get('grid');
    if (gridId && (!selected || selected.properties.grid_id !== gridId)) {
      const match = allTargets.find(g => g.properties.grid_id === gridId);
      if (match) {
        setSelected(match);
        if (match.geometry.type === 'Polygon' && match.geometry.coordinates?.[0]) {
          const ring = match.geometry.coordinates[0];
          let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
          for (const [lng, lat] of ring) {
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
          }
          flyToPlace([minLng - 0.05, minLat - 0.05, maxLng + 0.05, maxLat + 0.05]);
        }
      }
    }
  }, [allTargets, selected, setSelected, flyToPlace]);

  // Deep linking: update URL when grid changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (selected) {
      url.searchParams.set('grid', selected.properties.grid_id);
    } else {
      url.searchParams.delete('grid');
    }
    window.history.replaceState(null, '', url.toString());
  }, [selected]);

  // Fullscreen event listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    const el = document.querySelector('.workspace');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {
        setIsFullscreen(prev => !prev);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  const exportFilteredCSV = useCallback(() => {
    if (!filtered.features.length) return;
    const headers = [
      'ID_Grid',
      'Kabupaten',
      'Provinsi',
      'Tingkat_Rekomendasi',
      'Label_Rekomendasi',
      'Persentil_Kerentanan_Banjir',
      'Kerentanan_Tinggi',
      'Persen_Tumpang_Tindih_Izin',
      'Irisan_Izin_Aktif',
      'Bridge_Lintas_Sistem',
      'Bridge_Struktural',
      'Bridge_Administratif',
      'Lingkup_Koordinasi',
    ];

    const rows = filtered.features.map(f => {
      const p = f.properties;
      const susc = typeof p.susceptibility_percentile_01 === 'number' ? `${Math.round(p.susceptibility_percentile_01 * 100)}%` : '-';
      const overlap = typeof p.max_policy_overlap_pct === 'number' ? `${p.max_policy_overlap_pct.toFixed(1)}%` : '0%';
      return [
        `"${p.grid_id}"`,
        `"${p.admin_district_name || '-'}"`,
        `"${p.admin_province_name || '-'}"`,
        `"${code(p.recommendation_level)}"`,
        `"${recommendationTitleText[String(p.dashboard_recommendation_label)] || p.dashboard_recommendation_label || '-'}"`,
        `"${susc}"`,
        `"${p.high_susceptibility_primary ? 'Ya' : 'Tidak'}"`,
        `"${overlap}"`,
        `"${p.any_policy_overlap_primary ? 'Ya' : 'Tidak'}"`,
        `"${p.critical_cross_system_bridge ? 'Ya' : 'Tidak'}"`,
        `"${p.structural_bridge_candidate ? 'Ya' : 'Tidak'}"`,
        `"${p.administrative_hydrological_bridge ? 'Ya' : 'Tidak'}"`,
        `"${coordinationScopeText[String(p.coordination_scope)] || p.coordination_scope || '-'}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `SPECTRA_DAS_Mahakam_Filter_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filtered.features]);

  useEffect(() => {
    if (!hasDismissedOnboarding()) {
      setIsOnboardingOpen(true);
    }
    try {
      setFiltersCollapsed(localStorage.getItem(FILTERS_COLLAPSE_KEY) === '1');
      setDetailCollapsed(localStorage.getItem(DETAIL_COLLAPSE_KEY) === '1');
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleFiltersCollapsed = () => {
    setFiltersCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(FILTERS_COLLAPSE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  const toggleDetailCollapsed = () => {
    setDetailCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(DETAIL_COLLAPSE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  const empty = useMemo<Collection>(() => ({type: 'FeatureCollection', features: []}), []);

  return (
    <>
      <section className="kpis">
        <div><span>Node Hidrologi</span><strong>{metadata.counts.total.toLocaleString()}</strong><small>Rekaman kanonis</small></div>
        <div className="target-kpi"><span>Target Rekomendasi</span><strong>{metadata.counts.targets.toLocaleString()}</strong><small>Kategori screening baku</small></div>
        <div><span>Node Referensi</span><strong>{metadata.counts.reference.toLocaleString()}</strong><small>R0 · tanpa rekomendasi otomatis</small></div>
        <div className="tier-kpis">
          {metadata.contract.legend.filter(l => l.code !== 'R0').map(l => (
            <div key={l.code}><span style={{color: colors[l.recommendation_level]}}>{l.code}</span><strong>{metadata.counts.levels[l.recommendation_level].toLocaleString()}</strong></div>
          ))}
        </div>
      </section>

      <DistrictBrief />

      <div className="journey">
        <strong>DI MANA <span>Temukan</span></strong><i>→</i>
        <strong>MENGAPA <span>Periksa evidence</span></strong><i>→</i>
        <strong>LANGKAH SELANJUTNYA <span>Tinjau tindak lanjut teknis</span></strong>
      </div>

      <section className="workspace" aria-label="Eksplorasi spasial">
        <div className={`workspace-side workspace-side-filters${filtersCollapsed ? ' is-collapsed' : ''}`}>
          <div className="workspace-side-bar">
            <button
              type="button"
              className="workspace-side-toggle"
              onClick={toggleFiltersCollapsed}
              aria-expanded={!filtersCollapsed}
              aria-label={filtersCollapsed ? 'Buka panel filter' : 'Tutup panel filter'}
              title={filtersCollapsed ? 'Buka panel filter' : 'Tutup panel filter'}
            >
              <PanelChevron direction={filtersCollapsed ? 'right' : 'left'} />
              {filtersCollapsed && <span className="workspace-side-label">Filter</span>}
            </button>
          </div>
          <div className="workspace-side-content">
            <Filters
              metadata={metadata}
              value={filters}
              onChange={setFilters}
              search={search}
              onSearch={setSearch}
              onReset={resetFilters}
              onFlyToPlace={flyToPlace}
              onOpenGlossary={() => setIsGlossaryOpen(true)}
            />
          </div>
        </div>

        <section className="map-section">
          <div className="map-toolbar">
            <div>
              <h2>Atlas Screening Mahakam</h2>
              <span className="map-toolbar-status" aria-live="polite">{filtered.features.length.toLocaleString()} grid terlihat · {displayedTargets.toLocaleString()} target</span>
            </div>
            <div className="map-toolbar-actions">
              <button
                type="button"
                className="btn-tour-guide"
                onClick={() => setIsOnboardingOpen(true)}
                title="Buka panduan eksplorasi 3 langkah"
              >
                <IconGuide size={15} />
                <span>Panduan Cepat</span>
              </button>
              <button
                type="button"
                className="btn-open-glossary"
                onClick={() => setIsGlossaryOpen(true)}
                title="Buka kamus istilah ilmiah & bahasa awam"
              >
                <IconBook size={15} />
                <span>Kamus Istilah</span>
              </button>
              <button
                type="button"
                className="btn-open-compare"
                onClick={() => {
                  setCompareInitialGrid(selected);
                  setIsCompareOpen(true);
                }}
                title="Bandingkan titik hulu dan hilir secara berdampingan"
              >
                <IconScale size={15} />
                <span>Komparasi 2 Titik</span>
              </button>
              <button
                type="button"
                className="btn-export-csv"
                onClick={exportFilteredCSV}
                title={`Unduh ${filtered.features.length.toLocaleString()} data petak terfilter dalam format CSV`}
                disabled={filtered.features.length === 0}
              >
                <IconDownload size={15} />
                <span>Unduh CSV</span>
              </button>
              <button
                type="button"
                className="btn-map-fullscreen"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Keluar dari layar penuh' : 'Tampilkan peta layar penuh'}
              >
                {isFullscreen ? <IconMinimize size={15} /> : <IconMaximize size={15} />}
                <span>{isFullscreen ? 'Keluar' : 'Layar Penuh'}</span>
              </button>
              <button type="button" onClick={bumpReset}>Atur Ulang Tampilan</button>
            </div>
          </div>

          <div className="scope-controls">
            <div className="segmented">
              <button
                aria-pressed={scope === 'targets' && !needsAll}
                onClick={() => { setScope('targets'); setSearch(''); setFilters(f => ({...f, recommendation_level: f.recommendation_level === '99' ? '' : f.recommendation_level, screening_target: ''})); }}
              >Hanya Target</button>
              <button aria-pressed={needsAll} onClick={() => setScope('all')}>Semua Node</button>
            </div>
            <label><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} /> Tampilkan layer screening</label>
          </div>

          {loading && <div className="load-status" role="status">Memuat dan memvalidasi {needsAll ? 'seluruh grid kanonis (31,28 MB)' : 'target rekomendasi'}…</div>}

          <Map data={visible ? filtered : empty} selected={selected} onSelect={setSelected} metadata={metadata} reset={resetToken} flyTo={flyTo} />

          {!loading && !filtered.features.length && <div className="empty-result" role="status">Tidak ada grid yang cocok dengan filter ini. Hapus filter atau ubah pencarian.</div>}

          <div className="legend">
            <strong>Tingkatan rekomendasi / screening · bukan kelas risiko sebab-akibat</strong>
            <div>
              {[...metadata.contract.legend].sort((a, b) => (a.code > b.code ? 1 : -1)).map(l => (
                <button title={legendInterpretationText[l.recommendation_level] ?? l.interpretation} key={l.code} onClick={() => setTier(l.recommendation_level)} aria-pressed={filters.recommendation_level === String(l.recommendation_level)}>
                  <span style={{background: colors[l.recommendation_level]}} />
                  <div className="legend-copy">{l.code}<small>{recommendationTitleText[l.label] ?? l.label}</small><span className="tier-plain">{tierPlainSummary[l.recommendation_level]}</span></div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className={`workspace-side workspace-side-detail${detailCollapsed ? ' is-collapsed' : ''}`}>
          <div className="workspace-side-bar">
            <button
              type="button"
              className="workspace-side-toggle"
              onClick={toggleDetailCollapsed}
              aria-expanded={!detailCollapsed}
              aria-label={detailCollapsed ? 'Buka panel analisis' : 'Tutup panel analisis'}
              title={detailCollapsed ? 'Buka panel analisis' : 'Tutup panel analisis'}
            >
              <PanelChevron direction={detailCollapsed ? 'left' : 'right'} />
              {detailCollapsed && <span className="workspace-side-label">Analisis</span>}
            </button>
          </div>
          <div className="workspace-side-content">
            <GridDetail
              grid={selected}
              metadata={metadata}
              onOpenCompare={() => {
                setCompareInitialGrid(selected);
                setIsCompareOpen(true);
              }}
            />
          </div>
        </div>
      </section>

      <section className="disclaimer">
        <strong>Interpretasi Ilmiah</strong>
        <p className="disclaimer-id">
          Dashboard ini adalah dukungan keputusan berbasis screening untuk wilayah DAS Mahakam. Kelas
          rekomendasi (R0–R5) bukan kelas risiko masa depan yang terkalibrasi, tumpang tindih kebijakan/izin bukan jejak
          fisik di lapangan, dan keterkaitan spasial/model tidak membuktikan sebab-akibat maupun mengesahkan tindakan
          regulasi.
        </p>
        <p lang="en" className="disclaimer-en">
          {metadata.contract.required_disclaimer}
        </p>
      </section>

      {/* 3-Step Onboarding Guide */}
      <OnboardingGuide
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Side-by-Side 2-Point Comparison Modal */}
      <GridComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        initialGridA={compareInitialGrid}
        allGrids={allTargets}
        metadata={metadata}
        onFocusGridOnMap={grid => {
          setSelected(grid);
          if (grid.geometry.type === 'Polygon' && grid.geometry.coordinates?.[0]) {
            const ring = grid.geometry.coordinates[0];
            let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
            for (const [lng, lat] of ring) {
              if (lng < minLng) minLng = lng;
              if (lng > maxLng) maxLng = lng;
              if (lat < minLat) minLat = lat;
              if (lat > maxLat) maxLat = lat;
            }
            const pad = 0.08;
            flyToPlace([minLng - pad, minLat - pad, maxLng + pad, maxLat + pad]);
          }
        }}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
    </>
  );
}
