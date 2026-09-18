'use client';
import {useShapForGrid, FEATURES} from '@/lib/data/shapPerGrid';
import {shapFeatureLabel, glossary} from '@/lib/data/vocabulary';
import GlossaryHint from '@/components/ui/GlossaryHint';

export default function GridShapExplanation({gridId}: {gridId: string}) {
  const {shares, loading} = useShapForGrid(gridId);

  if (loading) return <p className="hint">Memuat interpretasi model untuk grid ini…</p>;
  if (!shares) return null;

  const rows = FEATURES
    .map((feature, i) => ({feature, share: shares[i]}))
    .sort((a, b) => Math.abs(b.share) - Math.abs(a.share));
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.share)), 0.0001);

  return (
    <details className="grid-shap">
      <summary>Kenapa skor kerentanan grid ini seperti ini?</summary>
      <p className="hint">
        Interpretasi model SHAP <GlossaryHint text={glossary.shap} /> khusus grid ini, konsensus dari 3 model (Random
        Forest, XGBoost, LightGBM) setelah dinormalisasi.
      </p>
      <div className="shap-grid-bars">
        {rows.map(r => {
          const pct = Math.round(Math.abs(r.share) * 100);
          const isUp = r.share >= 0;
          return (
            <div className="shap-grid-row" key={r.feature}>
              <div className="shap-grid-row-head">
                <span className="shap-feature-tag">{shapFeatureLabel[r.feature] ?? r.feature}</span>
                <span
                  className={isUp ? 'shap-grid-direction is-increase' : 'shap-grid-direction is-decrease'}
                  title={isUp ? `Menaikkan skor kerentanan, sekitar ${pct}% dari total pengaruh di grid ini` : `Menurunkan skor kerentanan, sekitar ${pct}% dari total pengaruh di grid ini`}
                >
                  {isUp ? '↑' : '↓'} {pct}%
                </span>
              </div>
              <div className="shap-grid-bar-track">
                <div
                  className={isUp ? 'shap-grid-bar is-increase' : 'shap-grid-bar is-decrease'}
                  style={{width: `${(Math.abs(r.share) / maxAbs) * 100}%`}}
                />
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}
