import Link from 'next/link';

type ParamRow = {
  cells: string[];
  isPrimary?: boolean;
};

type Topic = {
  id: string;
  title: string;
  summary: string;
  tableHeaders?: string[];
  tableRows?: ParamRow[];
  note?: string;
  citations: string[];
};

const TOPICS: Topic[] = [
  {
    id: 'unit-analisis',
    title: 'Unit Analisis Spasial',
    summary:
      'Seluruh metode di bawah ini bekerja di atas satu unit analisis yang sama: petak grid 1x1 km yang menutupi ' +
      'seluruh DAS Mahakam, dibangun dengan proyeksi luas-sama (equal-area, LAEA berpusat di 116 derajat bujur ' +
      'timur) supaya luas tiap petak konsisten secara geometris. Rinciannya ada di tahap 03 pada halaman Alur Proses.',
    tableHeaders: ['Parameter', 'Nilai'],
    tableRows: [
      { cells: ['Ukuran sel', '1 x 1 km'] },
      { cells: ['Proyeksi', 'Lambert Azimuthal Equal-Area (LAEA), lon0=116'] },
      { cells: ['Jumlah sel kanonis', '77.600 sel'] },
      { cells: ['Penomoran ID', 'MHK_R{baris 4 digit}_C{kolom 4 digit}, utara ke selatan, barat ke timur'] },
    ],
    citations: [],
  },
  {
    id: 'prediktor-validasi',
    title: 'Prediktor & Skema Validasi',
    summary:
      'Model kerentanan banjir historis hanya memakai variabel yang benar-benar bisa direkonstruksi untuk periode ' +
      'kejadian acuan (2004-2007), supaya tidak terjadi kebocoran waktu, memakai data yang belum ada saat kejadian ' +
      'terjadi. Alasan pemangkasan dari tabel fitur 60 kolom menjadi 4 prediktor ini dijelaskan di tahap 04 pada ' +
      'halaman Alur Proses.',
    tableHeaders: ['Prediktor', 'Satuan'],
    tableRows: [
      { cells: ['Curah hujan antesenden 3 hari sebelum kejadian', 'mm'] },
      { cells: ['Curah hujan antesenden 7 hari sebelum kejadian', 'mm'] },
      { cells: ['Kemiringan lahan rata-rata', 'derajat'] },
      { cells: ['Jarak ke sungai terdekat', 'meter'] },
    ],
    note:
      'Validasi memakai StratifiedGroupKFold 5-fold dengan blok spasial 20 km, sehingga wilayah latih dan uji tidak ' +
      'pernah bertampalan secara geografis. Izin tambang dan sawit sengaja tidak dimasukkan sebagai prediktor, ' +
      'karena datanya mencerminkan kondisi masa kini, bukan kondisi saat kejadian historis berlangsung.',
    citations: ['Pedregosa, F., et al. (2011). Scikit-learn: Machine learning in Python.'],
  },
  {
    id: 'model-ensemble',
    title: 'Model Klasifikasi Ensemble',
    summary:
      'Tiga model pohon keputusan dilatih secara terpisah lalu digabung dengan rata-rata tanpa bobot (Tree Ensemble ' +
      'Mean). Logistic Regression turut dilatih sebagai baseline pembanding, bukan sebagai model akhir. Hasil ' +
      'lengkapnya, termasuk ROC-AUC tiap model, ada di tahap 05 pada halaman Alur Proses.',
    tableHeaders: ['Model', 'Parameter Utama'],
    tableRows: [
      { cells: ['Random Forest', '350 pohon, class_weight balanced_subsample'] },
      { cells: ['XGBoost', '350 pohon, kedalaman maks. 6, learning rate 0,05, scale_pos_weight proporsional kelas'] },
      { cells: ['LightGBM', '350 pohon, num_leaves 31, learning rate 0,05, class_weight balanced'] },
      { cells: ['Logistic Regression (baseline)', 'class_weight balanced, solver lbfgs, fitur distandarisasi'] },
    ],
    citations: [
      'Breiman, L. (2001). Random forests.',
      'Chen, T., & Guestrin, C. (2016). XGBoost: A scalable tree boosting system.',
      'Ke, G., et al. (2017). LightGBM: A highly efficient gradient boosting decision tree.',
    ],
  },
  {
    id: 'interpretasi-shap',
    title: 'Interpretasi Model (SHAP)',
    summary:
      'Setiap komponen ensemble dijelaskan dengan TreeSHAP dalam mode tree_path_dependent, dihitung terpisah per ' +
      'model karena ketiganya punya satuan output yang berbeda (probabilitas untuk Random Forest, logit untuk ' +
      'XGBoost dan LightGBM). Nilai SHAP tiap model dinormalisasi lebih dulu menjadi proporsi pengaruh, baru ' +
      'dirata-rata menjadi satu angka konsensus lintas-model, baik secara global maupun per grid. Rinciannya ada di ' +
      'tahap 06 pada halaman Alur Proses.',
    citations: ['Lundberg, S. M., & Lee, S.-I. (2017). A unified approach to interpreting model predictions.'],
  },
  {
    id: 'graf-komunitas',
    title: 'Graf Hidrologi & Deteksi Komunitas',
    summary:
      'Bukan seluruh grid yang jadi node, hanya petak yang benar-benar dilalui aliran sungai. Sambungan antar node ' +
      'ditentukan dari kontinuitas jaringan sungai yang sebenarnya, bukan sekadar petak yang bertetangga. Dua ' +
      'algoritma pengelompokan komunitas diuji dan dibandingkan stabilitasnya sebelum salah satunya dipakai untuk ' +
      'hasil akhir. Rinciannya ada di tahap 07 pada halaman Alur Proses.',
    tableHeaders: ['Algoritma', 'Stabilitas (median ARI)', 'Status'],
    tableRows: [
      { cells: ['Louvain', '0,752 (uji seluruh graf) / 0,718 (per-komponen)', 'Dibandingkan sebagai kandidat'] },
      { cells: ['Leiden', '0,790 (uji seluruh graf) / 0,765 (per-komponen)', 'Dipilih, resolusi gamma=1'], isPrimary: true },
    ],
    note: 'Graf: 24.306 node, 25.275 sambungan. Hasil akhir: 973 komunitas, dijalankan secara per-komponen graf.',
    citations: [
      'Traag, V. A., Waltman, L., & van Eck, N. J. (2019). From Louvain to Leiden: guaranteeing well-connected communities.',
      'Blondel, V. D., et al. (2008). Fast unfolding of communities in large networks.',
    ],
  },
  {
    id: 'node-bridge-rekomendasi',
    title: 'Identifikasi Node Bridge & Aturan Rekomendasi',
    summary:
      'Node bridge adalah titik penghubung kritis dalam graf jaringan hidrologi, node yang posisinya menyatukan ' +
      'komunitas hidrologis berbeda sehingga gangguan di titik itu berisiko merembet ke sistem sungai lain. Skor ' +
      'kerentanan, status node bridge, dan konteks tumpang tindih kebijakan digabungkan menjadi enam tingkatan ' +
      'rekomendasi. Hanya node berstatus bridge dalam bentuk apa pun yang bisa naik ke tingkat R1 sampai R5; node ' +
      'yang bukan bridge otomatis masuk R0 tanpa rekomendasi otomatis. Rinciannya ada di tahap 08 pada halaman Alur ' +
      'Proses.',
    tableHeaders: ['Tingkat', 'Syarat Evidence Minimum'],
    tableRows: [
      { cells: ['R1', 'Bridge kritis lintas-sistem, persentil kerentanan 10% teratas, dan tumpang tindih kebijakan'] },
      { cells: ['R2', 'Bridge kritis lintas-sistem, ditambah minimal satu konteks kerentanan atau kebijakan'] },
      { cells: ['R3', 'Bridge struktural/administratif, persentil kerentanan 10% teratas, dan tumpang tindih kebijakan'] },
      { cells: ['R4', 'Bridge struktural/administratif, ditambah minimal satu konteks kerentanan atau kebijakan'] },
      { cells: ['R5', 'Bridge jaringan tanpa konteks kerentanan atau kebijakan yang menonjol'] },
      { cells: ['R0', 'Bukan node bridge, tidak ada rekomendasi otomatis'] },
    ],
    citations: [],
  },
];

export default function MethodologyTechnical() {
  return (
    <div className="pipeline-container">
      <section className="pipeline-hero">
        <span className="section-kicker">REFERENSI PER TOPIK · BUKAN URUTAN KRONOLOGIS</span>
        <h1>Metodologi Teknis</h1>
        <p>
          Halaman <Link href="/pipeline">Alur Proses</Link> menceritakan urutan kejadian dari awal sampai akhir,
          termasuk jalan buntu dan cara mengatasinya. Halaman ini menyusun ulang metode yang sama per topik, supaya
          bisa dicek langsung tanpa membaca seluruh cerita, lengkap dengan rujukan ilmiahnya.
        </p>
      </section>

      <div className="methodology-topics">
        {TOPICS.map(topic => (
          <details className="methodology-topic" key={topic.id} id={topic.id}>
            <summary>{topic.title}</summary>
            <p>{topic.summary}</p>
            {topic.tableHeaders && topic.tableRows && (
              <div className="pipeline-data-table-wrap">
                <table className="pipeline-data-table">
                  <thead>
                    <tr>
                      {topic.tableHeaders.map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topic.tableRows.map(row => (
                      <tr key={row.cells[0]} className={row.isPrimary ? 'is-primary' : undefined}>
                        {row.cells.map((cell, i) => (
                          <td key={i} className={i === 0 ? 'cell-strong' : 'cell-muted'}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {topic.note && <p className="methodology-topic-note">{topic.note}</p>}
            {topic.citations.length > 0 && (
              <div className="methodology-citations">
                <span>Rujukan:</span>
                <ul>
                  {topic.citations.map(c => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <Link href="/#bibliography">Lihat kutipan lengkap dan tautannya di Daftar Pustaka &rarr;</Link>
              </div>
            )}
          </details>
        ))}
      </div>

      <section className="disclaimer">
        <strong>Interpretasi Ilmiah</strong>
        <p className="disclaimer-id">
          Halaman ini menjelaskan metode, bukan menambah klaim baru. Batasan ilmiah yang sama tetap berlaku: kelas
          rekomendasi bukan kelas risiko masa depan yang terkalibrasi, tumpang tindih kebijakan/izin bukan jejak
          fisik di lapangan, dan keterkaitan spasial/model tidak membuktikan sebab-akibat maupun mengesahkan
          tindakan regulasi.
        </p>
        <p lang="en" className="disclaimer-en">
          Screening-based decision support for the Mahakam pilot. Recommendation classes are not calibrated future-risk
          classes, policy/permit overlap is not physical footprint, and spatial/model association does not establish
          causality or authorize regulatory action.
        </p>
      </section>
    </div>
  );
}
