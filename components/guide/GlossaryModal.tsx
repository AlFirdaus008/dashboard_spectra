'use client';

import { useState, useMemo } from 'react';
import { IconClose, IconSearch } from '@/components/ui/Icons';
import { useMountTransition } from '@/lib/hooks/useMountTransition';

interface GlossaryItem {
  id: string;
  term: string;
  category: 'tier' | 'geospasial' | 'pemodelan' | 'kebijakan';
  simpleExplanation: string;
  practicalContext: string;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    id: 'tier-r1-r5',
    term: 'Tier Rekomendasi (R1 s.d. R5 & R0)',
    category: 'tier',
    simpleExplanation: 'Tingkatan prioritas untuk peninjauan teknis lapangan oleh tim gabungan instansi pemerintah.',
    practicalContext: 'R1 & R2 menandai petak paling mendesak yang memerlukan sinkronisasi lintas-dinas (misal DLH dan Dinas ESDM), sedangkan R0 adalah petak pembanding (referensi) tanpa rekomendasi otomatis.',
  },
  {
    id: 'bridging-nodes',
    term: 'Simpul Jembatan Hidrologis (Bridging Nodes)',
    category: 'geospasial',
    simpleExplanation: 'Titik pertemuan aliran sungai yang menghubungkan dua wilayah administrasi (kabupaten/kota) yang berbeda.',
    practicalContext: 'Jika kondisi lingkungan di simpul ini terganggu, dampaknya akan mengalir langsung melintasi perbatasan ke kabupaten tetangga di hilir.',
  },
  {
    id: 'betweenness-centrality',
    term: 'Sentralitas Antara (Betweenness Centrality)',
    category: 'geospasial',
    simpleExplanation: 'Ukuran matematis untuk menghitung seberapa sering suatu titik dilalui oleh jalur aliran air di seluruh DAS.',
    practicalContext: 'Titik dengan nilai sentralitas tinggi berfungsi seperti persimpangan jalan tol utama: jika terjadi hambatan di titik ini, seluruh sistem di bawahnya akan terganggu.',
  },
  {
    id: 'kerentanan-retrospektif',
    term: 'Kerentanan Retrospektif',
    category: 'pemodelan',
    simpleExplanation: 'Tingkat kerentanan yang dihitung murni berdasarkan pola riwayat kejadian banjir masa lalu yang tercatat resmi.',
    practicalContext: 'Bukan ramalan masa depan yang pasti, melainkan indikasi empiris ilmiah bahwa karakteristik fisik wilayah tersebut berulang kali mengalami genangan.',
  },
  {
    id: 'shap-values',
    term: 'Nilai SHAP (Kontribusi Fitur AI)',
    category: 'pemodelan',
    simpleExplanation: 'Penjelasan transparan yang memperlihatkan faktor apa yang paling dominan mendorong hasil model pada petak tertentu.',
    practicalContext: 'Memungkinkan kita mengetahui apakah kerentanan suatu petak lebih dipicu oleh curah hujan ekstrem, kedekatan dengan badan sungai, atau kelerengan curam.',
  },
  {
    id: 'tumpang-tindih-kebijakan',
    term: 'Tumpang Tindih Kebijakan (Policy Overlap)',
    category: 'kebijakan',
    simpleExplanation: 'Persentase luasan petak 1 km² yang berada di dalam batas izin resmi tambang (WIUP) atau perkebunan sawit (HGU/IUP).',
    practicalContext: 'Data ini adalah konteks legalitas administrasi perizinan, bukan bukti bahwa tambang terbuka atau pembukaan hutan telah dilakukan secara fisik di lapangan.',
  },
  {
    id: 'idw-interpolation',
    term: 'Interpolasi IDW (Inverse Distance Weighting)',
    category: 'pemodelan',
    simpleExplanation: 'Metode penaksiran nilai iklim (seperti curah hujan) pada area yang tidak memiliki stasiun pengamat cuaca langsung.',
    practicalContext: 'Nilai dihitung dengan memberi bobot lebih besar pada stasiun BMKG terdekat dibandingkan stasiun yang letaknya lebih jauh.',
  },
  {
    id: 'kesatuan-das',
    term: 'Satu Kesatuan DAS (Daerah Aliran Sungai)',
    category: 'geospasial',
    simpleExplanation: 'Prinsip pengelolaan bentang alam air dari hulu hingga muara sebagai satu sistem terpadu yang tidak terputus oleh batas politik kabupaten.',
    practicalContext: 'Mencegah ego sektoral daerah, sehingga kabupaten hulu dan kota hilir dapat berkoordinasi bersama dalam kerangka PP No. 26/2025.',
  },
];

const CATEGORY_NAMES: Record<GlossaryItem['category'], string> = {
  tier: 'Tingkatan Rekomendasi',
  geospasial: 'Konsep Geospasial & Aliran Air',
  pemodelan: 'Metode Pemodelan & GeoAI',
  kebijakan: 'Tata Kelola & Regulasi',
};

export default function GlossaryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return GLOSSARY_ITEMS.filter(item => {
      const matchesSearch =
        !searchQuery ||
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.simpleExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.practicalContext.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const { shouldRender, isVisible } = useMountTransition(isOpen, 200);
  if (!shouldRender) return null;

  return (
    <div
      className={`glossary-modal-backdrop${isVisible ? ' is-visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
    >
      <div className="glossary-modal-card">
        <div className="glossary-modal-header">
          <div>
            <span className="section-kicker">PANDUAN INTERPRETASI</span>
            <h2 id="glossary-title">Kamus Istilah Ilmiah &amp; Bahasa Sederhana</h2>
            <p className="glossary-header-desc">
              Penjelasan praktis konsep-konsep AI spasial dan hidrologi agar mudah dipahami oleh pengambil kebijakan dan publik.
            </p>
          </div>
          <button
            type="button"
            className="glossary-btn-close"
            onClick={onClose}
            aria-label="Tutup kamus istilah"
            title="Tutup (Esc)"
          >
            <IconClose size={18} />
          </button>
        </div>

        <div className="glossary-toolbar">
          <div className="glossary-search-wrap">
            <span className="glossary-search-icon" aria-hidden="true">
              <IconSearch size={15} />
            </span>
            <input
              type="text"
              className="glossary-search-input"
              placeholder="Cari istilah: SHAP, simpul, tumpang tindih, IDW…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Cari istilah dalam kamus"
            />
            {searchQuery && (
              <button
                type="button"
                className="glossary-clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus teks pencarian"
              >
                <IconClose size={12} />
              </button>
            )}
          </div>

          <div className="glossary-category-pills">
            <button
              type="button"
              className={`glossary-pill ${activeCategory === 'all' ? 'is-active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Semua ({GLOSSARY_ITEMS.length})
            </button>
            {(Object.keys(CATEGORY_NAMES) as GlossaryItem['category'][]).map(cat => {
              const count = GLOSSARY_ITEMS.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`glossary-pill ${activeCategory === cat ? 'is-active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {CATEGORY_NAMES[cat]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="glossary-items-list">
          {filteredItems.length === 0 ? (
            <div className="glossary-empty">
              <p>Tidak ditemukan istilah yang cocok dengan pencarian &quot;{searchQuery}&quot;.</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div className="glossary-item-card" key={item.id}>
                <div className="glossary-item-top">
                  <h3>{item.term}</h3>
                  <span className="glossary-cat-tag">{CATEGORY_NAMES[item.category]}</span>
                </div>
                <div className="glossary-explanation">
                  <strong>Pengertian Singkat:</strong>
                  <p>{item.simpleExplanation}</p>
                </div>
                <div className="glossary-practical">
                  <strong>Penerapan Praktis:</strong>
                  <p>{item.practicalContext}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="glossary-modal-footer">
          <p className="glossary-footer-hint">
            Seluruh metodologi terverifikasi mengacu pada kerangka data geospasial resmi satu kesatuan DAS Mahakam.
          </p>
          <button type="button" className="primary-button" onClick={onClose}>
            Tutup Kamus
          </button>
        </div>
      </div>
    </div>
  );
}
