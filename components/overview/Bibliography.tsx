'use client';

import React, { useState } from 'react';

type CategoryKey = 'all' | 'ai' | 'dataset' | 'policy' | 'regulation';

interface ReferenceEntry {
  citation: string;
  category: string;
  categoryKey: Exclude<CategoryKey, 'all'>;
  accessNote?: string;
  url?: string;
  urlLabel?: string;
}

const REFERENCES: ReferenceEntry[] = [
  {
    citation: 'Yayasan KEHATI. (2026). Indonesia Environmental Outlook (IEO) 2026. Yayasan KEHATI.',
    category: 'Laporan & Riset',
    categoryKey: 'policy',
    accessNote: 'Laporan Outlook Lingkungan Terbitan Lembaga',
  },
  {
    citation: 'Badan Nasional Penanggulangan Bencana. (2026). Data DIBI kejadian bencana 2024–2026 [Database]. BNPB.',
    category: 'Basis Data Resmi',
    categoryKey: 'dataset',
    accessNote: 'Basis Data Terbuka Bencana (DIBI BNPB)',
  },
  {
    citation: 'Kementerian Energi dan Sumber Daya Mineral. (2025). Data izin usaha pertambangan aktif [Dataset]. Kementerian ESDM.',
    category: 'Basis Data Resmi',
    categoryKey: 'dataset',
    accessNote: 'Katalog Geospasial Izin Pertambangan Aktif',
  },
  {
    citation: 'Kementerian Keuangan Republik Indonesia. (2026). Laporan pendapatan sektor perkebunan sawit 2023–2025. Kementerian Keuangan RI.',
    category: 'Laporan Kebijakan',
    categoryKey: 'policy',
    accessNote: 'Laporan Resmi Kementerian Keuangan RI',
  },
  {
    citation: 'Lundberg, S. M., & Lee, S.-I. (2017). A unified approach to interpreting model predictions. Advances in Neural Information Processing Systems, 30, 4765–4774.',
    category: 'Metodologi & AI',
    categoryKey: 'ai',
    accessNote: 'Prosiding Konferensi Ilmiah NeurIPS (XAI / SHAP)',
  },
  {
    citation: 'Peraturan Pemerintah Nomor 26 Tahun 2025 tentang Perencanaan Perlindungan dan Pengelolaan Lingkungan Hidup, Lembaran Negara Republik Indonesia Tahun 2025 Nomor 96 (2025). Sekretariat Negara.',
    category: 'Regulasi & Hukum',
    categoryKey: 'regulation',
    accessNote: 'Lembaran Negara Republik Indonesia No. 96/2025',
  },
  {
    citation: 'Suhermawan, R., Basuki, T. M., & Wahyuningrum, N. (2019). Dampak pertambangan batubara terhadap laju deforestasi di Kabupaten Kutai Kartanegara Provinsi Kalimantan Timur. Jurnal Geografi Terapan, 3(1).',
    category: 'Riset Spasial Lokal',
    categoryKey: 'ai',
    accessNote: 'Publikasi Jurnal Geografi Terapan (Kukar)',
  },
  {
    citation: 'Center of Economic and Law Studies (Celios). (2025). Kerugian ekonomi banjir Sumatera: Aceh, Sumatera Utara, dan Sumatera Barat. Celios.',
    category: 'Laporan & Riset',
    categoryKey: 'policy',
    url: 'https://nu.or.id/nasional/celios-kerugian-ekonomi-banjir-sumatra-capai-rp68-6-triliun-kCEx5',
    urlLabel: 'Akses Rilis Laporan Celios (nu.or.id)',
  },
  {
    citation: 'Nursidik, I. (2024, Agustus 27). Kontribusi sawit untuk APBN dan perekonomian [Paparan kebijakan]. Badan Kebijakan Fiskal, Kementerian Keuangan Republik Indonesia.',
    category: 'Laporan Kebijakan',
    categoryKey: 'policy',
    url: 'https://ekonomi.bisnis.com/read/20240828/9/1794731/sawit-sumbang-rp887-triliun-ke-apbn-berkat-suntikan-insentif-perpajakan',
    urlLabel: 'Akses Paparan Kebijakan (bisnis.com)',
  },
  {
    citation: 'Badan Pusat Statistik. (2025). Statistik produktivitas tanaman pangan. BPS.',
    category: 'Basis Data Resmi',
    categoryKey: 'dataset',
    accessNote: 'Katalog Statistik BPS Terbitan Resmi',
  },
  {
    citation: 'Breiman, L. (2001). Random forests. Machine Learning, 45(1), 5–32.',
    category: 'Metodologi & AI',
    categoryKey: 'ai',
    url: 'https://doi.org/10.1023/A:1010933404324',
    urlLabel: 'Tautan DOI: 10.1023/A:1010933404324',
  },
  {
    citation: 'Chen, T., & Guestrin, C. (2016). XGBoost: A scalable tree boosting system. Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, 785–794.',
    category: 'Metodologi & AI',
    categoryKey: 'ai',
    url: 'https://doi.org/10.1145/2939672.2939785',
    urlLabel: 'Tautan DOI: 10.1145/2939672.2939785',
  },
  {
    citation: 'Liang, Y., Zhu, J., Ye, W., & Gao, S. (2024). GeoAI-enhanced community detection on spatial networks with graph deep learning. International Journal of Geographical Information Science.',
    category: 'Metodologi & AI',
    categoryKey: 'ai',
    url: 'https://doi.org/10.1016/j.compenvurbsys.2024.102228',
    urlLabel: 'Tautan DOI: 10.1016/j.compenvurbsys.2024.102228',
  },
  {
    citation: 'Pradhan, B., Lee, S., Dikshit, A., & Kim, H. (2023). Spatial flood susceptibility mapping using an explainable artificial intelligence (XAI) model. Geoscience Frontiers, 14(6), 101625.',
    category: 'Metodologi & AI',
    categoryKey: 'ai',
    url: 'https://doi.org/10.1016/j.gsf.2023.101625',
    urlLabel: 'Tautan DOI: 10.1016/j.gsf.2023.101625',
  },
  {
    citation: 'Ke, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q., & Liu, T.-Y. (2017). LightGBM: A highly efficient gradient boosting decision tree. Advances in Neural Information Processing Systems, 30, 3146-3154.',
    category: 'Metodologi & AI',
    categoryKey: 'ai',
    url: 'https://papers.nips.cc/paper/6907-lightgbm-a-highly-efficient-gradient-boosting-decision-tree',
    urlLabel: 'Akses Prosiding NeurIPS',
  },
  {
    citation: 'Traag, V. A., Waltman, L., & van Eck, N. J. (2019). From Louvain to Leiden: guaranteeing well-connected communities. Scientific Reports, 9(1), 5233.',
    category: 'Metodologi & AI',
    categoryKey: 'ai',
    url: 'https://doi.org/10.1038/s41598-019-41695-z',
    urlLabel: 'Tautan DOI: 10.1038/s41598-019-41695-z',
  },
  {
    citation: 'Blondel, V. D., Guillaume, J.-L., Lambiotte, R., & Lefebvre, E. (2008). Fast unfolding of communities in large networks. Journal of Statistical Mechanics: Theory and Experiment, 2008(10), P10008.',
    category: 'Metodologi & AI',
    categoryKey: 'ai',
    url: 'https://doi.org/10.1088/1742-5468/2008/10/P10008',
    urlLabel: 'Tautan DOI: 10.1088/1742-5468/2008/10/P10008',
  },
  {
    citation: 'Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M., & Duchesnay, E. (2011). Scikit-learn: Machine learning in Python. Journal of Machine Learning Research, 12, 2825-2830.',
    category: 'Metodologi & AI',
    categoryKey: 'ai',
    url: 'https://www.jmlr.org/papers/v12/pedregosa11a.html',
    urlLabel: 'Akses Jurnal JMLR',
  },
];

const CATEGORY_TABS: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: 'Semua Rujukan' },
  { key: 'ai', label: 'Metodologi & AI' },
  { key: 'dataset', label: 'Basis Data Resmi' },
  { key: 'policy', label: 'Laporan & Kebijakan' },
  { key: 'regulation', label: 'Regulasi & Hukum' },
];

export default function Bibliography() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  const filteredReferences = activeCategory === 'all'
    ? REFERENCES
    : REFERENCES.filter(r => r.categoryKey === activeCategory);

  return (
    <section className="content-section" id="bibliography">
      <span className="section-kicker">DAFTAR PUSTAKA</span>
      <h2>Sumber yang dapat diperiksa</h2>
      <p>Setiap referensi pada platform ini dapat ditelusuri ke sumber rujukan ilmiah, basis data institusi, dan dokumen resmi berikut.</p>

      {/* Category Filter Tabs */}
      <div className="biblio-toolbar">
        <div className="biblio-filter-tabs" role="tablist" aria-label="Filter kategori daftar pustaka">
          {CATEGORY_TABS.map(tab => {
            const count = tab.key === 'all'
              ? REFERENCES.length
              : REFERENCES.filter(r => r.categoryKey === tab.key).length;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeCategory === tab.key}
                className={`biblio-filter-btn ${activeCategory === tab.key ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="biblio-count-pill">{count}</span>
              </button>
            );
          })}
        </div>
        <span className="biblio-summary-note">
          Menampilkan {filteredReferences.length} dari {REFERENCES.length} rujukan terverifikasi
        </span>
      </div>

      {/* Responsive 2-column Grid of Cards */}
      <div className="biblio-grid" role="list">
        {filteredReferences.map(r => (
          <div className="biblio-card" key={r.citation} role="listitem">
            <div>
              <div className="biblio-card-header">
                <span className="biblio-index">
                  [{String(REFERENCES.indexOf(r) + 1).padStart(2, '0')}]
                </span>
                <span className={`biblio-category-tag tag-${r.categoryKey}`}>
                  {r.category}
                </span>
              </div>
              <p className="biblio-citation">{r.citation}</p>
            </div>

            <div className="biblio-card-footer">
              {r.url ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="biblio-link-btn"
                  title="Buka rujukan eksternal di tab baru"
                >
                  <span className="biblio-link-icon" aria-hidden="true">↗</span>
                  <span className="biblio-link-text">{r.urlLabel || 'Buka Rujukan'}</span>
                </a>
              ) : (
                <span className="biblio-source-note">
                  <span className="biblio-note-icon" aria-hidden="true">🏛</span>
                  <span>{r.accessNote || 'Dokumen / Terbitan Resmi'}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
