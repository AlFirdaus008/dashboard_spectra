'use client';

import { useState } from 'react';
import type { Grid, Metadata } from '@/types/data';
import { colors, code, human } from '@/lib/data/client';
import {
  tierPlainSummary,
  relevantStakeholders,
  coordinationScopeText,
  evidenceFieldText,
  translateEvidence,
  aliasTranslation,
  translateRecommendationLabel,
  translateActionBundle,
  glossary,
  generateGridExecutiveSummary,
} from '@/lib/data/vocabulary';
import GridShapExplanation from '@/components/evidence/GridShapExplanation';
import GlossaryHint from '@/components/ui/GlossaryHint';
import AgencyActionMatrix from '@/components/evidence/AgencyActionMatrix';
import PrintablePolicyBrief from '@/components/evidence/PrintablePolicyBrief';
import { IconScale } from '@/components/ui/Icons';

const FIELD_GLOSSARY: Record<string, string> = {
  coordination_scope: glossary.coordinationScope,
  critical_cross_system_bridge: glossary.bridgeNode,
  structural_bridge_candidate: glossary.bridgeNode,
  administrative_hydrological_bridge: glossary.bridgeNode,
  susceptibility_percentile_01: glossary.susceptibilityPercentile,
  any_policy_overlap_primary: glossary.policyOverlap,
  max_policy_overlap_pct: glossary.policyOverlap,
};

function fieldValue(key: string, value: unknown) {
  if (typeof value === 'boolean') {
    const text = evidenceFieldText[key];
    return <span className={value ? 'badge yes' : 'badge'}>{text ? (value ? text.yes : text.no) : value ? 'Ada' : 'Tidak ada'}</span>;
  }
  if (value === null) return 'Tidak tersedia';
  if (key === 'coordination_scope') return coordinationScopeText[String(value)] ?? human(value);
  if (key === 'susceptibility_percentile_01' && typeof value === 'number') return `${Math.round(value * 100)}% (persentil dibanding grid lain)`;
  if (key === 'max_policy_overlap_pct' && typeof value === 'number') return `${value.toFixed(1)}% dari area grid`;
  return String(value);
}

export default function GridDetail({
  grid,
  metadata,
  onOpenCompare,
}: {
  grid: Grid | null;
  metadata: Metadata;
  onOpenCompare?: () => void;
}) {
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyShareLink = () => {
    if (!grid) return;
    const url = new URL(window.location.href);
    url.searchParams.set('grid', grid.properties.grid_id);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
  };

  if (!grid) return (
    <aside className="detail">
      <div className="section-kicker">02 / MENGAPA</div>
      <h2>Pilih lokasi untuk dijelajahi</h2>
      <p>Pilih grid pada peta atau cari ID grid untuk melihat evidence screening dan rekomendasi tindak lanjut teknisnya.</p>
      {onOpenCompare && (
        <button
          type="button"
          className="btn-compare-with is-empty-state"
          onClick={onOpenCompare}
          title="Buka fitur komparasi dua titik berdampingan"
        >
          <IconScale size={14} />
          <span>Coba Komparasi Hulu vs Hilir</span>
        </button>
      )}
      <div className="empty-symbol">◎</div>
      <p className="hint">Setiap grid mempertahankan klasifikasi screening yang sudah terverifikasi. Tidak ada skor baru yang dihitung.</p>
    </aside>
  );

  const p = grid.properties;
  const field = (k: string) => (
    <div className="detail-field" key={k}>
      <dt>{aliasTranslation[k] ?? metadata.aliases[k] ?? human(k)}{FIELD_GLOSSARY[k] && <GlossaryHint text={FIELD_GLOSSARY[k]} />}</dt>
      <dd>{fieldValue(k, p[k])}</dd>
    </div>
  );
  const stakeholders = relevantStakeholders(p);
  const evidence = translateEvidence(String(p.recommendation_evidence));

  return (
    <aside className="detail">
      <div className="section-kicker">02 / MENGAPA</div>
      <div className="grid-title">
        <h2>{p.grid_id}</h2>
        <span className="tier" style={{ background: colors[p.recommendation_level] }}>{code(p.recommendation_level)}</span>
      </div>

      <div className="grid-quick-actions">
        {onOpenCompare && (
          <button
            type="button"
            className="btn-compare-with"
            onClick={onOpenCompare}
            title="Bandingkan titik ini dengan titik lain secara berdampingan"
          >
            <IconScale size={14} />
            <span>Komparasi Titik</span>
          </button>
        )}
        <button
          type="button"
          className={`btn-copy-grid-link ${copied ? 'is-copied' : ''}`}
          onClick={copyShareLink}
          title="Salin tautan langsung ke petak ini"
        >
          <span>{copied ? 'Tautan Tersalin' : 'Bagikan Petak'}</span>
        </button>
      </div>

      <p className="recommendation-label">{translateRecommendationLabel(String(p.dashboard_recommendation_label))}</p>
      <p className="tier-plain">{tierPlainSummary[p.recommendation_level]}</p>

      {/* Dynamic Human-Centric Executive Summary */}
      <div className="executive-summary-card">
        <div className="exec-summary-head">
          <span className="exec-summary-tag">Ringkasan Eksekutif Petak</span>
        </div>
        <p className="exec-summary-body">{generateGridExecutiveSummary(p)}</p>
      </div>

      <dl>{['admin_district_name', 'admin_province_name', 'coordination_scope'].map(field)}</dl>

      <h3>Eksplorasi Evidence</h3>
      <details className="evidence-group" open>
        <summary>Hidrologi / Jaringan</summary>
        <dl>{['critical_cross_system_bridge', 'structural_bridge_candidate', 'administrative_hydrological_bridge'].map(field)}</dl>
      </details>
      <details className="evidence-group" open>
        <summary>Kerentanan Retrospektif</summary>
        <dl>{['high_susceptibility_primary', 'susceptibility_percentile_01'].map(field)}</dl>
        <p className="hint">Persentil pada skala 0–1 yang disediakan; bukan probabilitas masa depan.</p>
        <GridShapExplanation gridId={p.grid_id} />
      </details>
      <details className="evidence-group" open>
        <summary>Konteks Tumpang Tindih Kebijakan/Izin</summary>
        <dl>{['any_policy_overlap_primary', 'max_policy_overlap_pct'].map(field)}</dl>
        <p className="hint">Tumpang tindih poligon adalah evidence kontekstual, bukan jejak fisik atau bukti pelanggaran.</p>
      </details>

      <h4>{aliasTranslation.recommendation_evidence ?? metadata.aliases.recommendation_evidence}</h4>
      <ul className="evidence-list">{evidence.map((line, i) => <li key={i}>{line}</li>)}</ul>

      {/* Practical Action Matrix by Agency */}
      <AgencyActionMatrix properties={p} onOpenPrintBrief={() => setIsPrintOpen(true)} />

      <section className="follow-up">
        <div className="section-kicker">03 / LANGKAH SELANJUTNYA</div>
        <h3>Paket Rekomendasi Asli Sistem</h3>
        {p.screening_target && stakeholders.length > 0 && <>
          <p className="hint">Berpotensi relevan untuk:</p>
          <div className="stakeholder-tags">{stakeholders.map(s => <span className="stakeholder-tag" key={s.name} title={s.reason}>{s.name}</span>)}</div>
          <p className="hint">Pengelompokan indikatif berdasarkan evidence yang ada di grid ini, bukan penugasan instansi resmi.</p>
        </>}
        <p lang="id">{translateActionBundle(String(p.recommended_action_bundle))}</p>
        <small>Panduan tindak lanjut ini bersifat final dari sistem screening. Keputusan kebijakan akhir tetap berada di tangan institusi berwenang.</small>
      </section>

      {/* Modal for One-Page Printable Policy Brief */}
      <PrintablePolicyBrief
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        grid={grid}
        metadata={metadata}
      />
    </aside>
  );
}
