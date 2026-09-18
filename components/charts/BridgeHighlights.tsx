import type {Collection, Metadata} from '@/types/data';
import type {FiltersState} from '@/components/filters/Filters';
import {aliasTranslation, glossary} from '@/lib/data/vocabulary';
import GlossaryHint from '@/components/ui/GlossaryHint';

type BridgeKey = 'critical_cross_system_bridge' | 'structural_bridge_candidate' | 'administrative_hydrological_bridge';

const BRIDGE_FIELDS: {key: BridgeKey; description: string}[] = [
  {
    key: 'critical_cross_system_bridge',
    description: 'Node yang menghubungkan sub-sistem jaringan hidrologi berbeda; hilangnya node ini berpotensi memutus konektivitas antar-sistem.',
  },
  {
    key: 'structural_bridge_candidate',
    description: 'Node dengan peran penghubung struktural tinggi dalam topologi jaringan (mis. posisi yang sering dilalui rute antar-node).',
  },
  {
    key: 'administrative_hydrological_bridge',
    description: 'Node yang menghubungkan jaringan hidrologi lintas batas administrasi (kabupaten/provinsi).',
  },
];

export default function BridgeHighlights({collection, filters, onChange, metadata}: {collection: Collection; filters: FiltersState; onChange: (v: FiltersState) => void; metadata: Metadata}) {
  return (
    <section className="bridges" aria-label="Node bridge kritis jaringan hidrologi">
      <div className="section-kicker">JARINGAN HIDROLOGI</div>
      <h2>Node Bridge Kritis<GlossaryHint text={glossary.bridgeNode} /></h2>
      <p>Grid yang berperan sebagai penghubung kritis dalam topologi jaringan hidrologi. Klik untuk menyaring pada peta.</p>
      <div className="bridge-grid">
        {BRIDGE_FIELDS.map(field => {
          const count = collection.features.filter(f => f.properties[field.key]).length;
          const active = filters[field.key] === 'true';
          return (
            <button
              key={field.key}
              type="button"
              className="bridge-card"
              title={field.description}
              aria-pressed={active}
              onClick={() => onChange({...filters, [field.key]: active ? '' : 'true'})}
            >
              <strong>{count.toLocaleString()}</strong>
              <span>{aliasTranslation[field.key] ?? metadata.aliases[field.key] ?? field.key}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
