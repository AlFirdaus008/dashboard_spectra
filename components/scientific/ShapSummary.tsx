import shap from '@/lib/data/shap-summary.json';
import {shapFeatureLabel, glossary} from '@/lib/data/vocabulary';
import GlossaryHint from '@/components/ui/GlossaryHint';

const DIRECTION_LABELS: Record<string, string> = {
  HIGHER_VALUE_TENDS_TO_INCREASE_MODEL_OUTPUT: 'Semakin tinggi nilainya, model cenderung menaikkan tingkat kerentanan.',
  HIGHER_VALUE_TENDS_TO_DECREASE_MODEL_OUTPUT: 'Semakin tinggi nilainya, model cenderung menurunkan tingkat kerentanan.',
};

export default function ShapSummary() {
  return (
    <div className="shap-summary">
      <h4>Apa yang paling memengaruhi model kerentanan banjir?</h4>
      <p className="hint">
        Interpretasi model SHAP <GlossaryHint text={glossary.shap} /> ini bersifat <strong>global, rata-rata seluruh
        grid</strong>. Penjelasan khusus untuk grid tertentu tersedia di panel detail grid pada peta.
      </p>
      {shap.features.map(f => (
        <div className="shap-feature" key={f.feature}>
          <div className="shap-feature-content">
            <div className="shap-feature-header">
              <span className="shap-feature-tag">{shapFeatureLabel[f.feature] ?? f.feature}</span>
            </div>
            <p className="shap-feature-desc">{DIRECTION_LABELS[f.direction] ?? f.direction}</p>
          </div>
          <span className="shap-feature-rank">#{f.rank}</span>
        </div>
      ))}
    </div>
  );
}
