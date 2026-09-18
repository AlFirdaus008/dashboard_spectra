import type {Metadata} from '@/types/data';
import ShapSummary from '@/components/scientific/ShapSummary';
import {claimTranslation} from '@/lib/data/vocabulary';

export default function MethodologyInfo({metadata: m}: {metadata: Metadata}) {
  return (
    <section className="science single-column">
      <details open>
        <summary>Metodologi & Batasan Ilmiah</summary>
        <p className="disclaimer-id">
          Sistem screening spasial ini diterapkan pada wilayah DAS Mahakam. Kerentanan bersifat retrospektif.
          Tingkatan rekomendasi menandai aktivitas tinjauan teknis. Keputusan kebijakan akhir tetap berada di tangan
          institusi yang berwenang.
        </p>
        <p lang="en" className="disclaimer-en">
          {m.contract.required_disclaimer}
        </p>
        {m.claims.map(c => {
          const t = claimTranslation[c.claim_id];
          return (
            <div className="claim" key={c.claim_id}>
              <span>{c.claim_id} · {c.status.replaceAll('_', ' ')}</span>
              {c.status === 'NOT_AUTHORIZED'
                ? <p className="claim-id"><strong>Tidak sah:</strong> {t?.claim ?? c.claim}</p>
                : <p className="claim-id">{t?.claim ?? c.claim}</p>}
              {t?.claim && c.claim && t.claim !== c.claim && (
                <p lang="en" className="claim-en">{c.claim}</p>
              )}
              <small className="claim-reason-id">{t?.reason ?? c.reason}</small>
              {t?.reason && c.reason && t.reason !== c.reason && (
                <small lang="en" className="claim-reason-en">{c.reason}</small>
              )}
            </div>
          );
        })}
        <ShapSummary />
      </details>
    </section>
  );
}
