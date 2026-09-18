import type {Metadata} from '@/types/data';
import {human} from '@/lib/data/client';
import {statusText} from '@/lib/data/vocabulary';

export default function ProvenanceInfo({metadata: m}: {metadata: Metadata}) {
  const status = (v: unknown) => statusText[String(v)] ?? human(v);
  return (
    <section className="science single-column">
      <details open>
        <summary>Data & Riwayat</summary>
        <dl>
          <dt>Status Ilmiah</dt><dd>{status(m.gate.scientific_status)}</dd>
          <dt>Status Pengiriman</dt><dd>{status(m.gate.web_delivery_status)}</dd>
          <dt>Kontrak Presentasi</dt><dd>{m.contract.contract_name}</dd>
          <dt>Koordinat Web</dt><dd>EPSG:4326</dd>
          <dt>Gerbang QA / Pengiriman</dt><dd>{statusText[String(m.qa.status)] ?? String(m.qa.status)} / {statusText[String(m.gate.status)] ?? String(m.gate.status)}</dd>
          <dt>Rekaman Kanonis / Target</dt><dd>{m.counts.total.toLocaleString()} / {m.counts.targets.toLocaleString()}</dd>
        </dl>
        <details>
          <summary>Riwayat lanjutan · hash sumber data</summary>
          {m.manifest.map(f => <p className="hash" key={f.file_name}>{f.file_name}<br />{f.sha256}</p>)}
        </details>
      </details>
    </section>
  );
}
