'use client';
import {useEffect, useState} from 'react';

export const FEATURES = [
  'max_event_antecedent_rainfall_3d_mm',
  'max_event_antecedent_rainfall_7d_mm',
  'slope_mean_deg',
  'distance_to_river_m',
] as const;

type ShapPerGridFile = {
  source: {step: string; shap_role: string; consensus_method: string; features: string[]; grid_count: number};
  perGrid: Record<string, [number, number, number, number]>;
};

let shapPerGridPromise: Promise<ShapPerGridFile> | null = null;

function loadShapPerGrid(): Promise<ShapPerGridFile> {
  if (!shapPerGridPromise) {
    shapPerGridPromise = fetch('/data/interpretation/shap-per-grid.json')
      .then(r => { if (!r.ok) throw Error('Per-grid SHAP data could not be loaded.'); return r.json(); })
      .catch(e => { shapPerGridPromise = null; throw e; });
  }
  return shapPerGridPromise;
}

// Additive, out-of-STEP54-contract data (see STEP46B_SHAP_PER_GRID_REPORT.md).
// Fails soft: a missing/failed fetch just means no explanation panel renders
// for that grid, it never blocks the rest of the dashboard.
export function useShapForGrid(gridId: string | undefined) {
  const [shares, setShares] = useState<[number, number, number, number] | null>(null);
  const [loading, setLoading] = useState(!!gridId);

  useEffect(() => {
    if (!gridId) { setShares(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    loadShapPerGrid()
      .then(file => { if (!cancelled) { setShares(file.perGrid[gridId] ?? null); setLoading(false); } })
      .catch(() => { if (!cancelled) { setShares(null); setLoading(false); } });
    return () => { cancelled = true; };
  }, [gridId]);

  return {shares, loading};
}
