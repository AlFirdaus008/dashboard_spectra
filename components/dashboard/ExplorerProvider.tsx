'use client';
import {createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction} from 'react';
import type {Collection, Grid, Metadata} from '@/types/data';
import {loadData, loadMetadata} from '@/lib/data/client';
import type {FiltersState} from '@/components/filters/Filters';
import type {FlyTo} from '@/components/map/MahakamMap';

type ExplorerContextValue = {
  metadata: Metadata;
  scope: 'targets' | 'all';
  setScope: (s: 'targets' | 'all') => void;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  search: string;
  setSearch: (s: string) => void;
  selected: Grid | null;
  setSelected: (g: Grid | null) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
  resetToken: number;
  bumpReset: () => void;
  loading: boolean;
  needsAll: boolean;
  filtered: Collection;
  allTargets: Grid[];
  counts: Record<string, number>;
  displayedTargets: number;
  setTier: (n: number) => void;
  resetFilters: () => void;
  flyTo: FlyTo | null;
  flyToPlace: (bounds: [number, number, number, number]) => void;
};

const ExplorerContext = createContext<ExplorerContextValue | null>(null);

export function useExplorer() {
  const value = useContext(ExplorerContext);
  if (!value) throw new Error('useExplorer must be used within ExplorerProvider');
  return value;
}

export default function ExplorerProvider({children}: {children: ReactNode}) {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [targets, setTargets] = useState<Collection | null>(null);
  const [all, setAll] = useState<Collection | null>(null);
  const [scope, setScope] = useState<'targets' | 'all'>('targets');
  const [filters, setFilters] = useState<FiltersState>({});
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Grid | null>(null);
  const [visible, setVisible] = useState(true);
  const [resetToken, setResetToken] = useState(0);
  const [flyTo, setFlyTo] = useState<FlyTo | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetadata()
      .then(async m => { setMetadata(m); setTargets(await loadData(m, 'targets')); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const needsAll = scope === 'all' || !!search || filters.recommendation_level === '99' || filters.screening_target === 'false';

  useEffect(() => {
    if (!metadata || !needsAll || all) return;
    let cancelled = false;
    setLoading(true);
    loadData(metadata, 'all')
      .then(d => { if (!cancelled) { setAll(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [metadata, needsAll, all]);

  const collection = needsAll ? all : targets;

  const filtered = useMemo<Collection>(() => ({
    type: 'FeatureCollection',
    features: (collection?.features ?? []).filter(f =>
      (!search || f.properties.grid_id.toLowerCase().includes(search.toLowerCase())) &&
      Object.entries(filters).every(([k, v]) => {
        if (!v) return true;
        if (v.includes(',')) {
          const list = v.split(',').map(s => s.trim());
          return list.includes(String(f.properties[k]));
        }
        return String(f.properties[k]) === v;
      })
    ),
  }), [collection, search, filters]);

  useEffect(() => {
    if (search && filtered.features.length === 1) setSelected(filtered.features[0]);
    else setSelected(s => s && filtered.features.some(f => f.properties.grid_id === s.properties.grid_id) ? s : null);
  }, [filtered, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    filtered.features.forEach(f => { const k = f.properties.recommendation_level; c[k] = (c[k] ?? 0) + 1; });
    return c;
  }, [filtered]);

  const displayedTargets = filtered.features.filter(f => f.properties.screening_target).length;
  const allTargets = useMemo<Grid[]>(() => targets?.features ?? [], [targets]);

  const setTier = (n: number) => {
    setFilters(f => ({...f, recommendation_level: f.recommendation_level === String(n) ? '' : String(n)}));
    if (n === 99) setScope('all');
  };

  const resetFilters = () => { setFilters({}); setSearch(''); setScope('targets'); setSelected(null); };

  if (error) return (
    <div className="fatal" role="alert">
      <h2>Data tidak valid / gagal dimuat</h2>
      <p>{error}</p>
      <p>Hasil screening ditahan sampai data dapat divalidasi.</p>
      <button onClick={() => window.location.reload()}>Muat Ulang Data</button>
    </div>
  );
  if (!metadata) return <div className="loading" role="status">Memvalidasi paket data terverifikasi…</div>;

  return (
    <ExplorerContext.Provider value={{
      metadata, scope, setScope, filters, setFilters, search, setSearch, selected, setSelected,
      visible, setVisible, resetToken, bumpReset: () => setResetToken(v => v + 1),
      loading, needsAll, filtered, allTargets, counts, displayedTargets, setTier, resetFilters,
      flyTo, flyToPlace: bounds => setFlyTo({bounds, token: Date.now()}),
    }}>
      {children}
    </ExplorerContext.Provider>
  );
}
