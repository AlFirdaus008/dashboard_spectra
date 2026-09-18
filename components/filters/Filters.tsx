'use client';

import { useEffect, useState } from 'react';
import type { Metadata } from '@/types/data';
import { human } from '@/lib/data/client';
import { aliasTranslation, coordinationScopeShortLabel, recommendationTitleText } from '@/lib/data/vocabulary';
import { loadPlaces, searchPlaces, type Place } from '@/lib/data/places';

export type FiltersState = Record<string, string>;

const PLACE_KIND_LABEL: Record<Place['kind'], string> = {
  kabupaten: 'Kabupaten/Kota',
  kecamatan: 'Kecamatan',
  sungai: 'Sungai',
};

const PRESET_SCENARIOS = [
  {
    id: 'critical',
    label: 'Prioritas Kritis (Tier R1 & R2)',
    badge: 'Urgensi Tertinggi',
    filters: { recommendation_level: '1,2' },
  },
  {
    id: 'overlap',
    label: 'Tumpang Tindih Tambang & Sawit',
    badge: 'Eksposur Izin',
    filters: { any_policy_overlap_primary: 'true' },
  },
  {
    id: 'susceptibility',
    label: 'Kerentanan Banjir Tinggi',
    badge: 'Riwayat Genangan',
    filters: { high_susceptibility_primary: 'true' },
  },
  {
    id: 'bridge',
    label: 'Jembatan Lintas-Kabupaten',
    badge: 'Simpul Aliran',
    filters: { coordination_scope: 'CROSS_DISTRICT_COORDINATION_RECOMMENDED' },
  },
] as const;

export default function Filters({
  metadata,
  value,
  onChange,
  search,
  onSearch,
  onReset,
  onFlyToPlace,
  onOpenGlossary,
}: {
  metadata: Metadata;
  value: FiltersState;
  onChange: (v: FiltersState) => void;
  search: string;
  onSearch: (v: string) => void;
  onReset: () => void;
  onFlyToPlace: (bounds: [number, number, number, number]) => void;
  onOpenGlossary?: () => void;
}) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeOpen, setPlaceOpen] = useState(false);
  const activeCount = Object.values(value).filter(Boolean).length + (search ? 1 : 0);

  const isPresetActive = (presetFilters: Record<string, string>) => {
    return Object.entries(presetFilters).every(([k, v]) => value[k] === v);
  };

  const togglePreset = (presetFilters: Record<string, string>) => {
    if (isPresetActive(presetFilters)) {
      const next = { ...value };
      Object.keys(presetFilters).forEach(k => { delete next[k]; });
      onChange(next);
    } else {
      onChange({ ...value, ...presetFilters });
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadPlaces().then(p => { if (!cancelled) setPlaces(p); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const placeResults = placeQuery.trim() ? searchPlaces(places, placeQuery) : [];

  const selectPlace = (p: Place) => {
    onFlyToPlace(p.bbox);
    setPlaceQuery(p.name);
    setPlaceOpen(false);
  };

  return (
    <aside className={`filters ${isOpenMobile ? 'is-open-mobile' : ''}`}>
      <div className="filters-header">
        <div>
          <div className="section-kicker">01 / DI MANA</div>
          <h2>Lensa Screening</h2>
        </div>
        <button
          type="button"
          className="filters-mobile-toggle"
          onClick={() => setIsOpenMobile(prev => !prev)}
          aria-expanded={isOpenMobile}
          aria-label={isOpenMobile ? 'Tutup filter pencarian' : 'Buka filter pencarian'}
        >
          <span>{isOpenMobile ? 'Tutup filter' : 'Filter & Cari'}</span>
          {activeCount > 0 && <span className="filters-badge">{activeCount}</span>}
          <span className="filters-chevron" aria-hidden="true">
            {isOpenMobile ? '▲' : '▼'}
          </span>
        </button>
      </div>

      <div className="filters-body">
        {/* Scenario Presets - 1-Click Quick Filters (No Emojis) */}
        <div className="filter-presets-section">
          <div className="filter-presets-header">
            <span className="section-kicker">SKENARIO CEPAT</span>
            <small>Pilih skenario analisis 1-klik</small>
          </div>
          <div className="filter-presets-grid">
            {PRESET_SCENARIOS.map(preset => {
              const active = isPresetActive(preset.filters);
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset-pill ${active ? 'is-active' : ''}`}
                  onClick={() => togglePreset(preset.filters)}
                  aria-pressed={active}
                  title={`Terapkan skenario: ${preset.label}`}
                >
                  <span className="preset-pill-label">{preset.label}</span>
                  <span className="preset-pill-badge">{preset.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {onOpenGlossary && (
          <button
            type="button"
            className="btn-filters-glossary"
            onClick={onOpenGlossary}
            title="Buka kamus istilah ilmiah & bahasa sederhana"
          >
            <span>Kamus Istilah Ilmiah &amp; Bahasa Awam</span>
          </button>
        )}

        <div className="place-search">
          <label>
            Cari lokasi
            <input
              aria-label="Cari lokasi: kecamatan, kabupaten/kota, atau sungai"
              placeholder="Tenggarong, Samarinda Ulu, Sungai Belayan…"
              value={placeQuery}
              onChange={e => { setPlaceQuery(e.target.value); setPlaceOpen(true); }}
              onFocus={() => setPlaceOpen(true)}
              onBlur={() => setPlaceOpen(false)}
            />
          </label>
          {placeOpen && placeResults.length > 0 && (
            <ul className="place-results">
              {placeResults.map(p => (
                <li key={`${p.kind}-${p.name}`}>
                  <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => selectPlace(p)}>
                    <span>{p.name}</span>
                    <small>{PLACE_KIND_LABEL[p.kind]}{p.kabupaten ? ` · ${p.kabupaten}` : ''}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="hint">Mengarahkan peta ke lokasi, tidak menyaring grid yang tampil.</p>

        <label>
          Cari grid
          <input
            aria-label="Cari grid"
            placeholder="MHK_R0121_C0027"
            value={search}
            onChange={e => onSearch(e.target.value.trim())}
          />
        </label>
        <p className="hint">Cari di seluruh grid kanonis. Data referensi dimuat saat diperlukan.</p>

        {metadata.contract.filter_fields.map(k => (
          <label key={k}>
            {aliasTranslation[k] ?? metadata.aliases[k] ?? human(k)}
            <select
              aria-label={aliasTranslation[k] ?? metadata.aliases[k] ?? human(k)}
              value={value[k] ?? ''}
              onChange={e => onChange({ ...value, [k]: e.target.value })}
            >
              <option value="">Semua</option>
              {k === 'recommendation_level' ? (
                metadata.contract.legend.map(l => (
                  <option key={l.code} value={l.recommendation_level}>
                    {l.code} · {recommendationTitleText[l.label] ?? l.label}
                  </option>
                ))
              ) : metadata.options[k] ? (
                metadata.options[k].map(v => (
                  <option key={v} value={v}>
                    {k === 'coordination_scope' ? (coordinationScopeShortLabel[v] ?? human(v)) : human(v)}
                  </option>
                ))
              ) : (
                <>
                  <option value="true">Ya</option>
                  <option value="false">Tidak</option>
                </>
              )}
            </select>
          </label>
        ))}

        <button type="button" className="text-button" onClick={onReset}>
          Hapus Filter & Pencarian
        </button>
      </div>
    </aside>
  );
}
